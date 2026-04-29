# Todo CLI (TypeScript)

## What This Is

Eine Todo-CLI in TypeScript und Node.js, die Aufgaben in einer lokalen JSON-Datei verwaltet. Sie dient als sauberes Referenzprojekt, das zeigt, wie man eine minimalistische CLI mit `commander` baut — ohne unnötige externe Abhängigkeiten.

## Core Value

Eine funktionierende CLI, mit der man Todos per `add`, `list`, `complete` und `delete` verwalten kann, und die als nachvollziehbare Referenzimplementierung für andere dient.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User kann ein Todo per `todo add "Text"` hinzufügen
- [ ] User kann alle Todos per `todo list` anzeigen (Format: `[ID] [ ] Text`)
- [ ] User kann ein Todo per `todo complete <ID>` als erledigt markieren (Toggle)
- [ ] User kann ein Todo per `todo delete <ID>` löschen
- [ ] Todos werden in `todos.json` im aktuellen Verzeichnis gespeichert
- [ ] Referenzierung von Todos erfolgt über numerische IDs

### Out of Scope

- Zeitstempel / Erstellungsdatum — nicht nötig für Minimalversion
- Kurztext-Matching — numerische IDs sind einfacher und eindeutiger
- Globale ~/.todos.json — projektlokale Datei passt besser zum Referenz-Use-Case
- Externe Dependencies außer `commander` — soll minimal und lesbar bleiben
- Subkommandos / Aliases / Shell-Completion — Out of scope für v1

## Context

- **Tech Stack**: TypeScript, Node.js, `commander` (einzige externe Dependency)
- **Zielgruppe**: Entwickler, die das Projekt als Referenz oder Vorlage nutzen
- **Hauptzweck**: Showcase / Lernvorlage — Code soll lesbar und strukturiert sein
- **Storage**: `todos.json` im aktuellen Arbeitsverzeichnis (project-local)
- **List-Format**: `[1] [ ] Milch kaufen` / `[2] [x] Meeting vorbereiten`

## Constraints

- **Tech Stack**: TypeScript + Node.js + `commander` only — keine weiteren NPM-Pakete
- **Einfachheit**: Code soll als Referenzprojekt verständlich sein — keine Over-Engineering
- **Portabilität**: Funktioniert ohne globale Installation (via `npx ts-node` oder Build)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| `commander` als einzige Dependency | Saubere Argument-Parsing ohne Boilerplate; bekannte Library in der Community | — Pending |
| Numerische IDs statt Text-Matching | Eindeutig, einfach zu tippen, kein Ambiguity-Problem bei ähnlichen Titeln | — Pending |
| `todos.json` im aktuellen Verzeichnis | Projektlokal — mehrere Verzeichnisse können eigene Todos haben | — Pending |
| Toggle-Verhalten bei `complete` | Flexibler als einmaliges Abhaken — nützlich für Referenzzwecke | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-29 after initialization*
