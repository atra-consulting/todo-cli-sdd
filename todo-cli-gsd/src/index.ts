#!/usr/bin/env node

import { Command } from 'commander';
import { registerAdd } from './commands/add.js';
import { registerList } from './commands/list.js';
import { registerComplete } from './commands/complete.js';
import { registerDelete } from './commands/delete.js';

const program = new Command();

program
  .name('todo')
  .description('Manage todos in a local todos.json file')
  .version('1.0.0');

registerAdd(program);
registerList(program);
registerComplete(program);
registerDelete(program);

program.parse(process.argv);
