import * as SQLite from "expo-sqlite";
import type { Task } from "../types/task";

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!database) {
    database = await SQLite.openDatabaseAsync("taskflow.db");
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        priority TEXT NOT NULL DEFAULT 'medium',
        dueDate TEXT,
        category TEXT NOT NULL DEFAULT 'Personal',
        completed INTEGER NOT NULL DEFAULT 0,
        subtasks TEXT NOT NULL DEFAULT '[]',
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        deletedAt INTEGER,
        syncStatus TEXT NOT NULL DEFAULT 'pending'
      );
      CREATE INDEX IF NOT EXISTS idx_tasks_updatedAt ON tasks(updatedAt);
      CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks(dueDate);
      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  }
  return database;
}

function rowToTask(row: any): Task {
  let subtasks = [];
  try { subtasks = JSON.parse(row.subtasks || "[]"); } catch { subtasks = []; }
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    priority: row.priority,
    dueDate: row.dueDate ?? null,
    category: row.category ?? "Personal",
    completed: Boolean(row.completed),
    subtasks,
    createdAt: Number(row.createdAt),
    updatedAt: Number(row.updatedAt),
    deletedAt: row.deletedAt == null ? null : Number(row.deletedAt),
    syncStatus: row.syncStatus
  };
}

export async function readTasks(includeDeleted = false): Promise<Task[]> {
  const db = await getDatabase();
  const rows = includeDeleted
    ? await db.getAllAsync<any>("SELECT * FROM tasks ORDER BY completed ASC, dueDate IS NULL, dueDate ASC, updatedAt DESC")
    : await db.getAllAsync<any>("SELECT * FROM tasks WHERE deletedAt IS NULL ORDER BY completed ASC, dueDate IS NULL, dueDate ASC, updatedAt DESC");
  return rows.map(rowToTask);
}

export async function saveTask(task: Task): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO tasks (id,title,description,priority,dueDate,category,completed,subtasks,createdAt,updatedAt,deletedAt,syncStatus)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       title=excluded.title, description=excluded.description, priority=excluded.priority,
       dueDate=excluded.dueDate, category=excluded.category, completed=excluded.completed,
       subtasks=excluded.subtasks, createdAt=excluded.createdAt, updatedAt=excluded.updatedAt,
       deletedAt=excluded.deletedAt, syncStatus=excluded.syncStatus`,
    task.id, task.title, task.description, task.priority, task.dueDate, task.category,
    task.completed ? 1 : 0, JSON.stringify(task.subtasks), task.createdAt,
    task.updatedAt, task.deletedAt, task.syncStatus
  );
}

export async function markTaskSynced(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("UPDATE tasks SET syncStatus='synced' WHERE id=?", id);
}

export async function getMeta(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM app_meta WHERE key=?", key);
  return row?.value ?? null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT INTO app_meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    key, value
  );
}
