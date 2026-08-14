# ADR-007: Ausgelagerte Event-Konfigurationen über die Content-Schnittstelle

**Status:** entschieden · 14.08.2026

## Kontext

Aufgaben-Events (Quiz, Texteingabe, Bildsuche) tragen eine Variante pro
Lernstufe und liegen deshalb nicht in der Episode, sondern in eigenen Dateien
unter `data/themes/<theme_id>/events/<event_id>.json`
(`JSON_SCHEMA_REFERENCE.md`, Abschnitt 4). Das Frontend muss diese Dateien zur
Laufzeit laden. [ADR-005](005-content-auslieferung-ab-meilenstein-2.md) hat für
Welt und Episode je einen Aufruf der Content-Schnittstelle festgelegt; Bilder
und Töne liefert der Webserver direkt aus.

## Optionen

1. **Wie Bilder statisch ausliefern** — die Dateien unter `/content/themes/…`
   direkt vom Webserver holen. Spart Backend-Code, verliert aber die ID-Prüfung
   und den einheitlichen `404`-Weg aus ADR-005; das Hosting-Paket beantwortet
   fehlende Dateien mit `200` und einer HTML-Seite, ein Ladefehler wäre also
   nicht mehr sicher erkennbar.
2. **Ein Aufruf je Eventtyp** — `/api/content/…/quiz/{id}` und so weiter.
3. **Ein Aufruf für alle ausgelagerten Events** —
   `GET /api/content/themes/{themeId}/events/{eventId}`, liefert den Dateiinhalt
   unverändert.

## Entscheidung

Option 3. Der Aufruf verhält sich exakt wie die Episoden-Route: gleiches
ID-Muster `^[a-z0-9_]{1,64}$`, gleicher `404`-Weg, kein Schreibzugriff, keine
Umformung der Daten.

Das verletzt die Regel „neue Gameplay-Features brauchen keine neuen REST-Endpunkte"
nicht: Der Aufruf liefert Content aus, er interpretiert kein Gameplay. Er
entsteht **einmal** für alle Eventtypen — Texteingabe, Bildsuche und jeder
künftige Typ nutzen denselben Pfad. Option 2 wäre der falsche Schnitt gewesen:
dort wüchse das Backend mit jedem Eventtyp mit.

## Konsequenzen

- Ein neuer Eventtyp braucht weiterhin **keinen** Backend-Code: eine Komponente,
  eine Zeile in der Typ-Tabelle des Frontends, ein Schema-Abschnitt.
- `ContentService.getEvent()` ist die einzige Ladestelle im Frontend und merkt
  sich jede Datei pro Welt und Event — dieselbe Aufgabe in zwei Episoden lädt
  einmal.
- `config.ref` und die Lernstufen-Variante löst das Ablauf-Gerüst auf. Eine
  Event-Komponente bekommt eine fertige Konfiguration und lädt selbst nichts
  nach ([ADR-004](004-event-engine.md) bleibt unberührt).
- Die Dateien liegen wie der übrige Content im Webbereich und sind ohne
  Anmeldung lesbar — derselbe offene Punkt wie in ADR-005, nicht neu.
