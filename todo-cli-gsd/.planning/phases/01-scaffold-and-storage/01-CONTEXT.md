# Phase 1: Scaffold and Storage - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Projekt-Scaffolding und Storage-Layer: package.json, tsconfig.json, src/types.ts, src/storage.ts, src/service.ts. Das Projekt baut (`npm run build`) und type-checkt ohne Fehler. Die Storage-Schicht liest und schreibt `todos.json` zuverlässig — atomisch, crash-safe, und mit korrekter ID-Generierung. Phase 2 (Commands) baut auf dieser Basis auf.

</domain>

<decisions>
## Implementation Decisions

### Package & Binary

- **D-01:** CLI-Befehl im Terminal: `todo` (matcht alle Beispiele in PROJECT.md)
- **D-02:** npm-Paketname: `todo-cli`
- **D-03:** `bin`-Feld in package.json: `{ "todo": "dist/index.js" }`

### npm Scripts

- **D-04:** Minimales Script-Set: `build` (tsc), `typecheck` (tsc --noEmit), `start` (node dist/index.js)
- **D-05:** tsx als devDependency installiert, aber nicht als Script — Entwickler können `npx tsx src/index.ts` nutzen

### JSON Storage Schema

- **D-06:** `todos.json` hat das Format `{ "nextId": number, "todos": Todo[] }` — nextId wird im File persistiert, nie berechnet
- **D-07:** JSON.stringify mit pretty-print: `JSON.stringify(data, null, 2)` — lesbar im Editor
- **D-08:** Fehlende `todos.json` → `{ todos: [], nextId: 1 }` zurückgeben (kein Fehler, kein Crash)

### TypeScript & Module System

- **D-09:** `"type": "module"` in package.json — ESM-Projekt
- **D-10:** tsconfig: `module: "NodeNext"`, `moduleResolution: "NodeNext"`, `strict: true`, `target: "ES2022"`, `outDir: "dist"`, `rootDir: "src"`
- **D-11:** `todos.json` wird über `process.cwd()` aufgelöst — immer im aktuellen Verzeichnis beim Ausführen

### Storage Layer Verhalten

- **D-12:** Sync I/O durchgehend: `fs.readFileSync` / `fs.writeFileSync` — kein async, kein `parseAsync` nötig
- **D-13:** Atomischer Write: erst in `todos.json.tmp` schreiben, dann `fs.renameSync` — kein Datenverlust bei Unterbrechung
- **D-14:** ID-Strategie: `nextId` aus der Store-Struktur nehmen und nach jedem Add um 1 erhöhen — kein `Math.max`

### Architecture

- **D-15:** Dateistruktur: `src/types.ts`, `src/storage.ts`, `src/service.ts`, `src/commands/`, `src/index.ts`
- **D-16:** Abhängigkeitsrichtung strikt einwärts: commands → service → storage → types
- **D-17:** `TodoStore` Interface: `{ todos: Todo[], nextId: number }` — `Todo` Interface: `{ id: number, text: string, done: boolean }`

### Claude's Discretion

- Exakte Fehlerbehandlung bei corrupt JSON (vermutlich: Fehler ausgeben + Exit 1)
- Ob `src/index.ts` bereits in Phase 1 einen commander-Skeleton enthält oder leer ist

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Projektziele, Constraints, Core Value
- `.planning/REQUIREMENTS.md` — v1 Requirements mit REQ-IDs (Phase 1 deckt: PROJ-01–03, STOR-01–03)

### Research
- `.planning/research/STACK.md` — TypeScript/commander Versionen, tsconfig-Einstellungen, bin-Setup
- `.planning/research/ARCHITECTURE.md` — Komponentenstruktur, Datenfluss, Build-Reihenfolge
- `.planning/research/PITFALLS.md` — Atomare Writes, ENOENT, ID-Generation, ESM __dirname

No external ADRs or design docs — alle Anforderungen sind in den obigen Dokumenten vollständig erfasst.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

Keine — Greenfield-Projekt. Kein bestehender Code.

### Established Patterns

- Keine bestehenden Patterns — Phase 1 legt die Basis für alle späteren Phasen
- Die in dieser Phase etablierten Patterns (Layering, Import-Stil, Error-Handling) gelten als Standard für Phase 2

### Integration Points

- `src/service.ts` exportiert Funktionen (`addTodo`, `listTodos`, etc.) — Phase 2 Commands importieren daraus
- `src/storage.ts` exportiert `load()` und `save(store)` — nur service.ts darf diese aufrufen
- `src/types.ts` exportiert `Todo` und `TodoStore` — wird von allen anderen Schichten importiert

</code_context>

<specifics>
## Specific Ideas

- JSON-Datei-Beispiel das der User bestätigt hat:
  ```json
  {
    "nextId": 4,
    "todos": [
      { "id": 1, "text": "Milch kaufen", "done": false },
      { "id": 3, "text": "PR reviewen", "done": true }
    ]
  }
  ```

</specifics>

<deferred>
## Deferred Ideas

None — Diskussion blieb im Phase-1-Scope.

</deferred>

---

*Phase: 01-scaffold-and-storage*
*Context gathered: 2026-04-29*
