# ADR-010: Wo der Erfolgs-Katalog liegt

**Status:** entschieden · 18.08.2026

## Kontext

Ein Erfolg hat zwei Hälften: die Definition (Titel, Bild, Bedingung — für
jedes Kind gleich) und das Ergebnis (wer ihn wann bekam — pro Kind
verschieden). Das Datenbankschema aus Meilenstein 1
(`backend/src/Migrations/sql/005_create_achievements.sql`,
`006_create_player_achievements.sql`) legte die Definition in eine eigene
Tabelle `achievements` und verband `player_achievements` über eine
Fremdschlüssel-ID. Bis Phase 7 stand offen, ob dabei bleibt.

## Optionen

1. **Katalog in der Datenbank** (Status quo aus Meilenstein 1). Serverseitig
   abfragbar, aber eine zweite Wahrheitsquelle neben dem Content-Repository —
   genau das, was [ADR-005](005-content-auslieferung-ab-meilenstein-2.md) für
   Content bereits ausgeschlossen hat. Jede neue Welt bräuchte einen
   Datenbank-Import, bevor ihre Erfolge existieren.
2. **Katalog im Content, `player_achievements` verweist auf den Schlüssel.**
   `world_config.json` trägt `achievements[]` (Titel, Bild, Bedingung), die
   Datenbank merkt sich nur noch `(profile_id, theme_id, achievement_key,
   unlocked_at)`. Die Auswertung der Bedingung macht das Frontend — wie jede
   andere Spielregel auch ([Critical Rule 8](../../AGENTS.md)).
3. **Katalog beim Deploy in die Tabelle spiegeln.** Hätte serverseitige
   Auswertung ermöglicht (die niemand braucht) und kostet dafür einen
   Importschritt, der irgendwann vergessen wird.

## Entscheidung

Option 2.

Migration 010 baut `player_achievements` auf die Content-Schlüssel um und
löscht die Tabelle `achievements`. Der Katalog steht ab jetzt ausschließlich
in `world_config.json` → `achievements[]`, mit einer geschlossenen
Bedingungs-Wertemenge (`episodes_completed`, `stars_total`,
`episode_perfect`, `stage_completed` — Details in
[JSON_SCHEMA_REFERENCE.md](../../data/_authoring/JSON_SCHEMA_REFERENCE.md)
Abschnitt 2). `achievement.rules.ts` wertet diese Bedingungen als reine
Funktionen aus, nach demselben Vorbild wie `progress.rules.ts`.

## Konsequenzen

- **Das Backend kennt keine Bedingung.** `Repositories/AchievementRepository.php`
  schreibt und liest ausschließlich `(profile_id, theme_id, achievement_key)` —
  ob der Schlüssel zu einer existierenden Definition gehört, prüft niemand
  serverseitig. Ein erfundener Schlüssel würde klaglos gespeichert; das ist der
  Preis dafür, dass Spielregeln nur an einer Stelle leben.
- **Eine Freischaltung ist additiv, nie ein Update.** `INSERT IGNORE` macht
  einen zweiten Aufruf mit demselben Schlüssel folgenlos (Plan-README,
  Kontrakt Erfolge) — anders als der Spielstand gibt es hier keinen "Server
  gewinnt"-Konflikt zu lösen.
- **Der Puffer aus Phase 5 trägt auch Erfolge.** Eine Freischaltung geht
  zuerst in den Browser-Speicher, dann auf die Reise — bei totem Server
  erscheint die Pille trotzdem und wird nachgereicht.
- **Eine neue Welt braucht keinen Datenbank-Import.** Erfolge existieren, sobald
  `world_config.json` sie trägt — dieselbe Eigenschaft, die ADR-005 für den
  restlichen Content bereits festgelegt hat.
