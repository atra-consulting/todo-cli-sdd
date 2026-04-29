import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { addTodo } from '../../../src/commands/add';
import { readStore } from '../../../src/storage/json-store';

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-add-'));
const testStorePath = path.join(testDir, 'todos.json');

afterEach(() => {
  if (fs.existsSync(testStorePath)) {
    fs.unlinkSync(testStorePath);
  }
});

test('addTodo creates a todo with id=1 on empty store', () => {
  addTodo('Buy groceries', testStorePath);
  const store = readStore(testStorePath);
  assert.equal(store.todos.length, 1);
  assert.equal(store.todos[0].id, 1);
  assert.equal(store.todos[0].description, 'Buy groceries');
  assert.equal(store.todos[0].completed, false);
  assert.ok(store.todos[0].createdAt);
});

test('addTodo assigns unique sequential IDs', () => {
  addTodo('First', testStorePath);
  addTodo('Second', testStorePath);
  const store = readStore(testStorePath);
  assert.equal(store.todos[0].id, 1);
  assert.equal(store.todos[1].id, 2);
});

test('addTodo throws on empty description', () => {
  assert.throws(
    () => addTodo('', testStorePath),
    (err: Error) => err.message.includes('Description must not be empty'),
  );
  assert.ok(!fs.existsSync(testStorePath));
});

test('addTodo throws on whitespace-only description', () => {
  assert.throws(
    () => addTodo('   ', testStorePath),
    (err: Error) => err.message.includes('Description must not be empty'),
  );
});

test('addTodo trims description whitespace', () => {
  addTodo('  Buy groceries  ', testStorePath);
  const store = readStore(testStorePath);
  assert.equal(store.todos[0].description, 'Buy groceries');
});
