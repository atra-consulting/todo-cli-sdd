# Roadmap: Todo CLI (TypeScript)

## Overview

Two phases take this project from zero to a complete, working CLI. Phase 1 establishes the project scaffold and storage layer — the foundation every command depends on. Phase 2 wires all four commands with full UX polish, completing the reference implementation.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Scaffold and Storage** - Project structure, TypeScript config, and atomic JSON storage layer
- [ ] **Phase 2: Commands and UX** - All four commands wired with error handling and UX polish

## Phase Details

### Phase 1: Scaffold and Storage
**Goal**: The project builds, types check, and the storage layer reliably reads and writes todos
**Depends on**: Nothing (first phase)
**Requirements**: PROJ-01, PROJ-02, PROJ-03, STOR-01, STOR-02, STOR-03
**Success Criteria** (what must be TRUE):
  1. `npm run build` compiles TypeScript to `dist/` without errors
  2. Running the CLI via `npx` or the built binary is possible (bin field wired)
  3. `todos.json` is created automatically on first run; missing file does not crash
  4. Todos saved in one invocation are present in the next invocation
  5. Deleted todos never have their ID reassigned (nextId counter persists)
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Project scaffold: package.json, tsconfig.json, .gitignore, src/index.ts; npm install + build verified
- [x] 01-02-PLAN.md — Storage layer: src/types.ts, src/storage.ts, src/service.ts; atomic writes, ENOENT handling, stable ID counter

### Phase 2: Commands and UX
**Goal**: Users can add, list, complete, and delete todos with clear feedback and correct error handling
**Depends on**: Phase 1
**Requirements**: CLI-01, CLI-02, CLI-03, CLI-04, UX-01, UX-02, UX-03, UX-04
**Success Criteria** (what must be TRUE):
  1. `todo add "Buy milk"` outputs a confirmation and the todo appears in `todo list`
  2. `todo list` displays todos in `[1] [ ] text` / `[1] [x] text` format; shows a helpful message when empty
  3. `todo complete <ID>` toggles the done state and confirms the change
  4. `todo delete <ID>` removes the todo and confirms deletion
  5. Invalid or non-existent IDs produce a specific error message on stderr and exit with code 1; unknown commands are not silently ignored
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — add and list commands: src/commands/add.ts (registerAdd, "Added [N] text"), src/commands/list.ts (registerList, empty-list message, "[N] [ ] text" format)
- [ ] 02-02-PLAN.md — complete and delete commands: src/commands/complete.ts and delete.ts with NaN guard, not-found error handling, stderr+exit 1
- [ ] 02-03-PLAN.md — Wire src/index.ts with all four registrations + end-to-end human verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffold and Storage | 2/2 | Complete | 2026-04-29 |
| 2. Commands and UX | 0/3 | Not started | - |
