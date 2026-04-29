# todo-cli · Kiro

Implementierung der Todo-CLI auf Basis von **[Kiro](https://kiro.dev/)** (AWS, vollständige IDE auf Code-OSS-Basis mit SDD als First-Class Feature). Verfügt über zwei Einstiegspunkte: **Requirements-First** (EARS-Requirements → Design) oder **Design-First** (Architektur → Requirements).

Teil des Vergleichs in [`../README.md`](../README.md). Hintergrund im Blog-Artikel [Spec-Driven Development in der Praxis](https://atra-homepage.vercel.app/blog/spec-driven-development-tools).

## Spec-Artefakte

Alle generierten SDD-Dokumente liegen unter [`.kiro/specs/todo-cli/`](./.kiro/specs/todo-cli):

| Datei             | Inhalt                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `requirements.md` | Requirements in **EARS-Notation** (`WHEN ... THE CLI SHALL ...`), 7 nummerierte Requirements mit Acceptance Criteria, vollständig auf Deutsch, Glossar |
| `design.md`       | Schichtenarchitektur (CLI → Service → Storage), TypeScript-Interfaces (`Todo`, `TodoStorage`, `TodoService`, `ServiceResult<T>`), 13 Correctness Properties, Testing-Strategie inkl. Property-Based Testing via `fast-check` |
| `tasks.md`        | 10 Haupt-Tasks mit Sub-Tasks, Requirements-Rückverfolgbarkeit pro Task, optionale PBT-Subtasks                    |

## Code

```
src/
├── index.ts                     # commander-Entry-Point
├── commands/                    # add | list | complete | delete
├── service/TodoService.ts       # Business-Logik, ServiceResult<T>-Pattern
├── storage/TodoStorage.ts       # JSON-File-Persistenz
├── types/Todo.ts
└── formatter.ts                 # CLI-Output-Formatierung
tests/                           # vitest + fast-check (Property-Based Tests)
```

## Run

```bash
npm install
npm run build           # tsc → dist/
npm start -- add "Einkaufen"
npm start -- list
npm start -- complete 1
npm start -- delete 1
npm test                # vitest run, inkl. Property-Based Tests
```

## Bemerkenswert

- **Spec-Format:** EARS-Notation (Easy Approach to Requirements Syntax) — `WHEN ... THE SYSTEM SHALL ...` plus `IF ... THEN`-Muster für Edge Cases.
- **Tiefste Artefakte der drei Tools:** vollständige Interface-Definitionen, 13 Correctness Properties, formaler `ServiceResult<T>`-Typ für explizite Fehlerbehandlung — alles direkt im Design-Dokument verankert.
- **Plattform & Credits:** Kiro betreibt eine eigene Plattform (eigenes Backend), arbeitet mit einem Credit-System. Diese Session verbrauchte 23,57 von 500 Trial-Credits; permanenter Free Tier umfasst nur 50 Credits/Monat.
- **Aufwand-Bewertung:** 2/5 — verlief problemlos, dauert spürbar länger als Spec Kit, dafür deutlich tiefere Artefakte.
