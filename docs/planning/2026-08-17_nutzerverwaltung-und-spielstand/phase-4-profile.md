# Phase 4 — Spielerprofile

Der Screen, den das Kind tatsächlich sieht: sein Bild antippen und los. Der
Prototyp hat ihn fertig gezeichnet.

## Kontext (vorher lesen)

- [README.md](README.md) → „Kontrakt" (Profile)
- `docs/design/HANDOFF.md` → Abschnitt „1. Profilauswahl (`login`)" —
  **verbindlich**, dies ist der einzige Screen dieses Meilensteins mit Mockup
- `docs/design/prototype/index.html` — der Screen im laufenden Prototyp
- `backend/src/Migrations/sql/003_create_player_profiles.sql`
- Phase 1 → `UserRepository`, Controller-Muster mit angemeldetem Benutzer
- `frontend/src/app/services/game-state.service.ts`
- `frontend/src/app/features/main-hub/` — Muster für einen Screen mit Karten

## Abnahmekriterien

1. Nach der Anmeldung erscheint die Profilauswahl mit allen Profilen des
   Accounts plus der gestrichelten Kachel „Neues Profil".
2. Struktur nach Mockup, prüfbar: zentriertes Layout mit derselben Deko wie der
   Anmeldebildschirm; Kicker-Tag; H1 „Questoria"; Vorlese-Knopf (52px Kreis,
   `--color-accent-2-600`) neben „Wer segelt heute mit?"; Profilkarten à 220px
   mit 108px rundem Bildplatz, darunter Primär-Knopf mit Name (24px) und
   Untertitel (13px); vierte Kachel mit 2px gestricheltem Rand und großem `+`.
3. „Neues Profil" öffnet ein Formular mit genau zwei Angaben: Name und Bild
   (Auswahl aus vorhandenen Bildern, kein Datei-Upload). Danach ist das Profil
   sofort in der Liste.
4. Antippen eines Profils setzt es als aktives Profil und führt zur
   Planetenkarte.
5. Ein Neuladen der Seite behält das aktive Profil (es steht im Browser, nicht
   nur im Speicher der Anwendung).
6. Ein Profil lässt sich löschen — mit Rückfrage, die den Namen nennt und
   sagt, dass der Spielstand mitgeht.
7. Der Vorlese-Knopf spricht „Wer segelt heute mit? Tippe auf dein Bild."

## Checkliste

- [ ] `backend/src/Repositories/ProfileRepository.php`: `allForUser`,
      `findForUser` (Profil **und** Benutzer-ID, siehe Kontrakt-Regel `404`),
      `create`, `update`, `delete`.
- [ ] `backend/src/Validators/ProfileValidator.php`: `display_name` 1–50
      Zeichen, `avatar` optional, max. 255 Zeichen.
- [ ] `backend/src/Controllers/ProfileController.php` mit den vier Aufrufen aus
      dem Kontrakt.
- [ ] Routen in `backend/public/index.php` registrieren (geschützt).
- [ ] `frontend/src/app/services/profile.service.ts`: Liste der Profile als
      Signal, `create`, `update`, `remove`, `select`.
- [ ] `GameStateService` um `activeProfileId` erweitern; die ID zusätzlich unter
      `questoria.profile.v1` im Browser ablegen, damit ein Neuladen nicht zurück
      zur Profilauswahl wirft. Beim Anmelden mit einem anderen Account wird der
      Wert verworfen, wenn er nicht in der geladenen Profilliste vorkommt.
- [ ] `frontend/src/app/features/profile/` — Screen nach Mockup, Route
      `/profiles` mit `authGuard`.
- [ ] `frontend/src/app/routing/profile-chosen.guard.ts`: ohne aktives Profil
      geht es zurück zur Profilauswahl. Muster:
      `routing/difficulty-chosen.guard.ts`. An alle Spiel-Routen hängen.
- [ ] Bildauswahl: eine feste Liste mitgelieferter Bilder unter
      `frontend/public/avatars/` (6 Stück reichen), Anzeige als Raster.
      Fehlt ein Bild, greift der Farbkreis-Ersatz aus dem Mockup
      (`conic-gradient`).
- [ ] Die gewählte Lernstufe wandert vom `GameStateService` ins Profil
      (`selected_level` per `PATCH`), damit sie das Gerät überlebt.
      `selected_theme` genauso.

## Doku-Updates

- [ ] `docs/code-map.md`: `features/profile/`, `services/profile.service.ts`,
      `Repositories/ProfileRepository.php`, `Controllers/ProfileController.php`
      in den Ist-Stand; Routen-Tabelle um `/profiles`.
- [ ] `docs/glossary.md`: Eintrag „Spielerprofil" um den Satz ergänzen, dass
      Lernstufen- und Weltauswahl am Profil hängen, nicht am Gerät.

## Report-Back
