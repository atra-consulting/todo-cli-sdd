# Project Research Summary

**Project:** todo-cli-gsd (TypeScript Todo CLI)
**Domain:** Local CLI tool — JSON file storage, four commands (add/list/complete/delete)
**Researched:** 2026-04-29
**Confidence:** HIGH

## Executive Summary

This is a minimal-scope reference TypeScript CLI project built with commander.js for argument parsing, storing todos in a local `todos.json` file. The recommended approach is strict layered architecture — three tiers (CLI parsing → business logic → storage) with zero leakage between layers. The entire project ships as a single compiled `dist/index.js` entry point. One runtime dependency (commander 14.x), three dev dependencies (TypeScript 6.x, tsx 4.x, @types/node 25.x). No bundler required; `tsc` alone is sufficient.

The feature scope is already fixed: add, list, complete (toggle), delete — all operating on project-local `todos.json`. The highest-value differentiators are stable non-reusable IDs (via a persisted `nextId` counter), trimming/empty-text guards on `add`, and a completion summary on `list`. All other embellishments (colors, interactive prompts, global storage, shell completion) are explicitly out of scope and would reduce the reference-project clarity.

The main risks are storage-layer correctness issues that manifest silently: non-atomic writes that corrupt the JSON file on interrupt, unhandled ENOENT on first run, and broken ID generation when all todos are deleted. All three are fixed with small, upfront patterns in the storage layer. The secondary risk is getting commander configuration wrong (sync vs async parse, unknown command handling, ID argument validation) — each has a one-line fix but must be intentional.

---

## Key Findings

### Recommended Stack

Use Node.js 22 LTS (minimum 20.6+ for `--import` tsx support), TypeScript 6.x with `strict: true` and `module: NodeNext` / `moduleResolution: NodeNext`. The project is ESM (`"type": "module"` in package.json). During development, `tsx` replaces `ts-node` — it is faster (~100ms vs ~500ms startup via esbuild) and requires zero configuration. Production build is a plain `tsc` invocation to `dist/`. No bundler.

**Core technologies:**
- `commander@14.x`: CLI argument parsing — the stated project constraint; handles help, version, subcommands, argument validation, ships its own TypeScript types
- `typescript@6.x`: Language — strict mode catches null dereferences and implicit `any` at author time
- `tsx@4.x` (dev only): Development runner — zero-config TypeScript execution without a build step
- `@types/node@25.x` (dev only): Typed Node.js built-ins — required for `fs`, `path`, `process`
- `tsc` (production build): No bundler needed for a single-entry CLI with one runtime dependency

**Critical tsconfig settings:** `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`, `strict: true`, `esModuleInterop: true`, `outDir: dist`, `rootDir: src`.

### Expected Features

**Must have (table stakes):**
- `add <text>` — confirmation output `Added [N] text`; auto-create `todos.json` on first run
- `list` — formatted `[N] [ ] text` / `[N] [x] text`; friendly message when empty
- `complete <id>` — toggle with confirmation: `marked done` / `marked incomplete`
- `delete <id>` — confirmation output `Deleted [N] text`
- Invalid ID: specific `Error: No todo with ID N` to stderr, exit code 1
- Non-numeric ID: `Error: ID must be a number` to stderr, exit code 1
- Exit code 0 on success, 1 on all errors; all errors to stderr
- `--help` / `-h` with meaningful descriptions on all commands

**Should have (differentiators):**
- Stable non-reused IDs via `nextId` counter persisted in `todos.json`
- Trim whitespace from `add` text; reject empty string after trim
- Completion summary line on `list`: `2 of 5 done`
- `--version` flag sourced from `package.json`

**Defer (v2+ / explicitly out of scope):**
- Color output, interactive prompts, priority levels, due dates, fuzzy search, undo, multiple lists, global storage, shell auto-completion, config file

### Architecture Approach

Three-layer separation: `commands/*.ts` (parse CLI args, format output) → `service.ts` (business logic: ID generation, toggle, validation) → `storage.ts` (file I/O only). Dependencies flow strictly inward. Each command exports a `registerXxx(program: Command)` function; `index.ts` imports and wires them. `types.ts` defines shared interfaces with no runtime logic.

**Major components:**
1. `index.ts` — entry point; creates `Command`, registers all subcommands, calls `program.parse(process.argv)`
2. `commands/add.ts`, `list.ts`, `complete.ts`, `delete.ts` — one file per command; parse args, call service, print result
3. `service.ts` — all business rules: ID assignment, toggle, ID-existence validation, query
4. `storage.ts` — `load()` / `save()` only; handles missing file as empty store; atomic writes via temp-file rename
5. `types.ts` — `Todo` and `TodoStore` interfaces (`{ todos: Todo[], nextId: number }`)

**Build order (dependency order):** `types.ts` → `storage.ts` → `service.ts` → `commands/add.ts` → `commands/list.ts` → `commands/complete.ts` → `commands/delete.ts` → `index.ts`

### Critical Pitfalls

1. **Non-atomic JSON writes** — `writeFileSync` truncates before completing; interrupted write leaves corrupt file. Fix: write to `.tmp`, then `renameSync`. Build this into `storage.ts` from day one.
2. **ENOENT crash on first run** — `readFileSync` throws if `todos.json` doesn't exist. Fix: catch `ENOENT` in `storage.load()` and return `{ todos: [], nextId: 1 }`.
3. **ID generation breaks on empty list** — `Math.max(...[])` returns `-Infinity`. Fix: guard with `todos.length === 0 ? 1 : Math.max(...todos.map(t => t.id)) + 1`.
4. **`parse()` silently drops async errors** — use `await program.parseAsync(process.argv)` if any action is async.
5. **Non-numeric ID argument passed to logic** — use commander's `InvalidArgumentError` in the argument parser for `complete` and `delete`.
6. **Unknown commands silently exit 0** — add `program.on('command:*', ...)` handler or `program.showSuggestionAfterError()`.

---

## Implications for Roadmap

### Phase 1: Project Scaffold and Storage Layer

**Rationale:** All four commands depend on the storage layer. Getting this right once prevents rewrites. tsconfig and package.json must be correct before any TypeScript is written.
**Delivers:** Working project structure, `storage.ts` with atomic `load()`/`save()`, `types.ts` with `Todo`/`TodoStore`, passing type-check, dev workflow.
**Addresses:** `todos.json` auto-creation; data model for stable IDs
**Avoids:** Pitfalls 1 (non-atomic writes), 2 (ENOENT), tsconfig `outDir`/`strict`/ESM decision, bin pointing to .ts source, JSON pretty-print, ESM/CJS decision upfront

### Phase 2: Core Commands (add + list)

**Rationale:** `add` + `list` together form the smallest useful slice — create a todo and see it. Validates the full stack before building the remaining two commands.
**Delivers:** Working `todo add "text"` and `todo list`; `service.ts` with ID generation and query; commander wired in `index.ts`.
**Addresses:** Table stakes add/list features; empty list message; exit codes; errors to stderr; stable IDs
**Avoids:** Pitfalls 3 (empty-array ID generation), 4 (parse vs parseAsync), 5 (unknown commands)

### Phase 3: Mutation Commands (complete + delete)

**Rationale:** `complete` and `delete` share the same ID-lookup-then-mutate pattern. Building them together after the add/list foundation reduces redundancy.
**Delivers:** Working `todo complete <id>` (toggle) and `todo delete <id>`; ID-not-found errors; non-numeric ID rejection.
**Addresses:** Table stakes complete/delete features; all error cases from error catalog
**Avoids:** Pitfall 8 (non-numeric ID), Pitfall 9 (ID reuse after deletion)

### Phase 4: Polish and Differentiators

**Rationale:** Differentiators are one-liners that shouldn't block core functionality but complete the reference project.
**Delivers:** `add` text trim + empty-text guard; `list` completion summary; `--version` flag; suggestion-after-error for unknown commands.
**Addresses:** All FEATURES "should have" differentiators

### Phase Ordering Rationale

- Storage-first is forced by the dependency graph: every command needs `load()`/`save()`.
- `add` + `list` before `complete` + `delete` because you need data to manipulate — it is the first independently testable unit.
- Polish last because all differentiators are additive with no structural dependencies.
- All critical pitfalls (1, 2, 3, 4, 5) surface in Phases 1-2 and are addressed there.

### Research Flags

Phases with standard patterns (skip research-phase):
- **All phases:** This domain is fully covered by high-confidence official sources. commander.js patterns, TypeScript CLI architecture, and Node.js file I/O are well-documented. No phase requires additional research before implementation.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified against Context7 commander docs, tsx docs, TypeScript official docs, live npm registry |
| Features | HIGH | Derived from fixed PROJECT.md scope + UNIX CLI conventions |
| Architecture | HIGH | Three-layer CLI pattern is established; commander patterns verified via Context7 |
| Pitfalls | HIGH | All verified via direct Node.js execution or authoritative stdlib/TypeScript documentation |

**Overall confidence:** HIGH

### Gaps to Address

- **ESM vs CJS for `__dirname`:** STACK.md recommends ESM with NodeNext; `storage.ts` needs to resolve the `todos.json` path. In ESM, `__dirname` is unavailable — must use `fileURLToPath(new URL('.', import.meta.url))` or pass the path as `process.cwd()`. Confirm approach in Phase 1 scaffolding.
- **Async vs sync file I/O:** Architecture uses synchronous `readFileSync`/`writeFileSync` (correct for single-user local CLI). If switched to `fs/promises`, Pitfall 4 (`parseAsync`) becomes mandatory. Decide explicitly in Phase 1 and keep consistent throughout.

---

## Sources

### Primary (HIGH confidence)
- Context7 `/tj/commander.js` — argument parsing, action handlers, `InvalidArgumentError`, `parseAsync`, unknown command handling
- Context7 `/privatenumber/tsx` — dev runner setup, Node.js `--import` flag, watch mode
- Context7 `/microsoft/typescript-website` — `NodeNext` module resolution, tsconfig compiler options
- Node.js stdlib (`fs.renameSync`, `fs.readFileSync` ENOENT, `JSON.parse`) — verified via direct execution
- Live npm registry — commander@14.0.3, typescript@6.0.3, tsx@4.21.0, @types/node@25.6.0

### Secondary (MEDIUM confidence)
- UNIX CLI conventions (exit codes, stderr for errors) — well-established standard

---
*Research completed: 2026-04-29*
*Ready for roadmap: yes*
