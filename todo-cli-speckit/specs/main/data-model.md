# Data Model: Todo CLI

**Phase**: 1 — Design  
**Date**: 2026-04-29  
**Feature**: [spec.md](spec.md)

## Entities

### Todo

Represents a single task managed by the user.

| Field       | Type      | Description                                      | Constraints                     |
|-------------|-----------|--------------------------------------------------|---------------------------------|
| `id`        | `number`  | Unique auto-incrementing integer identifier      | Positive integer, unique, stable|
| `description` | `string` | User-supplied task text                        | Non-empty, max 500 characters   |
| `completed` | `boolean` | Whether the task has been marked as done         | Default: `false`                |
| `createdAt` | `string`  | ISO 8601 timestamp of creation                   | Set once at creation, immutable |

**State Transitions**:
```
pending (completed: false)
    └── complete command ──► done (completed: true)
```
Once completed, a todo cannot return to pending (v1 scope). Deletion is available in either state.

### TodoStore

The root structure of the JSON persistence file.

| Field     | Type     | Description                                  | Constraints              |
|-----------|----------|----------------------------------------------|--------------------------|
| `version` | `string` | Schema version for future migrations         | SemVer string, e.g. `"1.0"` |
| `todos`   | `Todo[]` | Ordered list of all todo items               | May be empty array       |

## Validation Rules

- `description` must not be empty or whitespace-only → enforced by `add` command
- `id` must exist in the store → enforced by `complete` and `delete` commands before mutating
- `completed` must be `false` before calling `complete` → system warns if already done, no error thrown
- Store file must be valid JSON → if unreadable/corrupt, system halts with error (does not overwrite)

## Storage Schema

The store is serialized as a single JSON file at `~/.todo/todos.json`:

```json
{
  "version": "1.0",
  "todos": [
    {
      "id": 1,
      "description": "Buy groceries",
      "completed": false,
      "createdAt": "2026-04-29T10:00:00.000Z"
    },
    {
      "id": 2,
      "description": "Read research paper",
      "completed": true,
      "createdAt": "2026-04-29T10:05:00.000Z"
    }
  ]
}
```

## ID Allocation

Next ID = `max(todos.map(t => t.id), 0) + 1`

This ensures IDs never reuse a previously assigned value, even after deletions.
