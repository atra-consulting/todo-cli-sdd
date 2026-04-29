import type { Command } from 'commander';
import { deleteTodo, listTodos } from '../service.js';

export function registerDelete(program: Command): void {
  program
    .command('delete')
    .description('Delete a todo')
    .argument('<id>', 'Todo ID')
    .action((idStr: string) => {
      const id = parseInt(idStr, 10);
      if (isNaN(id)) {
        process.stderr.write('Error: ID must be a number\n');
        process.exit(1);
      }
      // Fetch text before deletion since deleteTodo returns void
      const todos = listTodos();
      const todo = todos.find((t) => t.id === id);
      if (!todo) {
        process.stderr.write(`Todo with ID ${id} not found\n`);
        process.exit(1);
      }
      deleteTodo(id);
      console.log(`Deleted [${todo.id}] ${todo.text}`);
    });
}
