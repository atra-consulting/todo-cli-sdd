# Feature Landscape

**Domain:** CLI Todo App (TypeScript / Node.js / commander)
**Scope:** Fixed — add, list, complete (toggle), delete — stored in todos.json
**Researched:** 2026-04-29

---

## Table Stakes

Features users expect. Missing = CLI feels broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `add "text"` outputs confirmation | User needs feedback that the add succeeded | Low | Print the new todo's ID and text: `Added [3] Buy milk` |
| `list` shows all todos with IDs | Core affordance — IDs are the only way to reference items | Low | Format: `[1] [ ] Buy milk` / `[2] [x] Prepare meeting` |
| `list` on empty store prints friendly message | Empty output feels like a crash or bug | Low | Print `No todos yet. Add one with: todo add "text"` |
| `complete <id>` toggles and confirms state | User needs to know what happened and which direction | Low | Print `[2] [x] Prepare meeting — marked done` or `— marked incomplete` |
| `delete <id>` outputs confirmation | Destructive action must confirm what was removed | Low | Print `Deleted [2] Prepare meeting` |
| Invalid ID error is specific | Generic "error" messages leave users guessing | Low | Print `Error: No todo with ID 2` and exit with code 1 |
| Missing text on `add` produces clear error | Commander catches missing required args, but message should be human | Low | Commander handles this natively; ensure the error message names the argument |
| Non-numeric ID argument is rejected clearly | Users may accidentally pass strings | Low | Print `Error: ID must be a number` and exit with code 1 |
| `todos.json` auto-created if missing | First run should work transparently | Low | Create file (and parent dir if needed) on first write |
| Corrupt / malformed `todos.json` produces a clear error | Silent data loss or a raw JSON parse error is confusing | Low | Catch parse errors; print `Error: todos.json is not valid JSON — delete it to start fresh` and exit with code 1 |
| Exit code 0 on success, 1 on error | Standard UNIX convention; enables scripting | Low | All error paths must exit(1); success exits(0) |
| Error messages go to stderr | Enables `todo list > output.txt` without mixing errors into data | Low | Use `process.stderr.write` or `console.error` for all errors |
| Help text via `--help` and `-h` | Commander provides this; descriptions must be meaningful | Low | Every command and argument needs a useful description string |

---

## Differentiators

Features that elevate a reference project above the bare minimum. Not required, but make the project a better teaching example.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Consistent output prefix on success vs error | `✓ Added [3] Buy milk` vs `Error: ...` makes output scannable at a glance | Low | Pick a convention and apply it everywhere — even without color |
| `list` shows completion summary | `2 of 5 done` at bottom of list gives context | Low | Only display when list is non-empty |
| `list` formats pending and done todos distinctly | Done items visually grouped or dimmed | Low | Easiest approach: sort done to bottom, prefix done with `[x]`, pending with `[ ]` — already in spec |
| `add` trims whitespace from text | `todo add "  Buy milk  "` should store `Buy milk` | Low | One-liner, prevents subtle bugs |
| `add` rejects empty string after trimming | `todo add "   "` should error, not create a blank todo | Low | `Error: Todo text cannot be empty` |
| IDs are stable (never reused after delete) | Re-using IDs causes confusion when referencing old history | Low | Use a monotonic counter stored in `todos.json` alongside the array, or derive next ID as `max(existing IDs) + 1` |
| `--version` flag prints the package version | Standard CLI convention, demonstrates commander feature | Low | Use `program.version()` sourced from `package.json` |

---

## Anti-Features

Things to explicitly NOT build. Keeping them out protects readability as a reference project.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Color output (chalk, picocolors) | Adds a dependency; color handling adds complexity without teaching value | Plain text output; document where color would go as a comment |
| Interactive prompts (inquirer, prompts) | Breaks scriptability; adds a heavy dependency | Positional arguments only — commander handles this cleanly |
| Priority levels or due dates | Scope creep; breaks the minimal reference model | Out of scope per PROJECT.md |
| Fuzzy search / text matching | Numeric IDs are the stated design decision; matching adds ambiguity | Use IDs only |
| Global storage (`~/.todos.json`) | Project-local storage is the stated design decision | Current directory only |
| Undo / history | Significant state management complexity | Out of scope |
| Multiple lists / projects | Implies directory-aware scoping that complicates the model | One `todos.json` per working directory, period |
| Shell auto-completion scripts | Non-trivial to implement correctly across shells | Out of scope per PROJECT.md |
| Watch mode / daemon | No use case for a reference todo CLI | Out of scope |
| Config file (`.todorc`) | Adds a whole configuration surface with no benefit here | Hard-code all behavior |

---

## Error Cases and Expected Behavior

Exhaustive catalog for implementation. These are the cases that separate a polished CLI from a rough one.

### `add` command

| Input | Expected Behavior | Exit Code |
|-------|-------------------|-----------|
| `todo add "Buy milk"` | Creates todo, prints `Added [N] Buy milk` | 0 |
| `todo add` | Commander error: missing required argument `<text>` | 1 |
| `todo add ""` | `Error: Todo text cannot be empty` | 1 |
| `todo add "   "` | `Error: Todo text cannot be empty` (after trim) | 1 |
| `todos.json` is corrupt | `Error: todos.json is not valid JSON — delete it to start fresh` | 1 |

### `list` command

| Input | Expected Behavior | Exit Code |
|-------|-------------------|-----------|
| `todo list` (items exist) | Prints formatted list, one per line | 0 |
| `todo list` (empty store) | `No todos yet. Add one with: todo add "text"` | 0 |
| `todo list` (no `todos.json`) | Treat as empty — same as above (file not existing is not an error) | 0 |
| `todos.json` is corrupt | `Error: todos.json is not valid JSON — delete it to start fresh` | 1 |

### `complete` command

| Input | Expected Behavior | Exit Code |
|-------|-------------------|-----------|
| `todo complete 2` (exists, pending) | Marks done, prints `[2] [x] Text — marked done` | 0 |
| `todo complete 2` (exists, done) | Unmarks, prints `[2] [ ] Text — marked incomplete` | 0 |
| `todo complete 99` (ID not found) | `Error: No todo with ID 99` | 1 |
| `todo complete` (no ID) | Commander error: missing required argument `<id>` | 1 |
| `todo complete abc` (non-numeric) | `Error: ID must be a number` | 1 |
| `todo complete 2.5` (fractional) | `Error: ID must be a whole number` | 1 |

### `delete` command

| Input | Expected Behavior | Exit Code |
|-------|-------------------|-----------|
| `todo delete 2` (exists) | Removes from store, prints `Deleted [2] Text` | 0 |
| `todo delete 99` (ID not found) | `Error: No todo with ID 99` | 1 |
| `todo delete` (no ID) | Commander error: missing required argument `<id>` | 1 |
| `todo delete abc` (non-numeric) | `Error: ID must be a number` | 1 |

---

## Output Format Specification

### `list` output

```
[1] [ ] Buy milk
[2] [x] Prepare meeting
[3] [ ] Call dentist
```

- Square brackets around ID: `[N]`
- Checkbox notation: `[ ]` pending, `[x]` done
- Single space between each segment
- One todo per line
- No blank lines between items
- Optional summary line at end (differentiator): `2 of 3 done`

### Success confirmations

```
Added [3] Buy milk
Deleted [2] Prepare meeting
[2] [x] Prepare meeting — marked done
[2] [ ] Prepare meeting — marked incomplete
```

### Error messages

```
Error: No todo with ID 99
Error: Todo text cannot be empty
Error: ID must be a number
Error: todos.json is not valid JSON — delete it to start fresh
```

- Always prefixed with `Error:`
- Always to stderr
- Never include stack traces in user-facing output (handle internally, log to stderr only in debug mode)

---

## Feature Dependencies

```
list → todos.json read (graceful on missing file)
add → todos.json read + write (create if missing)
complete <id> → todos.json read + write (ID must exist)
delete <id> → todos.json read + write (ID must exist)
```

All mutation commands (add, complete, delete) require a read-before-write cycle to maintain consistency.

---

## MVP Recommendation

The scope is already fixed by PROJECT.md. Within that scope, prioritize:

1. All four commands working end-to-end (add, list, complete, delete)
2. Empty list message
3. Invalid ID error with specific ID in message
4. Exit codes (0 / 1)
5. Errors to stderr

Then add differentiators in order: stable IDs, trim/empty-text guard, completion summary.

Defer: `--version` flag (can add with one line at any time, not a UX concern).

---

## Sources

- Commander.js official docs via Context7 (`/tj/commander.js`) — HIGH confidence
- Project scope and decisions from `/Users/daniel.schock/Development.localized/repository/atra/todo-cli-sdd/todo-cli-gsd/.planning/PROJECT.md` — HIGH confidence
- UNIX CLI conventions (exit codes, stderr for errors) — HIGH confidence, well-established standard
