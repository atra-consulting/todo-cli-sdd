import { readStore } from '../storage/json-store';

export function listTodos(storePath?: string): void {
  const store = readStore(storePath);

  if (store.todos.length === 0) {
    console.log('No todos yet. Add one with: todo add "<description>"');
    return;
  }

  const header = 'ID   Status  Description';
  const separator = '---  ------  ' + '-'.repeat(40);
  console.log(header);
  console.log(separator);

  for (const todo of store.todos) {
    const status = todo.completed ? '[✓]' : '[ ]';
    const id = String(todo.id).padEnd(3);
    console.log(`${id}  ${status}     ${todo.description}`);
  }
}
