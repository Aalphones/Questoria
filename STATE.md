# STATE

**Aktiver Plan:** [docs/planning/2026-08-31_karten-ueberarbeitung/](docs/planning/2026-08-31_karten-ueberarbeitung/README.md)
— freigegeben am 31.08.2026, sechs Phasen.

**Phase:** 4/6 — Orientierung: Minikarte und Legende. Phase 1–3 sind umgesetzt
und committet, am Bildschirm noch nicht abgenommen.

**Nächster Schritt:** `phase-4-orientierung.md` umsetzen. Rating „standard" —
`sonnet` reicht, `opusplan` ist hier nicht nötig.

Worum es geht: Sternen- und Weltenkarten bekommen die Struktur aus dem
Karten-Konzept vom 31.08.2026 — Nebel als eigene weiche Schicht statt beiger
Kachelklötze, Herauszoomen bis zur Gesamtansicht, vier Marker-Zustände,
Minikarte, ein gemeinsames Kartenpanel. Dazu werden die sechs Kartenbilder neu
erzeugt. Die Farbwelt bleibt Pergament; die dunkel-kosmische Palette des
Konzepts wird bewusst nicht übernommen (Begründung in der Plan-README).

---

## Im Backlog: Sammelkarten und Druckbogen (freigegeben 18.08.2026)

[docs/planning/2026-08-18_sammelkarten-und-druckbogen/](docs/planning/2026-08-18_sammelkarten-und-druckbogen/README.md)
— sechs Phasen, **noch nicht begonnen.** Am 31.08.2026 zugunsten der
Karten-Überarbeitung zurückgestellt.

🟡 **Vorher zu klären:** Phase 6 dieses Plans baut `pokemon_lesen` von 6 auf ≥11
Karten aus. Die Welt heißt seit dem 23.08.2026 `pokemon`, und ihr Content ist
inzwischen deutlich größer als bei der Planung — die Phase gehört einmal gegen
den heutigen Stand gerechnet, bevor sie losläuft.

---

## Offene Abnahme: Kartenplan (archiviert 27.08.2026, ungeprüft)

[docs/archive/2026-08/2026-08-20_vollbild-karten-mit-pan-zoom/](docs/archive/2026-08/2026-08-20_vollbild-karten-mit-pan-zoom/README.md)
— acht Phasen, alle umgesetzt und committet, **nichts davon am Bildschirm
abgenommen.** Sascha sammelt die Korrekturen und macht sie gebündelt in einer
eigenen Session.

🔴 **Die vollständige Liste steht unter „Follow-ups" in der archivierten
README** — dort und in den Report-Backs der Phasen 3, 4, 5 und 8, nicht hier
noch einmal. Kurzfassung, was zu prüfen ist:

- Ziehen und Zoomen, die Kachel-Freischaltung, der Spielstand-Schreibkreis beim
  Kartenöffnen, der animierte Auto-Fokus, `prefers-reduced-motion`
- die neue `pokemon`-Welt insgesamt (Prüf-Checkliste in phase-5)
- der Vorlese-Knopf in einer Aufgabe und der gesprochene Fortsetzen-Dialog
- sieben Aufnahmen anhören (Liste in phase-8) — Prüfstein sind die Eigennamen

🔴 **`deploy.cmd content` ist bewusst nie gelaufen.** `pokemon` ist strukturell,
bildlich und tonlich vollständig; die Sperre kann fallen, sobald der Smoke
einmal durch ist.

🟡 **Offene Entscheidung:** Der Fortsetzen-Dialog spricht, hat aber keinen
Wiederhol-Knopf — ein Kind, das die Frage überhört, kann sie nicht noch einmal
hören. Ein `qst-read-aloud-button` wäre eine Zeile im Template.

🟡 **Bildmaschine:** Der Karten-Ablauf ist am 26.08.2026 zweimal grundlegend
umgebaut worden. Verbindlich und vollständig ist
[`image-prompts/MAPS.md`](data/_authoring/image-prompts/MAPS.md) →
„Hochskalieren — der Detailgrad hängt an drei Reglern". Das Wichtigste in einem
Satz: der gespeicherte Ablauf `Upscale Map` trägt nicht, die Regler erreichen den
Auftrag über comfy-cli gar nicht, und die Stilwörter im Prompt schlagen alles
andere — der `art_style` der Welt gehört wörtlich hinein.

🟡 **Karten-Leinwände** liegen unter `data/_authoring/map-canvases/` und sind
gitignored — eine 8192er Leinwand gehört nicht in die Repo-Historie. Preis: nur
lokal, kein Drive-Backup.

---

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
- 🟡 **Der Server-Vorfall vom 19.08.2026 ist nicht aufgeklärt** (30–40 s pro API-Aufruf, Verzögerung vor PHP, am 20.08. von selbst weg). Diagnose-Zeilen liegen in `api-bridge/diag.php` bereit.
- Aus dem UI-Umbau: das letzte `vh` statt `dvh` in `--size-answer-image`, das zu klein gewordene Größenbudget des Builds. (Der Bühnen-Kontrakt ohne automatischen Wächter ist am 20.08.2026 behoben — `align-content: safe end` in `episode.scss`.)
- Aus Meilenstein 4: die Smoke-Checkliste der [archivierten README](docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md) ist noch nicht abgearbeitet — sieben Punkte, die drei ersten mit 🔴.

## Danach

Der Backlog ist leer, sobald Sammelkarten & Druckbogen (oben, jetzt aktiv) durch ist.

Alle gesammelten Spielideen mit Stand und Bewertung: [docs/knowledge/spielmechaniken-katalog.md](docs/knowledge/spielmechaniken-katalog.md) — Ideenspeicher, kein Fahrplan.

## Merkposten zur Maschine

- **PHP/Composer** liegen unter `C:\Users\sasch\develop\.tools\` (`php.cmd`/`composer.cmd`), nicht im Suchpfad. Für den PHP-Linter müssen die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne `--no-dev`).
- **Ad-hoc-Testserver nie auf Port 8000 oder 4200** — Sascha nutzt beide selbst parallel (`backend\serve.cmd` / `npm start`).
- **Python** gibt es nur in den Werkzeug-Umgebungen: `data/_authoring/image-tools/.venv/Scripts/python.exe` für Bilder, `data/_authoring/voice-tools/.venv-orpheus/Scripts/python.exe` für Vertonung. Ein blankes `python` liegt nicht im Suchpfad. Beim Vertonen `PYTHONIOENCODING=utf-8` davorsetzen, sonst bricht die Ausgabe am ersten Umlaut ab. **ImageMagick ist nicht installiert** — das `convert` im Suchpfad ist das Windows-Dateisystem-Werkzeug und richtet bei falschem Aufruf Schaden an.
- **Der Content unter `data/themes/` liegt außerhalb von Git** (Drive-Verknüpfung). Weltdateien und erzeugte Bilder tauchen in keinem Commit auf; gesichert werden sie über Drive, auf den Server kommen sie mit `deploy.cmd content`.
- **Bilderzeugung** läuft ferngesteuert über den MCP-Server `comfy` (Comfy Desktop muss laufen). Bedienung, Werte und alle bekannten Fallen: [data/_authoring/image-prompts/GENERATING.md](data/_authoring/image-prompts/GENERATING.md). Handwerk pro Modell: Skills `krea2-bilder` und `flux2-bilder`, Vertonung: Skill `vertonung`.
