# Umgebung einrichten

Einmalige Vorbereitung auf dem Rechner mit der Grafikkarte. Danach ist Vertonen
ein Kommandozeilen-Aufruf.

**Zwei getrennte Umgebungen.** Kokoro und Orpheus hängen an unterschiedlichen
Versionen derselben Bibliotheken; in einem gemeinsamen Ordner zerlegen sie sich
gegenseitig. Das kostet ein paar Gigabyte Platte und spart einen ganzen
Nachmittag Fehlersuche.

---

## Voraussetzungen

| | Womit | Prüfen mit |
|---|---|---|
| Python 3.12 | <https://www.python.org/downloads/> | `python --version` |
| uv (Paketverwaltung) | <https://astral.sh/uv> | `uv --version` |
| Grafikkartentreiber mit CUDA | NVIDIA-Treiber, aktuell | `nvidia-smi` |
| ffmpeg (nur für mp3) | <https://www.gyan.dev/ffmpeg/builds/> | `ffmpeg -version` |
| espeak-ng (nur für Kokoro) | <https://github.com/espeak-ng/espeak-ng/releases> | `espeak-ng --version` |

Python 3.13 bewusst nicht: mehrere der Bibliotheken bringen dafür noch keine
fertigen Pakete mit, und dann baut der Rechner eine halbe Stunde lang C-Code.

**Grafikspeicher:** Orpheus braucht rund 8 GB in voller Genauigkeit. Auf einer
Karte mit weniger Speicher läuft es mit `--load-4bit` und rund 4 GB, hörbar
gleich gut. Kokoro braucht unter 1 GB und läuft notfalls auf dem Prozessor.

---

## Orpheus einrichten

```powershell
cd data\_authoring\voice-tools
uv venv .venv-orpheus --python 3.12
.venv-orpheus\Scripts\activate

# Torch passend zur CUDA-Version — die Zeile stammt von pytorch.org und
# aendert sich mit der Treibergeneration. Dort nachsehen, nicht raten.
uv pip install torch --index-url https://download.pytorch.org/whl/cu124

uv pip install -r requirements-orpheus.txt
```

Erster Lauf lädt rund 7 GB Modelldaten von Hugging Face nach
`%USERPROFILE%\.cache\huggingface`. Das dauert einmal, danach nie wieder.

### Zugang für die Mehrstimmen-Modelle

Die deutschen Modelle mit Sprecherensemble sind zugangsbeschränkt — keine
Warteliste, aber ein Konto:

1. Konto anlegen auf <https://huggingface.co/join>
2. Auf der Modellseite einmal zustimmen:
   <https://huggingface.co/SebastianBodza/Kartoffel_Orpheus-3B_german_natural-v0.1>
3. Schlüssel erzeugen unter <https://huggingface.co/settings/tokens>
   (Typ „Read" genügt)
4. Schlüssel dauerhaft hinterlegen:

```powershell
setx HF_TOKEN "hf_dein_schluessel"
```

Neue Konsole öffnen, damit die Variable greift. Der Schlüssel gehört **nicht**
ins Repository — `setx` legt ihn im Benutzerprofil ab, das ist der richtige Ort.

Probe mit Ensemble:

```powershell
python generate_orpheus.py --probe --probe-voices Julian,Sophie,Jakob
```

### Ohne Konto loslegen

Es gibt genau ein offenes deutsches Modell — eine Stimme, dafür sofort:

```powershell
python generate_orpheus.py --model Thorsten-Voice/tv-orpheus-v1 --probe "--probe-voices=-"
```

Fünf Sätze je Stimme in `probe/`. Klingt eine davon nach einer Figur —
eintragen in `voices.json`. Klingt alles nach Rauschen, steht die Ursache unten.

---

## Kokoro einrichten

```powershell
cd data\_authoring\voice-tools
uv venv .venv-kokoro --python 3.12
.venv-kokoro\Scripts\activate

uv pip install torch --index-url https://download.pytorch.org/whl/cu124
uv pip install -r requirements-kokoro.txt
```

espeak-ng installieren, dann in derselben Konsole:

```powershell
$env:PHONEMIZER_ESPEAK_LIBRARY = "C:\Program Files\eSpeak NG\libespeak-ng.dll"
```

Ohne diesen Verweis findet Kokoro die Lautschrift-Bibliothek nicht und bricht
bei manchen Sprachen ab. Soll es dauerhaft gelten, in die
Benutzer-Umgebungsvariablen eintragen.

Probe (englische Stimme, weil das die ist, die ohne Zusatz läuft):

```powershell
python generate_kokoro.py --probe --probe-text "Good morning, little captain!" --probe-voices af_heart
```

### Deutsche Kokoro-Stimme

Nur über einen lokal laufenden Server, weil die deutsche Nachschulung nicht in
der offiziellen Bibliothek steckt. Der Weg: einen Kokoro-Server mit dem Modell
`kikiri-tts/kikiri-german-martin` bzw. dessen ONNX-Fassung starten (Anleitung
liegt beim Modell), dann:

```powershell
python generate_kokoro.py --backend http --endpoint http://localhost:8880 --probe "Guten Morgen!" --probe-voices martin
```

🟡 Dieser Weg ist hier nicht ausprobiert. Wenn er sich als umständlich erweist:
Kokoro auf Fremdsprachen beschränken und Deutsch komplett über Orpheus fahren —
verloren geht dabei nur Geschwindigkeit bei Rohfassungen.

---

## Wenn es nicht geht

| Symptom | Ursache | Abhilfe |
|---|---|---|
| `CUDA out of memory` | Karte zu klein für bf16 | `--load-4bit`, dazu `bitsandbytes` installieren |
| Orpheus liefert Rauschen oder bricht mit „Generierung ist entgleist" ab | Wiederholungsbremse zu niedrig oder unbekannter Stimmname | `--repetition-penalty 1.3` lassen, Stimmnamen per `--probe` bestätigen |
| Orpheus stottert, wiederholt Silben | dasselbe | s. o. |
| Kokoro: `espeak` nicht gefunden | Umgebungsvariable fehlt | `PHONEMIZER_ESPEAK_LIBRARY` setzen |
| `--mp3` bricht ab | ffmpeg nicht im Suchpfad | ffmpeg installieren oder ohne `--mp3` laufen lassen |
| „Kein Weltenordner unter …" | falsches Arbeitsverzeichnis | aus `data/_authoring/voice-tools` heraus starten |
| „gated repo" / 401 | Modell zugangsbeschränkt | Konto, Zustimmung und `HF_TOKEN`, siehe oben — oder das offene Modell nehmen |
| 403 trotz gültigem Schlüssel | fein-granularer Schlüssel ohne Recht auf fremde beschränkte Modelle | Schlüssel vom Typ „Read" erzeugen, oder global „Read access to contents of all public gated repos" ankreuzen |
| `CUDNN_STATUS_SUBLIBRARY_VERSION_MISMATCH` | cuDNN-Teilbibliotheken passen nicht zusammen | schon abgefangen: das Skript schaltet cuDNN ab, weil nur der Ton-Decoder es überhaupt anfassen würde |
| Sehr langsam, Karte langweilt sich | Modell liegt auf dem Prozessor | `--device cuda`, `nvidia-smi` während des Laufs prüfen |

Ein einzelner Fehlschlag stoppt den Stapel nicht: die Zeile wird am Ende als
Fehler aufgelistet, alles andere läuft durch. Erneutes Starten holt genau die
fehlenden Dateien nach.
