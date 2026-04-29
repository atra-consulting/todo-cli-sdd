import fs from 'fs';
import path from 'path';
import type { TodoStore } from './types.js';

const FILE_NAME = 'todos.json';
const TMP_FILE_NAME = 'todos.json.tmp';

function getFilePath(): string {
  return path.join(process.cwd(), FILE_NAME);
}

function getTmpFilePath(): string {
  return path.join(process.cwd(), TMP_FILE_NAME);
}

export function load(): TodoStore {
  const filePath = getFilePath();
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw) as TodoStore;
    // Guard against missing fields (corrupt or partial file) — T-02-01 mitigation
    if (!Array.isArray(data.todos) || typeof data.nextId !== 'number') {
      throw new Error('todos.json is corrupted: missing required fields');
    }
    return data;
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { todos: [], nextId: 1 };
    }
    if (err instanceof SyntaxError) {
      throw new Error(`todos.json is corrupted: ${err.message}`);
    }
    throw err;
  }
}

export function save(store: TodoStore): void {
  const filePath = getFilePath();
  const tmpPath = getTmpFilePath();
  const content = JSON.stringify(store, null, 2);
  fs.writeFileSync(tmpPath, content, 'utf8');
  fs.renameSync(tmpPath, filePath);
}
