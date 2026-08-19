# Sprach-Werkstatt

Aus Dialogtexten werden Sprachdateien, lokal auf der eigenen Grafikkarte. Die
Skripte lesen die Episodendateien, erzeugen pro Dialogzeile eine Audiodatei im
richtigen Ordner mit dem richtigen Namen und tragen den Verweis zurück ins
Content-JSON. Kein Klickweg, kein Abo, kein Text-Copy-Paste.

Das Gegenstück auf der Bildseite ist [image-prompts/](../image-prompts/) — dort
Prompts für Bilder, hier Skripte für Stimmen.

**Soll eine Welt vertont werden, ist der Skill `vertonung` der Einstieg** — er
führt die fünf Schritte in der richtigen Reihenfolge, nennt die geprüften
Kommandos und den Stand der Umgebung auf dieser Maschine. Diese Datei hier ist
das Nachschlagewerk dahinter: Modellwahl, Herleitung, Rechtliches.

| Datei | Wofür |
|---|---|
| [SETUP.md](SETUP.md) | Umgebung einrichten: Python, Grafikkartentreiber, Modelle laden |
| `voices.json` | Besetzungsliste — welche Figur klingt wie |
| `probe-lines.txt` | Feste Satzbatterie für Stimmvergleiche |
| `generate_kokoro.py` | Stapellauf mit Kokoro: schnell, sparsam, gleichförmig |
| `generate_orpheus.py` | Lauf mit Orpheus: langsamer, deutlich lebendiger |
| `voice_lines.py` | Gemeinsamer Unterbau — wird nicht direkt aufgerufen |

Wo die Dateien landen und in welchem Format:
[ASSET_REQUIREMENTS.md](../ASSET_REQUIREMENTS.md) Abschnitt 3.

---

## Die Rollenverteilung dreht sich um, weil wir Deutsch sprechen

Die verbreitete Empfehlung lautet: Kokoro als Arbeitspferd, Orpheus für die
wichtigen Stellen. Diese Empfehlung stammt aus der englischsprachigen Welt und
trägt für Questoria nicht.

**Kokoro kann offiziell kein Deutsch.** Das Modell deckt amerikanisches und
britisches Englisch, Japanisch, Mandarin, Spanisch, Französisch, Hindi,
Italienisch und brasilianisches Portugiesisch ab — Deutsch ist nicht dabei und
war es nie. Es gibt eine Gemeinschafts-Nachschulung
(`kikiri-tts/kikiri-german-martin`, Apache 2.0) mit **genau einer** Stimme:
einem männlichen Sprecher namens Martin. Für ein Spiel, in dem Shanks, Luffy
und eine Erzählerin klingen sollen, ist eine Stimme keine Besetzung.

**Orpheus kann Deutsch.** Nur hängt der Zugang an einer Hürde, die niemand
erwähnt: **alle deutschen Mehrstimmen-Modelle sind zugangsbeschränkt.**

| Modell | Stimmen | Zugang |
|---|---|---|
| `SebastianBodza/Kartoffel_Orpheus-3B_german_natural-v0.1` | ~19 (12 männlich, 7 weiblich) | Konto + einmal zustimmen |
| `SebastianBodza/Kartoffel_Orpheus-3B_german_synthetic-v0.1` | dieselben, mehr Ausdruck | Konto + einmal zustimmen |
| `canopylabs/3b-de-ft-research_release` | wenige, nicht dokumentiert | Konto + einmal zustimmen |
| `Thorsten-Voice/tv-orpheus-v1` | **1** (männlich, ruhig) | **offen**, Apache 2.0, Sprachdaten gemeinfrei |

„Zugangsbeschränkt" heißt hier nicht Warteliste: Konto anlegen, auf der
Modellseite einmal zustimmen (automatische Freigabe), Zugangsschlüssel als
Umgebungsvariable `HF_TOKEN` setzen. Fünf Minuten. Ohne das bricht der Lauf mit
„gated repo" ab.

Die Kartoffel-Stimmen: **männlich** Jakob, Anton, Julian, Jan, Alexander, Emil,
Ben, Elias, Felix, Jonas, Noah, Maximilian — **weiblich** Sophie, Marie, Mia,
Maria, Sophia, Lina, Lea. Das Modellblatt sagt selbst, dass der Trainingsbestand
deutlich mehr männliche Sprecher hatte und nicht jede Stimme sauber
rekonstruiert wurde. Heißt: durchhören, nicht blind besetzen.

**Solange nichts freigeschaltet ist**, läuft die Werkstatt mit
`Thorsten-Voice/tv-orpheus-v1` — eine Stimme, aber sofort und sauber lizenziert.
Ein-Stimmen-Modelle kennen keinen Stimmnamen: in der Besetzungsliste bleibt
`voice` dann leer, im Probelauf schreibt man `--probe-voices=-`.

Daraus folgt für dieses Projekt:

| Aufgabe | Werkzeug | Warum |
|---|---|---|
| Fertige Sprachausgabe, alle Figuren | **Orpheus (deutsch)** | einziger Weg zu mehreren deutschen Stimmen mit Betonung |
| Schnelle Rohfassung zum Timing-Prüfen | **Kokoro über den deutschen Server** | Sekunden statt Minuten, eine Stimme reicht zum Abschätzen |
| Fremdsprachige Zeilen (englischer Song, japanischer Ruf) | **Kokoro direkt** | dafür ist es ohne Umweg gebaut und sehr gut |
| Platzhalter, solange nichts vertont ist | **gar nichts** | die Engine liest zur Not selbst vor, siehe unten |

🟡 Kokoro bleibt trotzdem eingebaut. Es kostet fast nichts, es ist der schnellste
Weg zu einer hörbaren Rohfassung, und sollte eine deutsche Mehrstimmen-Version
erscheinen, ist das Skript schon da.

🟡 **Nicht geprüfte Alternative:** Chatterbox Multilingual (MIT-Lizenz,
23 Sprachen inklusive Deutsch, Stimmklonen aus wenigen Sekunden Beispielton)
wäre der naheliegende Kandidat, falls das Orpheus-Ensemble zu klein bleibt. Hier
bewusst nicht gebaut — erst prüfen, ob Orpheus reicht.

---

## Der Ablauf in vier Schritten

### 1. Besetzen

`voices.json` ordnet jeder Figur eine Stimme zu. Schlüssel ist die
`character_id` — das ist der Sprite-Dateiname ohne Emotion: aus
`shanks_neutral.png` wird `shanks`. Figuren ohne eigenen Eintrag fallen auf
`_default` zurück.

### 2. Stimmprobe hören

Bevor eine ganze Welt durchläuft, dieselben Sätze mit mehreren Stimmen erzeugen
und vergleichen:

```bash
python generate_orpheus.py --probe --probe-voices Julian,Sophie,Jakob
```

Gesprochen wird die feste Batterie aus `probe-lines.txt`: Erzählton, Ausruf,
direkte Ansprache ans Kind, Umlaute mit Zahlen und Eigenname, kurze Warnung.
Fünf Sätze, die jeweils etwas anderes prüfen — **immer dieselben**, sonst
vergleicht man Stimmen anhand verschiedener Texte, und das sagt nichts.

Nur ein einzelner Satz: `--probe-text "Ich werde König der Piraten!"`.
Andere Sammlung: `--probe-file meine-saetze.txt`.

Die Dateien landen in `probe/` (nicht im Git) und werden nicht ins Content
geschrieben.

🟡 **Ein unbekannter Stimmname liefert kein Fehlerbild, sondern eine beliebige
Stimme.** Das Modellblatt warnt zudem, dass nicht jede Stimme sauber
rekonstruiert wurde. Deshalb der Probelauf, bevor jemand besetzt wird — und was
funktioniert, gehört in `voices.json`.

### 3. Vertonen

```bash
# Erst schauen, was passieren würde
python generate_orpheus.py --theme one_piece --dry-run

# Dann eine Episode
python generate_orpheus.py --theme one_piece --episode arc_01_foosha

# Eine einzelne Figur nachziehen, nachdem ihr Text geändert wurde
python generate_orpheus.py --theme one_piece --character shanks --force
```

Vorhandene Dateien werden übersprungen — ein abgebrochener Lauf wird einfach
neu gestartet. `--force` erzeugt neu.

### 4. Ausliefern

Die Dateien liegen direkt an ihrem Zielort unter
`data/themes/<theme_id>/audio/voices/` und gehen mit dem Content-Repo mit.

Vor dem Ausliefern lohnt mp3: eine `.wav` in 24 kHz ist rund achtmal so groß wie
die gleichwertige `.mp3`, und das Zeug wird auf Tablets über Mobilfunk geladen.
Entweder gleich beim Erzeugen (`--mp3`, braucht ffmpeg) oder später am Stapel:

```bash
for %f in (data\themes\one_piece\audio\voices\*.wav) do ffmpeg -i "%f" -codec:a libmp3lame -b:a 96k -ac 1 "%~dpnf.mp3"
```

Wird nachträglich umgewandelt, zeigt `audio_path` noch auf die `.wav` — dann
einmal mit `--mp3 --force` durchlaufen lassen oder die Pfade von Hand ziehen.

---

## Welcher Text gesprochen wird

Standard ist **`text_simple`**, die Vorlesefassung, mit Rückfall auf `text`.
Begründung: Vorgelesen wird für Kinder, die noch nicht selbst lesen — genau die
Gruppe, für die `text_simple` geschrieben ist. Wer selbst liest, braucht die
Aufnahme seltener.

Das Schema kennt **einen** `audio_path` pro Dialogzeile, also gibt es genau eine
Aufnahme pro Zeile. Beide Fassungen zu vertonen ginge nur mit einem zweiten Feld
im Schema — bewusst nicht gebaut, solange niemand es vermisst.

`--text full` dreht es um und vertont die volle Fassung.

Fehlt eine Aufnahme, ist das kein Fehler: die Engine liest die Zeile dann über
die Sprachausgabe des Geräts vor (Schema-Referenz Abschnitt 6). Vorproduziert
klingt besser, aber nichts bricht.

---

## Einstellungen — die Zahlen, die zählen

### Orpheus (deutsch)

| | Wert | Anmerkung |
|---|---|---|
| Modell (Voreinstellung) | `SebastianBodza/Kartoffel_Orpheus-3B_german_natural-v0.1` | 3 Mrd. Parameter, Llama-Unterbau, Llama-3.2-Lizenz, Zugang nötig |
| Modell (offen) | `Thorsten-Voice/tv-orpheus-v1` | eine Stimme, Apache 2.0, kein Konto nötig |
| Decoder | `hubertsiuzdak/snac_24khz` | macht aus Audio-Codes Ton |
| Ausgabe | 24 kHz, mono | keine höhere Abtastrate erhältlich |
| Temperatur | 0.6 | höher wird theatralisch und unzuverlässig |
| top_p | 0.95 | |
| Wiederholungsbremse | **1.1** | darunter fängt das Modell an zu stottern und läuft nicht mehr aus |
| Höchstlänge | 2000 Token | rund 85 Token je Sekunde Ton, also gut 20 Sekunden |
| Grafikspeicher | ~8 GB in bf16, ~4 GB mit `--load-4bit` | |
| Tempo | über Neuabtastung, verändert die Tonhöhe mit | für feine Tempoarbeit die Stimme wechseln |

Der Aufbau der Anweisung ist schlicht `Stimmname: Text`. Ein unbekannter
Stimmname wirft keinen Fehler — das Modell nimmt dann irgendeine Stimme.

Das Modell sagt keine Wellenform voraus, sondern Audio-Codes in Rahmen zu je
sieben Werten. Läuft die Generierung aus dem Ruder, sind die Codes außerhalb
ihres Wertebereichs — das Skript bricht die Zeile dann mit Meldung ab, statt
Rauschen zu speichern.

🟡 **Gefühlsmarkierungen** wie `<laugh>` oder `<sigh>` sind für das englische
Modell dokumentiert. Ob das deutsche sie versteht, ist nicht belegt — beim
Ausprobieren zuerst eine Probe fahren, nicht eine ganze Episode.

### Kokoro

| | Wert | Anmerkung |
|---|---|---|
| Modell | 82 Mio. Parameter, Apache 2.0 | läuft zur Not auf der Prozessor-Grafik |
| Ausgabe | 24 kHz, mono | |
| Sprachkürzel | `a` `b` `f` `j` `z` `e` `h` `i` `p` | **kein `d`** — Deutsch fehlt |
| Deutsche Stimme | nur über `--backend http` | lokaler Server mit `kikiri-german-martin` |
| Tempo | `speed` in `voices.json`, echter Schalter im Modell | |

---

## Was gute Kinder-Sprachausgabe ausmacht

- **Kurze Sätze.** Beide Modelle verlieren bei Schachtelsätzen die Betonung.
  `text_simple` ist dafür schon die richtige Vorlage.
- **Zahlen und Abkürzungen ausschreiben.** „3" wird mal „drei", mal „dritte".
  Im Content ausschreiben, nicht im Skript reparieren.
- **Fandom-Namen prüfen.** „Zorro", „Nami", „Chat Noir" — deutsche Modelle raten
  bei Eigennamen. Klingt es falsch, hilft eine lautschriftliche Schreibweise im
  Text (`Schanks` statt `Shanks`) mehr als jede Einstellung.
- **Nicht zu langsam.** Unter `speed` 0.9 klingt es nach Belehrung statt nach
  Abenteuer.
- **Eine Stimme pro Figur, durchgehend.** Ein Stimmwechsel mitten in der Welt
  fällt Kindern sofort auf — dieselbe Regel wie beim Bildstil.

---

## Rechtliches — kurz, aber nicht egal

- **Die Lizenzen sind nicht dieselbe.** Kokoro und das offene Ein-Stimmen-Modell
  stehen unter Apache 2.0. Das eingesetzte Kartoffel-Modell hängt an der
  **Llama-3.2-Lizenz** — für ein privates Projekt unproblematisch, sie schreibt
  aber Namensnennung vor und schließt bestimmte Nutzungen aus. 🟡 Vor einer
  Veröffentlichung selbst lesen, nicht auf diese Zeile verlassen.
- **Stimmen echter Menschen nicht nachbauen.** Orpheus kann Stimmen aus einer
  kurzen Aufnahme klonen. Die Synchronstimme aus einer Serie zu klonen ist eine
  andere Nummer als eine Modellstimme zu nutzen — für dieses Projekt bleibt es
  bei den mitgelieferten Sprechern.
- Dieselbe ungeklärte Trennlinie wie bei den Bildern: privater Gebrauch versus
  veröffentlichte Plattform. Siehe
  [image-prompts/README.md](../image-prompts/README.md), Abschnitt „Rechtliches".

---

## Was hier nicht belegt ist

- **Belegt:** Die Umrechnung von Modellausgabe zu Ton stimmt — sie wurde Zeichen
  für Zeichen gegen den Referenzcode von `Thorsten-Voice/tv-orpheus-v1`
  geprüft. Das war die Stelle mit dem größten Fehlerpotenzial.
- 🟡 Welche der 19 Stimmen für welche Figur taugt. Das entscheidet nur das Ohr.
- 🟡 Ob die deutsche Nachschulung Gefühlsmarkierungen versteht.
- 🟡 Tempo über Neuabtastung ist eine Notlösung. Wie weit man gehen kann, bevor
  es nach Zeichentrick klingt, ist Gehörsache und nicht gemessen.
- **Gemessen:** rund 30–40 Sekunden je Dialogzeile auf einer RTX 3060, dazu
  einmalig etwa eine Minute Modellstart. Eine Episode mit 20 Zeilen ist also
  ein Zehn-Minuten-Lauf. Einzelne Zeilen dauerten deutlich länger — Ursache
  unklar, deshalb überspringt der Lauf fertige Dateien und ist jederzeit
  wiederaufnehmbar.
- **Stille am Rand ist kein Problem.** Anfang und Ende werden abgeschnitten
  (`--no-trim` schaltet es ab), aber gemessen bringt das nur 0,0 bis 0,4
  Sekunden je Datei. Die Modelle setzen sauber an und hören sauber auf.

---

## Quellen

- Kokoro Modelcard (Sprachliste, Lizenz) — <https://huggingface.co/hexgrad/Kokoro-82M>
- Anfrage nach deutscher Kokoro-Unterstützung — <https://github.com/hexgrad/kokoro/issues/186>
- Deutsche Kokoro-Nachschulung (ONNX, Stimme Martin) — <https://huggingface.co/Godelaune/Kokoro-82M-ONNX-German-Martin>
- Orpheus-Projekt (Steuertoken, Standardwerte) — <https://github.com/canopyai/Orpheus-TTS>
- Deutsches Mehrstimmen-Modell (Stimmnamen, Einstellungen) — <https://huggingface.co/SebastianBodza/Kartoffel_Orpheus-3B_german_natural-v0.1>
- Offenes deutsches Ein-Stimmen-Modell samt Referenz-Code — <https://huggingface.co/Thorsten-Voice/tv-orpheus-v1>
- Offizielles deutsches Modell von Canopy Labs — <https://huggingface.co/canopylabs/3b-de-ft-research_release>
- SNAC-Decoder — <https://huggingface.co/hubertsiuzdak/snac_24khz>
