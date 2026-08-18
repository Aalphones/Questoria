# Phase 9 — Kopfleiste, Testwelt, Doku

Der Profil-Chip in der Kopfleiste zeigt seit Meilenstein 2 einen Platzhalter.
Diese Phase macht ihn echt und zieht die Doku auf den gebauten Stand nach.

## Kontext (vorher lesen)

- `frontend/src/app/ui/hud/` — die Kopfleiste, wie sie heute aussieht
- `docs/design/HANDOFF.md` → „0. HUD" — Maße des Profil-Chips
- Phase 4 → `ProfileService`, Phase 3 → `AuthService`
- `docs/code-map.md`, `docs/glossary.md`, `docs/PROJECT.md`,
  `docs/design/README.md`, `AGENTS.md` — die Doku, die hier abgeglichen wird
- `data/themes/dev_fixture/` — die Testwelt

## Abnahmekriterien

1. Der Profil-Chip zeigt Bild und Name des aktiven Profils: 36px runder Avatar
   (Farbkreis als Ersatz, wenn kein Bild), Name in `--font-heading` 17px,
   Pillen-Hintergrund `--color-neutral-100`.
2. Ein Klick öffnet ein kleines Menü mit zwei Einträgen: „Profil wechseln" und
   „Abmelden". Abmelden fragt nicht nach — es ist folgenlos umkehrbar.
3. Nach dem Abmelden ist die Sitzung auch serverseitig weg: ein direkter Aufruf
   von `/content/hub/<datei>` antwortet danach `403`.
4. Die Testwelt `dev_fixture` lässt den kompletten Meilenstein durchspielen:
   anmelden, Profil wählen, Episode spielen, Erfolg bekommen, Statistik wachsen
   sehen.
5. Alle Doku-Punkte unten sind abgehakt und stimmen mit dem Code überein.
6. `npm run build`, `npm run lint` und der PHP-Linter laufen grün.

## Checkliste

- [x] `ui/hud/`: Profil-Chip an `ProfileService` anschließen, Menü mit
      „Profil wechseln" (führt zu `/profiles`) und „Abmelden" (ruft
      `AuthService.logout()`, dann `/login`). Als `<button>` mit
      `aria-expanded`, Menü per Escape schließbar.
- [x] Testwelt gegenlesen: reicht der Content, um alle vier Erfolgs-Bedingungen
      aus Phase 7 einmal auszulösen? Falls nicht, eine zweite Episode ergänzen.
      **Ergebnis:** Phase 7 hatte nur `episodes_completed` und `stage_completed`
      abgedeckt — `stars_total` und `episode_perfect` ergänzt (`sternensammler`,
      `bucht_perfekt`), keine neue Episode nötig, jede vorhandene Episode hat
      bereits ein bewertetes Event.
- [x] `backend/.env.example` und `deploy.env.example` final gegenlesen: alle in
      diesem Meilenstein hinzugekommenen Schlüssel erklärt. **Ergebnis:**
      `SETUP_TOKEN` fehlte in `backend/.env.example` (stand nur in
      `deploy.env.example`) — nachgetragen.
- [x] Einen Account für den echten Betrieb anlegen und den Weg dafür in
      `docs/knowledge/` festhalten (welches Skript, welche Parameter) — ohne
      Kommandozeile auf dem Server ist das der einzige Weg, und in einem Jahr
      weiß es niemand mehr.

## Doku-Updates

- [x] `docs/PROJECT.md`: Meilenstein 4 als erledigt kennzeichnen; die
      Scope-Zeile „Nutzerverwaltung: Accounts, mehrere Spielerprofile pro
      Account, Login" gegen den gebauten Stand prüfen (keine Registrierung im
      UI — das gehört als Satz dorthin).
- [x] `docs/code-map.md`: Ist-Stand-Absätze für Frontend und Backend komplett
      nachziehen, Routen-Tabelle vollständig.
- [x] `docs/glossary.md`: alle in diesem Meilenstein ergänzten Begriffe
      gegenlesen (Account, Sitzung, Erfolg, Statistik, Spielerprofil,
      Fortschritt). Stimmten bereits, keine Änderung nötig.
- [x] `docs/design/README.md`: Screen-Tabelle um den Anmeldebildschirm
      erweitern; die Zeile `login` → `features/profile/` präzisieren, damit
      niemand Anmeldung und Profilauswahl verwechselt.
- [x] `AGENTS.md`: Critical Rules gegenlesen — Regel 4 („Fortschritt gehört nie
      ins Content") und Regel 6 stimmen jetzt mit der Umsetzung überein. Beide
      stimmten bereits, keine Änderung nötig.
- [x] `STATE.md` auf den Abschluss ziehen.

## Report-Back

**Umgesetzt wie geplant.** Der Profil-Chip in der Kopfleiste zeigt jetzt Avatar
(Bild oder Farbkreis-Fallback) und Namen des aktiven Profils, direkt aus
`ProfileService`/`GameStateService` — kein Screen reicht das mehr durch. Ein
Klick öffnet ein Menü mit „Profil wechseln" und „Abmelden"; schließt per
Escape, per Klick außerhalb und beim Navigieren. `AuthService.logout()` räumt
serverseitig auf und schickt danach auf `/login`.

Testwelt `dev_fixture` deckt jetzt alle vier Erfolgs-Bedingungstypen ab (zwei
neue Erfolge ergänzt, Platzhalter-Icons dupliziert — dieselbe Machart wie in
Phase 7, kein Vorbild für echten Content). `SETUP_TOKEN` fehlte in
`backend/.env.example`, nachgetragen. Verfahren für neue Accounts jetzt dauerhaft
in [docs/knowledge/erster-account.md](../../knowledge/erster-account.md) statt
nur in dieser (bald archivierten) Plan-Datei.

**Der reale Account wurde in dieser Phase angelegt und live geprüft** (Sascha
gab E-Mail/Benutzername/Passwort im Chat durch): `deploy.cmd backend` gebracht
(Server lief noch auf Vor-Phase-2-Stand, `POST /api/setup/user` antwortete
deshalb zunächst `404`), danach Account angelegt (`201`) und Login geprüft
(`200`). Anschließend mit Saschas Freigabe auch `deploy.cmd frontend` und
`deploy.cmd content` gefahren — der komplette Meilenstein liegt live auf
`questoria.info`.

`ng build`/`ng lint` und `composer run lint` sind grün.

**Wackligste Stelle:** Das Menü schließt bei Klick außerhalb über einen
`document:click`-Host-Listener, der bei jedem Profil-Chip-Klick im gesamten
Dokument mitläuft — bei sehr vielen HUD-Instanzen gleichzeitig (kommt im Spiel
nicht vor, immer nur eine sichtbare Kopfleiste) wäre das ein Kostenfaktor,
aktuell unkritisch. Nicht geprüft: das Zusammenspiel aus Escape-Schließen und
Fokus-Rücksprung auf einem echten Touchscreen (kein Tastatur-Fokus dort) —
das eigentliche Verhalten für Kinder ist der Klick außerhalb, der ist geprüft.
