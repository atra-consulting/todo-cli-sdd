import { Command } from 'commander';
import { TodoService } from '../service/TodoService';
import { formatCompleteConfirmation } from '../formatter';

export function registerCompleteCommand(program: Command, service: TodoService): void {
  program
    .command('complete <id>')
    .description('Todo als erledigt markieren')
    .action((idStr: string) => {
      const id = parseInt(idStr, 10);
      const result = service.completeTodo(id);
      if (result.success) {
        console.log(formatCompleteConfirmation(result.data));
        process.exitCode = 0;
      } else {
        console.error(result.error);
        process.exitCode = 1;
      }
    });
}
