import { readStore, writeStore } from '../storage/json-store';

export function addTodo(description: string, storePath?: string): void {
  if (!description || !description.trim()) {
    throw new Error('Description must not be empty.');
  }

  const store = readStore(storePath);
  const nextId = store.todos.length > 0
    ? Math.max(...store.todos.map(t => t.id)) + 1
    : 1;

  store.todos.push({
    id: nextId,
    description: description.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  });

  writeStore(store, storePath);
  console.log(`✓ Added todo #${nextId}: ${description.trim()}`);
}
