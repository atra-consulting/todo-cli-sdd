# Requirements: Todo CLI (TypeScript)

**Defined:** 2026-04-29
**Core Value:** Eine funktionierende CLI zum Verwalten von Todos per add/list/complete/delete, die als saubere Referenzimplementierung dient.

## v1 Requirements

### CLI Commands

- [ ] **CLI-01**: User kann `todo add "text"` ausführen um ein neues Todo hinzuzufügen
- [ ] **CLI-02**: User kann `todo list` ausführen um alle Todos anzuzeigen (Format: `[1] [ ] text` / `[1] [x] text`)
- [ ] **CLI-03**: User kann `todo complete <ID>` ausführen um den Erledigungsstatus zu toggeln
- [ ] **CLI-04**: User kann `todo delete <ID>` ausführen um ein Todo zu entfernen

### Storage

- [ ] **STOR-01**: Todos werden in `todos.json` im aktuellen Arbeitsverzeichnis gespeichert
- [ ] **STOR-02**: Fehlende `todos.json` wird als leere Liste behandelt (kein Fehler)
- [ ] **STOR-03**: IDs sind stabile Integers die nach dem Löschen nicht wiederverwendet werden

### UX & Error Handling

- [ ] **UX-01**: `todo list` auf leerer Liste zeigt eine hilfreiche Nachricht statt leerer Ausgabe
- [ ] **UX-02**: Alle Fehler werden nach stderr ausgegeben und beenden den Prozess mit Exit-Code 1
- [ ] **UX-03**: Ungültige oder nicht existierende IDs zeigen eine spezifische Fehlermeldung
- [ ] **UX-04**: Unbekannte Befehle zeigen eine Fehlermeldung (kein stilles Ignorieren)

### Project Setup

- [ ] **PROJ-01**: Projekt kann mit `npm run build` gebaut werden (kompiliertes JS in `dist/`)
- [ ] **PROJ-02**: CLI ist über `bin`-Feld in package.json per `npx` oder globalem Install ausführbar
- [ ] **PROJ-03**: TypeScript strict mode aktiv, `module: "NodeNext"`, `moduleResolution: "NodeNext"`

## v2 Requirements

### Erweiterungen

- **EXT-01**: Mehrere IDs auf einmal annehmen (`todo delete 1 2 3`)
- **EXT-02**: JSON-Output-Flag für Scripting (`todo list --json`)
- **EXT-03**: Farbige Ausgabe (erfordert externe Dependency)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Globale `~/.todos.json` | Projektlokal passt besser zum Referenz-Use-Case |
| Zeitstempel / Erstellungsdatum | Nicht im v1-Scope |
| Interaktiver Modus (Prompts) | Bricht Scripting, außerhalb des Scopes |
| Kurztext-Matching | Numerische IDs sind eindeutiger und einfacher |
| Farb-Output | Würde externe Dependency erfordern |
| Undo-Funktion | Over-Engineering für v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROJ-01 | Phase 1 | Pending |
| PROJ-02 | Phase 1 | Pending |
| PROJ-03 | Phase 1 | Pending |
| STOR-01 | Phase 1 | Pending |
| STOR-02 | Phase 1 | Pending |
| STOR-03 | Phase 1 | Pending |
| CLI-01 | Phase 2 | Pending |
| CLI-02 | Phase 2 | Pending |
| UX-01 | Phase 2 | Pending |
| UX-02 | Phase 2 | Pending |
| UX-03 | Phase 2 | Pending |
| UX-04 | Phase 2 | Pending |
| CLI-03 | Phase 2 | Pending |
| CLI-04 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-29*
*Last updated: 2026-04-29 after initial definition*
