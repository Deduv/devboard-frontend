export type TaskStatus = 'TODO' | 'DOING' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: number;
  assigned_user_id: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface TaskListResponse {
  data: Task[];
  total: number;
  skip: number;
  limit: number;
}
