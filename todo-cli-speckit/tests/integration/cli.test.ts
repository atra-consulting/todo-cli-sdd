import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-integration-'));
const CLI = path.join(__dirname, '..', '..', 'src', 'index.js');

function run(args: string[]) {
  return spawnSync('node', [CLI, ...args], {
    encoding: 'utf-8',
    env: { ...process.env, TODO_STORE_DIR: testDir },
  });
}

beforeEach(() => {
  const storePath = path.join(testDir, 'todos.json');
  if (fs.existsSync(storePath)) {
    fs.unlinkSync(storePath);
  }
});

test('add: creates a todo and prints confirmation', () => {
  const result = run(['add', 'Buy groceries']);
  assert.equal(result.status, 0);
  assert.ok(result.stdout.includes('✓ Added todo #1: Buy groceries'));
});

test('add: rejects empty description with exit code 1', () => {
  const result = run(['add', '']);
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes('Description must not be empty'));
});

test('add: assigns incrementing IDs', () => {
  run(['add', 'First']);
  const result = run(['add', 'Second']);
  assert.ok(result.stdout.includes('#2'));
});

test('list: shows empty message when no todos exist', () => {
  const result = run(['list']);
  assert.equal(result.status, 0);
  assert.ok(result.stdout.includes('No todos yet'));
});

test('list: shows added items with status indicators', () => {
  run(['add', 'Task one']);
  run(['add', 'Task two']);
  const result = run(['list']);
  assert.equal(result.status, 0);
  assert.ok(result.stdout.includes('Task one'));
  assert.ok(result.stdout.includes('Task two'));
  assert.ok(result.stdout.includes('[ ]'));
});

test('complete: marks a todo as done', () => {
  run(['add', 'Mark me done']);
  const result = run(['complete', '1']);
  assert.equal(result.status, 0);
  assert.ok(result.stdout.includes('✓ Completed todo #1'));
  const listResult = run(['list']);
  assert.ok(listResult.stdout.includes('[✓]'));
});

test('complete: returns exit 0 with notice when already done', () => {
  run(['add', 'Already done']);
  run(['complete', '1']);
  const result = run(['complete', '1']);
  assert.equal(result.status, 0);
  assert.ok(result.stdout.includes('already marked as done'));
});

test('complete: exits 1 for unknown ID', () => {
  const result = run(['complete', '99']);
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes('No todo with ID 99'));
});

test('delete: removes a todo permanently', () => {
  run(['add', 'Delete me']);
  const result = run(['delete', '1']);
  assert.equal(result.status, 0);
  assert.ok(result.stdout.includes('✓ Deleted todo #1'));
  const listResult = run(['list']);
  assert.ok(listResult.stdout.includes('No todos yet'));
});

test('delete: exits 1 for unknown ID', () => {
  const result = run(['delete', '99']);
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes('No todo with ID 99'));
});
