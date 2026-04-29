---
status: complete
phase: 02-commands-and-ux
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md
started: 2026-04-29T13:50:00Z
updated: 2026-04-29T13:50:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: |
  `npm run build` produces dist/index.js. Running `node dist/index.js list` on a fresh environment boots without errors and produces output.
result: pass

### 2. Add a todo
expected: |
  `node dist/index.js add "Buy milk"` prints `Added [1] Buy milk` to stdout and exits 0.
result: pass

### 3. List todos (non-empty)
expected: |
  After adding "Buy milk", `node dist/index.js list` prints `[1] [ ] Buy milk`.
result: pass

### 4. Complete a todo
expected: |
  `node dist/index.js complete 1` prints `Done [1] Buy milk` to stdout and exits 0.
result: pass

### 5. List shows completed state
expected: |
  After completing todo 1, `node dist/index.js list` prints `[1] [x] Buy milk`.
result: pass

### 6. Delete a todo
expected: |
  `node dist/index.js delete 1` prints `Deleted [1] Buy milk` to stdout and exits 0.
result: pass

### 7. List is empty after delete
expected: |
  After deleting all todos, `node dist/index.js list` prints `No todos yet. Run: todo add "text"`.
result: pass

### 8. Invalid (non-numeric) ID rejected
expected: |
  `node dist/index.js complete abc` prints `Error: ID must be a number` to stderr and exits 1.
result: pass

### 9. Not-found ID error
expected: |
  `node dist/index.js delete 99` prints `Todo with ID 99 not found` to stderr and exits 1.
result: pass

### 10. Unknown command rejected
expected: |
  `node dist/index.js unknowncmd` prints a commander error message to stderr and exits non-zero.
result: pass

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
