import { create } from "zustand";
import { readTasks, saveTask } from "../database/db";
import { syncWithCloud } from "../services/sync";
import { scheduleTaskReminder } from "../services/notifications";
import type { Task, TaskDraft } from "../types/task";

type TaskState = {
  tasks: Task[];
  ready: boolean;
  syncMessage: string;
  hydrate: () => Promise<void>;
  addTask: (draft: TaskDraft) => Promise<void>;
  updateTask: (id: string, draft: TaskDraft) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  sync: () => Promise<void>;
};

const now = () => Date.now();

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  ready: false,
  syncMessage: "Saved on this phone",
  hydrate: async () => {
    const tasks = (await readTasks()).filter(task => !task.deletedAt);
    set({ tasks, ready: true });
    void get().sync();
  },
  addTask: async draft => {
    const timestamp = now();
    const task: Task = {
      ...draft,
      id: `task_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
      title: draft.title.trim(),
      description: draft.description.trim(),
      category: draft.category.trim() || "Personal",
      completed: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
      syncStatus: "pending"
    };
    await saveTask(task);
    set(state => ({ tasks: [task, ...state.tasks] }));
    await scheduleTaskReminder(task.id, task.title, task.dueDate);
    void get().sync();
  },
  updateTask: async (id, draft) => {
    const current = get().tasks.find(task => task.id === id);
    if (!current) return;
    const updated: Task = {
      ...current, ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      category: draft.category.trim() || "Personal",
      updatedAt: now(),
      syncStatus: "pending"
    };
    await saveTask(updated);
    set(state => ({ tasks: state.tasks.map(task => task.id === id ? updated : task) }));
    await scheduleTaskReminder(updated.id, updated.title, updated.dueDate);
    void get().sync();
  },
  toggleTask: async id => {
    const current = get().tasks.find(task => task.id === id);
    if (!current) return;
    const updated = { ...current, completed: !current.completed, updatedAt: now(), syncStatus: "pending" as const };
    await saveTask(updated);
    set(state => ({ tasks: state.tasks.map(task => task.id === id ? updated : task) }));
    void get().sync();
  },
  deleteTask: async id => {
    const current = get().tasks.find(task => task.id === id);
    if (!current) return;
    const deleted = { ...current, deletedAt: now(), updatedAt: now(), syncStatus: "pending" as const };
    await saveTask(deleted);
    set(state => ({ tasks: state.tasks.filter(task => task.id !== id) }));
    void get().sync();
  },
  toggleSubtask: async (taskId, subtaskId) => {
    const current = get().tasks.find(task => task.id === taskId);
    if (!current) return;
    const updated = {
      ...current,
      subtasks: current.subtasks.map(item => item.id === subtaskId ? { ...item, completed: !item.completed } : item),
      updatedAt: now(),
      syncStatus: "pending" as const
    };
    await saveTask(updated);
    set(state => ({ tasks: state.tasks.map(task => task.id === taskId ? updated : task) }));
    void get().sync();
  },
  sync: async () => {
    const result = await syncWithCloud();
    set({ syncMessage: result.message });
    if (result.status === "synced") {
      set({ tasks: await readTasks() });
    }
  }
}));
