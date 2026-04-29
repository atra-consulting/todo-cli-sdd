import * as fs from 'fs';
import * as path from 'path';
import { Todo } from '../types/Todo';

export class TodoStorage {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  load(): Todo[] {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }

    const raw = fs.readFileSync(this.filePath, 'utf-8');
    try {
      return JSON.parse(raw) as Todo[];
    } catch {
      process.stderr.write(
        `Warnung: Die Datei "${this.filePath}" enthält ungültiges JSON und wird zurückgesetzt.\n`
      );
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
  }

  save(todos: Todo[]): void {
    const tmpPath = this.filePath + '.tmp';
    const content = JSON.stringify(todos, null, 2);
    fs.writeFileSync(tmpPath, content, 'utf-8');
    fs.renameSync(tmpPath, this.filePath);
  }
}
