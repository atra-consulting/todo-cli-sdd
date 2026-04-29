# Tasks: Todo CLI

**Input**: Design documents from `specs/main/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/cli-commands.md ✓

**Tests**: Included — plan.md explicitly defines a test directory structure using Node.js built-in `node:test`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup

**Purpose**: Create the project skeleton. No source logic yet — just structure, config, and tooling.

- [x] T001 Create all source and test directories: `src/commands/`, `src/storage/`, `src/models/`, `tests/unit/commands/`, `tests/unit/storage/`, `tests/integration/`
- [x] T002 Initialize `package.json` with `name: "todo-cli"`, `main: "dist/index.js"`, `scripts: { build, test, start }`, dependency `commander`, devDependencies `typescript` and `@types/node`
- [x] T003 [P] Create `tsconfig.json` with `strict: true`, `target: ES2022`, `module: CommonJS`, `outDir: dist`, `rootDir: .`, `include: ["src/**/*", "tests/**/*"]`
- [x] T004 [P] Create `.gitignore` with entries for `node_modules/`, `dist/`

**Checkpoint**: `npm install` succeeds; `npx tsc --noEmit` reports no errors (empty project).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, storage layer, and CLI scaffold that ALL user stories depend on.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete.

- [x] T005 [P] Define `Todo` interface (id: number, description: string, completed: boolean, createdAt: string) and `TodoStore` interface (version: string, todos: Todo[]) in `src/models/todo.ts`
- [x] T006 [P] Create CLI entry point scaffold in `src/index.ts`: import `Command` from `commander`, create `program`, set name/description/version, call `program.parse()` — no commands registered yet
- [x] T007 Implement JSON storage module in `src/storage/json-store.ts`: export functions `readStore(): TodoStore` and `writeStore(store: TodoStore): void`; resolve path to `~/.todo/todos.json` using `os.homedir()`; create directory and empty store on first use (FR-011); throw descriptive error on corrupt JSON without overwriting (FR-012)
- [x] T008 Write unit tests for storage module in `tests/unit/storage/json-store.test.ts` using `node:test` and `assert`; cover: reads existing store, initializes empty store when file is missing, throws on corrupt file, writes and reads round-trip

**Checkpoint**: `npx tsc && node --test "dist/tests/unit/storage/json-store.test.js"` passes; `node dist/index.js --help` prints program name.

---

## Phase 3: User Story 1 — Add a Todo Item (Priority: P1) 🎯 MVP

**Goal**: Users can add a new task with a description and receive confirmation with the assigned ID.

**Independent Test**: `node dist/index.js add "Buy groceries"` prints `✓ Added todo #1: Buy groceries`; running it again assigns ID 2; `node dist/index.js add ""` exits with code 1 and an error on stderr.

- [x] T009 [US1] Implement `add` command handler in `src/commands/add.ts`: export `function addTodo(description: string): void`; validate non-empty description (exit 1 + stderr on empty, FR-010); call `readStore`, compute next ID as `Math.max(0, ...todos.map(t => t.id)) + 1`, push new Todo with `completed: false` and `createdAt: new Date().toISOString()`, call `writeStore`, print `✓ Added todo #<id>: <description>` to stdout (FR-001, FR-006, FR-008)
- [x] T010 [US1] Register `add` command in `src/index.ts`: `program.command('add <description>').action(addTodo)`
- [x] T011 [P] [US1] Write unit tests for add command in `tests/unit/commands/add.test.ts`: cover happy path (ID assigned, persisted), duplicate ID prevention, empty description rejection

**Checkpoint**: `node dist/index.js add "Buy groceries"` works end-to-end. US1 independently verified.

---

## Phase 4: User Story 2 — List All Todo Items (Priority: P2)

**Goal**: Users can view all todo items with IDs, descriptions, and completion statuses in a formatted table.

**Independent Test**: After adding two items (one completed via direct store manipulation), `node dist/index.js list` prints both rows with visually distinct statuses; on empty store it prints the empty-list message.

- [x] T012 [US2] Implement `list` command handler in `src/commands/list.ts`: export `function listTodos(): void`; call `readStore`; if empty print `No todos yet. Add one with: todo add "<description>"`; otherwise print formatted table: `ID   Status     Description` header followed by rows with `[ ]` or `[✓]` status column (FR-002, FR-007)
- [x] T013 [US2] Register `list` command in `src/index.ts`: `program.command('list').action(listTodos)`
- [x] T014 [P] [US2] Write unit tests for list command in `tests/unit/commands/list.test.ts`: cover empty list output, single item pending, single item completed, mixed list ordering

**Checkpoint**: `node dist/index.js list` works end-to-end. US2 independently verified.

---

## Phase 5: User Story 3 — Complete a Todo Item (Priority: P3)

**Goal**: Users can mark a specific todo as done by its ID; the system confirms the change or reports if already done.

**Independent Test**: `node dist/index.js complete 1` prints confirmation; running again prints "already done" (exit 0); `node dist/index.js complete 99` exits code 1 with "No todo with ID 99" on stderr.

- [x] T015 [US3] Implement `complete` command handler in `src/commands/complete.ts`: export `function completeTodo(rawId: string): void`; validate `rawId` is a positive integer (exit 1 + stderr, FR-009); call `readStore`; find todo by ID (exit 1 + stderr if not found); if already completed print info message and exit 0; set `completed: true`, call `writeStore`, print `✓ Completed todo #<id>: <description>` (FR-003, FR-008)
- [x] T016 [US3] Register `complete` command in `src/index.ts`: `program.command('complete <id>').action(completeTodo)`
- [x] T017 [P] [US3] Write unit tests for complete command in `tests/unit/commands/complete.test.ts`: cover happy path, already-completed notice, unknown ID error, non-integer ID error

**Checkpoint**: `node dist/index.js complete <id>` works end-to-end. US3 independently verified.

---

## Phase 6: User Story 4 — Delete a Todo Item (Priority: P4)

**Goal**: Users can permanently remove a todo by its ID; the item no longer appears in subsequent listings.

**Independent Test**: `node dist/index.js delete 1` prints confirmation; running `list` no longer shows item 1; `node dist/index.js delete 99` exits code 1 with "No todo with ID 99" on stderr.

- [x] T018 [US4] Implement `delete` command handler in `src/commands/delete.ts`: export `function deleteTodo(rawId: string): void`; validate `rawId` is a positive integer (exit 1 + stderr); call `readStore`; find todo by ID (exit 1 + stderr if not found); remove it from `todos` array, call `writeStore`, print `✓ Deleted todo #<id>: <description>` (FR-004, FR-008, FR-009)
- [x] T019 [US4] Register `delete` command in `src/index.ts`: `program.command('delete <id>').action(deleteTodo)`
- [x] T020 [P] [US4] Write unit tests for delete command in `tests/unit/commands/delete.test.ts`: cover happy path, item absent from store after deletion, unknown ID error, non-integer ID error

**Checkpoint**: All four commands work. US4 independently verified.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation, installability, and cross-command correctness.

- [x] T021 [P] Write integration tests in `tests/integration/cli.test.ts` using `node:test` and `child_process.spawnSync`: spawn `node dist/index.js` for each command, assert stdout, stderr, and exit codes match `specs/main/contracts/cli-commands.md`
- [x] T022 [P] Add `bin` field to `package.json` (`"todo": "./dist/index.js"`); add shebang `#!/usr/bin/env node` to `src/index.ts`; verify `npm link && todo add "test"` works
- [x] T023 Audit all command outputs against `specs/main/contracts/cli-commands.md`: confirm stdout format, stderr messages, and exit codes match exactly for all success and error paths

**Checkpoint**: `node --test "dist/tests/**/*.test.js"` passes all 23+ assertions; `todo` binary works globally after `npm link`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **blocks all user story phases**
- **US1 (Phase 3)**: Depends on Phase 2 only
- **US2 (Phase 4)**: Depends on Phase 2 only
- **US3 (Phase 5)**: Depends on Phase 2 only
- **US4 (Phase 6)**: Depends on Phase 2 only
- **Polish (Phase 7)**: Depends on all US phases complete

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2 — no dependency on US2/US3/US4
- **US2 (P2)**: Independent after Phase 2 — no dependency on US1/US3/US4
- **US3 (P3)**: Independent after Phase 2 — no dependency on US1/US2/US4
- **US4 (P4)**: Independent after Phase 2 — no dependency on US1/US2/US3

All four command handlers operate on the same storage module but do not import each other. They can be implemented fully in parallel after Phase 2.

### Within Each User Story

1. Implement handler (T009 / T012 / T015 / T018)
2. Register in index.ts (T010 / T013 / T016 / T019) — depends on handler
3. Write unit tests [P] (T011 / T014 / T017 / T020) — can run alongside registration

---

## Parallel Execution Examples

### Phase 2 Parallel Start

```text
Parallel:   T005 (models)          T006 (index.ts scaffold)
Then:       T007 (storage module)
Then:       T008 (storage tests)
```

### After Phase 2: All User Stories in Parallel

```text
Parallel:   Phase 3 (US1)   Phase 4 (US2)   Phase 5 (US3)   Phase 6 (US4)
```

### Within Each Story

```text
T009 (handler) → T010 (register)
                     ↘
              T011 [P] (unit tests)   ← can start as soon as handler exists
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T008) — **CRITICAL**
3. Complete Phase 3: US1 Add Command (T009–T011)
4. **STOP and VALIDATE**: `node dist/index.js add "test"` works, data persists
5. Ship / demo if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → foundation ready
2. Add US1 (add) → demo: user can create todos
3. Add US2 (list) → demo: user can see todos
4. Add US3 (complete) → demo: user can mark todos done
5. Add US4 (delete) → demo: full CRUD
6. Phase 7 polish → production-ready binary

---

## Summary

| Phase | Tasks | User Story | Notes |
|-------|-------|------------|-------|
| Phase 1 | T001–T004 | — | Project setup |
| Phase 2 | T005–T008 | — | Foundational (blocks all stories) |
| Phase 3 | T009–T011 | US1 (P1) | 🎯 MVP — add command |
| Phase 4 | T012–T014 | US2 (P2) | list command |
| Phase 5 | T015–T017 | US3 (P3) | complete command |
| Phase 6 | T018–T020 | US4 (P4) | delete command |
| Phase 7 | T021–T023 | — | Polish & integration tests |

**Total tasks**: 23  
**Parallelizable [P] tasks**: 13  
**MVP scope**: T001–T011 (11 tasks)
