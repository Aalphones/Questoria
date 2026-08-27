---
name: vertonung
description: Alles Gesprochene einer Questoria-Welt lokal vertonen — Dialoge, Ansagen und Fragetexte — besetzen, Stimmprobe, Stapellauf mit Orpheus (deutsch) oder Kokoro, mp3 und Rückverweis ins Content-JSON. TRIGGER wenn Sprachausgabe, Sprecher, Stimmen oder Audio für eine Welt gebraucht werden — auch bei "vertone welt X", "stimmen für die Figuren", "audio erzeugen", "orpheus", "kokoro", "sprachausgabe". SKIP für Bilder (→ krea2-bilder, flux2-bilder), für Musik und Geräusche (nicht abgedeckt) und für reines Textschreiben ohne Erzeugung.
---

# Vertonung — aus Texten werden Sprachdateien

Die Skripte unter `data/_authoring/voice-tools/` lesen die Content-Dateien einer Welt, erzeugen pro gesprochener Zeile eine Audiodatei am richtigen Ort mit dem richtigen Namen und tragen den Verweis zurück ins Content-JSON. Kein Copy-Paste von Text, keine Handbenennung.

**Drei Arten von Zeilen, ein Lauf.** Was das Werkzeug einsammelt und wohin der Rückverweis geht:

| Art | Woher | Sprecher | Rückverweis |
|---|---|---|---|
| Dialogzeile | `episodes/*.json`, `dialog`-Events | die Figur (aus dem Sprite-Namen) | `audio_path` |
| Ansage eines Spiel-Events | `episodes/*.json`, `config` des Events | `erzaehler` | z. B. `intro_audio_path` |
| **Fragetext einer Aufgabe** | `events/*.json`, je Variante bzw. Pool-Eintrag | `erzaehler` | `question_audio_path` |

Ansagen und Fragen kommen aus dem Off — sie hängen an keiner Bühnenfigur und laufen deshalb immer über den Besetzungseintrag `erzaehler`. Jede Art wird eigen durchnummeriert.

Erweiterungspunkte in `voice_lines.py`: `ANNOUNCEMENT_EVENT_FIELDS` (welcher Eventtyp trägt eine Ansage, in welchen Feldern) und `QUESTION_EVENT_TYPES` (welche Aufgabentypen haben eine Frage). Ein neuer Eventtyp braucht dort eine Zeile und sonst nichts.

**Deutsch heißt Orpheus.** Kokoro kann offiziell kein Deutsch — es bleibt für fremdsprachige Zeilen und schnelle Rohfassungen. Die ganze Herleitung steht in `data/_authoring/voice-tools/README.md`.

Fehlt eine Aufnahme, bricht nichts: die Engine liest die Zeile über die Sprachausgabe des Geräts vor. Vertonung ist Kür, nicht Pflicht — das ist der Grund, warum ein abgebrochener Lauf kein Drama ist.

## Was auf dieser Maschine schon steht

Am 19.08.2026 geprüft, damit niemand das Setup ein zweites Mal fährt:

- `data/_authoring/voice-tools/.venv-orpheus/` ist eingerichtet.
- `HF_TOKEN` ist gesetzt, das zugangsbeschränkte Mehrstimmen-Modell `SebastianBodza/Kartoffel_Orpheus-3B_german_natural-v0.1` liegt im Zwischenspeicher unter `~/.cache/huggingface/hub/` — es wird nicht neu geladen.
- Auch `Thorsten-Voice/tv-orpheus-v1` (offen, eine Stimme) und der Decoder `snac_24khz` liegen bereit.
- In `voice-tools/probe/` stehen fertige Stimmproben für **Jakob, Julian, Sophie**.

Eine Kokoro-Umgebung gibt es **nicht**. Wird sie gebraucht, erst `SETUP.md` fahren.

Aufgerufen wird aus dem Ordner `data/_authoring/voice-tools/` heraus, mit dem Python aus der Umgebung — nicht mit dem des Systems:

```bash
cd data/_authoring/voice-tools
PYTHONIOENCODING=utf-8 ./.venv-orpheus/Scripts/python.exe generate_orpheus.py --theme <welt> --dry-run
```

🟡 `PYTHONIOENCODING=utf-8` ist keine Kosmetik: ohne die Variable bricht die Ausgabe unter Windows beim ersten Umlaut ab — mitten im Lauf, nachdem die ersten Zeilen schon erfolgreich aussahen.

## Eine neue Welt vertonen — fünf Schritte

### 1. Trockenlauf: was steht überhaupt an?

```bash
PYTHONIOENCODING=utf-8 ./.venv-orpheus/Scripts/python.exe generate_orpheus.py --theme <welt> --dry-run
```

Eingesammelt wird **alles Gesprochene einer Welt**, aus zwei Ordnern: Dialogzeilen und Event-Ansagen aus `episodes/`, **Fragetexte aus `events/`**. Fragen erscheinen als Sprecher `Frage`, Ansagen als `Ansage` — beide werden über den Besetzungseintrag `erzaehler` gesprochen, weil sie an keiner Bühnenfigur hängen. Bei einer `pool`-Variante zählt **jeder Pool-Eintrag** als eigene Zeile: jeder hat einen eigenen Fragetext.

Die Ausgabe zeigt jede Zeile mit Quelldatei, laufender Nummer, Sprechername und **der Stimme in eckigen Klammern**. Das ist der eigentliche Befund: Steht überall dieselbe Stimme, ist keine Figur besetzt und alles fällt auf `_default`. Genau so sah es zuletzt für `pokemon` (bis 23.08.2026 `pokemon_lesen`) aus — 16 Zeilen, viermal Julian, weil Professor Eich, Bisasam, Pikachu und Rattfratz keinen Eintrag haben.

### 2. Besetzen

`voices.json` ordnet Figur zu Stimme. Schlüssel ist die `character_id` — **die steckt im Sprite-Namen**, nicht in der Dialogzeile: aus `bisasam/bisasam_happy.png` wird `bisasam`. Der Trockenlauf oben nennt die Sprechernamen; die ids holt man aus den Sprite-Pfaden der Episodendateien.

```json
"prof_eich": { "engine": "orpheus", "voice": "Alexander", "speed": 0.95 },
"bisasam":   { "engine": "orpheus", "voice": "Lina",      "speed": 1.0  }
```

Deutsche Stimmen des Kartoffel-Modells — **männlich:** Jakob, Anton, Julian, Jan, Alexander, Emil, Ben, Elias, Felix, Jonas, Noah, Maximilian. **Weiblich:** Sophie, Marie, Mia, Maria, Sophia, Lina, Lea.

Der Eintrag `_default` ist Pflicht und fängt jede unbesetzte Figur auf. Eine Figur ohne eigene Stimme ist damit kein Fehler, sondern eine stille Fehlbesetzung — deshalb Schritt 1 vor Schritt 3.

### 3. Stimmprobe hören, bevor eine Welt durchläuft

```bash
PYTHONIOENCODING=utf-8 ./.venv-orpheus/Scripts/python.exe generate_orpheus.py --probe --probe-voices Alexander,Lina,Emil
```

Gesprochen wird die feste Batterie aus `probe-lines.txt`: Erzählton, Ausruf, Ansprache ans Kind, Umlaute mit Zahlen und Eigenname, kurze Warnung. **Immer dieselben Sätze** — sonst vergleicht man Stimmen anhand verschiedener Texte, und das sagt nichts. Ergebnisse landen in `probe/`, außerhalb von Git, ohne Rückschreiben ins Content.

🟡 **Ein unbekannter Stimmname wirft keinen Fehler**, das Modell nimmt dann irgendeine Stimme. Und laut Modellblatt ist nicht jede der 19 Stimmen sauber rekonstruiert. Die Probe ist keine Fleißaufgabe, sie ist die einzige Prüfung, die es gibt.

Die Dateien anhören muss der Mensch. Wer sie nur erzeugt und weiterläuft, hat nichts geprüft.

### 4. Vertonen

```bash
# Eine Episode
PYTHONIOENCODING=utf-8 ./.venv-orpheus/Scripts/python.exe generate_orpheus.py --theme <welt> --episode <episode_id> --mp3

# Eine Figur nachziehen, nachdem ihr Text geändert wurde
PYTHONIOENCODING=utf-8 ./.venv-orpheus/Scripts/python.exe generate_orpheus.py --theme <welt> --character bisasam --force --mp3
```

**Episodenweise fahren, nicht die ganze Welt am Stück.** Gemessen sind 30–40 Sekunden je Zeile auf einer RTX 3060, dazu einmalig etwa eine Minute Modellstart; einzelne Zeilen dauerten deutlich länger, Ursache unklar. Vorhandene Dateien werden übersprungen, jeder Lauf ist also wiederaufnehmbar — ein Abbruch kostet nichts.

Ein einzelner Fehlschlag stoppt den Stapel nicht: die Zeile steht am Ende in der Fehlerliste, der Rest läuft durch.

**Fragen getrennt fahren, wenn die Figuren noch nicht abgenommen sind.** Alle Fragen und Ansagen laufen über `erzaehler`, also trennt `--character erzaehler` sie sauber vom Rest:

```bash
# Nur die Fragen und Ansagen einer Welt
PYTHONIOENCODING=utf-8 ./.venv-orpheus/Scripts/python.exe generate_orpheus.py --theme <welt> --character erzaehler --mp3
```

### 4b. Die festen Engine-Ansagen (einmalig, nicht pro Welt)

Der Fortsetzen-Dialog und die Erfolgs-Nachricht am Episodenende gehören keiner Welt — sie stehen als Konstanten im Frontend. Ein eigenes Skript vertont sie:

```bash
PYTHONIOENCODING=utf-8 ./.venv-orpheus/Scripts/python.exe generate_engine_lines.py --mp3
```

Das läuft **einmal für die ganze Anwendung**, nicht je Welt, und schreibt nach `data/audio/engine/`. Ändert sich einer der beiden Sätze im Frontend, muss er in `generate_engine_lines.py` mitgeändert und der Lauf mit `--force` wiederholt werden — die Texte stehen an zwei Stellen, das Skript nennt die Fundstellen im Frontend.

### 5. Kontrollieren

Der Lauf meldet „Erzeugt / Übersprungen / Fehlgeschlagen" und wie viele Episodendateien einen neuen `audio_path` bekommen haben. Danach:

- Zwei, drei Dateien **anhören** — besonders Eigennamen und Ausrufe.
- Prüfen, dass `audio_path` in der Episodendatei auf die tatsächlich vorhandene Endung zeigt. Wird erst nachträglich in mp3 umgewandelt, zeigt der Pfad noch auf die `.wav`; dann einmal mit `--mp3 --force` durchlaufen.

## Die Schalter

| Schalter | Wirkung |
|---|---|
| `--theme` / `--episode` / `--character` | Umfang eingrenzen |
| `--dry-run` | nur auflisten, nichts erzeugen |
| `--force` | vorhandene Dateien neu erzeugen statt überspringen |
| `--mp3` | direkt in mp3 umwandeln (braucht ffmpeg) |
| `--text simple\|full` | Vorlesefassung (Standard) oder voller Text |
| `--no-write-json` | `audio_path` **nicht** zurückschreiben |
| `--no-trim` | Stille an den Rändern stehen lassen |
| `--load-4bit` | Modell quantisiert laden, ~4 GB statt ~8 GB Grafikspeicher |
| `--model` | anderes Modell, z. B. `Thorsten-Voice/tv-orpheus-v1` (offen, eine Stimme → `"--probe-voices=-"`) |

Werte, die belegt sind und **nicht** angefasst werden sollten: Temperatur 0.6, top_p 0.95, Wiederholungsbremse **1.1** (darunter stottert das Modell und läuft nicht mehr aus), Höchstlänge 2000 Token (gut 20 Sekunden Ton). Ausgabe ist immer 24 kHz mono — eine höhere Abtastrate gibt es nicht, und Hochrechnen fügt nichts hinzu.

## Wo die Dateien landen

```
data/themes/<welt>/audio/voices/<character_id>_<episode_id>_<nnn>.mp3     Dialog und Ansage
data/themes/<welt>/audio/voices/erzaehler_frage_<event_id>_<nnn>.mp3      Fragetext
data/audio/engine/erzaehler_<name>.mp3                                    feste Engine-Ansage
```

Fragen tragen `frage_` im Namen, weil `event_id` und `episode_id` in getrennten Namensräumen leben — ohne das Stück könnten zwei verschiedene Zeilen dieselbe Datei treffen und die zweite die erste überschreiben.

Die laufende Nummer zählt **alle** Dialogzeilen der Episode durch, über alle `dialog`-Events hinweg — nicht pro Event neu. Bei Fragen zählt sie alle Fragetexte **einer Event-Datei** durch, über alle Lernstufen und Pool-Einträge hinweg. **Deshalb verschiebt das Einfügen eines Pool-Eintrags in der Mitte alle folgenden Nummern** — dann einmal mit `--force` durchlaufen, sonst zeigt der Rückverweis auf die Aufnahme der Nachbarfrage. Verbindliche Vorgaben: `data/_authoring/ASSET_REQUIREMENTS.md` Abschnitt 3.

`data/themes/` liegt auf Google Drive hinter einer Junction — die Dateien landen im Backup, aber nicht in Git.

## Fallstricke

- **Eine Stimme pro Figur, durchgehend.** Ein Stimmwechsel mitten in der Welt fällt Kindern sofort auf — dieselbe Regel wie beim Bildstil.
- **Zahlen und Abkürzungen im Content ausschreiben**, nicht im Skript reparieren. „3" wird mal „drei", mal „dritte".
- **Fandom-Namen prüfen.** Deutsche Modelle raten bei Eigennamen. Klingt es falsch, hilft eine lautschriftliche Schreibweise im Text (`Schanks` statt `Shanks`) mehr als jede Einstellung.
- **Nicht unter `speed` 0.9.** Darunter klingt es nach Belehrung statt nach Abenteuer.
- **Gefühlsmarkierungen** wie `<laugh>` sind nur fürs englische Modell dokumentiert. Ob das deutsche sie versteht, ist unbelegt — erst proben, nie eine ganze Episode darauf setzen.
- **Stimmen echter Menschen nicht klonen.** Es bleibt bei den mitgelieferten Sprechern.

Volle Bedienungsanleitung samt Herleitung und Rechtlichem: `data/_authoring/voice-tools/README.md`. Umgebung neu aufsetzen oder Fehlerbilder nachschlagen: `data/_authoring/voice-tools/SETUP.md`.
