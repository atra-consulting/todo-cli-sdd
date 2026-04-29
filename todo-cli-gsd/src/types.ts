export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export interface TodoStore {
  todos: Todo[];
  nextId: number;
}
