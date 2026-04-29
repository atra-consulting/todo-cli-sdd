import type { Command } from 'commander';
import { completeTodo } from '../service.js';

export function registerComplete(program: Command): void {
  program
    .command('complete')
    .description('Toggle the done state of a todo')
    .argument('<id>', 'Todo ID')
    .action((idStr: string) => {
      const id = parseInt(idStr, 10);
      if (isNaN(id)) {
        process.stderr.write('Error: ID must be a number\n');
        process.exit(1);
      }
      try {
        const todo = completeTodo(id);
        console.log(`Done [${todo.id}] ${todo.text}`);
      } catch (err) {
        process.stderr.write(`${(err as Error).message}\n`);
        process.exit(1);
      }
    });
}
