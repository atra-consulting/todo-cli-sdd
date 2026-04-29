import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { TodoStore } from '../models/todo';

const EMPTY_STORE: TodoStore = { version: '1.0', todos: [] };

export function getStorePath(): string {
  const dir = process.env.TODO_STORE_DIR
    ? path.resolve(process.env.TODO_STORE_DIR)
    : path.join(os.homedir(), '.todo');
  return path.join(dir, 'todos.json');
}

export function readStore(storePath?: string): TodoStore {
  const resolvedPath = storePath ?? getStorePath();

  if (!fs.existsSync(resolvedPath)) {
    return { ...EMPTY_STORE, todos: [] };
  }

  const raw = fs.readFileSync(resolvedPath, 'utf-8');
  try {
    return JSON.parse(raw) as TodoStore;
  } catch {
    throw new Error(`Could not read storage file: ${resolvedPath}`);
  }
}

export function writeStore(store: TodoStore, storePath?: string): void {
  const resolvedPath = storePath ?? getStorePath();
  const dir = path.dirname(resolvedPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    fs.writeFileSync(resolvedPath, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    throw new Error(`Could not write to storage file: ${resolvedPath}`);
  }
}
