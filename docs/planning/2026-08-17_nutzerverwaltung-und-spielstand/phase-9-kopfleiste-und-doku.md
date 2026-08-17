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

- [ ] `ui/hud/`: Profil-Chip an `ProfileService` anschließen, Menü mit
      „Profil wechseln" (führt zu `/profiles`) und „Abmelden" (ruft
      `AuthService.logout()`, dann `/login`). Als `<button>` mit
      `aria-expanded`, Menü per Escape schließbar.
- [ ] Testwelt gegenlesen: reicht der Content, um alle vier Erfolgs-Bedingungen
      aus Phase 7 einmal auszulösen? Falls nicht, eine zweite Episode ergänzen.
- [ ] `backend/.env.example` und `deploy.env.example` final gegenlesen: alle in
      diesem Meilenstein hinzugekommenen Schlüssel erklärt.
- [ ] Einen Account für den echten Betrieb anlegen und den Weg dafür in
      `docs/knowledge/` festhalten (welches Skript, welche Parameter) — ohne
      Kommandozeile auf dem Server ist das der einzige Weg, und in einem Jahr
      weiß es niemand mehr.

## Doku-Updates

- [ ] `docs/PROJECT.md`: Meilenstein 4 als erledigt kennzeichnen; die
      Scope-Zeile „Nutzerverwaltung: Accounts, mehrere Spielerprofile pro
      Account, Login" gegen den gebauten Stand prüfen (keine Registrierung im
      UI — das gehört als Satz dorthin).
- [ ] `docs/code-map.md`: Ist-Stand-Absätze für Frontend und Backend komplett
      nachziehen, Routen-Tabelle vollständig.
- [ ] `docs/glossary.md`: alle in diesem Meilenstein ergänzten Begriffe
      gegenlesen (Account, Sitzung, Erfolg, Statistik, Spielerprofil,
      Fortschritt).
- [ ] `docs/design/README.md`: Screen-Tabelle um den Anmeldebildschirm
      erweitern; die Zeile `login` → `features/profile/` präzisieren, damit
      niemand Anmeldung und Profilauswahl verwechselt.
- [ ] `AGENTS.md`: Critical Rules gegenlesen — Regel 4 („Fortschritt gehört nie
      ins Content") und Regel 6 stimmen jetzt mit der Umsetzung überein.
- [ ] `STATE.md` auf den Abschluss ziehen.

## Report-Back
