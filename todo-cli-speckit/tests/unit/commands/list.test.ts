import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { listTodos } from '../../../src/commands/list';
import { writeStore } from '../../../src/storage/json-store';
import type { TodoStore } from '../../../src/models/todo';

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-list-'));
const testStorePath = path.join(testDir, 'todos.json');

function captureOutput(fn: () => void): string {
  const lines: string[] = [];
  const orig = console.log;
  console.log = (...args: unknown[]) => lines.push(args.join(' '));
  try { fn(); } finally { console.log = orig; }
  return lines.join('\n');
}

afterEach(() => {
  if (fs.existsSync(testStorePath)) {
    fs.unlinkSync(testStorePath);
  }
});

test('listTodos prints empty message when store is empty', () => {
  const out = captureOutput(() => listTodos(testStorePath));
  assert.ok(out.includes('No todos yet'));
});

test('listTodos shows all todos with IDs and descriptions', () => {
  const store: TodoStore = {
    version: '1.0',
    todos: [
      { id: 1, description: 'Buy groceries', completed: false, createdAt: '' },
      { id: 2, description: 'Read paper', completed: false, createdAt: '' },
    ],
  };
  writeStore(store, testStorePath);
  const out = captureOutput(() => listTodos(testStorePath));
  assert.ok(out.includes('Buy groceries'));
  assert.ok(out.includes('Read paper'));
  assert.ok(out.includes('1'));
  assert.ok(out.includes('2'));
});

test('listTodos distinguishes pending and completed items', () => {
  const store: TodoStore = {
    version: '1.0',
    todos: [
      { id: 1, description: 'Pending task', completed: false, createdAt: '' },
      { id: 2, description: 'Done task', completed: true, createdAt: '' },
    ],
  };
  writeStore(store, testStorePath);
  const out = captureOutput(() => listTodos(testStorePath));
  assert.ok(out.includes('[ ]'));
  assert.ok(out.includes('[✓]'));
});
