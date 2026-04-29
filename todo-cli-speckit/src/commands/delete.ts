import { readStore, writeStore } from '../storage/json-store';

export function deleteTodo(rawId: string, storePath?: string): void {
  const id = parseInt(rawId, 10);
  if (!Number.isInteger(id) || id <= 0 || String(id) !== rawId.trim()) {
    throw new Error('ID must be a positive integer.');
  }

  const store = readStore(storePath);
  const index = store.todos.findIndex(t => t.id === id);

  if (index === -1) {
    throw new Error(`No todo with ID ${id}.`);
  }

  const [removed] = store.todos.splice(index, 1);
  writeStore(store, storePath);
  console.log(`✓ Deleted todo #${id}: ${removed.description}`);
}
