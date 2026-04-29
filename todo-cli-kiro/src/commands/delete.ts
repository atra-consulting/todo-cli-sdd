import { Command } from 'commander';
import { TodoService } from '../service/TodoService';
import { formatDeleteConfirmation } from '../formatter';

export function registerDeleteCommand(program: Command, service: TodoService): void {
  program
    .command('delete <id>')
    .description('Todo löschen')
    .action((idStr: string) => {
      const id = parseInt(idStr, 10);
      const result = service.deleteTodo(id);
      if (result.success) {
        console.log(formatDeleteConfirmation(result.data));
        process.exitCode = 0;
      } else {
        console.error(result.error);
        process.exitCode = 1;
      }
    });
}
