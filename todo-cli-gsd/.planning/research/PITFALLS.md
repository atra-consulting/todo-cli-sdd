# Domain Pitfalls

**Domain:** TypeScript CLI — todo app with commander + JSON file storage
**Researched:** 2026-04-29

---

## Critical Pitfalls

Mistakes that cause data loss, silent corruption, or rewrites.

---

### Pitfall 1: Non-Atomic JSON Writes Cause Silent Data Corruption

**What goes wrong:** Writing directly to `todos.json` with `fs.writeFileSync` is not atomic. If the process is interrupted mid-write (signal, crash, power loss), the file is left truncated or empty. On next run, `JSON.parse` throws `"Unexpected end of JSON input"` and all todos are lost.

**Why it happens:** `fs.writeFileSync` truncates the file first, then writes. There is a window between truncation and completion where the file is invalid JSON.

**Consequences:** Complete todo list loss. For a reference project, this is embarrassing — readers copy the pattern and ship corrupted-data bugs.

**Prevention:** Write to a `.tmp` file first, then `fs.renameSync` (atomic on POSIX, near-atomic on Windows NTFS). Pattern:
```typescript
const tmpPath = filePath + '.tmp';
fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
fs.renameSync(tmpPath, filePath);
```

**Detection:** `todos.json` is 0 bytes or has truncated content after an interrupted run.

**Phase:** Address in Phase 1 (storage layer). Build it right from the start — retrofitting atomic writes is easy but requires touching every write call.

---

### Pitfall 2: Missing `todos.json` Not Handled Gracefully

**What goes wrong:** First run, or after manually deleting the file, `fs.readFileSync` throws `ENOENT`. If not caught, the CLI crashes with a Node.js stack trace instead of a clean empty state.

**Why it happens:** Developers test with the file already present; the cold-start path is never exercised.

**Consequences:** `todo list` on a fresh directory prints a stack trace. Terrible UX and poor reference code.

**Prevention:** Wrap the read in a try/catch and treat `ENOENT` as "return empty array". Treat any other `JSON.parse` error as a corruption warning:
```typescript
function loadTodos(): Todo[] {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err: any) {
    if (err.code === 'ENOENT') return [];
    throw new Error(`todos.json is corrupted: ${err.message}`);
  }
}
```

**Detection:** Run `todo list` in a directory that has never had a `todos.json`. If it crashes, this is not handled.

**Phase:** Phase 1 (storage layer). Part of the initial load/save abstraction.

---

### Pitfall 3: ID Generation Breaks When All Todos Are Deleted

**What goes wrong:** Using `Math.max(...todos.map(t => t.id)) + 1` to generate the next ID silently produces `-Infinity` when the array is empty. The next `add` creates a todo with ID `-Infinity`, which breaks `complete` and `delete` comparisons entirely.

**Why it happens:** `Math.max()` with no arguments returns `-Infinity`. Spread on an empty array passes no arguments.

**Consequences:** After deleting all todos, the next `add` creates a corrupted entry. IDs look like `-Infinity` in output.

**Prevention:** Guard with a length check:
```typescript
function nextId(todos: Todo[]): number {
  if (todos.length === 0) return 1;
  return Math.max(...todos.map(t => t.id)) + 1;
}
```

**Detection:** Add one todo, delete it, add another. Check the ID of the second todo.

**Phase:** Phase 1 (add command). Simple guard, easy to build correctly from the start.

---

### Pitfall 4: Commander `parse()` Used Instead of `parseAsync()` for Async Actions

**What goes wrong:** If any command action is `async`, using `program.parse(process.argv)` does not await the action. Errors thrown in async actions become unhandled promise rejections (silently swallowed in older Node, crashes in modern Node with unhelpful messages).

**Why it happens:** `parse()` is the most documented form; `parseAsync()` is easy to miss in the docs.

**Consequences:** File write errors, validation errors, or any thrown exceptions in command handlers are silently lost or produce confusing crash output. For a reference project, readers copy the `parse()` form and wonder why their errors aren't caught.

**Prevention:** If any action is async, use `parseAsync`:
```typescript
await program.parseAsync(process.argv);
```
For a simple synchronous CLI this is low risk — but if any action touches the filesystem asynchronously (e.g. using `fs/promises`), this becomes critical.

**Detection:** Make an action throw an error intentionally. If it silently exits 0, `parseAsync` is needed.

**Phase:** Phase 1 (CLI entry point). Decide sync vs async file I/O upfront; don't mix.

---

### Pitfall 5: Commander Silently Accepts Unknown Subcommands

**What goes wrong:** By default, commander does not error on unknown commands — it passes them through. `todo typo "Buy milk"` exits 0 with no output and no todo created, confusing users.

**Why it happens:** Default commander behavior is permissive; `.allowUnknownOption()` / `.allowExcessArguments()` are opt-in but the inverse (strict unknown command rejection) requires explicit setup.

**Consequences:** Silent no-ops on typos. For a reference project, this teaches the wrong pattern — readers expect CLIs to give feedback on invalid input.

**Prevention:** Add an explicit unknown command handler:
```typescript
program.on('command:*', () => {
  console.error(`Unknown command: ${program.args.join(' ')}`);
  process.exit(1);
});
```
Or use `program.showHelpAfterError()` and `program.showSuggestionAfterError()` for better UX.

**Detection:** Run `todo boguscommand`. If it exits 0 silently, unknown commands are not handled.

**Phase:** Phase 1 (CLI entry point setup).

---

## Moderate Pitfalls

---

### Pitfall 6: `tsconfig.json` Missing `outDir` / `rootDir` — Compiled Files Pollute Source Tree

**What goes wrong:** Without `outDir` in tsconfig, `tsc` compiles `.ts` to `.js` next to each source file. `src/index.ts` produces `src/index.js`. Git status becomes noisy; accidental imports of `.js` instead of `.ts` are possible.

**Prevention:** Always set:
```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  }
}
```
Add `dist/` to `.gitignore` immediately.

**Phase:** Phase 1 (project scaffolding). Fix before writing any TypeScript.

---

### Pitfall 7: `strict: false` in tsconfig Hides Type Errors Until Runtime

**What goes wrong:** Without `"strict": true`, TypeScript allows implicit `any`, unchecked null access, and loose function signatures. For a reference project, this defeats the purpose of using TypeScript.

**Prevention:** Set `"strict": true` in `tsconfig.json`. The most common consequence is needing explicit `Todo | undefined` checks when finding by ID — which is actually the correct behavior.

**Phase:** Phase 1 (project scaffolding).

---

### Pitfall 8: No Validation on ID Argument — Non-Numeric Input Passed to Logic

**What goes wrong:** `todo complete abc` — commander passes the string `"abc"` as the argument. If the handler parses it with `parseInt`, NaN propagates silently. The `find` call returns `undefined`, and "Todo not found" is printed, which looks like a logic bug rather than an input error.

**Prevention:** Validate the ID argument before any logic:
```typescript
.argument('<id>', 'todo ID', (val) => {
  const id = parseInt(val, 10);
  if (isNaN(id) || id <= 0) throw new InvalidArgumentError('ID must be a positive integer.');
  return id;
})
```
Commander's `InvalidArgumentError` produces clean error output and sets the right exit code.

**Detection:** Run `todo complete abc`. If it says "Todo not found" rather than "Invalid ID", validation is missing.

**Phase:** Phase 2 (complete/delete commands).

---

### Pitfall 9: ID Reuse After Deletion Creates Confusing History

**What goes wrong:** If IDs are reassigned after deletion (e.g., always start from 1 and fill gaps), a user doing `todo delete 2`, `todo add "New item"` may get a new todo with ID 2. Their mental model breaks: "I deleted ID 2 already."

**Why it happens:** Some implementations use `index + 1` as the ID instead of a persistent counter.

**Prevention:** Use `max(existing IDs) + 1` — never reuse IDs. IDs only ever increase. This is the behavior in Pitfall 3's fix.

**Detection:** Add three todos, delete the second, add a new one. If the new one gets ID 2, IDs are being reused.

**Phase:** Phase 1 (ID generation, add command).

---

### Pitfall 10: `bin` Entry in `package.json` Points to TypeScript Source

**What goes wrong:** If `package.json` `"bin"` points to `src/index.ts` instead of `dist/index.js`, the CLI works when run via `ts-node` but fails when installed globally via `npm link` or `npm install -g`. Node cannot execute `.ts` files natively.

**Prevention:** `"bin"` always points to the compiled output: `"./dist/index.js"`. Add a `#!/usr/bin/env node` shebang at the top of the entry file. Add a `build` script in `package.json` that runs `tsc` before any `npm link`.

**Detection:** Run `npm link` then `todo list` in a fresh shell (without ts-node). If it fails with a syntax error, bin points to source.

**Phase:** Phase 1 (project scaffolding / package.json setup).

---

## Minor Pitfalls

---

### Pitfall 11: `console.error` vs `process.stderr.write` Inconsistency

**What goes wrong:** Mixing `console.log` and `console.error` for error output is fine, but not handling output streams consistently breaks shell scripting (e.g., `todo list 2>/dev/null` should suppress only errors). For a reference project, inconsistent output streams teach bad habits.

**Prevention:** Use `console.log` for data output (stdout), `console.error` for error messages (stderr). Commander already writes its own errors to stderr.

**Phase:** Throughout — establish convention in Phase 1, enforce consistently.

---

### Pitfall 12: JSON Pretty-Printing Makes File Unreadable for Debugging, Minifying Loses Readability

**What goes wrong:** `JSON.stringify(data)` writes a single line with no whitespace. Fine for machines, impossible to inspect with a text editor or `cat`. For a project where `todos.json` is a visible artifact, readability matters.

**Prevention:** Always use `JSON.stringify(data, null, 2)` for the stored file.

**Phase:** Phase 1 (save function).

---

### Pitfall 13: No `"type": "module"` Decision Made Upfront Causes ESM/CJS Confusion

**What goes wrong:** Without an explicit decision, the project defaults to CommonJS. Adding `"type": "module"` later forces all `require()` calls to become `import`, and `__dirname`/`__filename` disappear (need `import.meta.url` instead). Commander works fine with both, but the migration is disruptive mid-project.

**Prevention:** For a simple CLI reference project, stay with CommonJS (`"module": "commonjs"` in tsconfig, no `"type": "module"` in package.json). This keeps `__dirname` available and avoids ESM quirks in Node.js CLI tooling.

**Phase:** Phase 1 (scaffolding decision — make it explicit in tsconfig and package.json).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Project scaffolding | `outDir` missing, `strict: false`, ESM/CJS confusion | Set tsconfig correctly before writing any code |
| Storage layer | ENOENT crash on first run, non-atomic writes | Abstract load/save behind helper functions from the start |
| Add command | Empty-array ID generation produces `-Infinity` | Use `todos.length === 0 ? 1 : Math.max(...ids) + 1` |
| Complete/Delete | Non-numeric ID argument silently falls through | Use commander `InvalidArgumentError` in argument parser |
| CLI entry point | `parse()` instead of `parseAsync()`, unknown commands silently pass | Use `parseAsync`, add unknown command handler |
| Package/bin setup | `bin` points to `.ts` source | Point to `dist/index.js`, add shebang |

---

## Sources

- Commander.js official docs: https://github.com/tj/commander.js/blob/master/Readme.md (verified via Context7, HIGH confidence)
- Commander.js error handling: `exitOverride`, `InvalidArgumentError`, `program.error()` — verified via Context7
- Node.js `fs.renameSync` atomicity: POSIX atomic via kernel rename(2) syscall — HIGH confidence (Node.js stdlib behavior)
- `Math.max(...[])` returning `-Infinity`: verified via direct Node.js execution
- `fs.readFileSync` ENOENT error code: verified via direct Node.js execution
- `JSON.parse('')` throwing "Unexpected end of JSON input": verified via direct Node.js execution
- tsconfig `outDir`/`rootDir`/`strict` behavior: HIGH confidence from TypeScript documentation and direct experience
