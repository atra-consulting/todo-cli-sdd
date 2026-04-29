import { Todo } from './types/Todo';

/**
 * Formats a single Todo for display in the list output.
 * Pending todos are prefixed with `[ ]`, completed todos with `[✓]`.
 * Example pending:   `[ ] #1 Einkaufen gehen (pending) - 2024-01-15`
 * Example completed: `[✓] #2 Bericht schreiben (completed) - 2024-01-14`
 */
export function formatTodo(todo: Todo): string {
  const prefix = todo.status === 'completed' ? '[✓]' : '[ ]';
  const date = new Date(todo.createdAt).toISOString().slice(0, 10); // YYYY-MM-DD
  return `${prefix} #${todo.id} ${todo.title} (${todo.status}) - ${date}`;
}

/**
 * Returns a confirmation message after a todo was added.
 * Always includes the assigned ID.
 * Example: `Todo #1 "Einkaufen gehen" wurde hinzugefügt.`
 */
export function formatAddConfirmation(todo: Todo): string {
  return `Todo #${todo.id} "${todo.title}" wurde hinzugefügt.`;
}

/**
 * Returns a confirmation message after a todo was deleted.
 * Always includes the title of the deleted todo.
 * Example: `Todo #1 "Einkaufen gehen" wurde gelöscht.`
 */
export function formatDeleteConfirmation(todo: Todo): string {
  return `Todo #${todo.id} "${todo.title}" wurde gelöscht.`;
}

/**
 * Returns a confirmation message after a todo was marked as completed.
 * Example: `Todo #1 "Einkaufen gehen" wurde als erledigt markiert.`
 */
export function formatCompleteConfirmation(todo: Todo): string {
  return `Todo #${todo.id} "${todo.title}" wurde als erledigt markiert.`;
}
