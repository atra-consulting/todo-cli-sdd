# Implementation Plan: Todo CLI

**Branch**: `main` | **Date**: 2026-04-29 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/main/spec.md`

## Summary

Build a command-line tool with four commands (`add`, `list`, `complete`, `delete`) that manages todo items persisted in a local JSON file at `~/.todo/todos.json`. Implemented in TypeScript using only `commander` as an external production dependency. TypeScript compilation via `tsc`; tests run with Node.js built-in `node:test`.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 18 LTS  
**Primary Dependencies**: `commander` (CLI parsing) — only external production dependency  
**DevDependencies**: `typescript`, `@types/node`  
**Storage**: JSON file at `~/.todo/todos.json` via Node.js `fs` and `os` modules  
**Testing**: Node.js built-in `node:test` (no external test framework)  
**Target Platform**: macOS / Linux / Windows (Node.js CLI)  
**Project Type**: CLI tool  
**Performance Goals**: Each command completes within 1 second under normal conditions  
**Constraints**: Local file storage only; no network; no concurrent access; no external deps except `commander`  
**Scale/Scope**: Single user; up to 1,000 todo items without degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution (`constitution.md`) contains only a blank template — no project-specific principles have been ratified. No gates can be violated. Constitution check passes by default.

**Post-design re-check**: Still passes. No constitution constraints exist to evaluate against Phase 1 artifacts.

## Project Structure

### Documentation (this feature)

```text
specs/main/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/
│   └── cli-commands.md  # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── commands/
│   ├── add.ts           # add command handler
│   ├── list.ts          # list command handler
│   ├── complete.ts      # complete command handler
│   └── delete.ts        # delete command handler
├── storage/
│   └── json-store.ts    # read/write ~/.todo/todos.json (uses fs + os only)
├── models/
│   └── todo.ts          # Todo and TodoStore type definitions
└── index.ts             # CLI entry point (commander setup)

tests/
├── unit/
│   ├── commands/
│   │   ├── add.test.ts
│   │   ├── list.test.ts
│   │   ├── complete.test.ts
│   │   └── delete.test.ts
│   └── storage/
│       └── json-store.test.ts
└── integration/
    └── cli.test.ts      # end-to-end: spawn child process, verify stdout/exit code

dist/                    # tsc output (gitignored)

package.json
tsconfig.json
```

**Structure Decision**: Single-project layout. Commands separated by file for independent testability. Storage logic isolated in `storage/` so tests can mock the filesystem boundary. No monorepo or backend/frontend split needed.

### Build & Run Commands

```bash
# Install (only commander + typescript + @types/node)
npm install

# Compile
npx tsc

# Run CLI (after compile)
node dist/index.js add "Buy groceries"

# Run tests (after compile)
node --test dist/tests/**/*.test.js

# Watch + recompile
npx tsc --watch
```

## Complexity Tracking

No constitution violations to justify.
