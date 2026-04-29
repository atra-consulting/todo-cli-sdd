import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { deleteTodo } from '../../../src/commands/delete';
import { readStore, writeStore } from '../../../src/storage/json-store';

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-delete-'));
const testStorePath = path.join(testDir, 'todos.json');

function seedStore(): void {
  writeStore({
    version: '1.0',
    todos: [
      { id: 1, description: 'Buy groceries', completed: false, createdAt: '' },
      { id: 2, description: 'Read paper', completed: false, createdAt: '' },
    ],
  }, testStorePath);
}

afterEach(() => {
  if (fs.existsSync(testStorePath)) {
    fs.unlinkSync(testStorePath);
  }
});

test('deleteTodo removes the item from the store', () => {
  seedStore();
  deleteTodo('1', testStorePath);
  const store = readStore(testStorePath);
  assert.equal(store.todos.length, 1);
  assert.equal(store.todos[0].id, 2);
});

test('deleteTodo throws on unknown ID', () => {
  seedStore();
  assert.throws(
    () => deleteTodo('99', testStorePath),
    (err: Error) => err.message.includes('No todo with ID 99'),
  );
});

test('deleteTodo throws on non-integer ID', () => {
  seedStore();
  assert.throws(
    () => deleteTodo('abc', testStorePath),
    (err: Error) => err.message.includes('positive integer'),
  );
});

test('deleteTodo leaves other todos intact', () => {
  seedStore();
  deleteTodo('1', testStorePath);
  const store = readStore(testStorePath);
  assert.equal(store.todos[0].description, 'Read paper');
});
