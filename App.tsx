import React, { useEffect, useMemo, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView,
  StatusBar, Alert, Switch, Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Plus, Search, Sun, Moon, CalendarDays, Check, Circle, Clock3,
  ListTodo, Cloud, CloudOff, Settings2, ChevronRight, Trash2,
  Pencil, CheckCheck, Sparkles, SlidersHorizontal
} from "lucide-react-native";
import { useTaskStore } from "./src/store/tasks";
import TaskEditor from "./src/components/TaskEditor";
import { darkTheme, lightTheme, palette, type Theme } from "./src/theme/colors";
import type { Task } from "./src/types/task";
import { prepareNotifications } from "./src/services/notifications";
import { isFirebaseConfigured } from "./src/services/firebase";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Tab = "all" | "today" | "upcoming" | "overdue" | "settings";
const todayKey = () => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

function dateLabel(date: string | null) {
  if (!date) return "No deadline";
  const today = todayKey();
  if (date === today) return "Today";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const key = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,"0")}-${String(tomorrow.getDate()).padStart(2,"0")}`;
  if (date === key) return "Tomorrow";
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function App() {
  const { tasks, ready, syncMessage, hydrate, addTask, updateTask, toggleTask, deleteTask, toggleSubtask, sync } = useTaskStore();
  const [tab, setTab] = useState<Tab>("all");
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [online, setOnline] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const theme = dark ? darkTheme : lightTheme;
  const styles = makeStyles(theme);

  useEffect(() => {
    void AsyncStorage.getItem("taskflow-theme").then(value => {
      if (value === "dark") setDark(true);
      if (value === "light") setDark(false);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem("taskflow-theme", dark ? "dark" : "light").catch(() => undefined);
  }, [dark]);

  useEffect(() => {
    void hydrate();
    void prepareNotifications();
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = Boolean(state.isConnected);
      setOnline(connected);
      if (connected) void sync();
    });
    return unsubscribe;
  }, []);

  const activeTasks = useMemo(() => tasks.filter(task => !task.deletedAt), [tasks]);
  const counts = useMemo(() => {
    const today = todayKey();
    return {
      all: activeTasks.filter(t => !t.completed).length,
      today: activeTasks.filter(t => !t.completed && t.dueDate === today).length,
      upcoming: activeTasks.filter(t => !t.completed && t.dueDate && t.dueDate > today).length,
      overdue: activeTasks.filter(t => !t.completed && t.dueDate && t.dueDate < today).length
    };
  }, [activeTasks]);

  const visibleTasks = useMemo(() => {
    const today = todayKey();
    return activeTasks.filter(task => {
      const textMatch = `${task.title} ${task.description} ${task.category}`.toLowerCase().includes(query.toLowerCase());
      const priorityMatch = priorityFilter === "all" || task.priority === priorityFilter;
      let tabMatch = true;
      if (tab === "today") tabMatch = task.dueDate === today && !task.completed;
      if (tab === "upcoming") tabMatch = Boolean(task.dueDate && task.dueDate > today && !task.completed);
      if (tab === "overdue") tabMatch = Boolean(task.dueDate && task.dueDate < today && !task.completed);
      if (tab === "all") tabMatch = true;
      return textMatch && priorityMatch && tabMatch;
    });
  }, [activeTasks, query, priorityFilter, tab]);

  const openNew = () => { setEditingTask(null); setEditorVisible(true); };
  const openEdit = (task: Task) => { setEditingTask(task); setEditorVisible(true); };
  const saveDraft = async (draft: any) => {
    if (editingTask) await updateTask(editingTask.id, draft);
    else await addTask(draft);
  };

  const confirmDelete = (task: Task) => Alert.alert(
    "Delete task?",
    `"${task.title}" will be removed from this phone and from its next cloud backup.`,
    [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => void deleteTask(task.id) }]
  );

  const priorityColor = (p: string) => p === "high" ? palette.red : p === "medium" ? palette.amber : palette.green;

  const TaskCard = ({ task }: { task: Task }) => {
    const completedSubtasks = task.subtasks.filter(s => s.completed).length;
    return (
      <View style={styles.taskCard}>
        <Pressable onPress={() => void toggleTask(task.id)} style={styles.checkButton}>
          {task.completed ? <View style={styles.checkedCircle}><Check size={14} color="#FFFFFF" strokeWidth={3}/></View> : <Circle size={23} color={theme.muted}/>}
        </Pressable>
        <Pressable style={{ flex: 1 }} onPress={() => openEdit(task)}>
          <View style={styles.taskTop}>
            <Text numberOfLines={2} style={[styles.taskTitle, task.completed && styles.completedTitle]}>{task.title}</Text>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor(task.priority) }]}/>
          </View>
          {task.description ? <Text numberOfLines={1} style={styles.taskDescription}>{task.description}</Text> : null}
          <View style={styles.taskMeta}>
            <View style={styles.metaPill}><Text style={styles.metaText}>{task.category}</Text></View>
            {task.dueDate ? <View style={styles.metaItem}><CalendarDays size={12} color={theme.muted}/><Text style={styles.metaText}>{dateLabel(task.dueDate)}</Text></View> : null}
            {task.subtasks.length > 0 ? <View style={styles.metaItem}><CheckCheck size={12} color={theme.muted}/><Text style={styles.metaText}>{completedSubtasks}/{task.subtasks.length}</Text></View> : null}
          </View>
        </Pressable>
        <View style={styles.cardActions}>
          <Pressable onPress={() => openEdit(task)} hitSlop={8}><Pencil size={16} color={theme.muted}/></Pressable>
          <Pressable onPress={() => confirmDelete(task)} hitSlop={8}><Trash2 size={16} color={theme.muted}/></Pressable>
        </View>
      </View>
    );
  };

  const NavItem = ({ id, label, icon, count }: { id: Tab; label: string; icon: React.ReactNode; count?: number }) => (
    <Pressable onPress={() => setTab(id)} style={[styles.navItem, tab === id && styles.navItemActive]}>
      {icon}
      <Text style={[styles.navLabel, tab === id && styles.navLabelActive]}>{label}</Text>
      {typeof count === "number" && count > 0 ? <Text style={[styles.navCount, tab === id && styles.navCountActive]}>{count}</Text> : null}
    </Pressable>
  );

  if (!ready) {
    return <SafeAreaView style={[styles.loading, { backgroundColor: theme.background }]}><Text style={{ color: theme.text, fontWeight: "800", fontSize: 22 }}>TaskFlow</Text><Text style={{ color: theme.muted, marginTop: 8 }}>Preparing your workspace…</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"}/>
      <View style={styles.header}>
        <View>
          <View style={styles.brandRow}><View style={styles.brandMark}><Check size={16} color="#FFFFFF" strokeWidth={3}/></View><Text style={styles.brand}>TaskFlow</Text></View>
          <Text style={styles.subtitle}>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</Text>
        </View>
        <Pressable style={styles.themeButton} onPress={() => setDark(v => !v)}>{dark ? <Sun size={19} color={theme.text}/> : <Moon size={19} color={theme.text}/>}</Pressable>
      </View>

      {tab !== "settings" ? (
        <>
          <LinearGradient colors={dark ? ["#35306D", "#24284D"] : ["#746BFF", "#5B58D9"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.hero}>
            <View style={{ flex: 1 }}>
              <View style={styles.heroEyebrow}><Sparkles size={13} color="#DCD9FF"/><Text style={styles.heroEyebrowText}>YOUR PRODUCTIVITY SPACE</Text></View>
              <Text style={styles.heroTitle}>Make today{'\n'}count.</Text>
              <Text style={styles.heroCaption}>{counts.all === 0 ? "A clear space for what's next." : `${counts.all} task${counts.all === 1 ? "" : "s"} waiting for you.`}</Text>
            </View>
            <View style={styles.heroStat}><Text style={styles.heroNumber}>{counts.all}</Text><Text style={styles.heroStatLabel}>TO DO</Text></View>
            <View style={styles.heroOrb}/>
          </LinearGradient>

          <View style={styles.searchRow}>
            <Search size={18} color={theme.muted}/>
            <TextInput value={query} onChangeText={setQuery} placeholder="Search your tasks..." placeholderTextColor={theme.muted} style={styles.searchInput}/>
            <Pressable onPress={() => setShowFilters(v => !v)}><SlidersHorizontal size={18} color={showFilters ? theme.primary : theme.muted}/></Pressable>
          </View>
          {showFilters ? <View style={styles.filters}>{(["all","low","medium","high"] as const).map(p => <Pressable key={p} onPress={() => setPriorityFilter(p)} style={[styles.filterChip, priorityFilter === p && styles.filterChipActive]}><Text style={[styles.filterText, priorityFilter === p && styles.filterTextActive]}>{p === "all" ? "All priorities" : p[0].toUpperCase()+p.slice(1)}</Text></Pressable>)}</View> : null}

          <View style={styles.navGrid}>
            <NavItem id="all" label="All tasks" icon={<ListTodo size={17} color={tab === "all" ? theme.primary : theme.muted}/>} count={counts.all}/>
            <NavItem id="today" label="Today" icon={<Sun size={17} color={tab === "today" ? theme.primary : theme.muted}/>} count={counts.today}/>
            <NavItem id="upcoming" label="Upcoming" icon={<CalendarDays size={17} color={tab === "upcoming" ? theme.primary : theme.muted}/>} count={counts.upcoming}/>
            <NavItem id="overdue" label="Overdue" icon={<Clock3 size={17} color={tab === "overdue" ? theme.primary : theme.muted}/>} count={counts.overdue}/>
          </View>

          <View style={styles.sectionHeader}>
            <View><Text style={styles.sectionTitle}>{tab === "all" ? "Your tasks" : tab[0].toUpperCase()+tab.slice(1)}</Text><Text style={styles.sectionSub}>{visibleTasks.length} item{visibleTasks.length === 1 ? "" : "s"}</Text></View>
            <Pressable onPress={openNew} style={styles.addButton}><Plus size={17} color="#FFFFFF"/><Text style={styles.addButtonText}>New task</Text></Pressable>
          </View>

          <ScrollView style={styles.taskList} contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
            {visibleTasks.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}><CheckCheck size={27} color={theme.primary}/></View>
                <Text style={styles.emptyTitle}>{query ? "No matching tasks" : "You're all caught up"}</Text>
                <Text style={styles.emptyText}>{query ? "Try a different search or filter." : "Add a task when something new comes up."}</Text>
                {!query && <Pressable onPress={openNew} style={styles.emptyButton}><Text style={styles.emptyButtonText}>Create your first task</Text></Pressable>}
              </View>
            ) : visibleTasks.map(task => <TaskCard key={task.id} task={task}/>)}
          </ScrollView>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.settingsContent}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <Text style={styles.sectionSub}>Make TaskFlow feel like yours.</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingIcon}><Moon size={19} color={theme.primary}/></View>
            <View style={{ flex: 1 }}><Text style={styles.settingTitle}>Appearance</Text><Text style={styles.settingDesc}>Switch between light and dark themes</Text></View>
            <Switch value={dark} onValueChange={setDark} trackColor={{ true: theme.primary, false: theme.border }}/>
          </View>
          <View style={styles.settingCard}>
            <View style={styles.settingIcon}><Cloud size={19} color={theme.primary}/></View>
            <View style={{ flex: 1 }}><Text style={styles.settingTitle}>Automatic cloud backup</Text><Text style={styles.settingDesc}>{isFirebaseConfigured() ? syncMessage : "Firebase setup required to enable backup"}</Text></View>
          </View>
          <View style={styles.settingCard}>
            <View style={styles.settingIcon}>{online ? <Cloud size={19} color={theme.success}/> : <CloudOff size={19} color={theme.muted}/>}</View>
            <View style={{ flex: 1 }}><Text style={styles.settingTitle}>{online ? "You're online" : "Offline mode"}</Text><Text style={styles.settingDesc}>Tasks are always saved locally on this phone.</Text></View>
          </View>
          <Pressable onPress={() => void sync()} style={styles.syncButton}><Cloud size={17} color="#FFFFFF"/><Text style={styles.syncButtonText}>Back up now</Text></Pressable>
          <View style={styles.noteBox}><Text style={styles.noteTitle}>Your data, your phone</Text><Text style={styles.noteText}>TaskFlow works without an account. Cloud backup uses an anonymous Firebase identity. It is tied to this app installation; clearing app data or reinstalling may make the cloud backup unrecoverable. This version does not connect task lists between phones.</Text></View>
          <Text style={styles.version}>TASKFLOW · VERSION 1.0.0</Text>
        </ScrollView>
      )}

      <View style={styles.bottomBar}>
        <Pressable onPress={() => setTab("all")} style={styles.bottomItem}><ListTodo size={19} color={tab !== "settings" ? theme.primary : theme.muted}/><Text style={[styles.bottomLabel, tab !== "settings" && { color: theme.primary }]}>Tasks</Text></Pressable>
        <Pressable onPress={openNew} style={styles.fab}><Plus size={24} color="#FFFFFF"/></Pressable>
        <Pressable onPress={() => setTab("settings")} style={styles.bottomItem}><Settings2 size={19} color={tab === "settings" ? theme.primary : theme.muted}/><Text style={[styles.bottomLabel, tab === "settings" && { color: theme.primary }]}>Settings</Text></Pressable>
      </View>

      <TaskEditor visible={editorVisible} task={editingTask} theme={theme} onClose={() => setEditorVisible(false)} onSave={saveDraft}/>
    </SafeAreaView>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.background },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: { width: 27, height: 27, borderRadius: 9, backgroundColor: t.primary, alignItems: "center", justifyContent: "center" },
  brand: { color: t.text, fontWeight: "900", fontSize: 20, letterSpacing: -0.5 },
  subtitle: { color: t.muted, fontSize: 11, marginTop: 5, marginLeft: 36, fontWeight: "600" },
  themeButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: t.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.border },
  hero: { marginHorizontal: 20, borderRadius: 22, padding: 20, minHeight: 154, flexDirection: "row", alignItems: "center", overflow: "hidden" },
  heroEyebrow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroEyebrowText: { color: "#DCD9FF", fontSize: 9, letterSpacing: 1.2, fontWeight: "800" },
  heroTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "900", letterSpacing: -0.8, marginTop: 9, lineHeight: 31 },
  heroCaption: { color: "#E0DEFF", fontSize: 11, marginTop: 8 },
  heroStat: { width: 76, height: 76, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 3 },
  heroNumber: { color: "#FFFFFF", fontSize: 27, fontWeight: "900" },
  heroStatLabel: { color: "#E0DEFF", fontSize: 8, fontWeight: "900", letterSpacing: 1.2 },
  heroOrb: { position: "absolute", width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", right: -65, top: -75 },
  searchRow: { marginHorizontal: 20, marginTop: 17, height: 48, borderRadius: 14, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  searchInput: { flex: 1, color: t.text, fontSize: 13, paddingVertical: 0 },
  filters: { flexDirection: "row", gap: 7, marginHorizontal: 20, marginTop: 10 },
  filterChip: { borderRadius: 20, borderWidth: 1, borderColor: t.border, paddingHorizontal: 11, paddingVertical: 7 },
  filterChipActive: { backgroundColor: t.primarySoft, borderColor: t.primary },
  filterText: { color: t.muted, fontSize: 10, fontWeight: "700" },
  filterTextActive: { color: t.primary },
  navGrid: { flexDirection: "row", marginHorizontal: 20, marginTop: 15, gap: 6 },
  navItem: { flex: 1, minHeight: 61, borderRadius: 13, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 2 },
  navItemActive: { backgroundColor: t.primarySoft, borderColor: t.primary },
  navLabel: { color: t.muted, fontSize: 9, fontWeight: "700" },
  navLabelActive: { color: t.primary },
  navCount: { position: "absolute", right: 5, top: 4, fontSize: 8, color: t.muted, fontWeight: "800" },
  navCountActive: { color: t.primary },
  sectionHeader: { marginHorizontal: 22, marginTop: 20, marginBottom: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: t.text, fontSize: 19, fontWeight: "900", letterSpacing: -0.4 },
  sectionSub: { color: t.muted, fontSize: 10, marginTop: 3 },
  addButton: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: t.primary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  addButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  taskList: { flex: 1, paddingHorizontal: 20 },
  taskCard: { backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 13, marginBottom: 9, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  checkButton: { paddingTop: 2 },
  checkedCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: t.success, alignItems: "center", justifyContent: "center" },
  taskTop: { flexDirection: "row", alignItems: "center", gap: 7 },
  taskTitle: { color: t.text, fontSize: 13, fontWeight: "800", flex: 1, lineHeight: 18 },
  completedTitle: { color: t.muted, textDecorationLine: "line-through" },
  priorityDot: { width: 7, height: 7, borderRadius: 4 },
  taskDescription: { color: t.muted, fontSize: 10, marginTop: 4 },
  taskMeta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 9, marginTop: 9 },
  metaPill: { backgroundColor: t.surfaceAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  metaText: { color: t.muted, fontSize: 9, fontWeight: "700" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardActions: { gap: 13, paddingLeft: 3, paddingTop: 3 },
  empty: { alignItems: "center", paddingTop: 42, paddingHorizontal: 25 },
  emptyIcon: { width: 60, height: 60, borderRadius: 20, backgroundColor: t.primarySoft, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: t.text, fontSize: 16, fontWeight: "900", marginTop: 15 },
  emptyText: { color: t.muted, fontSize: 11, textAlign: "center", marginTop: 6, lineHeight: 17 },
  emptyButton: { backgroundColor: t.primary, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12, marginTop: 17 },
  emptyButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  bottomBar: { height: 67, backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 45 },
  bottomItem: { alignItems: "center", gap: 4, minWidth: 54 },
  bottomLabel: { color: t.muted, fontSize: 9, fontWeight: "700" },
  fab: { width: 48, height: 48, borderRadius: 17, backgroundColor: t.primary, alignItems: "center", justifyContent: "center", marginTop: -25, elevation: 5, shadowColor: t.shadow, shadowOpacity: 0.3, shadowRadius: 8 },
  settingsContent: { paddingHorizontal: 21, paddingTop: 10, paddingBottom: 30 },
  settingCard: { backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 15, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
  settingIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: t.primarySoft, alignItems: "center", justifyContent: "center" },
  settingTitle: { color: t.text, fontWeight: "800", fontSize: 12 },
  settingDesc: { color: t.muted, fontSize: 10, marginTop: 4, lineHeight: 15 },
  syncButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: t.primary, padding: 14, borderRadius: 14, marginTop: 16 },
  syncButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  noteBox: { backgroundColor: t.surfaceAlt, padding: 15, borderRadius: 14, marginTop: 18 },
  noteTitle: { color: t.text, fontSize: 12, fontWeight: "900" },
  noteText: { color: t.muted, fontSize: 10, lineHeight: 16, marginTop: 7 },
  version: { textAlign: "center", color: t.muted, fontSize: 9, letterSpacing: 1.2, fontWeight: "800", marginTop: 25 }
});


