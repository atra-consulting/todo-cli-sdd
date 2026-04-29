# todo-cli · GSD (Get Shit Done)

Implementierung der Todo-CLI auf Basis von **[GSD](https://www.npmjs.com/package/get-shit-done-cc)**. Slash-Command-Layer für den bestehenden Editor — analog zu Spec Kit, aber mit anderem Schwerpunkt: GSD orchestriert die Implementierung **aktiv**, zerlegt Pläne in atomar unabhängige Tasks und führt sie über Subagenten mit frischen Kontexten parallel aus. Walk-Away-Modus: Phase starten, zu fertigem Code zurückkommen.

Teil des Vergleichs in [`../README.md`](../README.md). Hintergrund im Blog-Artikel [Spec-Driven Development in der Praxis](https://atra-homepage.vercel.app/blog/spec-driven-development-tools).

## Spec-Artefakte

Alle generierten SDD-Dokumente liegen unter [`.planning/`](./.planning):

| Pfad                          | Inhalt                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `PROJECT.md`                  | Projekt-Charter mit Core Value, aktiven Requirements, Out-of-Scope-Liste, technischen Constraints, Key Decisions |
| `REQUIREMENTS.md`             | Anforderungen als prüfbare Checklisten mit IDs (`CLI-01`, `STOR-02`, `UX-03`), v2-Backlog, Traceability-Matrix   |
| `ROADMAP.md`                  | Phasenplan mit Goal, Dependencies, Requirements-Mapping und messbaren Success Criteria pro Phase                |
| `STATE.md`                    | Aktueller Ausführungsstatus (Phase/Plan)                                                                        |
| `phases/01-scaffold-and-storage/` | Phase 1: PLAN.md je Task, CONTEXT, DISCUSSION-LOG, REVIEW, VERIFICATION                                     |
| `phases/02-commands-and-ux/`  | Phase 2: PLAN.md je Task, CONTEXT, DISCUSSION-LOG, UAT                                                          |

PLAN-Dateien sind XML-strukturiert mit `<action>`-, `<verify>`- und `<done>`-Blöcken — direkt vom Subagenten ausführbar.

## Code

```
src/
├── index.ts                  # commander-Entry-Point
├── commands/                 # add | list | complete | delete
├── service.ts                # Business-Logik
├── storage.ts                # JSON-File-Persistenz (todos.json)
├── types.ts
└── test/                     # node:test (eingebaut)
```

## Run

```bash
npm install
npm run build           # tsc + chmod +x dist/index.js
npm start -- add "Einkaufen"
npm start -- list
npm start -- complete 1     # ⚠️ siehe „Toggle-Drift" unten
npm start -- delete 1
npm run typecheck       # tsc --noEmit
```

## Bemerkenswert

- **Spec-Format:** Checklisten-Items mit Requirement-IDs plus phasenbasierte Roadmap. Jede Phase hat messbare Success Criteria.
- **Subagenten + Parallelisierung:** Tasks innerhalb einer Phase werden parallel von Subagenten mit frischen Kontexten ausgeführt. Lerngrund: KI-Agenten produzieren schlechteren Code, je länger ein Kontextfenster wächst.
- **Toolagnostisch:** Über 14 Runtimes (Claude Code, Gemini CLI, OpenCode, Copilot, Cursor, Windsurf, Codex, Augment, …); LLM ergibt sich aus dem gewählten Tool.
- **Toggle-Drift:** GSD baute `complete` als **Toggle**, weil das Wort „toggeln" in `REQUIREMENTS.md → CLI-03` stand. Spec Kit und Kiro bauten an gleicher Stelle einen nicht-reversiblen Übergang. Die Implementierung folgt also exakt der Spec — das ist genau der Punkt von SDD und gleichzeitig die Mahnung des theoretischen Beitrags zur menschlichen [Verifikationsrolle](https://atra-homepage.vercel.app/blog/spec-driven-development#kontrolle-auf-dem-papier-ist-noch-keine-kontrolle-im-alltag).
- **Aufwand-Bewertung:** 3/5 — höchster Lernaufwand der drei Tools, dafür autonomste Ausführung. Walk-Away funktioniert.
