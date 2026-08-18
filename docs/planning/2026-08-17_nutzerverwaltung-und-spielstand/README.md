# Plan: Nutzerverwaltung & Spielstand (Meilenstein 4)

Deckt Meilenstein 4 aus [docs/PROJECT.md](../../PROJECT.md) ab: Anmeldung,
Spielerprofile, Spielstand-Schnittstelle, Erfolge und Statistiken. Am Ende
dieses Meilensteins hängt der Fortschritt nicht mehr am Browser, sondern am
Profil — und die Plattform ist tatsächlich zugesperrt, nicht nur symbolisch.

Das Datenbank-Schema liegt seit Meilenstein 1 als rohes SQL bereit
(`backend/src/Migrations/sql/`). Repository-Klassen darauf entstehen hier zum
ersten Mal; der Ordner `backend/src/Repositories/` existiert noch gar nicht.

## Entschieden vor dem Bauen

Diese Punkte sind Vorgabe, nicht Ermessen des Umsetzers:

1. **Ein Eltern-Login pro Gerät, danach nur noch Profilwahl.** Ein Kind tippt
   nie ein Passwort. Die Anmeldung gilt 30 Tage, danach fragt sie erneut.
2. **Keine Registrierung in der Oberfläche.** Accounts legt der Betreiber an —
   auf dem Server über `POST /api/setup/user` mit eigenem Token (Phase 2),
   lokal über `backend/bin/create-user.php`, falls die Datenbank je von außen
   erreichbar ist. Der Betrieb bleibt auf einen privaten Kreis beschränkt
   ([Critical Rule 6](../../../AGENTS.md)).
3. **Die Sitzung ist ein HttpOnly-Cookie, kein Token im Browser-Speicher.**
   Nur so kann auch die Auslieferung der Bilder und Audiodateien dieselbe
   Sitzung prüfen ([ADR-008](../../decisions/008-zugang-und-sitzung.md), Phase 1+2).
4. **Der Browser-Speicher bleibt als Puffer.** Gespielt wird immer; Ergebnisse
   werden nachgereicht, sobald der Server wieder antwortet. Beim Laden gewinnt
   der Server ([ADR-009](../../decisions/009-spielstand-aufteilung.md)).
5. **Erfolgs-Definitionen sind Content, erreichte Erfolge sind Spielstand.**
   Titel, Bild und Bedingung stehen in `world_config.json`; die Auswertung
   macht das Frontend ([ADR-010](../../decisions/010-erfolge-im-content.md)).
6. **Die dritte Statistik-Kachel im Ergebnis-Screen heißt nicht „Neue Wörter
   gelernt".** Diese Zahl gibt es in keiner Spalte. Sie zeigt stattdessen die
   in dieser Welt insgesamt geschafften Aufgaben (Phase 8).

## Phasen

| # | Phase | Inhalt | Rating | Status |
|---|---|---|---|---|
| 1 | [Anmeldung im Backend](phase-1-anmeldung-backend.md) | `Repositories/`, `UserRepository`, `AuthController`, Sitzungs-Cookie, geschützte Routen, Account-Skript | heikel | complete |
| 2 | [Türsteher vor Content und App](phase-2-tuersteher.md) | PHP-Weiche vor `/content/`, Schutz der App-Dateien, `deploy.cmd`, lokaler Entwicklungs-Router, Endpunkt für den ersten Account | heikel | complete |
| 3 | [Anmeldebildschirm im Frontend](phase-3-anmeldebildschirm.md) | `features/auth/`, `AuthService`, Abfang bei abgelaufener Sitzung, Zugangs-Wächter | standard | complete |
| 4 | [Spielerprofile](phase-4-profile.md) | `ProfileRepository`/`ProfileController`, `features/profile/` nach Prototyp-Screen `login`, aktives Profil im `GameStateService` | standard | complete |
| 5 | [Spielstand-Schnittstelle](phase-5-savegame.md) | `SavegameRepository`/`SavegameController`, `SavegameService` mit Puffer und Nachreichen | heikel | complete |
| 6 | [Fortschritt zieht um](phase-6-fortschritt-umzug.md) | `ProgressService` + `RunStoreService` auf den Spielstand umstellen, alten Browser-Stand einmalig übernehmen | heikel | complete |
| 7 | [Erfolge](phase-7-erfolge.md) | Content-Schema, Migration 010, `AchievementRepository`/`Controller`, Auswertung im Frontend, Erfolgs-Pille + Panel | heikel | pending |
| 8 | [Statistiken](phase-8-statistiken.md) | `StatisticsRepository`/`Controller`, Aufsummieren am Episodenende, dritte Ergebnis-Kachel | standard | pending |
| 9 | [Kopfleiste, Testwelt, Doku](phase-9-kopfleiste-und-doku.md) | Profil-Chip mit echtem Profil + Abmelden, Testwelt um Erfolge ergänzen, Doku-Abgleich | mechanisch | pending |

## Kontrakt: die Schnittstelle

Alles unter `/api/` außer `POST /api/auth/login`, `GET /api/health`,
`POST /api/migrate` und `POST /api/setup/user` verlangt eine gültige Sitzung.
Ohne: `401` mit dem üblichen Fehlerkörper
`{"error": {"code": 401, "message": "..."}}`.

Die beiden Betreiber-Endpunkte (`/api/migrate`, `/api/setup/user`) können keine
Sitzung voraussetzen — der eine richtet die Datenbank ein, der andere legt den
allerersten Account an. Sie schützen sich stattdessen über einen eigenen Token
im Kopf und antworten ohne ihn mit `404`, verhalten sich also wie nicht
vorhandene Pfade.

**Warum das keine Verletzung von [Critical Rule 8](../../../AGENTS.md) ist:**
Die Regel verbietet neue Endpunkte für *Gameplay*. Anmeldung, Profile und
Spielstände stehen ausdrücklich auf der erlaubten Liste in
[docs/PROJECT.md](../../PROJECT.md) → Constraints. Kein Endpunkt hier
interpretiert eine Spielregel — sie speichern und liefern, was das Frontend
gerechnet hat.

### Anmeldung

| Aufruf | Körper | Antwort |
|---|---|---|
| `POST /api/auth/login` | `{"email": string, "password": string}` | `200 {"user": {"id": int, "username": string, "role": string}}` + `Set-Cookie` · `401` bei falschen Daten |
| `POST /api/auth/logout` | — | `204`, löscht das Cookie |
| `GET /api/auth/me` | — | `200 {"user": {...}}` · `401` |
| `POST /api/setup/user` | `{"email": string, "username": string, "password": string}` | `201 {"user": {...}}` · `409` bei vergebener E-Mail/Benutzername · `404` ohne Kopf `X-Setup-Token` |

Cookie: `qst_session=<JWT>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`.
`Secure` entfällt nur, wenn `APP_ENV=local` gesetzt ist — sonst käme das Cookie
beim lokalen Entwickeln über `http://localhost` nie an.
Nutzlast des Tokens: `{"sub": <user_id>, "iat": ..., "exp": ...}`.

### Profile

| Aufruf | Körper | Antwort |
|---|---|---|
| `GET /api/profiles` | — | `200 {"profiles": [Profil]}` |
| `POST /api/profiles` | `{"display_name": string, "avatar": string\|null}` | `201 {"profile": Profil}` |
| `PATCH /api/profiles/{profileId}` | Teilmenge aus `display_name`, `avatar`, `selected_theme`, `selected_level` | `200 {"profile": Profil}` |
| `DELETE /api/profiles/{profileId}` | — | `204` |

`Profil` = `{"id": int, "display_name": string, "avatar": string|null, "selected_theme": string|null, "selected_level": string|null}`.

Jeder Aufruf mit `{profileId}` prüft, dass das Profil zum angemeldeten Account
gehört — sonst `404` (nicht `403`: ein fremdes Profil soll sich nicht einmal
als existierend verraten).

### Spielstand

| Aufruf | Körper | Antwort |
|---|---|---|
| `GET /api/profiles/{profileId}/savegames` | — | `200 {"savegames": [Spielstand]}` |
| `PUT /api/profiles/{profileId}/savegames/{themeId}` | `{"episode_id": string\|null, "node_id": string\|null, "state": Zustand}` | `200 {"savegame": Spielstand}` |

`Spielstand` = `{"theme_id": string, "episode_id": string|null, "node_id": string|null, "state": Zustand, "updated_at": string}`.

`Zustand` (Inhalt von `game_state_json`, Version 1):

```json
{
  "version": 1,
  "progress": { "<episode_id>": { "stars": 3, "completedAt": "2026-08-17T10:00:00.000Z" } },
  "run": { "episodeId": "…", "eventIndex": 2, "scoredCount": 1, "correctFirstTryCount": 1 },
  "settings": { "difficultyLevel": "matrose" }
}
```

`run` ist `null`, wenn kein Lauf angefangen ist. `settings.difficultyLevel` ist
`null`, solange keine Lernstufe gewählt wurde. `PUT` ersetzt den Zustand
vollständig (kein Zusammenführen im Backend — das Frontend ist das Spiel).

### Erfolge und Statistiken

| Aufruf | Körper | Antwort |
|---|---|---|
| `GET /api/profiles/{profileId}/achievements` | — | `200 {"achievements": [{"theme_id", "achievement_key", "unlocked_at"}]}` |
| `POST /api/profiles/{profileId}/achievements` | `{"theme_id": string, "achievement_key": string}` | `201 {"achievement": {...}}`, mehrfach aufrufbar ohne Fehler |
| `GET /api/profiles/{profileId}/statistics` | — | `200 {"statistics": [Statistik]}` |
| `POST /api/profiles/{profileId}/statistics/{themeId}` | Zuwächse plus Lauf-Kennung: `{"run_id": string, "events_completed": int, "correct_answers": int, "wrong_answers": int, "playtime_minutes": int}` | `200 {"statistics": Statistik}` |

`Statistik` = `{"theme_id", "events_completed", "correct_answers", "wrong_answers", "playtime_minutes", "updated_at"}`.
Die Statistik-Werte werden **addiert**, nicht gesetzt — der Aufruf schickt, was
in diesem Lauf dazugekommen ist. Fehlende Felder zählen als `0`.

🟡 **`run_id` ist kein Beiwerk, sondern der Schutz gegen Doppelzählung.**
Addieren ist nicht wiederholbar: Geht nur die *Antwort* auf dem Weg verloren,
schickt der Puffer aus Phase 5 denselben Zuwachs ein zweites Mal, und das Kind
bekommt seine Aufgaben doppelt gutgeschrieben. Das Backend merkt sich deshalb
pro Profil und Welt die zuletzt verbuchte Lauf-Kennung und addiert dieselbe
kein zweites Mal (Antwort trotzdem `200` mit dem aktuellen Stand — für den
Client ist der Aufruf geglückt). Der Erfolgs-Aufruf hat das Problem nicht, er
setzt statt zu addieren.

### Auslieferung der Dateien

| Adresse | Verhalten |
|---|---|
| `/content/**` | Nur mit gültigem Sitzungs-Cookie. Ohne: `403`, ohne Datei-Inhalt. |
| Alles andere im ausgelieferten Bereich (App-Dateien) | Ohne Sitzung wird `index.html` ausgeliefert, die Anwendung zeigt dann den Anmeldebildschirm. Kein Content-Leck, weil die Anwendung selbst keine Fandom-Inhalte enthält. |

## Finale Abnahmekriterien

1. Ein frisch geöffneter Browser zeigt den Anmeldebildschirm, nicht die
   Planetenkarte.
2. Nach der Anmeldung kommt die Profilauswahl im Look des Prototyp-Screens
   `login`: vorhandene Profile plus eine gestrichelte Kachel „Neues Profil".
3. Ein Kind spielt eine Episode zu Ende; nach Neuladen der Seite auf einem
   **anderen** Browser (gleicher Account, gleiches Profil) sind Sterne und
   Fortschritt da.
4. Wird eine Episode mittendrin abgebrochen, fragt die App beim nächsten Start
   nach dem Weiterspielen — auch im anderen Browser.
5. Ein Aufruf von `/content/hub/<beliebige Datei>` ohne Anmeldung liefert `403`
   und keine Bilddaten.
6. Bei abgeschaltetem Backend lässt sich eine bereits geladene Welt zu Ende
   spielen; das Ergebnis erscheint auf dem Server, sobald er wieder antwortet.
7. Ein Erfolg wird beim Erreichen seiner Bedingung freigeschaltet, erscheint im
   Ergebnis-Screen als Pille und danach dauerhaft im Erfolge-Panel der
   Planetenkarte.
8. Der Ergebnis-Screen zeigt drei Statistik-Kacheln, die dritte aus den
   dauerhaften Zahlen der Welt.
9. Die Kopfleiste zeigt Name und Bild des aktiven Profils; darüber kommt man
   zum Profilwechsel und zum Abmelden.
10. `npm run build`, `npm run lint` (Frontend) und der PHP-Linter laufen grün.

## Smoke-Checkliste (macht Sascha am Plan-Ende)

Die ersten drei Punkte sind die Stellen, an denen ich beim Planen am
unsichersten bin — dort zuerst hinsehen.

1. 🔴 **Der Türsteher vor den Bildern.** `/content/hub/<datei>` ohne Anmeldung
   im privaten Fenster aufrufen: kommt `403`? Und **mit** Anmeldung: laden
   Hintergründe, Sprites und Audio auf allen Screens noch normal, ohne
   spürbare Verzögerung? Die Weiche liegt zwischen Apache und jeder einzelnen
   Bilddatei — wenn irgendwo etwas hakt, dann hier.
2. 🔴 **Der Puffer bei totem Server.** Backend stoppen, eine Episode zu Ende
   spielen, Backend starten, Seite neu laden: sind Sterne und Statistik oben?
   Und danach auf einem zweiten Browser prüfen, dass nichts doppelt gezählt
   wurde.
3. 🔴 **Die einmalige Übernahme des alten Stands.** Vor dem Umstieg im
   Browser gespielten Fortschritt behalten, dann anmelden: taucht er im
   ersten Profil auf, und **nur einmal**, auch nach mehrfachem Neuladen?
4. Anmeldung mit falschem Passwort: kommt eine verständliche Meldung, keine
   Rohfehlermeldung?
5. Zweites Profil anlegen, Welt spielen, zurück zum ersten Profil: sind die
   beiden Stände getrennt?
6. Nach 30 Tagen läuft die Sitzung ab — ersatzweise das Cookie von Hand
   löschen: landet man sauber auf dem Anmeldebildschirm, ohne Fehlerkaskade?
7. Erfolg freischalten: Pille im Ergebnis-Screen, danach im Erfolge-Panel der
   Planetenkarte, und beim zweiten Durchlauf **nicht** noch einmal als „neu".

## Summary

*(beim Archivieren füllen)*

## Files touched

*(beim Archivieren füllen)*

## Commits

*(beim Archivieren füllen)*

## Deviations from plan

*(beim Archivieren füllen)*

## Follow-ups

*(beim Archivieren füllen)*
