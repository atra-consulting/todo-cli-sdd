import { Command } from 'commander';
import { TodoService } from '../service/TodoService';
import { formatTodo } from '../formatter';

export function registerListCommand(program: Command, service: TodoService): void {
  program
    .command('list')
    .description('Todos auflisten')
    .option('--pending', 'Nur offene Todos anzeigen')
    .option('--completed', 'Nur erledigte Todos anzeigen')
    .action((options: { pending?: boolean; completed?: boolean }) => {
      const filter: 'pending' | 'completed' | undefined = options.pending
        ? 'pending'
        : options.completed
        ? 'completed'
        : undefined;

      const result = service.listTodos(filter);
      if (result.success) {
        if (result.data.length === 0) {
          console.log('Keine Todos vorhanden.');
        } else {
          result.data.forEach(todo => console.log(formatTodo(todo)));
        }
        process.exitCode = 0;
      } else {
        console.error(result.error);
        process.exitCode = 1;
      }
    });
}
