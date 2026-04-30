# Todo CLI · SDD-Tools im Vergleich

Drei aktuelle SDD-Tools — **Spec Kit**, **Kiro** und **GSD** — wurden mit derselben Aufgabe gefüttert: einer **Todo-CLI in TypeScript** mit den Befehlen `add`, `list`, `complete` und `delete`. Jede Session wurde tatsächlich durchgespielt; die Spec-Artefakte und der erzeugte Code liegen 1:1 in den drei Unterprojekten.

## Die Pointe: Spec-Präzision bestimmt Code-Verhalten

Alle drei Tools haben dasselbe Feature implementiert — und doch unterscheidet sich das Ergebnis. Spec Kit und Kiro bauten einen nicht-reversiblen Status-Übergang (`pending → done`). GSD baute einen **Toggle**, weil das Wort „toggeln" in der Requirements-Checkbox stand.

Gleiches Projekt, gleiches Feature, unterschiedliches Verhalten. Das ist kein Zufall und kein Bug — und der Drift wurde bewusst nicht durch eine Sichtung der generierten Markdown-Specs aufgefangen. _Kontrolle auf dem Papier ist noch keine Kontrolle im Alltag._

## Repository-Layout

| Verzeichnis                               | Tool     | Spec-Format          | Artefakte unter         |
| ----------------------------------------- | -------- | -------------------- | ----------------------- |
| [`todo-cli-speckit/`](./todo-cli-speckit) | Spec Kit | Given/When/Then      | `specs/main/`           |
| [`todo-cli-kiro/`](./todo-cli-kiro)       | Kiro     | EARS-Notation        | `.kiro/specs/todo-cli/` |
| [`todo-cli-gsd/`](./todo-cli-gsd)         | GSD      | Checklisten + Phasen | `.planning/`            |

Jedes Unterverzeichnis ist ein eigenständiges Node-Projekt mit eigener `package.json` und eigenem `tsconfig.json`.

## Quickstart pro Tool

Voraussetzung: Node.js ≥ 20.

```bash
# Spec Kit
cd todo-cli-speckit && npm install && npm run build && npm start -- add "Einkaufen"

# Kiro
cd todo-cli-kiro && npm install && npm run build && npm start -- add "Einkaufen"

# GSD
cd todo-cli-gsd && npm install && npm run build && npm start -- add "Einkaufen"
```

Tests:

```bash
cd todo-cli-speckit && npm test  # node:test (eingebaut)
cd todo-cli-kiro    && npm test  # vitest, inkl. Property-Based Testing via fast-check
# todo-cli-gsd: keine eigene Test-Suite konfiguriert
```

## Working Notes

[`NOTE.md`](./NOTE.md) enthält die Arbeitsnotizen aus den drei Sessions — was funktioniert hat, was unklar war, welche Artefakte entstanden sind und der gefühlte Aufwand auf einer 1–5-Skala.
