# Phase 2: Commands and UX - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire all four commands (`add`, `list`, `complete`, `delete`) into the CLI entry point using `commander`. Each command calls the service layer and produces human-readable output. Phase 2 completes the reference implementation — after this phase, the CLI is fully functional.

</domain>

<decisions>
## Implementation Decisions

### Confirmation Messages

- **D-01:** `todo add "text"` prints `Added [N] text` on success — mirrors the list format, shows the assigned ID
- **D-02:** `todo complete N` prints `Done [N] text` on success — short, consistent with add style
- **D-03:** `todo delete N` prints `Deleted [N] text` on success — shows what was removed
- **D-04:** `todo list` on an empty store prints: `No todos yet. Run: todo add "text"` — helpful, not silent

### Command File Structure

- **D-05:** One file per command: `src/commands/add.ts`, `src/commands/list.ts`, `src/commands/complete.ts`, `src/commands/delete.ts`
- **D-06:** Each command file exports a function that registers the command on the `program` object
- **D-07:** `src/index.ts` imports each command file and calls the registration functions — thin orchestrator only

### Error Handling

- **D-08:** All errors (not-found, invalid input, corrupt storage) go to `process.stderr` and exit with code 1 (UX-02)
- **D-09:** The service layer already throws `Error("Todo with ID ${id} not found")` — command handlers catch this and print the message to stderr
- **D-10:** `todo complete abc` / `todo delete abc` (non-numeric ID): commander parses arguments as strings; commands must parse to int and validate before calling service — if NaN, print `Error: ID must be a number` to stderr and exit 1
- **D-11:** Unknown commands are handled by commander's default behavior — commander outputs an error and exits with non-zero code (UX-04)

### Claude's Discretion

- Exact output indentation/spacing within the fixed formats above
- Whether `todo list` numbers entries with their stored ID or re-numbers from 1 (stored ID is the right answer per the architecture, but the planner confirms)
- Error prefix format: "Error: ..." vs direct message

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Core value, constraints, list format spec (`[1] [ ] text`)
- `.planning/REQUIREMENTS.md` — v1 requirements CLI-01–04, UX-01–04 (all Phase 2)

### Phase 1 foundation
- `.planning/phases/01-scaffold-and-storage/01-CONTEXT.md` — D-15 (file structure), D-16 (dependency direction), D-17 (interfaces); all must be preserved
- `.planning/phases/01-scaffold-and-storage/01-01-SUMMARY.md` — tsconfig deviations (types: node), exact package versions
- `.planning/phases/01-scaffold-and-storage/01-02-SUMMARY.md` — service function signatures, error message format, .js import extension convention

No external ADRs or design docs — all requirements fully captured above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `src/service.ts` — exports `addTodo(text)`, `listTodos()`, `completeTodo(id)`, `deleteTodo(id)`; all sync; errors throw with "not found" message
- `src/types.ts` — exports `Todo { id: number, text: string, done: boolean }` and `TodoStore`
- `src/index.ts` — already has commander skeleton with `program.name('todo').version('1.0.0')`; Phase 2 adds subcommands to this program

### Established Patterns

- All local imports use `.js` extension (NodeNext requirement) — `import { addTodo } from '../service.js'`
- Sync I/O throughout — no async in commands needed
- Error pattern from service: `throw new Error(\`Todo with ID ${id} not found\`)` — catch in command, print to stderr, exit 1
- `"type": "module"` ESM project — import/export syntax only

### Integration Points

- Commands import from `../service.js` (one level up from `src/commands/`)
- `src/index.ts` imports from `./commands/add.js`, `./commands/list.js`, etc.
- Build output: `dist/commands/add.js`, `dist/commands/list.js`, etc. — tsc compiles the entire `src/` tree

</code_context>

<specifics>
## Specific Ideas

- List format confirmed: `[1] [ ] Milch kaufen` / `[2] [x] Meeting vorbereiten` — bracket-wrapped ID, space-padded checkbox
- Confirmation format follows the same bracket-ID style as list output for visual consistency

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 2 scope.

</deferred>

---

*Phase: 02-commands-and-ux*
*Context gathered: 2026-04-29*
