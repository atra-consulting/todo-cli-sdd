# CLI Command Contracts: Todo CLI

**Phase**: 1 — Design  
**Date**: 2026-04-29  
**Feature**: [spec.md](../spec.md)

## Overview

The Todo CLI exposes four commands to the user. All commands read from and write to `~/.todo/todos.json`. All output goes to `stdout`; errors go to `stderr`. Exit code `0` on success, non-zero on error.

---

## `add <description>`

Adds a new todo item with the given description.

**Arguments**:

| Argument      | Required | Description                    |
|---------------|----------|--------------------------------|
| `description` | Yes      | Text describing the task       |

**Output (stdout)**:
```
✓ Added todo #<id>: <description>
```

**Error cases**:

| Condition              | stderr message                                   | Exit code |
|------------------------|--------------------------------------------------|-----------|
| Description is empty   | `Error: Description must not be empty.`          | 1         |
| Storage write failure  | `Error: Could not write to storage file: <path>` | 1         |

---

## `list`

Displays all todo items.

**Arguments**: None

**Output (stdout)**:
```
ID   Status     Description
---  ---------  --------------------------------
1    [ ]        Buy groceries
2    [✓]        Read research paper
```

Empty list output:
```
No todos yet. Add one with: todo add "<description>"
```

**Error cases**:

| Condition              | stderr message                                    | Exit code |
|------------------------|---------------------------------------------------|-----------|
| Storage read failure   | `Error: Could not read storage file: <path>`      | 1         |

---

## `complete <id>`

Marks the specified todo item as done.

**Arguments**:

| Argument | Required | Description                        |
|----------|----------|------------------------------------|
| `id`     | Yes      | Integer ID of the todo to complete |

**Output (stdout)**:
```
✓ Completed todo #<id>: <description>
```

Already-completed notice (stdout, exit 0):
```
Todo #<id> is already marked as done.
```

**Error cases**:

| Condition              | stderr message                                   | Exit code |
|------------------------|--------------------------------------------------|-----------|
| ID not found           | `Error: No todo with ID <id>.`                   | 1         |
| ID not a valid integer | `Error: ID must be a positive integer.`          | 1         |
| Storage write failure  | `Error: Could not write to storage file: <path>` | 1         |

---

## `delete <id>`

Permanently removes the specified todo item.

**Arguments**:

| Argument | Required | Description                       |
|----------|----------|-----------------------------------|
| `id`     | Yes      | Integer ID of the todo to delete  |

**Output (stdout)**:
```
✓ Deleted todo #<id>: <description>
```

**Error cases**:

| Condition              | stderr message                                   | Exit code |
|------------------------|--------------------------------------------------|-----------|
| ID not found           | `Error: No todo with ID <id>.`                   | 1         |
| ID not a valid integer | `Error: ID must be a positive integer.`          | 1         |
| Storage write failure  | `Error: Could not write to storage file: <path>` | 1         |

---

## Global Behaviour

- Running `todo` or `todo --help` displays usage information for all commands.
- Running `todo <command> --help` displays usage for that specific command.
- The storage directory `~/.todo/` is created automatically if it does not exist.
- If the storage file is missing, an empty store is initialized on first write.
- If the storage file exists but is not valid JSON, the CLI exits with an error and does **not** overwrite it.
