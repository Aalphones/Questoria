# Phase 8 — Planetenkarte: Main-Hub auf das Design ziehen

**Rating:** standard

Der Einstieg ist heute eine Kachelliste aus Meilenstein 1. Mit der Kartenfläche
aus Phase 3 wird daraus die Planetenkarte aus dem Design — und der Main-Hub gibt
die Lernstufen-Auswahl an ihren eigenen Screen ab.

## Kontext — vorher lesen

- [docs/design/HANDOFF.md](../../design/HANDOFF.md) Abschnitt „2. Planetenkarte
  / Hub"
- Phase 3 → Kartenfläche, Phase 4 → Fortschritt, Phase 5 → Routen und
  Lernstufen-Screen
- [frontend/src/app/features/main-hub/main-hub.ts](../../../frontend/src/app/features/main-hub/main-hub.ts)
  und `main-hub.html` — was hier umgebaut wird
- [frontend/src/app/features/main-hub/theme-card/](../../../frontend/src/app/features/main-hub/theme-card/)
  — wird zum Weltknoten auf der Karte

## Akzeptanzkriterien

1. Vollflächige Kartenfläche mit dem Hintergrund aus `hub_map.background`
   (`hubAssetUrl`), Platzhalter wenn das Bild fehlt.
2. Pro installierter Welt ein runder Bildknoten auf seiner Prozent-Position,
   Größe aus `size` (Prozent der Kartenbreite), mit Ring und Schatten nach
   Design; darunter eine Pille mit Weltname und Status.
3. Status je Welt aus dem Fortschritt: „Offen · Etappe N" für die aktuelle
   Etappe, „Noch nicht gestartet", wenn nichts geschafft ist. **Keine gesperrten
   Welten** — alle installierten Welten sind offen (siehe README →
   „Bewusste Auslassungen").
4. Gestrichelte Routen aus `hub_map.routes`.
5. Info-Panel oben links: Kennzeichen „Planetenkarte", Überschrift „Deine
   Themenwelten", ein Hinweissatz und der Knopf „Weiterspielen", der in die
   zuletzt gespielte Welt führt. Gibt es keine, ist der Knopf nicht da (statt
   ins Leere zu führen).
6. Klick auf eine Welt führt auf `theme/:themeId/level`.
7. Der Main-Hub enthält **keine** Lernstufen-Auswahl und keinen
   Bestätigungstext mehr — beides lebt jetzt im Lernstufen-Screen.

## Checkliste

- [x] `main-hub.html` / `.ts` umbauen: Kartenfläche statt Liste, Navigation
      statt In-Place-Auswahl. `worldState`, `confirmation` und
      `chooseDifficultyLevel` entfallen hier — sie sind in Phase 5 in den
      Lernstufen-Screen gewandert.
- [x] `theme-card` wird zum Weltknoten: rundes Bild über `qst-image-slot`
      (Cover), Größe aus `--map-point-size`, Ring und Schatten nach Design,
      darunter die Status-Pille. Die Komponente bleibt am selben Ort
      (`features/main-hub/theme-card/`) — sie wird nur woanders eingebettet.
- [x] Aktuelle Etappe pro Welt: Welt-Konfiguration wird dafür gebraucht. Um
      nicht für jede Kachel eine Datei zu laden, den Status **nur für die
      Welten** auflösen, für die schon Fortschritt existiert; alle anderen
      zeigen „Noch nicht gestartet". Kommentar dazu an der Stelle.
- [x] „Weiterspielen": zuletzt geschaffter Ort über den jüngsten Zeitstempel im
      Fortschritt; führt auf die Etappenkarte dieser Welt.
- [x] Aktuelle Welt bewegt sich sanft (`eqBob`), Ring in Akzentfarbe.
- [x] Keine Kopfleiste auf diesem Screen (Design: die Kopfleiste beginnt eine
      Ebene tiefer — hier gibt es kein Zurück).

### Doku

- [x] `docs/code-map.md`: Main-Hub-Zeile auf den neuen Aufbau bringen.
- [x] `docs/design/README.md`: Screen-Tabelle prüfen — `hub` und `level` zeigen
      jetzt auf zwei getrennte Screens innerhalb von `features/main-hub/`.

## Chesterton's Fence

Die Kachelliste und die eingebettete Lernstufen-Auswahl waren die schnellste
Art, in Meilenstein 1 einen begehbaren Einstieg zu haben, bevor es Router,
Kartenfläche und Fortschritt gab. Alle drei existieren jetzt. Was bleibt:
`difficulty-picker` und `theme-card` als Bausteine — umgebaut wird die
Anordnung, nicht die Logik.

## Report-Back

**Status: complete** (14.08.2026). Build und Lint grün, kein Browser-Durchlauf
(private-Profil — Sichtprüfung läuft über die Smoke-Checkliste).

Drei Ergänzungen über den Wortlaut der AK hinaus, jeweils weil die AK den Fall
nicht nennt:

1. **„Alle Etappen geschafft"** als dritter Status. AK 3 kennt nur „Offen ·
   Etappe N" und „Noch nicht gestartet"; ist eine Welt komplett durch, gibt es
   keine aktuelle Etappe mehr — die Pille bliebe sonst leer.
2. **„Weiterspielen" prüft, ob die Welt noch installiert ist.** Fortschritt
   einer entfernten Welt liegt weiter im Browser-Speicher; ohne die Prüfung
   führte der Knopf auf eine Welt, die es nicht mehr gibt.
3. **Zwei neue Zweck-Tokens** in `_tokens.scss`: `--color-map-ring-current`
   (Akzent-Ring des aktuellen Knotens, Design: Accent-400 @75 %) und
   `--color-text-accent` (Statustext, Design: Accent-700). Die
   Komponenten-Regel verbietet rohe Palettenwerte im Stylesheet.

Ein `aria-pressed` am Weltknopf ist entfallen: der Knopf schaltet nichts mehr
um, er navigiert — die Angabe wäre eine Falschauskunft an die Vorlesehilfe.
