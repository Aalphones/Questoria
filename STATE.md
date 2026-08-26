# STATE

**Aktiver Plan:** [docs/planning/2026-08-20_vollbild-karten-mit-pan-zoom/](docs/planning/2026-08-20_vollbild-karten-mit-pan-zoom/README.md)

**Phase:** 6/8 — Assets erzeugen (in Arbeit). Plan jetzt 8 statt 7
Phasen — neue **Phase 8 „Vertonung, vollständig statt nur Dialog"** angehängt
(23.08.2026, Sascha): jede Frage und zwei feste Engine-Ansagen sollen eine
echte Aufnahme statt Browser-Sprachausgabe bekommen. Rating heikel — echte
Schema- und Komponenten-Arbeit, keine reine Content-Phase. Startet mit einer
eigenen 🔴-Entscheidung (siehe Phasendatei).

🟡 **Welt umbenannt (23.08.2026, Sascha):** `pokemon_lesen` → `pokemon`, Fach
erweitert auf Deutsch/Mathe/Sachkunde. Ordner, `theme_id`, `main_hub.json`
und alle load-bearing Doku-Verweise sind nachgezogen (Details: Report-Back
Phase 5). Weiter unten in dieser Datei stehen noch alte Verweise auf
`pokemon_lesen` in älteren, nicht mehr aktiven Abschnitten — die sind
historisch korrekt und bleiben so stehen.

🟡 **Phase-4-Smoke steht noch aus** (Report-Back der Phasendatei): Timeline/
MapScreen/MainHub am Bildschirm öffnen, manuelles Zoomen/Ziehen nach dem
Fokus prüfen, `prefers-reduced-motion` durchspielen — Details und Priorität
in [phase-4](docs/planning/2026-08-20_vollbild-karten-mit-pan-zoom/phase-4-auto-fokus.md).

**Nächster Schritt:** **Alle vier Spiel-Kacheln liegen** — `map_alabastia`,
`map_route_1`, `map_vertania_city`, `map_vertania_wald`. Als nächstes
Weltenkarte und Planetenkarte (je 8192×8192, je knapp eine Stunde), dann die
14 Stations-Sprites und 2 Orts-Sprites.

🔴 **Der Karten-Ablauf ist am 26.08.2026 zweimal grundlegend umgebaut worden**
(beide Male nach einem Befund von Sascha am Bildschirm). Verbindlich ist jetzt
[`image-prompts/MAPS.md`](data/_authoring/image-prompts/MAPS.md) →
„Hochskalieren — der Detailgrad hängt an drei Reglern". Kurzfassung:

1. **Der gespeicherte Ablauf `Upscale Map` reicht nicht** — Schritte stehen auf
   2, und sein Kachel-Prompt **verbietet** ausdrücklich das Hinzufügen von
   Feinstruktur. Ergebnis war Matsch.
2. **Die Regler im Knotenpaket erreichen den Auftrag über comfy-cli gar nicht.**
   Deshalb wird der fertig umgewandelte Auftrag aus `GET /history/<id>` geholt,
   direkt gepatcht und per `POST /prompt` eingereicht.
3. **Kette:** Remacri ×4 (Leinwand, nahtlos und farbtreu) → Detail-Lauf mit
   8 Schritten und 0,48 Rauschen und dem Detail-Prompt
   ([`DETAIL_PROMPT.txt`](data/_authoring/image-prompts/DETAIL_PROMPT.txt)) →
   `match_map_colour.py` (Palette zurückholen) → `slice_map.py`.
   Für Ausschnitte und garantierte Überblendung: `refine_map_tiles.py`.
4. **Die Stilwörter im Prompt schlagen alles andere.** Ein Detail-Prompt mit
   „watercolour" liefert eine Aquarellkarte. Der `art_style` der Welt gehört
   wörtlich hinein.

🔴 **Bei den 8192ern wird nur nachgeschärft, was sichtbar ist** (Sascha,
26.08.2026): Kachel `{0,0}` plus ein Kachelring Rand. Eine volle Leinwand
kostet rund vier Stunden für 63 Kacheln, die niemand sieht. Damit ist AK 7 dem
Sinn nach erfüllt (nahtloser Anschluss aus derselben Leinwand), dem Buchstaben
nach nicht (eine spätere Kachel braucht noch einen Schärf-Lauf).

🟡 **Drei Plan-Vorgaben haben in der Praxis nicht getragen** und sind in
[`image-prompts/MAPS.md`](data/_authoring/image-prompts/MAPS.md) korrigiert —
Herleitung im Report-Back von Phase 6: der `ResolutionSelector` kennt kein 2:1;
die Viertel-Regel hat eine Untergrenze bei 1024×576; und **eigene Verbotssätze
im Prompt holen genau das ins Bild, was sie fernhalten sollen** (Krea 2 hat
keinen Negativ-Zweig — die Bretterwand am Strand kam aus dem Satz, der sie
verbieten sollte).

🟡 **Karten-Leinwände liegen unter `data/_authoring/map-canvases/` und sind
gitignored** — `data/_authoring/` trägt sonst nur Markdown und Skripte, eine
8192er Leinwand gehört nicht in die Repo-Historie. Preis: nur lokal, kein
Drive-Backup.

✅ **Schritt 0 ist durch, das Stil-Rezept steht** (26.08.2026, von Sascha
abgenommen): echte Draufsicht, keine Perspektive, keine Bauwerke. Der erprobte
Prompt und die beiden Bedienfallen des Krea2-Workflows (Prompt gehört in
Knoten 19, Größe kommt aus `ResolutionSelector` und rechnet in 1024²-Einheiten)
stehen als Standard-Vorlage in
[`data/_authoring/image-prompts/MAPS.md`](data/_authoring/image-prompts/MAPS.md).
Krea 2 hält 2048×2048 zusammen — der Weg „2048 erzeugen, einmal um Faktor 4
hoch" ist bestätigt.

🔴 **Reihenfolge (Sascha, 26.08.2026): „Bilder zuerst, Umgruppierung danach."**
`world_config.json` steht noch auf dem alten Stand — **eine** Gebietskarte mit
vier Kacheln statt zwei mit je zweien, `arc_overview` mit einem Ort statt zwei,
Wald noch auf `{-1,2}`. Das wird als **Nachtrag 5b nach Phase 6** nachgezogen
(Tabelle Ist/Soll im Kopf von [phase-5](docs/planning/2026-08-20_vollbild-karten-mit-pan-zoom/phase-5-level-neuplanung.md)).
Bis dahin liegen die Bilder auf der Platte, ohne dass das Spiel die zweite
Gebietskarte kennt. Bewusst so gewählt, kein Versehen — **aber nicht deployen
und nicht abnehmen wollen, bevor 5b durch ist.**

🟡 **Ungeklärt, vor 5b zu suchen:** `data/hub/main_hub.json` liegt nicht an dem
Pfad, den dieser Merkzettel bisher genannt hat.

🟡 **Der Plan ist am 26.08.2026 in drei Punkten neu gefasst worden** (Sascha),
alle drei sind in README/Phase 5/Phase 6 eingearbeitet:
- **Drei Kartenebenen** statt zwei: Planetenkarte und Weltenkarte sind je
  8192×8192 mit nur der ersten Kachel aufgedeckt; die bisherige *eine* Ortskarte
  zerfällt in **zwei Gebietskarten** (Alabastia + Route 1 / Vertania City +
  Vertania-Wald). Die vier Kacheln und ihre vierzehn Stationen bleiben
  unverändert — nur umgruppiert.
- **Gebäude gehören nicht in die Karte** (Weg C): Karten tragen nur Gelände,
  jedes Bauwerk ist ein eigenes Sprite. Damit ist der alte 🔴-Punkt
  „Kartenverfahren" entschieden. Neu bestellt: zwei Orts-Sprites für die
  Weltenkarte.
- **Erzeugungsweg:** in 2048×2048 erzeugen, **einmal** um Faktor 4
  hochskalieren (Krea 2 ist bis 2k trainiert, 4× trifft 8192 exakt).

🟡 **Der Freistell-Fix ist erledigt** (`4b59882`, Phase 7 Teil A vorgezogen) —
und die im Plan festgeschriebene Mechanik war falsch: der Fehler ist kein Loch,
sondern eine **durchscheinende** Fläche (Alpha 9–64 am Bisasam-Auge). Gesucht
wird jetzt nach eingeschlossenen Flächen unter Alpha 200. Details in phase-7.

🔴 **`pokemon` ist bis Phase 7 nicht abnahmefähig/deploybar:** Phase 5 hat
Content und Datenmodell fertig (Build+Lint grün, alle Referenzen
konsistenzgeprüft), aber es fehlen noch alle Bilddateien — 4 Kachel-
Hintergründe, 14 Stations-Sprites, 10 Episoden-Hintergründe, 18 neue
Bildantworten, plus Sprites für 6 neue Figuren. Vollständige Bestellliste im
Report-Back von [phase-5](docs/planning/2026-08-20_vollbild-karten-mit-pan-zoom/phase-5-level-neuplanung.md).
**Nicht deployen, solange Phase 7 nicht fertig ist.** Die Planetenkarte
(`data/main_hub.json`, migriert) bleibt separat funktionsfähig.

🟡 **Ziehen, Zoomen und die Kachel-Freischaltung sind gebaut, aber am Bildschirm noch nicht abgenommen.** Die Abnahme von Phase 2 und 3 hängt zusammen und steht als eine Liste im Report-Back von [phase-3](docs/planning/2026-08-20_vollbild-karten-mit-pan-zoom/phase-3-fortschritts-freischaltung.md). Unsicherste Stellen: Zwei-Finger-Zoom gleichzeitig mit Schieben (Phase 2) und der Spielstand-Schreibkreis beim Öffnen einer Karte — höchstens ein `PUT` beim ersten Öffnen, keins beim zweiten (Phase 3). **Jetzt zusätzlich prüfbar** (FINDINGS.md → Phase 5, noch offen): `vertania_wald` liegt bewusst im Knick (`{row:-1,col:2}`) — sobald Phase 6 die Bilder liefert, am Bildschirm prüfen, ob sich in die leere Ecke neben `vertania_wald` pannen lässt, obwohl dort keine Kachel liegt.

**Sammelkarten-Plan liegt weiter geparkt:** [docs/planning/2026-08-18_sammelkarten-und-druckbogen/README.md](docs/planning/2026-08-18_sammelkarten-und-druckbogen/README.md).

**Davor offene Abnahme (Pokéball werfen) noch unbearbeitet — steht unten.**

## Zuletzt fertig: Pokéball werfen (archiviert 21.08.2026)

[docs/archive/2026-08/2026-08-19_pokeball-fangen/](docs/archive/2026-08/2026-08-19_pokeball-fangen/README.md) — drei Phasen. Das Event steht als letztes in `ep_route_1_wiese.json` (Ziele Pikachu/Rattfratz, `speed: normal`).

Die geplante Mechanik hat am Bildschirm nicht getragen und wurde am 21.08.2026 ersetzt — Begründung und Lehre stehen im Nachtrag der archivierten README. Kurzfassung des Endstands:
- **Wisch-Wurf** nach dem Vorbild von Pokémon GO: Ball anfassen, wegwischen; Richtung und Schwung bestimmen Ziel und Weite. Der beschriftete Knopf bleibt der Tastaturweg mit Zielhilfe.
- **Das Pokémon steht** auf einem von drei Plätzen und springt alle paar Sekunden zufällig auf einen anderen (Let's Go). `speed` steuert die Standzeit, nicht die Laufgeschwindigkeit, und trägt einen Zufallsanteil.
- **Die Ansage** liegt oben rechts über der Bühne, hat einen Kasten unter sich und blendet nach sieben Sekunden aus. Sie ist mit Orpheus vertont (Stimme Sophie über den Besetzungseintrag `erzaehler`) — dafür sammelt `voice-tools/` jetzt auch Ansagetexte von Spiel-Events ein, neues Content-Feld `intro_audio_path`.
- **Ein Kurvenball wurde gebaut und wieder entfernt** — zu fummelig fürs Lesealter.
- **Aufgabenkarten sitzen mittig** auf der Bühne statt am unteren Rand; das Fangspiel ist davon ausgenommen und streckt sich über die volle Höhe.

🔴 **Abnahme steht komplett aus** — nichts davon ist am Bildschirm bestätigt:
- Eine Runde spielen: Treffer, Fehlwurf, garantierter fünfter Fang, Weiterlauf zur Ergebnisseite. Mit Finger, Maus und Tastatur.
- **Die Aufnahme anhören** (`erzaehler_ep_route_1_wiese_001.mp3`) — deutsche Modelle raten bei Eigennamen, „Pokémon" ist der Prüfstein. Klingt es falsch: Wort lautschriftlich in den `intro`-Text und einmal mit `--force` durchlaufen.
- Mit eingeschalteter Bewegungsreduktion einmal werfen und schauen, ob der Name nach gut drei Sekunden erscheint.
- Alle sechs Aufgabenarten ansehen, ob das Zentrieren keine hohe Karte oben anstößt.
- Runde auf dem Gerät des Kindes, dann `deploy.cmd content` und Runde auf dem Server.
- Offen geblieben: die Entscheidung, ob weitere Episoden ein Fangspiel bekommen, und der Haken im Spielmechaniken-Katalog.

**Nachbar-Bug gefunden und gefixt (21.08.2026, `a63c052`):** Das Erfolgs-Overlay aus `fcf36c0` lag bei **jeder** der sechs Aufgabenarten von Anfang an über der Karte (abgedunkelter Scrim, leeres Panel), nicht erst nach einem Treffer — `&__feedback:empty` prüfte den falschen Knoten, alle sechs Aufgaben-Typen projizieren ihren Feedback-Container immer, nur dessen Inhalt ist bedingt. Mit `:has()` gefixt, Build + Lint grün, gepusht. Betrifft auch die neue `word_match`-Anzeige aus dem Screenshot — sollte jetzt wieder normal spielbar sein.

**Für die Bildmaschine gemerkt (korrigiert 26.08.2026):** Die richtige Instanz ist die Comfy-Desktop-Installation unter `F:\Comfy-Desktop\` — die Pfade in den Skills `krea2-bilder`/`flux2-bilder` stimmen also. Ein- und Ausgabe liegen gemeinsam unter `F:\Comfy-Desktop\ComfyUI-Shared\input\` bzw. `...\output\`, Referenzbilder für FLUX.2 gehören ins `input\`. Der frühere Hinweis auf `B:\ComfyUI_windows_portable\` war falsch; das Laufwerk existiert auf dieser Maschine nicht.

**Gespeicherte Workflows** (`user/default/workflows/`): `Krea2 Txt2Img`, `Flux2 Txt2Img`, `Flux Edit`, `SeedVR2`, `Upscale`, `Upscale Map`. Der Aufruf über den `comfy`-MCP-Server zeigt per Voreinstellung auf einen **anderen** Ordner (`F:\Comfy-Desktop\ComfyUI-Installs\...`) — die Workflows der laufenden Instanz holt man über `http://127.0.0.1:8188/api/userdata?dir=workflows`, nicht aus dem Dateisystem.

**Smoke-Test der Pokémon-Welt (20.08.2026) hat vier Anzeigefehler gefunden — alle noch am selben Tag behoben, gepusht:**
- `image_search` (`anlaut_b_suche`, `anlaut_m_suche`, `wald_suche`): akzeptierte nur eine fest verdrahtete Teilmenge der im Bild passenden Objekte — ein Kind, das zurecht auf ein drittes, ebenfalls richtiges Objekt tippte, bekam „Da ist nichts". Neues Content-Feld `find_count` behebt das (jedes passende Objekt zählt); die drei betroffenen JSON-Dateien und `JSON_SCHEMA_REFERENCE.md` sind nachgezogen. Damit ist auch die alte Nachbestell-Liste aus dem Phase-4-Report-Back hinfällig — es gibt keine Arenaleiter-Lücke mehr, weil jetzt immer alle bekannten Objekte als Ziel zählen.
- `number_line`: Feldbreite hing an der Bildschirmhöhe statt an der verfügbaren Breite, dadurch waagerechter Bildlauf bei 0–20. Felder schrumpfen jetzt auf die verfügbare Breite.
- Ziehen mit der Maus zeigte ein Verboten-Symbol (nativer Bild-Drag des Browsers kollidierte mit dem eigenen Pointer-Drag) — per Finger hat es laut Sascha schon vorher funktioniert. `draggable="false"` auf allen Bildern behoben.
- Aufgaben-Karten, die nicht in die Bühnenfläche passten, waren oben abgeschnitten (Titel-Tag + Überschriftsanfang unsichtbar) — das `safe` in der Ausrichtung der Bühne löst das strukturell für alle Kartentypen, nicht nur den betroffenen Einzelfall. (Die Ausrichtung selbst steht seit 21.08.2026 auf mittig statt unten.)

🟡 **Weiterhin offen, nicht angefasst:** Der Zahlenstrahl hat keine Bild-Beschriftungen für ein Kind, das noch keine Ziffern liest (`label_every` selbst ist Absicht — steuert die Schwierigkeit, keine Anzeige-Macke, siehe `JSON_SCHEMA_REFERENCE.md` § 5.7).

## Was zuletzt fertig wurde

**Curriculum & Variation ist abgeschlossen und archiviert (20.08.2026):** [docs/archive/2026-08/2026-08-19_curriculum-und-variation/](docs/archive/2026-08/2026-08-19_curriculum-und-variation/README.md). Vier Phasen: ein gemeinsamer Variations-Würfel (`pool`/`generated`), ein Welt-Bauprompt vom Lernziel her, zwei neue Mathe-Aufgabentypen (`sorting`, `number_line`), und acht von zehn Aufgaben der Pokémon-Welt jetzt mit echter Pool-Variation. Phase 4 betraf nur `data/themes/` (außerhalb Git), kein Commit dafür nötig — die im Report-Back dieser Phase genannte Nachbestell-Liste ist inzwischen durch den `find_count`-Fix unten hinfällig, das Report-Back selbst ist nicht mehr nachgezogen (archiviert, kein Schreibzugriff im Alltagsfluss).

🟡 **Plan-Ende-Smoke noch offen (User):** dieselbe Episode der Pokémon-Welt zweimal spielen und die Pool-Abwechslung mit eigenen Augen sehen — finale Abnahmekriterien in der archivierten README.

**Die erste echte Welt ist abgeschlossen und archiviert (20.08.2026):** [docs/archive/2026-08/2026-08-18_erste-echte-welt/](docs/archive/2026-08/2026-08-18_erste-echte-welt/README.md). Pokémon — Die Buchstaben-Route, drei Orte, drei Lernstufen, 52 Bilder, 16 vertonte Dialogzeilen, am Bildschirm abgenommen, auf `questoria.info` deployt, auf dem Gerät des Kindes durchgeklickt.

💡 **Was der Härtetest ergeben hat:** Das Content-Schema trägt echten Content ohne Änderung — aber vier Lücken kamen erst durch das Spielen heraus, nicht durch das Bauen. Zwei Engine-Bugs (Vertonung spielte wegen eines doppelten Pfads nie ab; die Etappenkarte zeigte ein leeres Raster statt ihres Kartenbilds), eine Schema-Zusage, die kein Code einlöste, und eine Sprite-Vorgabe, die Arbeit ohne Gegenwert verlangte. Keiner davon wäre einem Build oder Lint aufgefallen.

**Davor abgeschlossen:** [UI-Umbau auf Vollbild](docs/archive/2026-08/2026-08-19_ui-umbau-vollbild/README.md) (19.08.2026, fünf Phasen) und [Wort-Bild-Paare](docs/archive/2026-08/2026-08-18_wort-bild-paare.md) als eigener Eventtyp.

## Offene Punkte aus abgeschlossenen Plänen

Stehen dort jeweils unter „Follow-ups", hier nur als Merkposten:

- 🟡 **`data/hub/` ist nicht in `.gitignore`** — anders als `data/themes/` und `data/avatars/` würde die Planetenkarte im Repo landen. Zu entscheiden: mitversionieren oder ausnehmen. Aufs Deployen hat es keinen Einfluss.
- 🟡 **`_default` in `voices.json` steht auf Julian**, derselben Stimme wie Professor Eich — jede künftig unbesetzte Figur klingt unbemerkt wie er. Jakob wäre frei und schon geprobt.
- 🟡 **Der Server-Vorfall vom 19.08.2026 ist nicht aufgeklärt** (30–40 s pro API-Aufruf, Verzögerung vor PHP, am 20.08. von selbst weg). Diagnose-Zeilen liegen in `api-bridge/diag.php` bereit.
- Aus dem UI-Umbau: das letzte `vh` statt `dvh` in `--size-answer-image`, das zu klein gewordene Größenbudget des Builds. (Der Bühnen-Kontrakt ohne automatischen Wächter ist am 20.08.2026 behoben — `align-content: safe end` in `episode.scss`.)
- Aus Meilenstein 4: die Smoke-Checkliste der [archivierten README](docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md) ist noch nicht abgearbeitet — sieben Punkte, die drei ersten mit 🔴.

## Danach

**Sammelkarten & Druckbogen** — sechs Phasen, freigegeben am 18.08.2026: [docs/planning/2026-08-18_sammelkarten-und-druckbogen/](docs/planning/2026-08-18_sammelkarten-und-druckbogen/README.md). 🟡 Phase 6 baut `pokemon_lesen` von 6 auf ≥11 Karten in drei Gruppen aus — das war früher die Rolle der Testwelt `dev_fixture`, die es nicht mehr gibt.

Alle gesammelten Spielideen mit Stand und Bewertung: [docs/knowledge/spielmechaniken-katalog.md](docs/knowledge/spielmechaniken-katalog.md) — Ideenspeicher, kein Fahrplan.

## Merkposten zur Maschine

- **PHP/Composer** liegen unter `C:\Users\sasch\develop\.tools\` (`php.cmd`/`composer.cmd`), nicht im Suchpfad. Für den PHP-Linter müssen die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne `--no-dev`).
- **Ad-hoc-Testserver nie auf Port 8000 oder 4200** — Sascha nutzt beide selbst parallel (`backend\serve.cmd` / `npm start`).
- **Python** gibt es nur in den Werkzeug-Umgebungen: `data/_authoring/image-tools/.venv/Scripts/python.exe`. Ein blankes `python` liegt nicht im Suchpfad. **ImageMagick ist nicht installiert** — das `convert` im Suchpfad ist das Windows-Dateisystem-Werkzeug und richtet bei falschem Aufruf Schaden an.
- **Der Content unter `data/themes/` liegt außerhalb von Git** (Drive-Verknüpfung). Weltdateien und erzeugte Bilder tauchen in keinem Commit auf; gesichert werden sie über Drive, auf den Server kommen sie mit `deploy.cmd content`.
- **Bilderzeugung** läuft ferngesteuert über den MCP-Server `comfy` (Comfy Desktop muss laufen). Bedienung, Werte und alle bekannten Fallen: [data/_authoring/image-prompts/GENERATING.md](data/_authoring/image-prompts/GENERATING.md). Handwerk pro Modell: Skills `krea2-bilder` und `flux2-bilder`, Vertonung: Skill `vertonung`.
