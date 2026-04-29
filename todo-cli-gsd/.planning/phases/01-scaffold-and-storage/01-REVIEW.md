---
phase: 1
status: issues_found
reviewed: 2026-04-29T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - src/types.ts
  - src/storage.ts
  - src/service.ts
  - src/index.ts
  - package.json
  - tsconfig.json
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
---

# Phase 1: Code Review Report

**Reviewed:** 2026-04-29
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

The scaffold and storage layer is largely correct. The ESM configuration is proper, NodeNext module resolution is in place, all local imports use `.js` extensions, `process.cwd()` is used for the file path, atomic writes via `.tmp`+`renameSync` are implemented, ENOENT returns the default store, and `nextId` is persisted rather than calculated. These are the core requirements and they are met.

Three issues warrant attention before the next phase builds on this code: a logic error in `completeTodo` that toggles done state rather than marking it complete, missing input validation on `addTodo`, and an orphaned `.tmp` file risk when `renameSync` fails.

## Warnings

### WR-01: `completeTodo` Toggles Done State Instead of Marking Complete

**File:** `src/service.ts:28`
**Issue:** `todo.done = !todo.done` toggles the boolean. Calling `completeTodo` on an already-completed todo will un-complete it. The function is named `completeTodo`, not `toggleTodo`, and the requirement is to mark a todo done — toggling is unexpected behaviour that will surprise callers in Phase 2 and could cause data integrity problems.
**Fix:**
```typescript
todo.done = true;
```
If toggle behaviour is intentional it should be renamed `toggleTodo` and documented explicitly.

---

### WR-02: `addTodo` Accepts Empty or Whitespace-Only Text

**File:** `src/service.ts:4-15`
**Issue:** `addTodo("")` and `addTodo("   ")` succeed and persist a todo with no meaningful content. There is no guard against this at the service layer. The CLI layer (Phase 2) cannot be relied upon to prevent this because `commander` does not validate non-option arguments by default.
**Fix:**
```typescript
export function addTodo(text: string): Todo {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Todo text must not be empty');
  }
  const store = load();
  const todo: Todo = { id: store.nextId, text: trimmed, done: false };
  store.todos.push(todo);
  store.nextId += 1;
  save(store);
  return todo;
}
```

---

### WR-03: Orphaned `.tmp` File on `renameSync` Failure

**File:** `src/storage.ts:41-42`
**Issue:** If `writeFileSync` succeeds but `renameSync` subsequently fails (e.g., cross-mount rename, permissions change between the two calls), `todos.json.tmp` is left on disk permanently. On the next run, `load()` reads only `todos.json` and the orphaned tmp file is silently ignored — but it occupies space and can confuse diagnostics. More critically, if the process is interrupted between the two calls the same orphan results.

There is no automatic cleanup of stale `.tmp` files before writing a new one or on startup.
**Fix:** Clean up a stale tmp file before writing, or clean it up in a `finally` block:
```typescript
export function save(store: TodoStore): void {
  const filePath = getFilePath();
  const tmpPath = getTmpFilePath();
  const content = JSON.stringify(store, null, 2);
  // Remove any stale tmp file from a previous interrupted save
  try { fs.unlinkSync(tmpPath); } catch { /* ignore if absent */ }
  fs.writeFileSync(tmpPath, content, 'utf8');
  fs.renameSync(tmpPath, filePath);
}
```

---

## Info

### IN-01: `tsx` Dev Dependency Is Unused

**File:** `package.json:20`
**Issue:** `tsx` is listed as a dev dependency but no `package.json` script uses it (only `tsc` and `node` are used). This adds ~2 MB to `node_modules` with no benefit.
**Fix:** Remove the `tsx` entry from `devDependencies` unless a dev-run script (`"dev": "tsx src/index.ts"`) is planned for Phase 2.

---

### IN-02: No `test` Script Defined

**File:** `package.json:9-13`
**Issue:** There is no `test` script. `npm test` will print the default npm error message. Future phases that add tests will need this, and CI pipelines typically call `npm test`.
**Fix:** Add a placeholder (or a real runner) now:
```json
"test": "echo \"No tests yet\" && exit 0"
```
Replace with the actual test runner when tests are added.

---

_Reviewed: 2026-04-29_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
