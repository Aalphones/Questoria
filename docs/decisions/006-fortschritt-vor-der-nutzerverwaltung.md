# ADR-006: Fortschritt vor der Nutzerverwaltung

**Status:** abgelöst · entschieden 03.08.2026, abgelöst 18.08.2026 durch [ADR-009](009-spielstand-aufteilung.md) (siehe Nachtrag am Ende)

## Kontext

Meilenstein 2 braucht einen Fortschrittsstand, damit die Karten zeigen, welche
Orte und Etappen geschafft, aktuell oder gesperrt sind. Login und die
Savegame-Schnittstelle kommen erst mit Meilenstein 4 — bis dahin muss der
Fortschritt trotzdem irgendwo liegen.

## Optionen

1. **Savegame-Schnittstelle vorziehen** — Login und Backend-Speicher schon in
   Meilenstein 2 bauen.
2. **Lokal im Browser** — `ProgressService` legt den Stand in `localStorage`
   ab, reine Regeln (`progress.rules.ts`) rechnen daraus Zustände.
3. **Gar kein Fortschritt** — Karten zeigen immer alles offen.

## Entscheidung

Option 2. `ProgressService` liest und schreibt `localStorage` unter dem
Schlüssel `questoria.progress.v1`. Die Freischaltregeln sind reine Funktionen
in `progress.rules.ts` ohne Kenntnis der Datenquelle — sie bekommen
Welt-Konfiguration und einen Abfrage-Callback, keinen direkten
Speicherzugriff.

## Konsequenzen

- Der Stand hängt an Browser und Gerät. Wer die Website auf dem Tablet und am
  Rechner öffnet, hat zwei getrennte Stände — bis Meilenstein 4 gewollt, siehe
  auch die Risiken in [phase-4-fortschritt.md](../planning/2026-08-03_timeline-und-karten/phase-4-fortschritt.md).
  Ein von Hand kaputt gemachter Speichereintrag setzt den Stand zurück statt
  die App zum Absturz zu bringen.
- Beim Umstieg auf die Savegame-Schnittstelle in Meilenstein 4 wird genau
  `progress.service.ts` gegen eine Variante mit Backend-Zugriff getauscht —
  `progress.rules.ts` und alle Screens bleiben unberührt.

## Nachtrag: abgelöst am 18.08.2026

Meilenstein 4, Phase 6 hat den angekündigten Umstieg vollzogen. Der Fortschritt
liegt jetzt im Spielstand des Profils ([ADR-009](009-spielstand-aufteilung.md)),
der angefangene Lauf ebenfalls; `questoria.progress.v1` und `questoria.run.v1`
gibt es nicht mehr — ein noch vorhandener Alt-Stand wird beim ersten Anmelden
einmalig übernommen und dann gelöscht. Die Zusage aus den Konsequenzen ist
eingehalten: getauscht wurden nur `progress.service.ts` und
`run-store.service.ts`, `progress.rules.ts` und alle Screens blieben unberührt.

Diese Entscheidung bleibt stehen, weil sie erklärt, warum es den Zwischenstand
überhaupt gab.
