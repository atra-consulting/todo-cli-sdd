import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { completeTodo } from '../../../src/commands/complete';
import { readStore, writeStore } from '../../../src/storage/json-store';

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-complete-'));
const testStorePath = path.join(testDir, 'todos.json');

function seedStore(completed = false): void {
  writeStore({
    version: '1.0',
    todos: [{ id: 1, description: 'Buy groceries', completed, createdAt: '' }],
  }, testStorePath);
}

afterEach(() => {
  if (fs.existsSync(testStorePath)) {
    fs.unlinkSync(testStorePath);
  }
});

test('completeTodo marks a pending todo as done', () => {
  seedStore();
  completeTodo('1', testStorePath);
  const store = readStore(testStorePath);
  assert.equal(store.todos[0].completed, true);
});

test('completeTodo throws on unknown ID', () => {
  seedStore();
  assert.throws(
    () => completeTodo('99', testStorePath),
    (err: Error) => err.message.includes('No todo with ID 99'),
  );
});

test('completeTodo throws on non-integer ID', () => {
  seedStore();
  assert.throws(
    () => completeTodo('abc', testStorePath),
    (err: Error) => err.message.includes('positive integer'),
  );
});

test('completeTodo does not throw when todo is already done', () => {
  seedStore(true);
  assert.doesNotThrow(() => completeTodo('1', testStorePath));
});

test('completeTodo does not modify store when already done', () => {
  seedStore(true);
  completeTodo('1', testStorePath);
  const store = readStore(testStorePath);
  assert.equal(store.todos[0].completed, true);
  assert.equal(store.todos.length, 1);
});
