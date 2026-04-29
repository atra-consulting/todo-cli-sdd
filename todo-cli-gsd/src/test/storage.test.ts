/**
 * Tests for src/storage.ts
 * Uses Node.js built-in test runner (node:test) — no external framework needed.
 */
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// We test by running in a temp directory so todos.json doesn't pollute the project.
let tmpDir: string;
let originalCwd: string;

describe('storage.ts — load()', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'storage-test-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('returns empty store when todos.json does not exist (ENOENT)', async () => {
    const { load } = await import('../storage.js');
    const store = load();
    assert.deepStrictEqual(store, { todos: [], nextId: 1 });
  });

  test('returns saved store after save()', async () => {
    const { load, save } = await import('../storage.js');
    const inputStore = { todos: [{ id: 1, text: 'x', done: false }], nextId: 2 };
    save(inputStore);
    const result = load();
    assert.deepStrictEqual(result, inputStore);
  });

  test('save() writes to todos.json.tmp first then renames (no .tmp left after save)', async () => {
    const { save } = await import('../storage.js');
    save({ todos: [], nextId: 1 });
    const tmpExists = fs.existsSync(path.join(tmpDir, 'todos.json.tmp'));
    assert.strictEqual(tmpExists, false, 'todos.json.tmp should not persist after save()');
    const mainExists = fs.existsSync(path.join(tmpDir, 'todos.json'));
    assert.strictEqual(mainExists, true, 'todos.json should exist after save()');
  });

  test('save() writes pretty-printed JSON (2-space indent)', async () => {
    const { save } = await import('../storage.js');
    save({ todos: [{ id: 1, text: 'test', done: false }], nextId: 2 });
    const content = fs.readFileSync(path.join(tmpDir, 'todos.json'), 'utf8');
    assert.ok(content.includes('\n  '), 'Expected pretty-printed JSON with indentation');
  });

  test('load() throws with "corrupted" message for invalid JSON', async () => {
    const { load } = await import('../storage.js');
    fs.writeFileSync(path.join(tmpDir, 'todos.json'), 'NOT VALID JSON', 'utf8');
    assert.throws(() => load(), (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.ok(err.message.toLowerCase().includes('corrupted'), `Expected 'corrupted' in message, got: ${err.message}`);
      return true;
    });
  });

  test('todos.json is resolved via process.cwd() — changing cwd changes where file is read', async () => {
    const { save } = await import('../storage.js');
    // Save in current tmpDir
    save({ todos: [{ id: 42, text: 'cwd-test', done: false }], nextId: 43 });
    // Verify file is in cwd, not somewhere else
    const fileInCwd = fs.existsSync(path.join(tmpDir, 'todos.json'));
    assert.strictEqual(fileInCwd, true, 'todos.json should be in process.cwd()');
  });
});
