# Architecture Patterns

**Domain:** TypeScript CLI todo app (reference project)
**Researched:** 2026-04-29
**Confidence:** HIGH — minimal scope, well-established patterns, verified against commander docs

## Recommended Architecture

Three-layer separation: CLI parsing → business logic → storage. Each layer has one job and one direction of dependency. The CLI layer calls logic; logic calls storage. Nothing flows backwards.

```
src/
  index.ts          Entry point: instantiates Program, registers commands, calls parse()
  commands/
    add.ts          Registers `add` command; extracts args; calls TodoService
    list.ts         Registers `list` command; calls TodoService; formats output
    complete.ts     Registers `complete` command; calls TodoService
    delete.ts       Registers `delete` command; calls TodoService
  service.ts        Business logic: ID assignment, toggle, validation, query
  storage.ts        File I/O: read/write todos.json in cwd
  types.ts          Shared TypeScript interfaces (Todo, TodoStore)
```

Flat `src/` with a `commands/` sub-folder is the right depth for four commands. Going deeper (e.g. `src/core/`, `src/adapters/`) adds indirection without value for a project of this size and would obscure the reference-project intent.

### Component Boundaries

| Component | Responsibility | Allowed to call | Must NOT call |
|-----------|---------------|-----------------|---------------|
| `index.ts` | Boot: create Program, add commands, `program.parse()` | All command modules | Storage directly |
| `commands/*.ts` | Parse CLI args/options; delegate to service; format output | `service.ts` | `storage.ts` directly |
| `service.ts` | Business rules: generate IDs, toggle complete, validate ID existence | `storage.ts` | `commander`, `process` |
| `storage.ts` | Read/write `todos.json`; handle missing file gracefully | Node `fs`, `path` | Service, commands |
| `types.ts` | TypeScript interfaces, no runtime logic | — | Nothing |

**The rule:** dependencies flow inward only. `commands/` → `service` → `storage`. No layer reaches upward.

### Data Model

```typescript
// src/types.ts

export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export interface TodoStore {
  todos: Todo[];
  nextId: number;
}
```

`nextId` lives in the store so IDs never collide after deletions. It is a monotonically increasing counter, never reused. This is the simplest correct approach for a local single-user file store.

`todos.json` on disk mirrors `TodoStore` directly — no transformation layer needed:

```json
{
  "nextId": 3,
  "todos": [
    { "id": 1, "text": "Buy milk", "done": false },
    { "id": 2, "text": "Prepare meeting", "done": true }
  ]
}
```

### Data Flow

Illustrated with the `add` command, which is the canonical happy path:

```
User types: todo add "Buy milk"

1. index.ts
   └── program.parse(process.argv)
       └── commander matches "add" → invokes add.ts action handler

2. add.ts (commands/add.ts)
   └── receives: text = "Buy milk"
   └── calls: TodoService.add(text)

3. service.ts
   └── calls: Storage.load()   → reads todos.json (or returns empty store)
   └── creates: { id: store.nextId, text, done: false }
   └── pushes todo onto store.todos
   └── increments store.nextId
   └── calls: Storage.save(store)
   └── returns: created Todo

4. storage.ts
   └── load(): fs.readFileSync → JSON.parse → TodoStore
       if file missing: return { todos: [], nextId: 1 }
   └── save(store): JSON.stringify → fs.writeFileSync

5. add.ts
   └── receives returned Todo
   └── prints: Added [1] Buy milk
```

The same pattern applies to `list`, `complete`, and `delete` — the command layer handles presentation, the service layer handles logic, the storage layer handles persistence.

### commander Integration Pattern

commander is wired in `index.ts` and each command module exports a `register(program: Command)` function. This keeps command definitions close to their logic without cramming everything into a single file.

```typescript
// src/index.ts
import { Command } from 'commander';
import { registerAdd } from './commands/add';
import { registerList } from './commands/list';
import { registerComplete } from './commands/complete';
import { registerDelete } from './commands/delete';

const program = new Command();

program
  .name('todo')
  .description('Manage todos in the current directory')
  .version('1.0.0');

registerAdd(program);
registerList(program);
registerComplete(program);
registerDelete(program);

program.parse(process.argv);
```

```typescript
// src/commands/add.ts
import { Command } from 'commander';
import { TodoService } from '../service';

export function registerAdd(program: Command): void {
  program
    .command('add')
    .description('Add a new todo')
    .argument('<text>', 'todo text')
    .action((text: string) => {
      const todo = TodoService.add(text);
      console.log(`Added [${todo.id}] ${todo.text}`);
    });
}
```

This pattern means each command file is self-contained and testable in isolation.

### Error Handling

Service functions throw on invalid state (e.g. ID not found). Command handlers catch and print a human-readable message, then exit with a non-zero code. Storage handles missing file as an empty store (not an error), but propagates genuine I/O errors.

```typescript
// Pattern used in command handlers
try {
  TodoService.complete(id);
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}
```

## Build Order

Build in dependency order — each layer can only be built once its dependencies exist:

1. **`types.ts`** — no dependencies; defines the shared data model
2. **`storage.ts`** — depends on `types.ts`; pure file I/O
3. **`service.ts`** — depends on `types.ts` and `storage.ts`; all business rules
4. **`commands/add.ts`** — first command; validates the add + service + storage chain end-to-end
5. **`commands/list.ts`** — depends on service; validates read path and output formatting
6. **`commands/complete.ts`** — depends on service; validates toggle logic
7. **`commands/delete.ts`** — depends on service; validates mutation + ID validation
8. **`index.ts`** — wires everything together; only built last

This order means at each step you can run the partially-built CLI and see it working. `add` + `list` together form the smallest useful slice (you can add a todo and see it), so they are built back-to-back before moving to `complete` and `delete`.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Business logic in command handlers
**What:** Placing ID assignment, toggle logic, or validation inside `commands/*.ts`
**Why bad:** Duplicates logic if a future non-CLI interface is added; harder to test; muddies the reference-project clarity
**Instead:** All logic in `service.ts`, commands only parse and print

### Anti-Pattern 2: Storage calls from command handlers
**What:** Calling `Storage.load()` / `Storage.save()` directly from a command
**Why bad:** Bypasses the service layer; business invariants (e.g. unique IDs) can be broken
**Instead:** Commands call service exclusively; service owns the storage calls

### Anti-Pattern 3: Stateful singleton service
**What:** A service class that holds todos in memory and syncs on demand
**Why bad:** Adds complexity; file is the source of truth; in-memory cache can diverge
**Instead:** Load from file on every operation, save immediately. At this scale (single user, local file) this is correct and explicit.

### Anti-Pattern 4: `any` types in storage parsing
**What:** `JSON.parse(data) as any` without validation
**Why bad:** Runtime errors surface as cryptic type errors far from the source
**Instead:** Cast to `TodoStore` and apply a simple guard: if `nextId` or `todos` are missing, return the default empty store

## Scalability Considerations

This is intentionally a single-user local tool. No multi-user or network concerns apply. The only relevant scaling axis is file size — a JSON file with thousands of todos will still parse in milliseconds. No changes needed until an impractical scale (tens of thousands of todos).

## Sources

- commander.js official README (verified via Context7 /tj/commander.js): https://github.com/tj/commander.js/blob/master/Readme.md — HIGH confidence
- commander TypeScript integration, action handlers, subcommand patterns: verified against Context7 docs — HIGH confidence
- Three-layer CLI architecture (parsing/logic/storage separation): established pattern, consistent across multiple TypeScript CLI reference projects — HIGH confidence
