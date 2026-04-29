import type { Command } from 'commander';
import { addTodo } from '../service.js';

export function registerAdd(program: Command): void {
  program
    .command('add')
    .description('Add a new todo')
    .argument('<text>', 'Todo text')
    .action((text: string) => {
      const todo = addTodo(text);
      console.log(`Added [${todo.id}] ${todo.text}`);
    });
}
