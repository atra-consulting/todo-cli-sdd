# Requirements Document

## Introduction

Die Todo-CLI ist eine Kommandozeilenanwendung in TypeScript, die es Benutzern ermöglicht, Aufgaben (Todos) zu verwalten. Die Anwendung unterstützt die Befehle `add`, `list`, `complete` und `delete`. Alle Todos werden persistent in einer lokalen JSON-Datei gespeichert, sodass sie zwischen Programmaufrufen erhalten bleiben.

## Glossary

- **CLI**: Command Line Interface – die Kommandozeilenschnittstelle der Anwendung
- **Todo**: Eine Aufgabe mit einer eindeutigen ID, einem Titel, einem Status und einem Erstellungsdatum
- **Storage**: Die lokale JSON-Datei, in der alle Todos persistiert werden
- **Todo_ID**: Eine eindeutige numerische Kennung, die jedem Todo beim Erstellen zugewiesen wird
- **Status**: Der Zustand eines Todos – entweder `pending` (offen) oder `completed` (erledigt)

## Requirements

### Requirement 1: Todo hinzufügen

**User Story:** Als Benutzer möchte ich ein neues Todo über die Kommandozeile hinzufügen, damit ich Aufgaben erfassen kann.

#### Acceptance Criteria

1. WHEN der Benutzer `add "<titel>"` ausführt, THE CLI SHALL ein neues Todo mit dem angegebenen Titel, einer eindeutigen Todo_ID, dem Status `pending` und dem aktuellen Datum erstellen.
2. WHEN ein neues Todo erstellt wird, THE Storage SHALL das Todo in die JSON-Datei schreiben.
3. WHEN ein neues Todo erfolgreich erstellt wurde, THE CLI SHALL eine Bestätigungsmeldung mit der zugewiesenen Todo_ID ausgeben.
4. IF der Benutzer `add` ohne Titel ausführt, THEN THE CLI SHALL eine Fehlermeldung ausgeben, die auf den fehlenden Titel hinweist.
5. IF der angegebene Titel ausschließlich aus Leerzeichen besteht, THEN THE CLI SHALL eine Fehlermeldung ausgeben und kein Todo erstellen.

---

### Requirement 2: Todos auflisten

**User Story:** Als Benutzer möchte ich alle vorhandenen Todos anzeigen lassen, damit ich einen Überblick über meine Aufgaben habe.

#### Acceptance Criteria

1. WHEN der Benutzer `list` ausführt, THE CLI SHALL alle gespeicherten Todos mit Todo_ID, Titel, Status und Erstellungsdatum ausgeben.
2. WHEN der Benutzer `list` ausführt und keine Todos vorhanden sind, THE CLI SHALL eine Meldung ausgeben, die darauf hinweist, dass keine Todos existieren.
3. WHEN der Benutzer `list --pending` ausführt, THE CLI SHALL ausschließlich Todos mit dem Status `pending` ausgeben.
4. WHEN der Benutzer `list --completed` ausführt, THE CLI SHALL ausschließlich Todos mit dem Status `completed` ausgeben.
5. THE CLI SHALL erledigte Todos (`completed`) in der Ausgabe visuell von offenen Todos (`pending`) unterscheidbar darstellen.

---

### Requirement 3: Todo als erledigt markieren

**User Story:** Als Benutzer möchte ich ein Todo als erledigt markieren, damit ich den Fortschritt meiner Aufgaben verfolgen kann.

#### Acceptance Criteria

1. WHEN der Benutzer `complete <todo_id>` ausführt, THE CLI SHALL den Status des Todos mit der angegebenen Todo_ID auf `completed` setzen.
2. WHEN ein Todo als erledigt markiert wird, THE Storage SHALL die aktualisierte JSON-Datei mit dem neuen Status schreiben.
3. WHEN ein Todo erfolgreich als erledigt markiert wurde, THE CLI SHALL eine Bestätigungsmeldung ausgeben.
4. IF der Benutzer `complete <todo_id>` mit einer nicht existierenden Todo_ID ausführt, THEN THE CLI SHALL eine Fehlermeldung ausgeben, die auf die unbekannte Todo_ID hinweist.
5. IF der Benutzer `complete <todo_id>` für ein bereits erledigtes Todo ausführt, THEN THE CLI SHALL eine Hinweismeldung ausgeben, dass das Todo bereits den Status `completed` hat.

---

### Requirement 4: Todo löschen

**User Story:** Als Benutzer möchte ich ein Todo löschen, damit ich nicht mehr benötigte Aufgaben entfernen kann.

#### Acceptance Criteria

1. WHEN der Benutzer `delete <todo_id>` ausführt, THE CLI SHALL das Todo mit der angegebenen Todo_ID aus der Storage entfernen.
2. WHEN ein Todo gelöscht wird, THE Storage SHALL die aktualisierte JSON-Datei ohne das gelöschte Todo schreiben.
3. WHEN ein Todo erfolgreich gelöscht wurde, THE CLI SHALL eine Bestätigungsmeldung mit dem Titel des gelöschten Todos ausgeben.
4. IF der Benutzer `delete <todo_id>` mit einer nicht existierenden Todo_ID ausführt, THEN THE CLI SHALL eine Fehlermeldung ausgeben, die auf die unbekannte Todo_ID hinweist.

---

### Requirement 5: Datenpersistenz

**User Story:** Als Benutzer möchte ich, dass meine Todos zwischen Programmaufrufen erhalten bleiben, damit ich die Anwendung jederzeit schließen und wieder öffnen kann.

#### Acceptance Criteria

1. THE Storage SHALL alle Todos in einer lokalen JSON-Datei im Arbeitsverzeichnis des Benutzers speichern.
2. WHEN die CLI gestartet wird und die JSON-Datei nicht existiert, THE Storage SHALL eine neue leere JSON-Datei erstellen.
3. WHEN die CLI gestartet wird und die JSON-Datei existiert, THE Storage SHALL die vorhandenen Todos aus der JSON-Datei laden.
4. IF die JSON-Datei beim Lesen beschädigt oder ungültig ist, THEN THE Storage SHALL eine Fehlermeldung ausgeben und die Datei mit einem leeren Todo-Array initialisieren.
5. THE Storage SHALL alle Schreiboperationen atomar ausführen, sodass eine unterbrochene Schreiboperation die bestehenden Daten nicht korrumpiert.

---

### Requirement 6: Fehlerbehandlung und Robustheit

**User Story:** Als Benutzer möchte ich verständliche Fehlermeldungen erhalten, damit ich Fehleingaben korrigieren kann.

#### Acceptance Criteria

1. IF der Benutzer einen unbekannten Befehl eingibt, THEN THE CLI SHALL eine Fehlermeldung ausgeben und eine Übersicht der verfügbaren Befehle anzeigen.
2. IF der Benutzer einen Befehl ohne erforderliche Argumente ausführt, THEN THE CLI SHALL eine Fehlermeldung mit der korrekten Verwendungssyntax ausgeben.
3. WHEN der Benutzer `--help` oder `-h` als Argument übergibt, THE CLI SHALL eine Hilfeübersicht mit allen verfügbaren Befehlen und deren Syntax ausgeben.
4. THE CLI SHALL bei allen Fehlern einen Exit-Code ungleich 0 zurückgeben.
5. THE CLI SHALL bei erfolgreichen Operationen den Exit-Code 0 zurückgeben.

---

### Requirement 7: Technische Rahmenbedingungen

**User Story:** Als Entwickler möchte ich, dass die Anwendung ausschließlich mit TypeScript, Node.js und `commander` als einziger externer Abhängigkeit implementiert wird, damit die Codebasis schlank und wartbar bleibt.

#### Acceptance Criteria

1. THE CLI SHALL in TypeScript implementiert sein und auf der Node.js-Laufzeitumgebung ausgeführt werden.
2. THE CLI SHALL `commander` als einzige externe Bibliothek (npm-Abhängigkeit) verwenden.
3. THE Storage SHALL alle Dateisystemoperationen ausschließlich mit Node.js Built-in-Modulen (z. B. `fs`, `path`) umsetzen.
4. THE CLI SHALL die JSON-Verarbeitung (Lesen und Schreiben von Todo-Daten) ausschließlich mit den in Node.js integrierten JSON-Funktionen (`JSON.parse`, `JSON.stringify`) umsetzen.
5. WHERE weitere Hilfsfunktionalitäten benötigt werden, THE CLI SHALL diese ausschließlich mit Node.js Built-in-Modulen implementieren, ohne zusätzliche externe Abhängigkeiten einzuführen.
