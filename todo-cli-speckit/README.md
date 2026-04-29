# todo-cli · Spec Kit

Implementierung der Todo-CLI auf Basis von **[Spec Kit](https://github.com/github/spec-kit)** (GitHub, prozessorientiertes Open-Source-Toolkit). Spec Kit legt sich als Slash-Command-Layer über den bestehenden Coding Agent und strukturiert die Arbeit in einem wiederholbaren Zyklus: `specify` → `plan` → `tasks`.

Teil des Vergleichs in [`../README.md`](../README.md). Hintergrund im Blog-Artikel [Spec-Driven Development in der Praxis](https://atra-homepage.vercel.app/blog/spec-driven-development-tools).

## Spec-Artefakte

Alle generierten SDD-Dokumente liegen unter [`specs/main/`](./specs/main):

| Datei                | Inhalt                                                                         |
| -------------------- | ------------------------------------------------------------------------------ |
| `spec.md`            | Feature Specification mit User Stories (Given/When/Then), FR-001 – FR-012, Edge Cases |
| `plan.md`            | Stack, Verzeichnisstruktur, Build-Befehle, Architekturentscheidungen           |
| `data-model.md`      | Entitäten, JSON-Schema-Beispiel, Validierungsregeln, ID-Allokation             |
| `tasks.md`           | 23 Tasks in 7 Phasen mit `[P]`-Parallelisierungsmarkierungen                   |
| `research.md`        | Technische Vorrecherche                                                        |
| `contracts/`         | CLI-Befehlskontrakte (Input/Output/Exit-Codes)                                 |
| `checklists/`        | Review- und Akzeptanz-Checklisten                                              |

## Code

```
src/
├── index.ts              # commander-Entry-Point
├── commands/             # add | list | complete | delete
├── models/todo.ts
└── storage/json-store.ts # JSON-File-Persistenz
tests/                    # node:test (eingebaut, kein extra Test-Runner)
```

## Run

```bash
npm install
npm run build           # tsc → dist/
npm start -- add "Einkaufen"
npm start -- list
npm start -- complete 1
npm start -- delete 1
npm test                # tsc + node --test dist/tests/**/*.test.js
```

## Bemerkenswert

- **Spec-Format:** Given/When/Then-Szenarien — auch für Nicht-Entwickler lesbar.
- **Constitution:** Optional; hier als leeres Template angelegt, nicht befüllt — der Workflow funktionierte auch ohne.
- **Toolagnostisch:** über 30 unterstützte AI Coding Agents; das genutzte LLM ergibt sich aus dem gewählten Tool.
- **Aufwand-Bewertung:** 1/5 — alles verlief reibungslos, die nächsten Schritte waren jederzeit klar.
