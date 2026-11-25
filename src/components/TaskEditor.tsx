import React, { useEffect, useState } from "react";
import {
  Modal, View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView,
  Platform, StyleSheet
} from "react-native";
import { X, Plus, Trash2, Circle, CheckCircle2 } from "lucide-react-native";
import type { Priority, Subtask, Task } from "../types/task";
import type { Theme } from "../theme/colors";

type Props = {
  visible: boolean;
  task: Task | null;
  theme: Theme;
  onClose: () => void;
  onSave: (draft: {
    title: string; description: string; priority: Priority;
    dueDate: string | null; category: string; subtasks: Subtask[];
  }) => Promise<void>;
};

const makeId = () => `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export default function TaskEditor({ visible, task, theme, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("Personal");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setPriority(task?.priority ?? "medium");
    setDueDate(task?.dueDate ?? "");
    setCategory(task?.category ?? "Personal");
    setSubtasks(task?.subtasks ?? []);
    setNewSubtask("");
  }, [visible, task]);

  const styles = makeStyles(theme);
  const validDate = !dueDate || (() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return false;
    const [year, month, day] = dueDate.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);
    return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
  })();

  const save = async () => {
    if (!title.trim() || !validDate || saving) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(), description, priority,
        dueDate: dueDate.trim() || null, category, subtasks
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.heading}>{task ? "Edit task" : "New task"}</Text>
              <Pressable onPress={onClose} hitSlop={12}><X color={theme.muted} size={22}/></Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>TASK NAME</Text>
              <TextInput value={title} onChangeText={setTitle} placeholder="What needs to get done?" placeholderTextColor={theme.muted} style={styles.input} maxLength={120}/>
              <Text style={styles.label}>DESCRIPTION</Text>
              <TextInput value={description} onChangeText={setDescription} placeholder="Add a few details..." placeholderTextColor={theme.muted} style={[styles.input, styles.multiline]} multiline textAlignVertical="top"/>
              <Text style={styles.label}>PRIORITY</Text>
              <View style={styles.row}>
                {(["low", "medium", "high"] as Priority[]).map(value => (
                  <Pressable key={value} onPress={() => setPriority(value)} style={[styles.priority, priority === value && styles.prioritySelected]}>
                    <Text style={[styles.priorityText, priority === value && styles.priorityTextSelected]}>{value[0].toUpperCase() + value.slice(1)}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.label}>DUE DATE · OPTIONAL</Text>
              <TextInput value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" placeholderTextColor={theme.muted} style={styles.input} keyboardType="numbers-and-punctuation" maxLength={10}/>
              {!validDate && <Text style={styles.error}>Use the YYYY-MM-DD date format.</Text>}
              <Text style={styles.label}>CATEGORY</Text>
              <TextInput value={category} onChangeText={setCategory} placeholder="Personal, Work, Study..." placeholderTextColor={theme.muted} style={styles.input} maxLength={32}/>
              <Text style={styles.label}>SUBTASKS</Text>
              {subtasks.map(item => (
                <View key={item.id} style={styles.subtaskRow}>
                  <Pressable
                    onPress={() => setSubtasks(old => old.map(x => x.id === item.id ? { ...x, completed: !x.completed } : x))}
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 9 }}
                  >
                    {item.completed ? <CheckCircle2 size={18} color={theme.success}/> : <Circle size={18} color={theme.muted}/>}
                    <Text style={[styles.subtaskText, item.completed && { color: theme.muted, textDecorationLine: "line-through" }]}>{item.title}</Text>
                  </Pressable>
                  <Pressable onPress={() => setSubtasks(old => old.filter(x => x.id !== item.id))}><Trash2 size={17} color={theme.danger}/></Pressable>
                </View>
              ))}
              <View style={styles.addSubtaskRow}>
                <TextInput value={newSubtask} onChangeText={setNewSubtask} placeholder="Add a checklist item" placeholderTextColor={theme.muted} style={[styles.input, { flex: 1, marginBottom: 0 }]}/>
                <Pressable style={styles.addSubtaskButton} onPress={() => {
                  if (!newSubtask.trim()) return;
                  setSubtasks(old => [...old, { id: makeId(), title: newSubtask.trim(), completed: false }]);
                  setNewSubtask("");
                }}><Plus size={20} color="#FFFFFF"/></Pressable>
              </View>
            </ScrollView>
            <View style={styles.footer}>
              <Pressable onPress={onClose} style={styles.cancel}><Text style={styles.cancelText}>Cancel</Text></Pressable>
              <Pressable onPress={save} disabled={!title.trim() || !validDate || saving} style={[styles.save, (!title.trim() || !validDate || saving) && { opacity: 0.5 }]}>
                <Text style={styles.saveText}>{saving ? "Saving..." : task ? "Save changes" : "Create task"}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(5,10,20,0.55)", justifyContent: "flex-end" },
  keyboard: { width: "100%" },
  sheet: { backgroundColor: t.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 22, paddingBottom: 28, maxHeight: "92%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  heading: { color: t.text, fontSize: 23, fontWeight: "800" },
  label: { color: t.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginBottom: 9, marginTop: 17 },
  input: { backgroundColor: t.surfaceAlt, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 13, color: t.text, fontSize: 14, marginBottom: 2 },
  multiline: { minHeight: 82 },
  row: { flexDirection: "row", gap: 9 },
  priority: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: t.border, paddingVertical: 12, alignItems: "center" },
  prioritySelected: { borderColor: t.primary, backgroundColor: t.primarySoft },
  priorityText: { color: t.muted, fontWeight: "700", fontSize: 13 },
  priorityTextSelected: { color: t.primary },
  error: { color: t.danger, fontSize: 11, marginTop: 5 },
  subtaskRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.border },
  subtaskText: { color: t.text, fontSize: 13, flex: 1 },
  addSubtaskRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  addSubtaskButton: { width: 46, height: 46, borderRadius: 13, backgroundColor: t.primary, alignItems: "center", justifyContent: "center" },
  footer: { flexDirection: "row", gap: 10, marginTop: 18 },
  cancel: { flex: 1, borderRadius: 14, backgroundColor: t.surfaceAlt, padding: 15, alignItems: "center" },
  cancelText: { color: t.text, fontWeight: "700" },
  save: { flex: 1.5, borderRadius: 14, backgroundColor: t.primary, padding: 15, alignItems: "center" },
  saveText: { color: "#FFFFFF", fontWeight: "800" }
});

