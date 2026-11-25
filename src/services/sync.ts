import NetInfo from "@react-native-community/netinfo";
import {
  collection, doc, getDocs, setDoc
} from "firebase/firestore";
import { ensureAnonymousUser, getCloudDatabase, isFirebaseConfigured } from "./firebase";
import { markTaskSynced, readTasks, saveTask } from "../database/db";
import type { Task } from "../types/task";

let syncInProgress = false;

function cloudTaskToTask(data: any): Task {
  return {
    id: String(data.id),
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    priority: data.priority === "low" || data.priority === "high" ? data.priority : "medium",
    dueDate: data.dueDate ?? null,
    category: String(data.category ?? "Personal"),
    completed: Boolean(data.completed),
    subtasks: Array.isArray(data.subtasks) ? data.subtasks : [],
    createdAt: Number(data.createdAt ?? Date.now()),
    updatedAt: Number(data.updatedAt ?? Date.now()),
    deletedAt: data.deletedAt == null ? null : Number(data.deletedAt),
    syncStatus: "synced"
  };
}

export async function syncWithCloud(): Promise<{ status: "synced" | "offline" | "disabled" | "error"; message: string }> {
  if (syncInProgress) return { status: "synced", message: "Sync already running." };
  if (!isFirebaseConfigured()) return { status: "disabled", message: "Cloud backup is not configured yet." };

  const network = await NetInfo.fetch();
  if (!network.isConnected || network.isInternetReachable === false) {
    return { status: "offline", message: "Offline. Changes are safely stored on this phone." };
  }

  syncInProgress = true;
  try {
    const uid = await ensureAnonymousUser();
    const db = getCloudDatabase();
    const remoteRef = collection(db, "users", uid, "tasks");
    const snapshot = await getDocs(remoteRef);
    const remoteById = new Map<string, Task>();
    snapshot.forEach(item => remoteById.set(item.id, cloudTaskToTask(item.data())));

    const localTasks = await readTasks(true);
    const localById = new Map(localTasks.map(task => [task.id, task]));

    // Pull newer cloud records first. Updated timestamps are used for deterministic last-write-wins.
    for (const remote of remoteById.values()) {
      const local = localById.get(remote.id);
      if (!local || remote.updatedAt > local.updatedAt) {
        await saveTask({ ...remote, syncStatus: "synced" });
        localById.set(remote.id, { ...remote, syncStatus: "synced" });
      }
    }

    // Push local pending records, including deletion tombstones.
    for (const task of localById.values()) {
      const remote = remoteById.get(task.id);
      if (task.syncStatus === "pending" || !remote || task.updatedAt > remote.updatedAt) {
        await setDoc(doc(db, "users", uid, "tasks", task.id), {
          ...task,
          syncStatus: "synced"
        });
        await markTaskSynced(task.id);
      }
    }

    return { status: "synced", message: "Cloud backup is up to date." };
  } catch (error) {
    console.warn("TaskFlow cloud sync failed:", error);
    return { status: "error", message: "Cloud backup couldn't finish. Your local tasks are safe." };
  } finally {
    syncInProgress = false;
  }
}
