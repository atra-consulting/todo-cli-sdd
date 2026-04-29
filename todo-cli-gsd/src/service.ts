import type { Todo } from './types.js';
import { load, save } from './storage.js';

export function addTodo(text: string): Todo {
  const store = load();
  const todo: Todo = {
    id: store.nextId,
    text,
    done: false,
  };
  store.todos.push(todo);
  store.nextId += 1;
  save(store);
  return todo;
}

export function listTodos(): Todo[] {
  const store = load();
  return store.todos;
}

export function completeTodo(id: number): Todo {
  const store = load();
  const todo = store.todos.find((t) => t.id === id);
  if (!todo) {
    throw new Error(`Todo with ID ${id} not found`);
  }
  todo.done = !todo.done;
  save(store);
  return todo;
}

export function deleteTodo(id: number): void {
  const store = load();
  const index = store.todos.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error(`Todo with ID ${id} not found`);
  }
  store.todos.splice(index, 1);
  save(store);
}
