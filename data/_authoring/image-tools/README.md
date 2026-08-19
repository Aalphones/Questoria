# Bild-Werkstatt — Nachbearbeitung

Zwei lokale Werkzeuge, die aus einem Rohbild der Bildmaschine eine Datei machen, die die Engine direkt ausliefern kann. Die Erzeugung selbst steht nebenan in [../image-prompts/GENERATING.md](../image-prompts/GENERATING.md).

**Warum das lokal passiert und nicht auf dem Server:** Die App soll später offline laufen. Alles, was der Browser braucht, muss fertig auf der Platte liegen — keine Bildverarbeitung zur Laufzeit, keine Abhängigkeit von PHP-Erweiterungen, die auf einem Shared Host da sind oder eben nicht. Ein Bild wird genau einmal umgerechnet: hier, vor dem Hochladen.

| Werkzeug | Wofür |
|---|---|
| `format_assets.py` | Größe und Dateiformat ins Ziel bringen — webp für Szenen, feste Pixelmaße für Karten, Antwortbilder und Icons |
| `cutout.py` | Hintergrund entfernen, echten Alphakanal setzen — für Charakter-Sprites und Erfolgs-Icons |

## Einrichten

Einmalig, dauert ein paar Minuten (rembg zieht eine Rechenbibliothek mit):

```bat
uv venv data\_authoring\image-tools\.venv --python 3.12
uv pip install --python data\_authoring\image-tools\.venv\Scripts\python.exe -r data\_authoring\image-tools\requirements.txt
```

Beim ersten Freistellen lädt `cutout.py` sein Erkennungsmodell nach (rund 176 MB, einmalig, landet unter `%USERPROFILE%\.rembg\`). Das dauert beim allerersten Lauf zwei Minuten und danach nie wieder.

Die Umgebung liegt außerhalb von Git — auf einer neuen Maschine die zwei Befehle oben wiederholen.

## Formate ins Ziel bringen

```bat
:: eine Datei
.venv\Scripts\python.exe format_assets.py roh.png --out ..\..\themes\pokemon_lesen\backgrounds\alabastia_labor.webp

:: ein Stapel in denselben Ordner
.venv\Scripts\python.exe format_assets.py roh\*.png --out-dir ..\..\themes\pokemon_lesen\answers\
```

Den Zieltyp leitet das Werkzeug **aus dem Zielpfad** ab — `backgrounds/` heißt 1920×1080 webp, `answers/` heißt 512×512 PNG, und so weiter. Passt der Pfad nicht ins Schema, `--kind` explizit angeben.

| Ordner im Ziel | Ergebnis |
|---|---|
| `backgrounds/`, `maps/`, `cover.webp` | 1920×1080, **webp**, Qualität 92 |
| `answers/` | 512×512, PNG mit Alpha |
| `cards/` | 630×880, PNG |
| `achievements/` | 128×128, PNG mit Alpha |
| `sprites/` | 1024×1536, PNG mit Alpha |

**Verzerrt wird nie.** Was stattdessen passiert, hängt davon ab, ob das Ziel Transparenz erlaubt:

| Ziel | Verhalten bei abweichendem Seitenverhältnis |
|---|---|
| Szenen, Karten, Sammelkarten (ohne Alpha) | **mittig zuschneiden** — das Motiv füllt die Fläche randlos |
| Sprites, Erfolgs-Icons, Antwortbilder (mit Alpha) | **vollständig einpassen**, Rest bleibt transparent |

Der Unterschied ist wichtig: Eine freigestellte Figur hat nach `cutout.py --trim` ein beliebiges Seitenverhältnis. Würde sie auf 2:3 zugeschnitten, verlöre eine schmale Figur Kopf oder Füße — genau das, was die Prompt-Vorlagen mühsam verhindern. Wo Transparenz erlaubt ist, darf Rand dazukommen; wo nicht, muss geschnitten werden.

Ist die Quelle kleiner als das Ziel, sagt das Werkzeug das ausdrücklich — dann lieber neu erzeugen als hochskalieren.

## Freistellen

```bat
:: Sprite: freistellen und auf die Figur zuschneiden
.venv\Scripts\python.exe cutout.py roh.png --out pikachu_neutral.png --trim

:: Erfolgs-Icon: enger Rand
.venv\Scripts\python.exe cutout.py roh.png --out icon.png --trim --margin 2
```

Standardmodell ist `isnet-anime` — auf gezeichnete Figuren trainiert und deutlich sauberer an Haaren und Ohren als das Allzweckmodell. Für nicht-figürliche Motive `--model u2net`.

**Das Ergebnis hängt am Prompt, nicht am Werkzeug.** Die Figur muss vor einer flachen, einfarbigen Fläche stehen, und diese Farbe darf **nicht in der Figur vorkommen** — sonst frisst das Freistellen Löcher hinein. `mid grey` ist der sichere Standard, Details in [../image-prompts/SPRITES.md](../image-prompts/SPRITES.md).

Das Werkzeug meldet, wie viel Prozent des Bildes am Ende Figur sind. Unter 5 % oder über 95 % ist etwas schiefgelaufen und es sagt das auch.

## Die übliche Reihenfolge

Bei Sprites und Icons erst freistellen, dann formatieren — sonst schneidet die Formatierung an einem Rand herum, der gleich wegfällt:

```bat
.venv\Scripts\python.exe cutout.py roh.png --out zwischen.png --trim
.venv\Scripts\python.exe format_assets.py zwischen.png --out ..\..\themes\pokemon_lesen\sprites\pikachu\pikachu_neutral.png
```

Bei Szenen, Karten und Antwortbildern reicht der Formatierungsschritt allein.

## Nicht hierher gehört

Sammelkarten-Layout (Rahmen, Beschriftung, Druckbogen) — das ist Meilenstein 5 und passiert in der Engine, nicht in dieser Werkstatt. Hier entstehen nur die Motive.
