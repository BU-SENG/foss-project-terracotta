export type TaskStatus = "pending" | "ongoing" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type Taskcategory = "work" | "personal" | "school" | "errands" | "other";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: Taskcategory;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SortField = "priority" | "category" | "dueDate" | "title";
export type SortOrder = "asc" | "desc";
