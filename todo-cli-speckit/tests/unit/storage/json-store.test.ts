import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { readStore, writeStore } from '../../../src/storage/json-store';

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-storage-'));
const testStorePath = path.join(testDir, 'todos.json');

afterEach(() => {
  if (fs.existsSync(testStorePath)) {
    fs.unlinkSync(testStorePath);
  }
});

test('readStore returns empty store when file is missing', () => {
  const store = readStore(testStorePath);
  assert.deepEqual(store.todos, []);
  assert.equal(store.version, '1.0');
});

test('writeStore and readStore round-trip preserves data', () => {
  const store = {
    version: '1.0',
    todos: [{ id: 1, description: 'Test', completed: false, createdAt: '2026-01-01T00:00:00.000Z' }],
  };
  writeStore(store, testStorePath);
  const loaded = readStore(testStorePath);
  assert.deepEqual(loaded, store);
});

test('readStore throws on corrupt JSON without overwriting the file', () => {
  fs.writeFileSync(testStorePath, 'not valid json', 'utf-8');
  assert.throws(
    () => readStore(testStorePath),
    (err: Error) => err.message.includes('Could not read storage file'),
  );
  assert.equal(fs.readFileSync(testStorePath, 'utf-8'), 'not valid json');
});

test('writeStore creates missing directories', () => {
  const deepPath = path.join(testDir, 'nested', 'deep', 'todos.json');
  writeStore({ version: '1.0', todos: [] }, deepPath);
  assert.ok(fs.existsSync(deepPath));
  fs.rmSync(path.join(testDir, 'nested'), { recursive: true });
});
