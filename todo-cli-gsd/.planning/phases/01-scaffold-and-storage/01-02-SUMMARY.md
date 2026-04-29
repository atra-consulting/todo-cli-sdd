---
phase: 01-scaffold-and-storage
plan: 02
subsystem: storage
tags: [typescript, nodejs, esm, json, file-io, atomic-write, crud, tdd]

# Dependency graph
requires:
  - phase: 01-01
    provides: ESM TypeScript scaffold with NodeNext strict config and working tsc build
provides:
  - Todo and TodoStore TypeScript interfaces in src/types.ts
  - Atomic file I/O (load/save) with ENOENT handling in src/storage.ts
  - CRUD business logic (addTodo, listTodos, completeTodo, deleteTodo) in src/service.ts
  - 17 passing unit tests covering storage and service behaviors
affects: [02-commands]

# Tech tracking
tech-stack:
  added:
    - node:test (Node 25 built-in test runner, no external framework needed)
  patterns:
    - Atomic write: writeFileSync to .tmp then renameSync — no partial writes
    - ENOENT handling: catch + check err.code, return empty store
    - SyntaxError wrapping: corrupt JSON caught and re-thrown as 'corrupted' message
    - Stable ID counter: store.nextId persisted, never recalculated via Math.max
    - Fresh load on every operation: no in-memory cache (Anti-Pattern 3 avoided)
    - .js extensions in all local imports for NodeNext module resolution

key-files:
  created:
    - src/types.ts
    - src/storage.ts
    - src/service.ts
    - src/test/storage.test.ts
    - src/test/service.test.ts
  modified: []

key-decisions:
  - "SyntaxError from JSON.parse wrapped with 'todos.json is corrupted:' prefix — ENOENT returns empty store, corrupt JSON throws (T-02-01 mitigation)"
  - "node:test built-in used for TDD — no external test framework, consistent with project constraint of minimal deps"
  - "Dynamic import per test (await import('../service.js')) — ensures module re-execution with each test's cwd context"

patterns-established:
  - "Import style: 'import type { X }' for type-only imports, named import for runtime values"
  - "Error message format: 'Todo with ID ${id} not found' — Phase 2 catch handlers rely on 'not found' substring"
  - "Storage path: process.cwd() + FILE_NAME — never import.meta.url or __dirname"
  - "Atomic write sequence: writeFileSync(tmpPath) then renameSync(tmpPath, filePath)"

requirements-completed: [STOR-01, STOR-02, STOR-03]

# Metrics
duration: 3min
completed: 2026-04-29
---

# Phase 1 Plan 02: Scaffold and Storage (Types, Storage, Service) Summary

**Three-layer storage foundation: typed interfaces, atomic JSON file I/O with ENOENT handling, and CRUD service with monotonically increasing ID counter — 17 unit tests all green**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-29T12:46:15Z
- **Completed:** 2026-04-29T12:49:07Z
- **Tasks:** 2 (each with TDD RED + GREEN commits)
- **Files modified:** 5 created

## Accomplishments
- `src/types.ts`: `Todo` and `TodoStore` interfaces — the shared data model for all layers
- `src/storage.ts`: atomic load/save with ENOENT handling, process.cwd() resolution, pretty-printed JSON
- `src/service.ts`: addTodo, listTodos, completeTodo, deleteTodo — all using store.nextId for stable IDs
- 17 unit tests (node:test built-in) covering all specified behaviors — no external test framework
- Full build passes: `dist/types.js`, `dist/storage.js`, `dist/service.js`, `dist/index.js` all present

## Task Commits

Each task was committed atomically via TDD RED → GREEN sequence:

1. **Task 1 RED: Failing tests for storage.ts** - `66795c4` (test)
2. **Task 1 GREEN: Implement types.ts and storage.ts** - `f7e2eaa` (feat)
3. **Task 2 RED: Failing tests for service.ts** - `863d5e5` (test)
4. **Task 2 GREEN: Implement service.ts** - `fbf6cfa` (feat)

**Plan metadata:** (final docs commit — see below)

_TDD tasks have separate test and implementation commits as required by the TDD gate protocol._

## Files Created/Modified
- `src/types.ts` — `Todo { id, text, done }` and `TodoStore { todos, nextId }` interfaces
- `src/storage.ts` — `load(): TodoStore` and `save(store): void` with atomic write pattern
- `src/service.ts` — `addTodo`, `listTodos`, `completeTodo`, `deleteTodo` exported functions
- `src/test/storage.test.ts` — 6 tests covering ENOENT, roundtrip, atomic write, pretty-print, corrupt JSON, cwd resolution
- `src/test/service.test.ts` — 11 tests covering all CRUD operations and ID counter behavior

## Decisions Made
- **SyntaxError wrapping:** When `JSON.parse` throws (corrupt file), the SyntaxError is caught and re-thrown as `Error('todos.json is corrupted: ...')`. This satisfies the behavior spec and T-02-01 mitigation. ENOENT returns empty store separately.
- **Dynamic imports in tests:** Each test uses `await import('../service.js')` inside the test body so the module runs under the correct `process.cwd()` (changed per test to a fresh tmpDir). Static top-level imports would execute before `beforeEach` changes the cwd.
- **node:test built-in:** No external test framework needed — Node 25 built-in satisfies the project constraint of minimal deps.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test import paths from `../../storage.js` to `../storage.js`**
- **Found during:** Task 1 GREEN (first test run)
- **Issue:** Test file at `src/test/storage.test.ts` had import path `../../storage.js` which resolved to project root rather than `src/storage.ts`
- **Fix:** Updated all dynamic imports in test files to use `../storage.js` (one level up from `src/test/`)
- **Files modified:** `src/test/storage.test.ts`
- **Verification:** All 6 storage tests pass after fix
- **Committed in:** `f7e2eaa` (Task 1 GREEN commit)

**2. [Rule 1 - Bug] Added SyntaxError catch branch in storage.ts load()**
- **Found during:** Task 1 GREEN (test for corrupt JSON)
- **Issue:** Plan spec said `load()` with corrupt JSON throws error containing 'corrupted'. The guard for missing fields (`Array.isArray` check) only catches structurally valid JSON that lacks required fields. `JSON.parse` itself throws a SyntaxError for invalid JSON, which escaped without the 'corrupted' prefix.
- **Fix:** Added explicit `if (err instanceof SyntaxError)` catch branch that re-throws as `Error('todos.json is corrupted: ...')`
- **Files modified:** `src/storage.ts`
- **Verification:** Test "load() throws with 'corrupted' message for invalid JSON" passes
- **Committed in:** `f7e2eaa` (Task 1 GREEN commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs)
**Impact on plan:** Both fixes necessary for correctness — test path was wrong, and corrupt-JSON error wrapping was incomplete. No scope creep.

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (storage) | `66795c4` test(01-02): add failing tests for storage.ts | PASS |
| GREEN (storage) | `f7e2eaa` feat(01-02): implement types.ts and storage.ts | PASS |
| RED (service) | `863d5e5` test(01-02): add failing tests for service.ts | PASS |
| GREEN (service) | `fbf6cfa` feat(01-02): implement service.ts | PASS |

## Issues Encountered
- Initial test import path error (`../../storage.js` instead of `../storage.js`) — fixed immediately per Rule 1.
- SyntaxError from invalid JSON not wrapping in 'corrupted' message — fixed per Rule 1 to satisfy T-02-01 threat mitigation.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Storage layer complete: `npm run typecheck`, `npm run build`, all 17 tests pass
- Phase 2 command handlers must import exclusively from `src/service.ts` (never storage.ts directly)
- Error messages use format `Todo with ID ${id} not found` — Phase 2 catch handlers should check for `'not found'` substring
- `.js` extensions required in all local imports for NodeNext module resolution
- `dist/index.js --version` prints 1.0.0, `--help` prints help text — no regressions

---
*Phase: 01-scaffold-and-storage*
*Completed: 2026-04-29*
