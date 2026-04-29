#!/usr/bin/env node

import * as path from 'path';
import { Command } from 'commander';
import { TodoStorage } from './storage/TodoStorage';
import { TodoService } from './service/TodoService';
import { registerAddCommand } from './commands/add';
import { registerListCommand } from './commands/list';
import { registerCompleteCommand } from './commands/complete';
import { registerDeleteCommand } from './commands/delete';

const storage = new TodoStorage(path.join(process.cwd(), 'todos.json'));
const service = new TodoService(storage);

const program = new Command();
program
  .name('todo')
  .version('1.0.0')
  .description('Todo-Verwaltung über die Kommandozeile');

registerAddCommand(program, service);
registerListCommand(program, service);
registerCompleteCommand(program, service);
registerDeleteCommand(program, service);

program.parse(process.argv);
