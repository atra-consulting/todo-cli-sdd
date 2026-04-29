/**
 * Tests for src/service.ts
 * Uses Node.js built-in test runner (node:test) — no external framework needed.
 *
 * Each test operates in a temp directory to avoid polluting todos.json in the project.
 */
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

let tmpDir: string;
let originalCwd: string;

// We must re-import service functions fresh per test because storage uses process.cwd()
// and the module cache would hold old state. We use dynamic import inside each test.

describe('service.ts — addTodo()', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'service-test-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('addTodo returns Todo with id:1 on first call', async () => {
    const { addTodo } = await import('../service.js');
    const todo = addTodo('Buy milk');
    assert.strictEqual(todo.id, 1);
    assert.strictEqual(todo.text, 'Buy milk');
    assert.strictEqual(todo.done, false);
  });

  test('addTodo assigns store.nextId as the id, not a calculated value', async () => {
    const { addTodo } = await import('../service.js');
    const first = addTodo('First');
    const second = addTodo('Second');
    assert.strictEqual(first.id, 1);
    assert.strictEqual(second.id, 2);
  });

  test('addTodo increments nextId in persisted store after each call', async () => {
    const { addTodo } = await import('../service.js');
    addTodo('Task A');
    addTodo('Task B');
    const content = JSON.parse(fs.readFileSync(path.join(tmpDir, 'todos.json'), 'utf8'));
    assert.strictEqual(content.nextId, 3, 'nextId should be 3 after two adds');
  });
});

describe('service.ts — listTodos()', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'service-test-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('listTodos returns empty array on fresh store', async () => {
    const { listTodos } = await import('../service.js');
    const todos = listTodos();
    assert.deepStrictEqual(todos, []);
  });

  test('listTodos returns all todos after adds', async () => {
    const { addTodo, listTodos } = await import('../service.js');
    addTodo('Task 1');
    addTodo('Task 2');
    const todos = listTodos();
    assert.strictEqual(todos.length, 2);
    assert.strictEqual(todos[0].text, 'Task 1');
    assert.strictEqual(todos[1].text, 'Task 2');
  });
});

describe('service.ts — completeTodo()', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'service-test-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('completeTodo toggles done false -> true', async () => {
    const { addTodo, completeTodo } = await import('../service.js');
    addTodo('Toggle me');
    const result = completeTodo(1);
    assert.strictEqual(result.done, true);
  });

  test('completeTodo toggles done true -> false on second call', async () => {
    const { addTodo, completeTodo } = await import('../service.js');
    addTodo('Toggle me');
    completeTodo(1); // false -> true
    const result = completeTodo(1); // true -> false
    assert.strictEqual(result.done, false);
  });

  test('completeTodo throws "not found" for non-existent ID', async () => {
    const { completeTodo } = await import('../service.js');
    assert.throws(() => completeTodo(999), (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.ok(err.message.includes('not found'), `Expected 'not found' in message, got: ${err.message}`);
      return true;
    });
  });
});

describe('service.ts — deleteTodo()', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'service-test-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('deleteTodo removes the todo from the store', async () => {
    const { addTodo, deleteTodo, listTodos } = await import('../service.js');
    addTodo('To delete');
    deleteTodo(1);
    assert.deepStrictEqual(listTodos(), []);
  });

  test('deleteTodo throws "not found" for non-existent ID', async () => {
    const { deleteTodo } = await import('../service.js');
    assert.throws(() => deleteTodo(999), (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.ok(err.message.includes('not found'), `Expected 'not found' in message, got: ${err.message}`);
      return true;
    });
  });

  test('nextId does NOT reuse deleted IDs (STOR-03: nextId only increases)', async () => {
    const { addTodo, deleteTodo } = await import('../service.js');
    addTodo('First');
    deleteTodo(1);
    const second = addTodo('Second after delete');
    assert.notStrictEqual(second.id, 1, 'New todo should NOT reuse deleted ID 1');
    assert.strictEqual(second.id, 2, 'New todo should get ID 2 (nextId increments monotonically)');
  });
});
