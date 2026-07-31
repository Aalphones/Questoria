# Commit Conventions — Questoria

> Privates Solo-Projekt (siehe `docs/PROJECT.md` → Constraints) — direkt auf
> dem Default-Branch, kein Pflicht-Feature-Branch für Kleinkram.

## Format

Conventional Commits, deutsch oder englisch im Body — Betreffzeile knapp:

```
<type>(<scope>): <kurze Beschreibung>

<optional: Body mit Begründung, nicht Wiederholung des Diffs>
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`

**Scopes (grob an `docs/code-map.md` orientiert):** `frontend`, `backend`,
`content` (Änderungen unter `data/themes/`), `authoring` (Änderungen unter
`data/_authoring/`), `docs`, `ci`

## Content-Commits (Sonderfall)

Jeder Commit, der `data/themes/**` ändert, hält sich an die Checkliste in
`data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 6, bevor er entsteht —
kaputte Referenzen (fehlende Sprites, falsche `active_map_id`) sind hier
kein Lint-Fehler, sondern ein Laufzeit-Crash im Spiel.

## Critical Rules

1. **Schema-Änderung ohne Authoring-Toolkit-Update im selben Commit ist nicht fertig** — siehe `data/_authoring/README.md` "Pflegepflicht". Kein "mach ich später".
2. **Content-Commits (`data/themes/**`) laufen vorher durch die Schema-Checkliste** — kaputte Referenzen fallen sonst erst beim Spielen auf, nicht beim Commit.
