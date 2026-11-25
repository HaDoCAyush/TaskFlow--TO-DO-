export type Priority = "low" | "medium" | "high";

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null; // YYYY-MM-DD
  category: string;
  completed: boolean;
  subtasks: Subtask[];
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  syncStatus: "pending" | "synced" | "local";
};

export type TaskDraft = Pick<
  Task,
  "title" | "description" | "priority" | "dueDate" | "category" | "subtasks"
>;
