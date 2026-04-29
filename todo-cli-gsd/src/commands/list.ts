import type { Command } from 'commander';
import { listTodos } from '../service.js';

export function registerList(program: Command): void {
  program
    .command('list')
    .description('List all todos')
    .action(() => {
      const todos = listTodos();
      if (todos.length === 0) {
        console.log('No todos yet. Run: todo add "text"');
        return;
      }
      for (const todo of todos) {
        const checkbox = todo.done ? 'x' : ' ';
        console.log(`[${todo.id}] [${checkbox}] ${todo.text}`);
      }
    });
}
