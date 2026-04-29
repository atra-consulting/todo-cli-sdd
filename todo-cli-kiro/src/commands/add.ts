import { Command } from 'commander';
import { TodoService } from '../service/TodoService';
import { formatAddConfirmation } from '../formatter';

export function registerAddCommand(program: Command, service: TodoService): void {
  program
    .command('add <title>')
    .description('Neues Todo hinzufügen')
    .action((title: string) => {
      const result = service.addTodo(title);
      if (result.success) {
        console.log(formatAddConfirmation(result.data));
        process.exitCode = 0;
      } else {
        console.error(result.error);
        process.exitCode = 1;
      }
    });
}
