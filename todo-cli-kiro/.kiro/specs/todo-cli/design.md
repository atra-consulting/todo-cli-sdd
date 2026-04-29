# Design Document: todo-cli

## Overview

Die `todo-cli` ist eine schlanke Kommandozeilenanwendung in TypeScript, die auf Node.js läuft. Sie ermöglicht das Verwalten von Aufgaben (Todos) über die Befehle `add`, `list`, `complete` und `delete`. Todos werden persistent in einer lokalen JSON-Datei gespeichert.

**Ziele:**
- Einfache, intuitive CLI-Schnittstelle
- Zuverlässige Datenpersistenz mit atomaren Schreiboperationen
- Robuste Fehlerbehandlung mit aussagekräftigen Meldungen
- Minimale Abhängigkeiten: ausschließlich `commander` als externe Bibliothek

**Technische Rahmenbedingungen (Requirement 7):**
- Implementierungssprache: **TypeScript**, Laufzeitumgebung: **Node.js**
- Einzige externe npm-Abhängigkeit: **`commander`** (für Argument-Parsing)
- Alle Dateisystemoperationen ausschließlich mit Node.js Built-in-Modulen (`fs`, `path`)
- JSON-Verarbeitung ausschließlich mit `JSON.parse` / `JSON.stringify`
- Keine weiteren externen Bibliotheken oder npm-Pakete

**Nicht-Ziele:**
- Keine Netzwerkfunktionalität
- Keine Synchronisation zwischen mehreren Geräten
- Keine grafische Oberfläche

---

## Architecture

Die Anwendung folgt einer klaren Schichtenarchitektur mit drei Hauptschichten:

```
┌─────────────────────────────────────────┐
│              CLI Layer                  │
│  (commander, Argument-Parsing, Output)  │
├─────────────────────────────────────────┤
│            Service Layer                │
│  (TodoService – Geschäftslogik)         │
├─────────────────────────────────────────┤
│            Storage Layer                │
│  (TodoStorage – JSON-Persistenz)        │
└─────────────────────────────────────────┘
```

**Datenfluss:**

```
User Input → CLI (commander) → TodoService → TodoStorage → todos.json
                    ↓
              Console Output
```

**Verzeichnisstruktur:**

```
todo-cli/
├── src/
│   ├── index.ts          # Einstiegspunkt, commander-Setup
│   ├── commands/
│   │   ├── add.ts        # add-Befehl
│   │   ├── list.ts       # list-Befehl
│   │   ├── complete.ts   # complete-Befehl
│   │   └── delete.ts     # delete-Befehl
│   ├── service/
│   │   └── TodoService.ts
│   ├── storage/
│   │   └── TodoStorage.ts
│   └── types/
│       └── Todo.ts
├── package.json          # Einzige externe Abhängigkeit: commander
└── tsconfig.json
```

**Designentscheidungen:**

- **Schichtenarchitektur**: CLI-Schicht kennt nur den Service, der Service kennt nur den Storage. Das ermöglicht unabhängiges Testen jeder Schicht.
- **Atomare Schreiboperationen**: Schreiben in eine temporäre Datei, dann atomares Umbenennen (`fs.renameSync`), um Datenverlust bei Unterbrechungen zu verhindern (Requirement 5.5).
- **Synchrone I/O**: Da die CLI sequenziell arbeitet und keine Parallelität benötigt, werden synchrone `fs`-Methoden verwendet, was den Code einfacher und fehlerresistenter macht.
- **Keine externen Abhängigkeiten außer `commander`**: Alle Hilfsfunktionen (Datei-I/O, JSON-Verarbeitung, Pfadoperationen) werden ausschließlich mit Node.js Built-ins implementiert (Requirement 7.2–7.5).

---

## Components and Interfaces

### `Todo` (Typ)

```typescript
interface Todo {
  id: number;
  title: string;
  status: 'pending' | 'completed';
  createdAt: string; // ISO 8601
}
```

### `TodoStorage`

Verantwortlich für das Lesen und Schreiben der JSON-Datei. Verwendet ausschließlich `fs`, `path` und `JSON.parse`/`JSON.stringify` (Requirement 7.3, 7.4).

```typescript
class TodoStorage {
  constructor(filePath: string) {}

  /** Lädt alle Todos aus der JSON-Datei. Erstellt die Datei, falls sie nicht existiert. */
  load(): Todo[]

  /** Schreibt alle Todos atomar in die JSON-Datei. */
  save(todos: Todo[]): void
}
```

**Atomares Schreiben (Requirement 5.5):**
1. Serialisiere Todos zu JSON via `JSON.stringify`
2. Schreibe in `<filePath>.tmp` via `fs.writeFileSync`
3. Benenne `<filePath>.tmp` → `<filePath>` um via `fs.renameSync`

**Fehlerbehandlung beim Laden (Requirement 5.4):**
- Existiert die Datei nicht → leeres Array zurückgeben, Datei anlegen
- JSON ungültig / beschädigt → Fehlermeldung ausgeben, leeres Array zurückgeben

### `TodoService`

Enthält die gesamte Geschäftslogik. Gibt strukturierte Ergebnisse zurück, wirft keine Exceptions für erwartete Fehlerfälle.

```typescript
type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

class TodoService {
  constructor(storage: TodoStorage) {}

  addTodo(title: string): ServiceResult<Todo>
  listTodos(filter?: 'pending' | 'completed'): ServiceResult<Todo[]>
  completeTodo(id: number): ServiceResult<Todo>
  deleteTodo(id: number): ServiceResult<Todo>
}
```

**Validierungsregeln im Service:**
- `addTodo`: Titel darf nicht leer oder ausschließlich aus Leerzeichen bestehen (Requirement 1.4, 1.5)
- `completeTodo`: ID muss existieren; Todo darf nicht bereits `completed` sein (Requirement 3.4, 3.5)
- `deleteTodo`: ID muss existieren (Requirement 4.4)

### CLI-Schicht (`index.ts` + `commands/`)

Nutzt `commander` für Argument-Parsing (einzige externe Abhängigkeit, Requirement 7.2). Jeder Befehl:
1. Ruft die entsprechende `TodoService`-Methode auf
2. Gibt das Ergebnis formatiert auf `stdout` aus
3. Setzt den Exit-Code (`process.exitCode = 0` bei Erfolg, `!= 0` bei Fehler, Requirement 6.4, 6.5)

```typescript
// index.ts
import { Command } from 'commander';
const program = new Command();
program.name('todo').version('1.0.0');
// Befehle registrieren ...
program.parse(process.argv);
```

### ID-Generierung

Die nächste ID wird als `Math.max(0, ...todos.map(t => t.id)) + 1` berechnet. Das garantiert Eindeutigkeit und Monotonie, auch nach Löschvorgängen (Requirement 1.1).

---

## Data Models

### Todo-Objekt

| Feld        | Typ                        | Beschreibung                          |
|-------------|----------------------------|---------------------------------------|
| `id`        | `number` (positive integer)| Eindeutige, monoton steigende ID      |
| `title`     | `string` (nicht leer)      | Titel der Aufgabe                     |
| `status`    | `'pending' \| 'completed'` | Aktueller Status                      |
| `createdAt` | `string` (ISO 8601)        | Erstellungszeitpunkt                  |

### JSON-Dateiformat (`todos.json`)

```json
[
  {
    "id": 1,
    "title": "Einkaufen gehen",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "title": "Bericht schreiben",
    "status": "completed",
    "createdAt": "2024-01-14T08:00:00.000Z"
  }
]
```

**Invarianten:**
- Das JSON-Root-Element ist immer ein Array
- Alle IDs sind eindeutig und positiv
- `status` ist immer entweder `"pending"` oder `"completed"`
- `createdAt` ist immer ein gültiger ISO-8601-String
- JSON-Serialisierung erfolgt ausschließlich über `JSON.parse` / `JSON.stringify` (Requirement 7.4)

### Zustandsübergänge

```
pending ──complete──▶ completed
```

Ein Todo kann nur von `pending` nach `completed` wechseln. Es gibt keinen Übergang zurück (kein „Reopen").

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Neues Todo hat korrekte Felder

*For any* nicht-leeren Titel, wenn `addTodo(title)` aufgerufen wird, soll das zurückgegebene Todo den exakten Titel enthalten, den Status `pending` haben, eine positive eindeutige ID besitzen und ein gültiges ISO-8601-Datum in `createdAt` aufweisen.

**Validates: Requirements 1.1**

---

### Property 2: Whitespace-Titel werden abgelehnt

*For any* Zeichenkette, die ausschließlich aus Whitespace-Zeichen besteht (Leerzeichen, Tabs, Zeilenumbrüche), soll `addTodo` einen Fehler zurückgeben und die Todo-Liste unverändert lassen.

**Validates: Requirements 1.5**

---

### Property 3: Bestätigungsmeldung enthält die ID

*For any* erfolgreich hinzugefügtes Todo, soll die Ausgabe des `add`-Befehls die zugewiesene ID des neuen Todos enthalten.

**Validates: Requirements 1.3**

---

### Property 4: Storage-Roundtrip

*For any* Liste von Todo-Objekten, wenn diese Liste gespeichert (`save`) und anschließend geladen (`load`) wird, soll die geladene Liste strukturell identisch mit der gespeicherten Liste sein.

**Validates: Requirements 5.3**

---

### Property 5: Filterung gibt nur passende Todos zurück

*For any* Liste von Todos mit gemischten Status, wenn `listTodos` mit einem Filter (`'pending'` oder `'completed'`) aufgerufen wird, sollen ausschließlich Todos mit dem entsprechenden Status zurückgegeben werden — kein Ergebnis darf einen anderen Status haben.

**Validates: Requirements 2.3, 2.4**

---

### Property 6: Listenausgabe enthält alle Pflichtfelder

*For any* nicht-leere Liste von Todos, soll die formatierte Ausgabe von `list` für jedes Todo die ID, den Titel, den Status und das Erstellungsdatum enthalten.

**Validates: Requirements 2.1**

---

### Property 7: Completed-Todos sind visuell unterscheidbar

*For any* Todo, soll die formatierte Ausgabe eines `completed`-Todos sich von der Ausgabe desselben Todos im Status `pending` unterscheiden.

**Validates: Requirements 2.5**

---

### Property 8: Complete setzt Status auf `completed`

*For any* Todo mit Status `pending`, wenn `completeTodo(id)` aufgerufen wird, soll das Todo danach den Status `completed` haben und alle anderen Felder unverändert bleiben.

**Validates: Requirements 3.1, 3.2**

---

### Property 9: Delete entfernt das Todo

*For any* Todo-Liste und eine darin enthaltene ID, wenn `deleteTodo(id)` aufgerufen wird, soll das Todo mit dieser ID nicht mehr in der Liste enthalten sein, und alle anderen Todos sollen unverändert bleiben.

**Validates: Requirements 4.1, 4.2**

---

### Property 10: Delete-Bestätigung enthält den Titel

*For any* erfolgreich gelöschtes Todo, soll die Ausgabe des `delete`-Befehls den Titel des gelöschten Todos enthalten.

**Validates: Requirements 4.3**

---

### Property 11: Unbekannte ID liefert Fehler

*For any* Todo-Liste und eine ID, die nicht in dieser Liste vorkommt, sollen sowohl `completeTodo` als auch `deleteTodo` ein Fehlerergebnis zurückgeben (kein Erfolg, keine Änderung der Liste).

**Validates: Requirements 3.4, 4.4**

---

### Property 12: Ungültiges JSON wird toleriert

*For any* Zeichenkette, die kein gültiges JSON ist, soll `TodoStorage.load()` ein leeres Array zurückgeben und keine Exception werfen.

**Validates: Requirements 5.4**

---

### Property 13: Exit-Code spiegelt Ergebnis wider

*For any* CLI-Operation: erfolgreiche Operationen sollen mit Exit-Code 0 enden, fehlerhafte Operationen (unbekannte ID, ungültiger Titel, unbekannter Befehl) sollen mit einem Exit-Code ungleich 0 enden.

**Validates: Requirements 6.4, 6.5**

---

## Error Handling

### Fehlerkategorien

| Kategorie              | Beispiel                              | Verhalten                                              |
|------------------------|---------------------------------------|--------------------------------------------------------|
| Validierungsfehler     | Leerer / Whitespace-Titel             | `ServiceResult { success: false, error: "..." }`       |
| Nicht gefunden         | Unbekannte Todo-ID                    | `ServiceResult { success: false, error: "..." }`       |
| Zustandsfehler         | Todo bereits `completed`              | `ServiceResult { success: false, error: "..." }`       |
| I/O-Fehler             | Datei nicht lesbar / schreibbar       | Exception wird gefangen, Fehlermeldung auf stderr      |
| Korrupte Datei         | Ungültiges JSON in `todos.json`       | Leeres Array, Warnung auf stderr, Datei wird neu angelegt |
| Unbekannter Befehl     | `todo foobar`                         | commander gibt Fehler + Hilfe aus, Exit-Code ≠ 0       |
| Fehlende Argumente     | `todo add` ohne Titel                 | commander gibt Verwendungssyntax aus, Exit-Code ≠ 0    |

### Fehlerausgabe-Konventionen

- Fehlermeldungen gehen auf **stderr** (`console.error`)
- Normale Ausgaben gehen auf **stdout** (`console.log`)
- Exit-Code wird über `process.exitCode` gesetzt (nicht `process.exit()`, um async cleanup zu ermöglichen)
- Fehlermeldungen sind auf Deutsch und beschreiben das Problem konkret (z. B. `"Todo mit ID 42 nicht gefunden."`)

### Fehlerbehandlung im `TodoService`

Der Service wirft keine Exceptions für erwartete Fehlerfälle. Stattdessen wird `ServiceResult<T>` zurückgegeben:

```typescript
// Beispiel: completeTodo mit unbekannter ID
const result = service.completeTodo(99);
if (!result.success) {
  console.error(result.error); // "Todo mit ID 99 nicht gefunden."
  process.exitCode = 1;
}
```

---

## Testing Strategy

### Übersicht

Die Teststrategie kombiniert zwei komplementäre Ansätze:

- **Unit-Tests**: Testen spezifische Beispiele, Randfälle und Fehlerbedingungen
- **Property-Based Tests**: Verifizieren universelle Eigenschaften über viele generierte Eingaben

Da `TodoService` und `TodoStorage` reine Logik ohne externe Abhängigkeiten (außer dem Dateisystem) implementieren, eignen sie sich gut für Property-Based Testing.

### Technologie-Stack (Requirement 7)

- **Test-Runner**: [Vitest](https://vitest.dev/) oder [Jest](https://jestjs.io/) — beide unterstützen TypeScript nativ
- **Property-Based Testing**: [fast-check](https://fast-check.io/) — TypeScript-native PBT-Bibliothek
- **Dateisystem-Mocking**: `memfs` oder temporäre Verzeichnisse für Storage-Tests

> Hinweis: `fast-check` und Test-Runner sind **Dev-Dependencies** und zählen nicht zu den Produktions-Abhängigkeiten. Die Einschränkung auf `commander` als einzige externe Abhängigkeit gilt für `dependencies`, nicht `devDependencies`.

### Property-Based Tests

Jeder Property-Test läuft mit **mindestens 100 Iterationen**. Jeder Test ist mit einem Kommentar annotiert, der auf die entsprechende Design-Property verweist.

Tag-Format: `Feature: todo-cli, Property {N}: {property_text}`

| Property | Beschreibung | Modul |
|----------|-------------|-------|
| Property 1 | Neues Todo hat korrekte Felder | `TodoService` |
| Property 2 | Whitespace-Titel werden abgelehnt | `TodoService` |
| Property 3 | Bestätigungsmeldung enthält die ID | CLI-Output-Formatter |
| Property 4 | Storage-Roundtrip | `TodoStorage` |
| Property 5 | Filterung gibt nur passende Todos zurück | `TodoService` |
| Property 6 | Listenausgabe enthält alle Pflichtfelder | CLI-Output-Formatter |
| Property 7 | Completed-Todos sind visuell unterscheidbar | CLI-Output-Formatter |
| Property 8 | Complete setzt Status auf `completed` | `TodoService` |
| Property 9 | Delete entfernt das Todo | `TodoService` |
| Property 10 | Delete-Bestätigung enthält den Titel | CLI-Output-Formatter |
| Property 11 | Unbekannte ID liefert Fehler | `TodoService` |
| Property 12 | Ungültiges JSON wird toleriert | `TodoStorage` |
| Property 13 | Exit-Code spiegelt Ergebnis wider | CLI-Integration |

### Unit-Tests (Beispielbasiert)

Ergänzend zu den Property-Tests werden folgende spezifischen Szenarien als Unit-Tests abgedeckt:

- `add` ohne Titel → Fehlermeldung (Requirement 1.4)
- `list` mit leerer Storage → "Keine Todos"-Meldung (Requirement 2.2)
- `complete` für bereits erledigtes Todo → Hinweismeldung (Requirement 3.5)
- Unbekannter Befehl → Fehlermeldung + Hilfe (Requirement 6.1)
- `--help` → Hilfeübersicht mit allen Befehlen (Requirement 6.3)
- Storage-Datei existiert nicht → wird neu angelegt (Requirement 5.2)

### Teststruktur

```
tests/
├── unit/
│   ├── TodoService.test.ts      # Service-Logik (Unit + PBT)
│   ├── TodoStorage.test.ts      # Storage-Logik (Unit + PBT)
│   └── formatter.test.ts        # Output-Formatierung (Unit + PBT)
└── integration/
    └── cli.test.ts              # End-to-End CLI-Tests
```

### Abdeckungsziele

- **Service Layer**: ≥ 90 % Zweigabdeckung
- **Storage Layer**: ≥ 90 % Zweigabdeckung
- **CLI Layer**: Alle Befehle und Fehlerpfade durch Integration-Tests abgedeckt
