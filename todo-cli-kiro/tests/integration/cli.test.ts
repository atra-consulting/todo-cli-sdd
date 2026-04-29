import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { TodoStorage } from '../../src/storage/TodoStorage';
import { TodoService } from '../../src/service/TodoService';
import { formatTodo, formatAddConfirmation, formatDeleteConfirmation } from '../../src/formatter';

// ─── Helpers ────────────────────────────────────────────────────────────────

let tmpFilePath: string;
let storage: TodoStorage;
let service: TodoService;

beforeEach(() => {
  tmpFilePath = path.join(os.tmpdir(), `todo-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  storage = new TodoStorage(tmpFilePath);
  service = new TodoService(storage);
});

afterEach(() => {
  // Clean up temp file and any leftover .tmp file
  for (const p of [tmpFilePath, tmpFilePath + '.tmp']) {
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
    }
  }
});

// ─── Service Integration Tests ───────────────────────────────────────────────

describe('add', () => {
  it('returns error when title is empty (Requirement 1.4)', () => {
    const result = service.addTodo('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });

  it('returns error when title is whitespace-only (Requirement 1.5)', () => {
    const result = service.addTodo('   \t\n  ');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });

  it('succeeds with valid title and returns todo with correct fields (Requirements 1.1, 1.3)', () => {
    const result = service.addTodo('Buy groceries');
    expect(result.success).toBe(true);
    if (result.success) {
      const todo = result.data;
      expect(todo.title).toBe('Buy groceries');
      expect(todo.status).toBe('pending');
      expect(todo.id).toBeGreaterThan(0);
      // createdAt must be a valid ISO 8601 string
      expect(() => new Date(todo.createdAt)).not.toThrow();
      expect(new Date(todo.createdAt).toISOString()).toBe(todo.createdAt);
    }
  });
});

describe('list', () => {
  it('returns empty array when storage is empty (Requirement 2.2)', () => {
    const result = service.listTodos();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it('returns all todos after adding (Requirement 2.1)', () => {
    service.addTodo('Task A');
    service.addTodo('Task B');
    const result = service.listTodos();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      const titles = result.data.map(t => t.title);
      expect(titles).toContain('Task A');
      expect(titles).toContain('Task B');
    }
  });

  it('--pending filter returns only pending todos (Requirement 2.3)', () => {
    service.addTodo('Pending task');
    const addResult = service.addTodo('To complete');
    if (addResult.success) {
      service.completeTodo(addResult.data.id);
    }

    const result = service.listTodos('pending');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(todo => expect(todo.status).toBe('pending'));
    }
  });

  it('--completed filter returns only completed todos (Requirement 2.4)', () => {
    service.addTodo('Pending task');
    const addResult = service.addTodo('To complete');
    if (addResult.success) {
      service.completeTodo(addResult.data.id);
    }

    const result = service.listTodos('completed');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(todo => expect(todo.status).toBe('completed'));
    }
  });
});

describe('complete', () => {
  it('changes status to completed for valid id (Requirement 3.1)', () => {
    const addResult = service.addTodo('Do something');
    expect(addResult.success).toBe(true);
    if (!addResult.success) return;

    const completeResult = service.completeTodo(addResult.data.id);
    expect(completeResult.success).toBe(true);
    if (completeResult.success) {
      expect(completeResult.data.status).toBe('completed');
      // All other fields must remain unchanged
      expect(completeResult.data.id).toBe(addResult.data.id);
      expect(completeResult.data.title).toBe(addResult.data.title);
      expect(completeResult.data.createdAt).toBe(addResult.data.createdAt);
    }
  });

  it('returns error when todo is already completed (Requirement 3.5)', () => {
    const addResult = service.addTodo('Already done');
    expect(addResult.success).toBe(true);
    if (!addResult.success) return;

    service.completeTodo(addResult.data.id);
    const secondComplete = service.completeTodo(addResult.data.id);
    expect(secondComplete.success).toBe(false);
    if (!secondComplete.success) {
      expect(secondComplete.error).toBeTruthy();
    }
  });

  it('returns error for unknown id (Requirement 3.4)', () => {
    const result = service.completeTodo(9999);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });
});

describe('delete', () => {
  it('removes todo for valid id (Requirement 4.1)', () => {
    const addResult = service.addTodo('To be deleted');
    expect(addResult.success).toBe(true);
    if (!addResult.success) return;

    const deleteResult = service.deleteTodo(addResult.data.id);
    expect(deleteResult.success).toBe(true);

    // Verify it's gone from the list
    const listResult = service.listTodos();
    if (listResult.success) {
      const ids = listResult.data.map(t => t.id);
      expect(ids).not.toContain(addResult.data.id);
    }
  });

  it('returns error for unknown id (Requirement 4.4)', () => {
    const result = service.deleteTodo(9999);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });
});

// ─── Formatter Unit Tests ────────────────────────────────────────────────────

describe('formatter', () => {
  const pendingTodo = {
    id: 1,
    title: 'Buy milk',
    status: 'pending' as const,
    createdAt: '2024-01-15T10:30:00.000Z',
  };

  const completedTodo = {
    id: 2,
    title: 'Write report',
    status: 'completed' as const,
    createdAt: '2024-01-14T08:00:00.000Z',
  };

  it('formatTodo for pending todo contains "[ ]"', () => {
    const output = formatTodo(pendingTodo);
    expect(output).toContain('[ ]');
  });

  it('formatTodo for completed todo contains "[✓]"', () => {
    const output = formatTodo(completedTodo);
    expect(output).toContain('[✓]');
  });

  it('formatAddConfirmation contains the todo ID', () => {
    const output = formatAddConfirmation(pendingTodo);
    expect(output).toContain(String(pendingTodo.id));
  });

  it('formatDeleteConfirmation contains the todo title', () => {
    const output = formatDeleteConfirmation(pendingTodo);
    expect(output).toContain(pendingTodo.title);
  });
});
