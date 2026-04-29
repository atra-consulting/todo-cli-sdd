export interface Todo {
  id: number;
  title: string;
  status: 'pending' | 'completed';
  createdAt: string; // ISO 8601
}

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
