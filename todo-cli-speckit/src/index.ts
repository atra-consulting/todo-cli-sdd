#!/usr/bin/env node
import { Command } from 'commander';
import { addTodo } from './commands/add';
import { listTodos } from './commands/list';
import { completeTodo } from './commands/complete';
import { deleteTodo } from './commands/delete';

const program = new Command();

program
  .name('todo')
  .description('A simple command-line todo manager')
  .version('1.0.0');

program
  .command('add <description>')
  .description('Add a new todo item')
  .action((description: string) => {
    try {
      addTodo(description);
    } catch (err) {
      process.stderr.write(`Error: ${(err as Error).message}\n`);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all todo items')
  .action(() => {
    try {
      listTodos();
    } catch (err) {
      process.stderr.write(`Error: ${(err as Error).message}\n`);
      process.exit(1);
    }
  });

program
  .command('complete <id>')
  .description('Mark a todo item as complete')
  .action((id: string) => {
    try {
      completeTodo(id);
    } catch (err) {
      process.stderr.write(`Error: ${(err as Error).message}\n`);
      process.exit(1);
    }
  });

program
  .command('delete <id>')
  .description('Delete a todo item')
  .action((id: string) => {
    try {
      deleteTodo(id);
    } catch (err) {
      process.stderr.write(`Error: ${(err as Error).message}\n`);
      process.exit(1);
    }
  });

program.parse();
