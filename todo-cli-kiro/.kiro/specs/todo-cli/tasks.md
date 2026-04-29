# Implementation Plan: todo-cli

## Overview

Implementierung einer TypeScript-CLI-Anwendung zur Todo-Verwaltung in drei Schichten (Storage → Service → CLI). Die Aufgaben bauen inkrementell aufeinander auf: Zuerst wird die Projektstruktur aufgesetzt, dann die Typen und der Storage-Layer implementiert, gefolgt vom Service-Layer mit Geschäftslogik, und schließlich die CLI-Befehle. Property-Based Tests mit `fast-check` validieren die 13 Correctness Properties aus dem Design.

## Tasks

- [x] 1. Projektstruktur und Konfiguration aufsetzen
  - `package.json` erstellen mit `commander` als einziger `dependency` und `vitest`, `fast-check`, `memfs`, `typescript`, `@types/node` als `devDependencies`
  - `tsconfig.json` erstellen mit `target: "ES2020"`, `module: "commonjs"`, `strict: true`, `outDir: "dist"`, `rootDir: "src"`
  - Verzeichnisstruktur anlegen: `src/`, `src/commands/`, `src/service/`, `src/storage/`, `src/types/`, `tests/unit/`, `tests/integration/`
  - `vitest.config.ts` erstellen
  - `bin`-Eintrag in `package.json` auf `dist/index.js` setzen
  - _Requirements: 7.1, 7.2_

- [x] 2. Todo-Typ und ServiceResult-Typ definieren
  - [x] 2.1 `src/types/Todo.ts` erstellen
    - `Todo`-Interface mit Feldern `id: number`, `title: string`, `status: 'pending' | 'completed'`, `createdAt: string` (ISO 8601) implementieren
    - `ServiceResult<T>`-Typ als Union `{ success: true; data: T } | { success: false; error: string }` definieren
    - _Requirements: 1.1, 7.1_

- [ ] 3. Storage Layer implementieren
  - [x] 3.1 `src/storage/TodoStorage.ts` erstellen
    - Klasse `TodoStorage` mit Konstruktor `constructor(filePath: string)` implementieren
    - `load(): Todo[]`-Methode implementieren: Datei lesen, JSON parsen, bei fehlender Datei leeres Array zurückgeben und Datei anlegen
    - `save(todos: Todo[]): void`-Methode mit atomarem Schreiben implementieren: in `<filePath>.tmp` schreiben, dann `fs.renameSync` auf `<filePath>`
    - Fehlerbehandlung für korruptes JSON: leeres Array zurückgeben, Warnung auf `stderr`, Datei neu anlegen
    - Ausschließlich `fs`, `path`, `JSON.parse`, `JSON.stringify` verwenden
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.3, 7.4_

  - [ ]* 3.2 Property-Based Test für Storage-Roundtrip schreiben (`tests/unit/TodoStorage.test.ts`)
    - **Property 4: Storage-Roundtrip**
    - **Validates: Requirements 5.3**
    - Beliebige Todo-Arrays generieren, `save` + `load` aufrufen, strukturelle Gleichheit prüfen
    - `memfs` oder temporäre Verzeichnisse für Dateisystem-Isolation verwenden

  - [ ]* 3.3 Unit-Tests für TodoStorage schreiben
    - Datei existiert nicht → wird neu angelegt (Requirement 5.2)
    - Ungültiges JSON → leeres Array, keine Exception (Requirement 5.4)
    - Atomares Schreiben: `.tmp`-Datei wird nach `save` nicht mehr vorhanden sein
    - _Requirements: 5.2, 5.4_

  - [ ]* 3.4 Property-Based Test für ungültiges JSON schreiben
    - **Property 12: Ungültiges JSON wird toleriert**
    - **Validates: Requirements 5.4**
    - Beliebige Nicht-JSON-Strings als Dateiinhalt verwenden, `load()` aufrufen, leeres Array und keine Exception prüfen

- [ ] 4. Service Layer implementieren
  - [x] 4.1 `src/service/TodoService.ts` erstellen – `addTodo`
    - Klasse `TodoService` mit Konstruktor `constructor(storage: TodoStorage)` anlegen
    - `addTodo(title: string): ServiceResult<Todo>` implementieren: Whitespace-Validierung, ID-Generierung via `Math.max(0, ...todos.map(t => t.id)) + 1`, `createdAt` als `new Date().toISOString()`, Status `pending`
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [ ]* 4.2 Property-Based Test für `addTodo` schreiben
    - **Property 1: Neues Todo hat korrekte Felder**
    - **Validates: Requirements 1.1**
    - Beliebige nicht-leere Titel generieren, prüfen: exakter Titel, Status `pending`, positive eindeutige ID, gültiger ISO-8601-String in `createdAt`

  - [ ]* 4.3 Property-Based Test für Whitespace-Ablehnung schreiben
    - **Property 2: Whitespace-Titel werden abgelehnt**
    - **Validates: Requirements 1.5**
    - Strings aus ausschließlich Whitespace-Zeichen (Leerzeichen, Tabs, Zeilenumbrüche) generieren, prüfen: `success: false`, Todo-Liste unverändert

  - [x] 4.4 `listTodos` im TodoService implementieren
    - `listTodos(filter?: 'pending' | 'completed'): ServiceResult<Todo[]>` implementieren
    - Ohne Filter: alle Todos zurückgeben; mit Filter: nur Todos mit passendem Status
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 4.5 Property-Based Test für Filterung schreiben
    - **Property 5: Filterung gibt nur passende Todos zurück**
    - **Validates: Requirements 2.3, 2.4**
    - Todo-Listen mit gemischten Status generieren, mit `'pending'`- und `'completed'`-Filter aufrufen, prüfen: kein Ergebnis hat anderen Status

  - [x] 4.6 `completeTodo` im TodoService implementieren
    - `completeTodo(id: number): ServiceResult<Todo>` implementieren
    - Fehler bei unbekannter ID; Hinweis wenn bereits `completed`; sonst Status auf `completed` setzen, alle anderen Felder unverändert lassen, speichern
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [ ]* 4.7 Property-Based Test für `completeTodo` schreiben
    - **Property 8: Complete setzt Status auf `completed`**
    - **Validates: Requirements 3.1, 3.2**
    - Todos mit Status `pending` generieren, `completeTodo` aufrufen, prüfen: Status ist `completed`, alle anderen Felder unverändert

  - [ ]* 4.8 Property-Based Test für unbekannte ID schreiben
    - **Property 11: Unbekannte ID liefert Fehler**
    - **Validates: Requirements 3.4, 4.4**
    - Todo-Listen und IDs außerhalb der Liste generieren, `completeTodo` und `deleteTodo` aufrufen, prüfen: `success: false`, Liste unverändert

  - [x] 4.9 `deleteTodo` im TodoService implementieren
    - `deleteTodo(id: number): ServiceResult<Todo>` implementieren
    - Fehler bei unbekannter ID; sonst Todo entfernen, speichern, gelöschtes Todo zurückgeben
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 4.10 Property-Based Test für `deleteTodo` schreiben
    - **Property 9: Delete entfernt das Todo**
    - **Validates: Requirements 4.1, 4.2**
    - Todo-Listen mit mindestens einem Eintrag generieren, `deleteTodo` aufrufen, prüfen: ID nicht mehr in Liste, alle anderen Todos unverändert

- [x] 5. Checkpoint – Storage und Service vollständig
  - Alle Tests für Storage und Service ausführen, sicherstellen dass alle bestehen. Bei Fragen oder Unklarheiten den Benutzer fragen.

- [ ] 6. Output-Formatter implementieren
  - [x] 6.1 `src/formatter.ts` erstellen
    - Funktion `formatTodo(todo: Todo): string` implementieren: ID, Titel, Status, `createdAt` ausgeben; `completed`-Todos visuell unterscheidbar darstellen (z. B. mit `[✓]` vs. `[ ]` Präfix oder Durchstreichung via ANSI)
    - Funktion `formatAddConfirmation(todo: Todo): string` implementieren: enthält die zugewiesene ID
    - Funktion `formatDeleteConfirmation(todo: Todo): string` implementieren: enthält den Titel des gelöschten Todos
    - _Requirements: 1.3, 2.1, 2.5, 4.3_

  - [ ]* 6.2 Property-Based Test für Listenausgabe schreiben (`tests/unit/formatter.test.ts`)
    - **Property 6: Listenausgabe enthält alle Pflichtfelder**
    - **Validates: Requirements 2.1**
    - Beliebige Todo-Objekte generieren, `formatTodo` aufrufen, prüfen: Ausgabe enthält ID, Titel, Status und `createdAt`

  - [ ]* 6.3 Property-Based Test für visuelle Unterscheidbarkeit schreiben
    - **Property 7: Completed-Todos sind visuell unterscheidbar**
    - **Validates: Requirements 2.5**
    - Beliebige Todos generieren, `formatTodo` für `pending`- und `completed`-Version aufrufen, prüfen: Ausgaben sind verschieden

  - [ ]* 6.4 Property-Based Test für Add-Bestätigung schreiben
    - **Property 3: Bestätigungsmeldung enthält die ID**
    - **Validates: Requirements 1.3**
    - Beliebige Todos generieren, `formatAddConfirmation` aufrufen, prüfen: Ausgabe enthält die ID als String

  - [ ]* 6.5 Property-Based Test für Delete-Bestätigung schreiben
    - **Property 10: Delete-Bestätigung enthält den Titel**
    - **Validates: Requirements 4.3**
    - Beliebige Todos generieren, `formatDeleteConfirmation` aufrufen, prüfen: Ausgabe enthält den Titel

- [ ] 7. CLI-Befehle implementieren
  - [x] 7.1 `src/index.ts` erstellen – commander-Setup
    - `commander`-Programm mit `name('todo')`, `version('1.0.0')` und `description` konfigurieren
    - Alle vier Befehle registrieren (Imports aus `src/commands/`)
    - `TodoStorage` und `TodoService` instanziieren und an Befehle übergeben
    - `program.parse(process.argv)` aufrufen
    - `process.exitCode` statt `process.exit()` für Exit-Code-Verwaltung verwenden
    - _Requirements: 6.1, 6.2, 6.3, 7.2_

  - [x] 7.2 `src/commands/add.ts` implementieren
    - `add`-Befehl mit Argument `<title>` registrieren
    - `TodoService.addTodo` aufrufen, Ergebnis mit `formatAddConfirmation` ausgeben
    - Bei Fehler: `console.error`, `process.exitCode = 1`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 7.3 `src/commands/list.ts` implementieren
    - `list`-Befehl mit optionalen Flags `--pending` und `--completed` registrieren
    - `TodoService.listTodos` mit passendem Filter aufrufen
    - Bei leerer Liste: Hinweismeldung ausgeben
    - Todos mit `formatTodo` formatiert ausgeben
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 7.4 `src/commands/complete.ts` implementieren
    - `complete`-Befehl mit Argument `<id>` registrieren
    - ID zu `number` parsen, `TodoService.completeTodo` aufrufen
    - Erfolg: Bestätigungsmeldung auf `stdout`; Fehler: `console.error`, `process.exitCode = 1`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 7.5 `src/commands/delete.ts` implementieren
    - `delete`-Befehl mit Argument `<id>` registrieren
    - ID zu `number` parsen, `TodoService.deleteTodo` aufrufen
    - Erfolg: `formatDeleteConfirmation` auf `stdout`; Fehler: `console.error`, `process.exitCode = 1`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Integration-Tests und Exit-Code-Property schreiben
  - [x] 8.1 `tests/integration/cli.test.ts` erstellen
    - Unit-Tests für alle Befehle und Fehlerpfade: `add` ohne Titel, `list` mit leerer Storage, `complete` für bereits erledigtes Todo, unbekannter Befehl, `--help`
    - _Requirements: 1.4, 2.2, 3.5, 6.1, 6.3_

  - [ ]* 8.2 Property-Based Test für Exit-Codes schreiben
    - **Property 13: Exit-Code spiegelt Ergebnis wider**
    - **Validates: Requirements 6.4, 6.5**
    - Erfolgreiche Operationen prüfen: `process.exitCode === 0`; fehlerhafte Operationen (unbekannte ID, ungültiger Titel) prüfen: `process.exitCode !== 0`

- [x] 9. Build-Konfiguration und Einstiegspunkt finalisieren
  - `build`-Script in `package.json` auf `tsc` setzen
  - `start`-Script auf `node dist/index.js` setzen
  - Sicherstellen dass `dist/index.js` ausführbar ist (`chmod +x` oder Shebang `#!/usr/bin/env node` in `src/index.ts`)
  - TypeScript-Kompilierung ausführen und sicherstellen dass keine Fehler auftreten
  - _Requirements: 7.1_

- [x] 10. Finaler Checkpoint – Alle Tests bestehen
  - Alle Unit-Tests, Property-Based Tests und Integration-Tests ausführen
  - TypeScript-Kompilierung ohne Fehler bestätigen
  - Sicherstellen dass alle Tests bestehen. Bei Fragen oder Unklarheiten den Benutzer fragen.

## Notes

- Sub-Tasks mit `*` sind optional und können für ein schnelleres MVP übersprungen werden
- Jede Aufgabe referenziert spezifische Requirements für Rückverfolgbarkeit
- Property-Based Tests verwenden `fast-check` mit mindestens 100 Iterationen pro Property
- Unit-Tests und Property-Tests sind komplementär – beide werden in denselben Testdateien geführt
- `fast-check`, `vitest` und `memfs` sind `devDependencies` und verstoßen nicht gegen Requirement 7.2
- Atomares Schreiben (Requirement 5.5): `.tmp`-Datei → `fs.renameSync` → finale Datei
- Fehlermeldungen auf `stderr`, normale Ausgaben auf `stdout` (Requirement 6.4, 6.5)
- `process.exitCode` statt `process.exit()` verwenden, um async cleanup zu ermöglichen
