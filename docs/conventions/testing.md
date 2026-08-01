# Testing Conventions — Questoria

## Keine automatisierten Tests in diesem Projekt

Bewusste Entscheidung für dieses Ein-Personen-Projekt: **kein Karma, kein
Jasmine, kein Vitest, kein PHPUnit, kein E2E-Framework.** Weder Frontend noch
Backend bekommen ein Test-Setup — auch nicht „nur für die Kernlogik".

Begründung: Der Aufwand, Tests von einem Assistenten schreiben und pflegen zu
lassen, steht in keinem Verhältnis zum Nutzen bei einem privaten Projekt mit
einem einzigen Entwickler. Statt Testpflege fließt die Zeit in manuelle
Abnahme am laufenden Spiel.

**Diese Datei überschreibt die User-Level-Vorgabe „Features mit Unit-Tests
absichern".** Wer hier arbeitet, schreibt keine Tests — auch nicht ungefragt
„zur Sicherheit".

## Was stattdessen absichert

| Mittel | Wo |
|---|---|
| Statische Prüfung | `npm run lint` (ESLint + strict TypeScript), `composer lint` (php-cs-fixer) |
| Build als Rauchtest | `npm run build` bricht bei Typfehlern ab |
| Manuelle Abnahme | Akzeptanzkriterien-Checkliste am Ende jedes Plans, durchgeklickt am laufenden Spiel |
| Content-Schema | Checkliste in `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 6 |

Der Typ-Compiler ist hier das Sicherheitsnetz. Deshalb gilt strict mode ohne
Ausnahmen und `any` ist tabu (siehe `typescript.md`) — das ist die Gegenleistung
dafür, dass keine Tests laufen.

## Critical Rules

1. **Keine Test-Dateien, keine Test-Abhängigkeiten, keine Test-Skripte anlegen** — `ng generate` immer mit `--skip-tests`, `composer.json` ohne PHPUnit, CI ohne Test-Schritt.
2. **Vor dem Commit läuft Lint + Build** — das ist der einzige automatisierte Gate, den es gibt, und er wird nicht übersprungen.
