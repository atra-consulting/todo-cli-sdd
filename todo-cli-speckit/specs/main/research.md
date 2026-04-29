# Research: Todo CLI

**Phase**: 0 — Outline & Research  
**Date**: 2026-04-29  
**Feature**: [spec.md](spec.md)

## Constraint

**No external dependencies except `commander`** (user-specified).  
This applies to production `dependencies`. DevDependencies may include `typescript` and `@types/node` (build tooling, not runtime).

## Decision Log

### CLI Argument Parsing

- **Decision**: Use `commander` (the only allowed external package)
- **Rationale**: De-facto standard for Node.js CLI tools. Handles subcommands, argument validation, and help text generation with minimal boilerplate. Well-maintained, ships with its own TypeScript types in v12+.
- **Alternatives considered**: `yargs`, `minimist`, native `process.argv` — all rejected either for being disallowed or being too low-level.

### Storage File Location

- **Decision**: `~/.todo/todos.json` (user home directory, hidden folder)
- **Rationale**: Placing the file in the user's home directory ensures todos persist regardless of which directory the CLI is invoked from. The `.todo` subfolder keeps it organized. Implemented using Node.js built-in `fs` and `os` modules — no external dependency required.
- **Alternatives considered**:
  - Current working directory — data lost when switching directories
  - `~/.config/todo/todos.json` — XDG-compliant but more complex for v1

### ID Generation Strategy

- **Decision**: Auto-incrementing integer (1, 2, 3 …)
- **Rationale**: Human-readable and easy to type at the command line. Next ID = `max(existing IDs, 0) + 1`. Implemented with standard JavaScript `Math.max`.
- **Alternatives considered**: UUID v4 (long, requires external dep or crypto module), Nano ID (external dep).

### Testing Framework

- **Decision**: Node.js built-in test runner (`node:test`, available since Node.js 18)
- **Rationale**: No external dependency needed. `node:test` ships with Node 18 LTS and provides `describe`, `it`, `assert`, and subtests. Tests are compiled with `tsc` and run with `node --test`.
- **Alternatives considered**:
  - Jest + ts-jest — external dependencies, violates constraint
  - Vitest — external dependency, violates constraint
  - Mocha + Chai — external dependencies, violates constraint

### TypeScript Compilation & Dev Workflow

- **Decision**: `tsc` for compilation; no `ts-node` or `tsx`
- **Rationale**: `typescript` is a standard devDependency. Compiling to `dist/` before running is the simplest, dependency-free approach. Test files are compiled alongside source and run with `node --test dist/**/*.test.js`.
- **Alternatives considered**:
  - `ts-node` — external devDependency; adds complexity without benefit given the small project size
  - `tsx` — external devDependency, not allowed

### Package Structure

- **`dependencies`**: `commander` only
- **`devDependencies`**: `typescript`, `@types/node`
- Commander v12+ ships its own types — no `@types/commander` needed.

## Open Questions Resolved

All unknowns resolved. No NEEDS CLARIFICATION markers remain.
