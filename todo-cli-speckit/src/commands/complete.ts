import { readStore, writeStore } from '../storage/json-store';

export function completeTodo(rawId: string, storePath?: string): void {
  const id = parseInt(rawId, 10);
  if (!Number.isInteger(id) || id <= 0 || String(id) !== rawId.trim()) {
    throw new Error('ID must be a positive integer.');
  }

  const store = readStore(storePath);
  const todo = store.todos.find(t => t.id === id);

  if (!todo) {
    throw new Error(`No todo with ID ${id}.`);
  }

  if (todo.completed) {
    console.log(`Todo #${id} is already marked as done.`);
    return;
  }

  todo.completed = true;
  writeStore(store, storePath);
  console.log(`✓ Completed todo #${id}: ${todo.description}`);
}
