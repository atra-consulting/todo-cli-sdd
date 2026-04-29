export interface Todo {
  id: number;
  description: string;
  completed: boolean;
  createdAt: string;
}

export interface TodoStore {
  version: string;
  todos: Todo[];
}
