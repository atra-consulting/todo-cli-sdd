# Notes

## speckit

Was hat funktioniert?
> Alles verlief reibungslos, ohne relevanten manuellen Eingriff

Was war unklar oder hat nicht geklappt?
> Nichts, alles war gut erklärt, die nächsten schritte waren klar.

Welche Artefakte hat das Tool erzeugt?
> - `specs/main/spec.md` — Feature Specification mit User Stories (Given/When/Then), Acceptance Scenarios pro Story (P1–P4), funktionale Requirements (FR-001–FR-012), Edge Cases und Success Criteria
> - `specs/main/plan.md` — Implementation Plan mit technischem Stack (TypeScript, Node.js, commander), vollständiger Verzeichnisstruktur, Build/Run-Befehlen und Architekturentscheidungen
> - `specs/main/data-model.md` — Datenmodell mit Entitäts-Definitionen, JSON-Schema-Beispiel, Validierungsregeln und ID-Allokationsstrategie
> - `specs/main/tasks.md` — 23 Tasks in 7 Phasen, mit Parallelisierungsmarkierungen [P], User-Story-Zuordnung, Abhängigkeitsgraph und inkrementellem Lieferplan
> - `specs/main/research.md` — Technische Vorrecherche
> - `specs/main/contracts/` — CLI-Befehlskontrakte (Input/Output/Exit-Codes)

Gefühlter Aufwand (1–5)?
> 1

## kiro

Was hat funktioniert?
> Verlief ohne probleme, scheit sauberer zu arbeiten. Hinterlässt weniger Dot-Files

Was war unklar oder hat nicht geklappt?
> Es dauerte wesentlich länger, und benötigt ein weiteres Tool. Credits werden benötigt. Verbrauchte 23.57 Credits von 500 in der Free version für diese Operation

Welche Artefakte hat das Tool erzeugt?
> Alle Artefakte liegen unter `.kiro/specs/todo-cli/`:
> - `requirements.md` — Requirements in EARS-Notation (`WHEN ... THE CLI SHALL ...`), aufgeteilt in 7 nummerierte Requirements mit je mehreren Acceptance Criteria; vollständig auf Deutsch; enthält Glossar und technische Rahmenbedingungen
> - `design.md` — Design Document mit Schichtenarchitektur (CLI → Service → Storage), vollständigen TypeScript-Interface-Definitionen (`Todo`, `TodoStorage`, `TodoService`, `ServiceResult<T>`), Datenmodell, 13 formalen Correctness Properties und detaillierter Testing-Strategie inkl. Property-Based Testing mit `fast-check`
> - `tasks.md` — Implementation Plan mit 10 Haupt-Tasks (nummeriert, mit Sub-Tasks), Requirements-Rückverfolgbarkeit pro Task, Hinweisen auf optionale PBT-Subtasks (markiert mit `*`) und Checkpoints

Gefühlter Aufwand (1–5)?
> 2

## gsd

Was hat funktioniert?
> Nutzt subagents, parallelisierung,

Was war unklar oder hat nicht geklappt?
> Dauert lange bis ergebnis kommt

Welche Artefakte hat das Tool erzeugt?
> Alle Artefakte liegen unter `.planning/`:
> - `PROJECT.md` — Projekt-Charter mit Core Value, aktiven Requirements, Out-of-Scope-Liste, technischen Constraints, Key Decisions und Evolutionsstrategie (wird bei Phase-Transitions aktualisiert)
> - `REQUIREMENTS.md` — Requirements als prüfbare Checklisten-Items mit Requirement-IDs (z.B. `CLI-01`, `STOR-02`, `UX-03`), v2-Backlog, Out-of-Scope-Tabelle mit Begründungen und vollständiger Traceability-Matrix (Requirement → Phase → Status)
> - `ROADMAP.md` — Phasenplan mit Goal, Dependencies, Requirements-Mapping und messbaren Success Criteria pro Phase; enthält Plan-Dateien-Übersicht und Progress-Tabelle
> - `STATE.md` — Aktueller Ausführungsstatus (welche Phase/welcher Plan läuft gerade)
> - `phases/01-scaffold-and-storage/` und `phases/02-commands-and-ux/` — Phasenverzeichnisse mit je einem detaillierten PLAN.md pro Task (XML-strukturierte Ausführungsanweisungen mit `<action>`, `<verify>` und `<done>`-Blöcken)

Gefühlter Aufwand (1–5)?
> 3