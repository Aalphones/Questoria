# Handover: Questoria – Story-Lernabenteuer (Game-Flow, Sammelkarten & Druckbogen)

> **Wortgetreue Übernahme des Design-Handoffs** (Claude Design, 31.07.2026) — nur
> Projektname und Dateipfade sind auf den Repo-Stand angepasst. Wie dieses Dokument
> zum Projekt steht (was verbindlich ist, was Prototyp-Artefakt bleibt, welche
> Abweichungen zum Content-Schema gelten): [README.md](README.md).

## Überblick
Questoria ist ein Story-basiertes Lernspiel für Grundschulkinder (ca. 6–10 Jahre), inkl. nicht-lesender Kinder ("Vorlesen-Modus"). Der Prototyp zeigt den kompletten Spielfluss einer Themenwelt (Piratenwelt / Sachkunde) von der Profilauswahl bis zum Ergebnis-Screen, plus das **neue Sammelkarten-Feature** mit **Trophäenhalle**, **Kartendetail**, **Druckauswahl** und **A4-Druckbogen**.

Kernidee: Inhalte (Welten, Etappen, Orte, Dialoge, Quizfragen, Karten, Kartenbilder) kommen aus einem **Content-Paket (JSON + Bild-Assets)**. Die App ist die Engine – sie rendert, schaltet frei, zeigt an und druckt. Sie generiert keine Karten.

## Zu den Design-Dateien
Die Dateien in diesem Bundle sind **Design-Referenzen in HTML** – Prototypen, die Aussehen und Verhalten zeigen, **kein Produktionscode zum Kopieren**. Aufgabe ist, diese Designs in der Zielumgebung des Projekts (React/Next, Vue, Flutter, SwiftUI, …) mit deren etablierten Patterns und Libraries **nachzubauen**. Existiert noch keine Codebasis, wähle das passendste Framework für ein tablet-orientiertes, offline-fähiges Kinder-Lernspiel und implementiere die Designs dort.

Der Prototyp nutzt eine hauseigene Template-Runtime (`support.js`, `<sc-if>`, `<sc-for>`, `{{ }}`-Holes) und `image-slot.js` als **Bild-Platzhalter**. Beides ist reines Prototyping-Werkzeug: In der echten App werden daraus normale Komponenten mit `<img src>` bzw. dem Asset-Loader der Plattform.

## Fidelity
**High fidelity.** Farben, Typografie, Abstände, Radien, Schatten, Zustände und Copy sind final gemeint und sollen pixelnah übernommen werden – aber mit den Komponenten/Tokens der Zielcodebasis. Alle Werte stehen unten unter "Design Tokens".

Ausnahme: alle Bildflächen sind Platzhalter (gestrichelte Slots mit Dateinamen). Die realen Assets (Hintergründe, Sprites, Kartenbilder) liegen im Content-Paket und werden per Dateiname referenziert.

---

## Screens / Views

Zustandsmaschine `screen` mit den Werten:
`login → hub → level → timeline → map → dialog → minigame → result` plus die Nebenzweige `cards` (Trophäenhalle) und `print` (Druckbogen).

Zurück-Navigation (Back-Button in der HUD):
```
hub→login, level→hub, timeline→level, map→timeline,
dialog→map, minigame→dialog, result→map, cards→hub, print→cards
```

### 0. HUD (globale Kopfleiste)
Auf allen Screens außer `login` sichtbar.
- Sticky oben, `background: --color-surface`, `border-bottom: 1px solid --color-divider`, `box-shadow: --shadow-sm`, `padding: 13.2px 17.6px`, `gap: 13.2px`, `flex-wrap: wrap`, `z-index: 40`.
- **Zurück-Button**: Pill, `--color-neutral-100`, 17px, `min-height: 46px`, Chevron-left-Icon (24er Lucide-Grid, `stroke-width: 2.75`).
- **Profil-Chip**: 36px runder Avatar (conic-gradient Fallback) + Name in `--font-heading` 17px, Pill-Hintergrund `--color-neutral-100`.
- **Stufen-Tag**: `.tag.tag-accent`, 14px, mit 10px Raute (`rotate(45deg)`) in `--color-accent`. Text = gewählte Schwierigkeit oder "Stufe wählen".
- **Fortschritt**: 130×14px Bar, Track `--color-neutral-300`, Fill `--color-accent-2-500`, daneben Label `x/3` in `--color-accent-700`.
- **Modus-Umschalter**: Pill, 2px Border `--color-divider`, 34px runder Punkt (`--color-accent-2-600` im Bilder-Modus, `--color-accent-600` im Lesemodus) mit Glyphe `◉` bzw. `Aa`; Label "Bilder & Vorlesen" / "Selbst lesen".
- **Karten-Button (neu)**: Pill, Label zweizeilig – "Karten" (`--font-heading` 16px) über Zähler `owned / total` (12px, opacity .75). Icon: zwei gestapelte Rechtecke (15×21px, `rotate(-9deg)`, opacity .45 und 17×24px voll) in `currentColor`. **Aktiv-Zustand** (screen === 'cards'): Hintergrund `--color-accent-300`, Text `--color-accent-900`, Border `--color-accent-500`; sonst `--color-neutral-100` / `--color-text` / `--color-divider`. Hover: `translateY(-1px)` + `--shadow-sm`.
- **Ton-Button**: 46×46px, Lautsprecher-Icon mit/ohne Wellen; schaltet Sprachausgabe global an/aus (bricht laufende Ausgabe ab).

### 1. Profilauswahl (`login`)
- Vollflächig zentriert, dekorative Formen: Kreis 132px `--color-accent-300` (top 7 % / right 10 %), zwei "Wolken"-Pills (`--color-neutral-100/200`) mit `eqBob`-Animation, zwei überlappende Halbkreise unten (`--color-accent-2-400` / `-600`) als Wellen.
- Kicker-Tag "Story-Lernabenteuer" (uppercase, `letter-spacing: .14em`), H1 "Questoria" `clamp(52px, 8vw, 96px)` in `--color-accent-700`.
- Vorlese-Button (52px Kreis, `--color-accent-2-600`) + "Wer segelt heute mit?" (23px, 600).
- 3 Profilkarten à 220px: 108px runder Avatar-Slot, darunter Primary-Button mit Name (24px heading) + Untertitel (13px). Demo-Profile: **Mia** (Navigator), **Jonas** (Matrose), **Leyla** (Neu hier).
- Vierte Kachel "Neues Profil": 2px `dashed --color-neutral-400`, großes `+`.

### 2. Planetenkarte / Hub (`hub`)
Weltenauswahl als Karte, Positionen kommen aus dem JSON (`maps[kind=hub_map]`).
- Vollflächiger Hintergrund-Slot `map_planetenkarte.webp`.
- **Routen**: SVG-Layer, `viewBox="0 0 1600 900"`, `preserveAspectRatio="none"`. Jede Route ist ein quadratischer Bézier zwischen zwei Knoten mit Bauch `bow = min(110, len*0.18)` senkrecht zur Verbindung. Stil: `stroke-width: 7`, `stroke-dasharray: 16 22`, `stroke-linecap: round`, `vector-effect: non-scaling-stroke`. Farbe `--color-accent-500`, wenn beide Enden nicht `locked` sind, sonst `--color-neutral-400`.
- **Knoten**: absolut per `left/top` in Prozent, `translate(-50%,-50%)`, runder Bild-Slot in `size`px mit `box-shadow: 0 0 0 8px <ring>, --shadow-lg`. Ring: aktuell = `--color-accent-400` 75 %, gesperrt = `--color-neutral-100` 70 %. Aktueller Knoten mit `eqBob 5s`, gesperrte mit `opacity .72`.
- Darunter Label-Button (weiße Pill, Name 20px heading + Status 13px): "Offen · Etappe 2" (`--color-accent-700`) bzw. "Noch nicht freigespielt" (`--color-neutral-600`).
- Info-Panel oben links (halbtransparentes `--color-neutral-100` 90 %, `--radius-lg`, `--shadow-md`): Tag "Planetenkarte", H2 "Deine Themenwelten", Vorlese-Button, Hinweistext, Primary-CTA "Weiterspielen".
- Erfolge-Panel oben rechts: Liste mit 16px Rauten-Icons; gesperrte Badges mit `opacity .85` und Neutral-Farben.

### 3. Schwierigkeit (`level`)
Drei Karten à 266px, `--radius-lg × 1.15`, Hover `translateY(-4px)` + `--shadow-lg`:
| Stufe | Pips | Hintergrund | Text | Beschreibung (Lesemodus) |
|---|---|---|---|---|
| Matrose | 1 | `--color-accent-2-200` | `--color-accent-2-900` | "Leicht — kurze Aufgaben, viele Hinweise." |
| Navigator | 2 | `--color-accent-200` | `--color-accent-900` | "Mittel — mehr Auswahl, weniger Hilfe." |
| Kapitän | 3 | `--color-accent-500` | `--color-neutral-100` | "Schwer — eigene Antworten, kein Hinweis." |

Pips: 28×12px Pills, aktiv in `pipOn`, inaktiv in `pipOff` der Stufe. Im Bilder-Modus wird die Beschreibung auf ein Wort verkürzt ("Leicht"/"Mittel"/"Schwer").

### 4. Etappenkarte (`timeline`)
Seekarte der Story-Arcs (`maps[kind=arc_map]`), Hintergrund `--color-accent-2-300` + Gitternetz (`repeating-linear-gradient`, 2px Linien alle 58px, `--color-neutral-100` 42 %).
- Knoten = organische Inselformen (`border-radius` aus `shape`, z. B. `46% 56% 40% 60%`), Größe aus `width/height`. Füllung: erledigt `--color-accent-2-500`, aktuell `--color-accent-300`, gesperrt `--color-neutral-300`. Umriss `0 0 0 10px --color-accent-200 @70%` + `--shadow-md`.
- In der Insel ein 52px Kreis-Chip mit Etappennummer (heading 22px, weiß).
- Darunter Pill mit Etappenname + drei 12px Rauten als Sterne (`--color-accent-500` / `--color-neutral-300`).
- Panel oben links: Tag "Piratenwelt · Sachkunde", H2 "Die Reise der Windmühlen-Crew", Vorlese-Button, Hinweis.
- Legende unten rechts: "Jetzt dran" (`--color-accent-500`), "Geschafft" (`--color-accent-2-600`), "Verschlossen" (`--color-neutral-400`).

### 5. Ortskarte (`map`, "East Blue")
Gleiche Kartenmechanik (`maps[kind=location_map]`), zusätzlich:
- **Inseln** als reine Deko aus `islands[]` (Position %, Größe px, `shape`, Token-Farbe), mit `inset 0 -14px 26px --color-accent-2-900 @22%` als Küstenschatten.
- **Orte** als Punkte: aktuell 46px + `eqPulse 2s`, sonst 32px; Farbe erledigt/aktuell/gesperrt wie oben; weißer 6px Ring. Label als weiße Pill (16px heading).
- **Kompassrose** unten links: 100px weißer Kreis mit N/O/S/W und einer 10×54px Nadel (`linear-gradient(180deg, --color-accent-600 50%, --color-neutral-300 50%)`).
- Klick auf einen offenen Ort → `dialog`.

### 6. Dialog (`dialog`)
Visual-Novel-Layout.
- Hintergrund `--color-accent-2-200`, Deko-Kreise/Wolken, Wellen-Halbkreis `--color-accent-2-500`, Steg unten (150px, `repeating-linear-gradient` 48px `--color-accent-700` / 6px `--color-accent-800`), darüber Hintergrund-Slot `hafendamm.webp`.
- Zwei Sprite-Slots links/rechts, `min(28vw,286px) × min(46vh,392px)`, oben abgerundet. **Aktiver Sprecher**: volle Sättigung + `eqBob 3.4s/3.8s`; **inaktiv**: `saturate(.5) brightness(1.06) opacity(.75)`, keine Animation.
- Textbox: Card, `--shadow-lg`, Margin unten `35.2px`, klickbar (ganze Box = "Weiter"). Namensschild überlappt oben (`top: -13.2px`), Pill in `--color-accent-500` (links) bzw. `--color-accent-2-600` (rechts), weiß, heading 22px, seitlich an der Sprecherseite ausgerichtet.
- Dialogtext: 25px (600), im Großtext-Modus 30px, `max-width: 52ch`, `text-wrap: pretty`.
- Fußzeile: "Nochmal vorlesen"-Button (Pill `--color-accent-2-200`, 38px Icon-Kreis), Zähler `n / 4`, Primary-CTA "Weiter" bzw. "Minispiel starten" bei der letzten Zeile.
- Demo-Dialog: 4 Zeilen, Kapitän Ruben ↔ Nala, Thema Kompass/Himmelsrichtungen; Sprites `kapitaen_neutral.png`, `nala_froehlich.png`, `kapitaen_erstaunt.png`, `nala_zeigt.png`; optionale Audiodateien pro Zeile (`kapitaen_001.mp3`).

### 7. Minispiel (`minigame`, Multiple Choice)
- Zentrierte Card, `max-width: 940px`, `animation: eqPop .22s ease-out`, Hintergrundfläche `--color-accent-2-200`.
- Kopf: Tag "Minispiel · Multiple Choice" + Fortschrittspunkte (17px Kreise: erledigt `--color-accent-2-600`, aktuell `--color-accent-500`, offen `--color-neutral-300`).
- Frage: 60px Vorlese-Button + H2 `clamp(24px,2.6vw,34px)`, `max-width: 34ch`.
- Antworten: 2×2-Grid. Im **Bilder-Modus** über jedem Button ein Bild-Slot (`clamp(64px,12vh,140px)`, Dateiname aus dem Antworttext geslugt, z. B. `antwort_norden.png`); Schlüssel sind Ziffern `1–4`. Im **Lesemodus** ohne Bild, Schlüssel `A–D`.
- Antwort-Button: Pill, 2px Border, `min-height: clamp(60px,8vh,78px)`, 44px Schlüssel-Kreis, Label heading `clamp(18px,1.9vw,22px)`. Hover `translateY(-3px)`.
- **Auswertung** (nach dem ersten Klick gesperrt): richtige Antwort → `--color-accent-2-200` / Border `--color-accent-2-600` / Häkchen; falsch gewählte → `--color-accent-200` / Border `--color-accent-600` / Kreuz; übrige `opacity .6`.
- Feedback-Leiste (`eqRise .2s`): Titel "Richtig!"/"Fast!" (25px heading) + Erklärsatz + CTA "Nächste Frage" bzw. "Ergebnis".
- Demo-Quiz: 3 Fragen zu Himmelsrichtungen; korrekte Indizes 0, 1, 2.

### 8. Ergebnis (`result`)
- Konfetti: 10 absolut positionierte Rauten (11–18px, Akzentfarben, `eqBob` mit gestaffelter Dauer 3–6,6 s).
- Drei 68px Sterne (Rauten) mit `eqPop .3s` gestaffelt (0/0.12/0.24 s); gefüllt = `--color-accent-400`, sonst `--color-neutral-300`.
- H2 "Ort geschafft!" `clamp(32px,4.4vw,52px)`, Hinweistext, Vorlese-Button.
- Drei Statistik-Karten (min 196px): "Richtige Antworten" `x/3`, "Dialogzeilen gehört" `4`, "Neue Wörter gelernt" `3`.
- Erfolgs-Pill: 54px Raute `--color-accent-500` + Kicker "Neuer Erfolg" + "Erster Landgang".
- **Neue-Karte-Banner (neu, siehe unten).**
- CTAs: "Zurück zur Karte" (primary) und "Zur Karte der Etappen" (secondary).

---

## NEU: Sammelkarten-Feature

### Konzept
Sammelkarten sind **fertige Bilddateien** (PNG, 630 × 880 px = 63 × 88 mm bei 300 dpi), die außerhalb des Spiels erzeugt und mit dem Content-Paket ausgeliefert werden. Das Spiel **generiert keine Karten** – es schaltet frei, zeigt, wählt aus und druckt. Kartenformat steht im JSON:

```json
"card_format": { "width_mm": 63, "height_mm": 88, "canvas": [630,880], "dpi": 300, "sheet": "A4", "grid": [3,3] }
```

Kartendatensatz (`cards[]`):
```json
{ "id": "kompassrose", "name": "Die Kompassrose", "set": "Etappe 2 · East Blue",
  "rarity": "legendaer", "asset": "karte_kompassrose.png", "status": "locked",
  "earned": "", "flavor": "Norden, Osten, Süden, Westen – nie wieder verlaufen.",
  "hint": "Alle 3 Fragen im Windmühlen-Dorf lösen" }
```
- `status`: `owned` | `locked` (Startzustand aus dem Content; der Spielstand überschreibt ihn zur Laufzeit).
- `hint`: wird auf der verschlossenen Karte angezeigt ("wie komme ich da ran?").
- `set`: Gruppierungsschlüssel; die Halle gruppiert Karten in der Reihenfolge ihres ersten Auftretens nach `set`.

**Seltenheitsstufen** (Farbcodes):
| rarity | Label | Chip-BG | Chip-Text | Statuspunkt |
|---|---|---|---|---|
| `haeufig` | Häufig | `--color-neutral-200` | `--color-neutral-700` | `--color-neutral-500` |
| `selten` | Selten | `--color-accent-2-200` | `--color-accent-2-900` | `--color-accent-2-600` |
| `legendaer` | Legendär | `--color-accent-300` | `--color-accent-900` | `--color-accent-600` |

Verschlossene Karten zeigen immer Label "Noch verschlossen", `--color-neutral-600`, Punkt `--color-neutral-400`.

### 9a. Kartenvergabe im Spielfluss (Ergebnis-Screen)
Nach der letzten Quizfrage wird die Kartenvergabe ausgelöst: die Karten-ID wird dem Besitz hinzugefügt (idempotent) und als `newCard` gemerkt (im Prototyp fix `kompassrose`; produktiv kommt die ID aus der Episoden-Definition, z. B. `reward_card_id`).

**Banner "Neue Sammelkarte"** auf dem Ergebnis-Screen:
- Card, horizontal, `padding: 17.6px 26.4px`, `background: --color-neutral-100`, **3px Border `--color-accent-500`**, `animation: eqPop .34s ease-out .1s both`.
- Links das Kartenbild, 112px breit, `aspect-ratio: 63/88`, `--radius-md`, `--shadow-md`, dauerhaft `eqBob 4s`.
- Rechts: Rarity-Tag "Neue Sammelkarte · <Rarity>" (uppercase, 12px, `letter-spacing: .14em`, Farben aus der Rarity-Tabelle), Name (28px heading), Flavor-Text (16px/600, `--color-neutral-700`, `max-width: 34ch`), Primary-CTA **"In die Trophäenhalle"** → `screen = cards` (und `newCard` zurücksetzen).
- Wird nur gerendert, wenn `newCard` gesetzt ist.

### 9b. Trophäenhalle (`cards`)
Scrollbare Seite, `padding: 26.4px 26.4px 140px` (Platz für die schwebende Auswahlleiste), Hintergrund `--color-bg`.

**Kopfbereich** (zwei Spalten, umbrechend):
- Links: Tag "Trophäenhalle · Piratenwelt", H2 "Deine Sammelkarten" `clamp(30px,4vw,46px)`, 48px Vorlese-Button + Hinweistext. Hinweis ist modusabhängig: Bilder-Modus "Tippe auf eine Karte, die du schon hast.", Lesemodus "Karten kommen aus den Minispielen. Ausgewählte Karten kannst du auf DIN A4 ausdrucken."
- Rechts: Fortschrittskarte (min 280px, `--color-neutral-100`): große Zahl `owned` (40px heading, `--color-accent-700`) + "von N Karten", 14px Fortschrittsbalken (Track `--color-neutral-300`, Fill `--color-accent-2-500`, Breite = gerundetes Prozent), Fußnote "Neue Karten gibt es für gelöste Minispiele."

**Filter-Pills**: "Alle Karten" | "Freigespielt" | "Noch offen". Aktiv: `--color-accent-500` / weiß / Border `--color-accent-500`; inaktiv: `--color-neutral-100` / `--color-neutral-800` / Border `--color-divider`. `min-height: 48px`, 16px/700.

**Gruppen**: pro `set` eine Zeile aus Gruppenname (22px heading), Zähler ("3 Karten" / "1 Karte") und einer 2px-Trennlinie, die den Rest der Breite füllt.

**Kartenkachel** (184px breit, `flex-wrap`-Grid mit 17,6px Gap):
- Klickfläche: `aspect-ratio: 63/88`, `border-radius: --radius-md × 1.1`, **3px Border**: ausgewählt `--color-accent-600`, sonst besessen `--color-neutral-100`, gesperrt `--color-neutral-300`. Schatten `--shadow-md` nur bei Besitz. Hover `translateY(-4px)`. Cursor `pointer` nur bei Besitz.
- **Besessen**: Kartenbild füllt die Kachel (`asset`).
- **Gesperrt**: diagonales Streifenmuster `repeating-linear-gradient(135deg, --color-neutral-200 0 12px, --color-neutral-300 12px 24px)` + Vorhängeschloss-Piktogramm (44×36px Korpus `--color-neutral-500`, Bügel 26×24px mit 6px Border, oben abgerundet) + `hint`-Text (13px/700, zentriert, `--color-neutral-700`, Fallback "Spiele weiter, um sie zu finden").
- **Statuspunkt** oben links: 16px Kreis in der Rarity-Farbe, 3px weißer Halo.
- **Druck-Checkbox** oben rechts (nur bei besessenen Karten): 34×34px, `border-radius: 9px`, 2,5px Border, 3px weißer Halo, Hover `scale(1.08)`. Nicht gewählt: halbtransparentes Weiß, Border `--color-neutral-500`, leer. Gewählt: `--color-accent-600` gefüllt, weißes Häkchen (`stroke-width: 3.4`). Klick **stoppt die Propagation**, öffnet also nicht das Detail.
- Unter der Kachel: Name (17px heading, gesperrt in `--color-neutral-600`) und Rarity-Label (13px/700).

**Auswahlleiste** (nur bei ≥1 gewählter Karte): fixiert, unten zentriert, Pill, `--color-neutral-100`, 2px Border `--color-accent-500`, `--shadow-lg`, `z-index: 30`. Inhalt: "N Karten gewählt" (19px heading), Secondary "Auswahl leeren", Primary **"Druckbogen ansehen"** → `screen = print`.

**Kartendetail-Modal** (Klick auf eine besessene Karte): Overlay `--color-accent-2-900 @62 %`, Klick auf den Hintergrund schließt, Klick im Dialog stoppt die Propagation. Dialog: Card, `max-width: 820px`, `padding: 35.2px`, `gap: 35.2px`, `eqPop .2s`.
- Links Kartenbild `min(46vw,268px)`, `aspect-ratio: 63/88`, `--shadow-lg`.
- Rechts: Rarity-Tag, Name `clamp(26px,3vw,36px)`, Flavor (18px/600), Metablock (`--color-neutral-200`, `--radius-md`, 15px/600): "Fundort: <set>", "Erhalten: <earned|heute>", "Druckformat: 63 × 88 mm · 300 dpi".
- Buttons: Primary toggelt die Druckauswahl ("Zum Drucken auswählen" / "Aus Druckauswahl entfernen"), Secondary "Schließen".

### 9c. Druckbogen (`print`)
Ziel: Eltern/Lehrkräfte drucken die freigespielten Karten maßstabsgetreu auf DIN A4 aus und schneiden sie aus.

**Bildschirmansicht** (Hintergrund `--color-neutral-200`, scrollbar, zentriert):
- Werkzeugleiste (`data-noprint`), max. 900px breit: Titel "Druckbogen" (26px heading) + Zusammenfassung `"<N> Karten · <M> Blatt/Blätter DIN A4 · je 63 × 88 mm"`; Toggle **"Schnittmarken"**, Toggle **"Kartenabstand"**, Secondary "Zurück zur Halle", Primary **"Drucken / PDF"** (löst `window.print()` aus; in der Zielplattform der native Druck-/PDF-Export).
- Toggle-Zustände: aktiv `--color-accent-500` / weiß / Border `--color-accent-500`; inaktiv `--color-neutral-100` / `--color-neutral-800` / Border `--color-divider`. Beide Toggles sind standardmäßig: Schnittmarken **an**, Kartenabstand **aus**.

**Bogen-Geometrie (maßgeblich, in mm rechnen – nicht in px):**
- Blatt: `210mm × 297mm`, `box-sizing: border-box`, `padding: 12mm 10.5mm`, weißer Grund, auf dem Bildschirm mit `--shadow-lg`.
- Raster: `grid-template-columns: repeat(3, 63mm)`, `grid-template-rows: repeat(3, 88mm)`, `justify-content: center`, `align-content: center` → **9 Karten pro Blatt (3×3)**.
- Gap: `0mm` (Standard, Karten stoßen aneinander – eine Schnittlinie für zwei Karten) bzw. `3mm`, wenn "Kartenabstand" aktiv ist.
- Zelle: exakt `63mm × 88mm`, `overflow: hidden`, weiß. Kartenbild füllt die Zelle randlos (Bild ist bereits im Anschnittformat).
- Schnittmarken: `outline: 0.3mm dashed` – gefüllte Zellen `--color-neutral-500`, leere Zellen `--color-neutral-300`. Outline statt Border, damit die Zellgröße unberührt bleibt.

**Paginierung**: `pages = max(1, ceil(anzahlGewählterKarten / 9))`. Jede Seite hat immer 9 Slots; überzählige Slots bleiben leer (aber mit Schnittmarken, wenn aktiv). Reihenfolge = Reihenfolge der Auswahl.

**Druck-CSS** (Kern des Features – 1:1 sinngemäß übernehmen):
```css
@media print {
  @page { size: A4; margin: 0 }
  html, body { height: auto !important; overflow: visible !important; background: #fff !important }
  body * { visibility: hidden !important }
  [data-printsheet], [data-printsheet] * { visibility: visible !important }
  [data-printsheet] { position: absolute !important; left: 0; top: 0; gap: 0 !important }
  [data-printsheet] > div { box-shadow: none !important; page-break-after: always }
}
```
Wichtig für den Nachbau:
1. `@page { size: A4; margin: 0 }` – die 12/10,5 mm Rand kommen aus dem Padding des Bogens, **nicht** vom Druckertreiber; so bleibt das Raster exakt.
2. `visibility`-Trick statt `display: none`, damit das Layout des Bogens erhalten bleibt.
3. Jeder Bogen bekommt `page-break-after: always` → ein Blatt pro Seite.
4. Schatten im Druck entfernen.
5. Bilder müssen mit voller Auflösung (300 dpi Quelle) gedruckt werden – Farbmanagement/„Hintergrundgrafiken drucken" muss im Zielsystem aktiv sein.

In einer nativen App (iOS/Android) entspricht das einem PDF-Renderer, der A4-Seiten mit demselben mm-Raster erzeugt; die Bilder werden bei 300 dpi platziert (630 × 880 px pro Zelle).

---

## Interaktionen & Verhalten

**Vorlese-/Bilder-Modus** (`leseModus`, umschaltbar in der HUD)
- *Bilder & Vorlesen* (Default): kurze Sätze, Bildantworten im Quiz, Ziffern statt Buchstaben, **automatisches Vorlesen** beim Screenwechsel; Sprechrate 0.86.
- *Selbst lesen*: längere Texte, Buchstaben-Keys, Vorlesen nur auf Knopfdruck; Sprechrate 0.95.
- Sprachausgabe: `SpeechSynthesisUtterance`, `lang: de-DE`, `pitch: 1.05`; vor jeder neuen Ausgabe wird abgebrochen. In der Zielplattform: TTS-Service oder vorproduzierte Audiodateien (`audio`-Feld pro Dialogzeile).
- Autoplay-Trigger: Screen/Zeile/Frage/Antwort bilden einen Schlüssel; nur bei dessen Änderung wird gesprochen (kein Doppelsprechen bei Re-Renders).
- Der Ton-Button stoppt und unterdrückt jede Ausgabe.

**Animationen**
| Name | Definition | Verwendung |
|---|---|---|
| `eqPulse` | 2 s, `scale(1) → 1.14 → 1` | aktueller Ortspunkt |
| `eqBob` | `translateY(0 → -7px → 0)`, 3–11 s | Wolken, Inseln, Sprites, Karten, Konfetti |
| `eqPop` | `scale(.86)/opacity 0 → scale(1)/1` | Modals, Quizkarte, Sterne, Neue-Karte-Banner |
| `eqRise` | `translateY(14px)/0 → 0/1` | Quiz-Feedback |
| `eqTwinkle` | opacity .55↔1 mit `scale(.9→1.08)` | Dekor (reserviert) |

Alle Übergänge: Hover-Lift `translateY(-1…-4px)` + Schattenwechsel; keine langen Easing-Kurven, Default `ease-out`, 0.2–0.34 s.

**Touch-Ziele**: alle Buttons ≥ 46 px hoch, primäre CTAs 52–56 px. Fokus: `:focus-visible` mit 2px `--color-accent` Outline, Offset 2px.

## State
```
config      Content-JSON (async geladen; Fallback inline)
screen      login|hub|level|timeline|map|dialog|minigame|result|cards|print
profile     Index des gewählten Profils
level       matrose|navigator|kapitaen|null
node        aktueller Ort
line        Index der Dialogzeile
q, picked, correct    Quizfrage, gewählte Antwort (null = unbeantwortet), Trefferzahl
sound       Sprachausgabe an/aus
modeOverride  überschreibt den Lesemodus zur Laufzeit
owned       Array besessener Karten-IDs (null = aus Content ableiten)
sel         Array zum Drucken gewählter Karten-IDs
detail      geöffnete Karte im Modal (id|null)
filter      alle|offen|fehlt
newCard     gerade gewonnene Karte (id|null)
marks       Schnittmarken an/aus (default true)
cardGap     Kartenabstand 3mm an/aus (default false)
```
Persistenz (im Prototyp nicht umgesetzt, produktiv nötig): Profil, Fortschritt pro Etappe/Ort inkl. Sterne, `owned`, Erfolge, Modus- und Ton-Einstellung. `sel`, `detail`, `filter`, `newCard` sind flüchtig.

**Datenladen**: `fetch('data/world_piraten.json')` beim Mount; schlägt es fehl, greift ein identisch strukturierter Inline-Fallback. In der echten App: Content-Paket lokal bündeln/entpacken (offline-fähig), Schema wie in `data/world_piraten.json`.

## Design Tokens
Quelle: `ds/styles.css` (Design-System "Organic"). Auszug:

- **Basis**: bg `#f5ead8`, surface `#ebddc5`, text `#201e1d`, accent `#c67139`, accent-2 `#7a8a5e`, divider = text @16 %.
- **Neutral 100→900**: `#f9f4ed #eee7db #dcd3c4 #c0b6a5 #a19786 #82796a #645c50 #474238 #2e2b25`
- **Accent (Terrakotta) 100→900**: `#fff2eb #ffe1d0 #ffc6a5 #f6a06b #d67f48 #b2622d #8c491a #643312 #402310`
- **Accent-2 (Olive) 100→900**: `#f0fae1 #e1eecc #ccdbb2 #aebf92 #8fa073 #728157 #56633f #3d472b #272e1b`
- **Typo**: Headings `Caprasimo` 400; Body `Figtree` 400/600/700. Skala: h1 42, h2 32, h3 25, h4 20; Body 15px/1.55. Im Spiel bewusst größer (Dialog 25–30px, Antworten 18–22px, HUD 15–17px).
- **Spacing**: 4.4 / 8.8 / 13.2 / 17.6 / 26.4 / 35.2 px (`--space-1…8`).
- **Radien**: sm 8, md 16, lg 28; Cards/Dialoge `lg × 1.15`; Buttons/Tags/Inputs `999px`.
- **Schatten**: sm `0 1px 2px #2e2b25@14%`, md `0 3px 10px @16%`, lg `0 12px 32px @22%`.
- **Karten-/Druckmaße**: Karte 63 × 88 mm (Seitenverhältnis 63/88), 630 × 880 px @300 dpi; Bogen A4 210 × 297 mm, Padding 12 mm oben/unten, 10,5 mm seitlich, Raster 3×3, Gap 0 oder 3 mm, Schnittmarken 0,3 mm gestrichelt.

## Assets
Alle Bilder sind im Prototyp **Platzhalter** (`image-slot`), benannt wie die erwarteten Dateien im Content-Paket:
- Avatare: `avatar_mia.png`, `avatar_jonas.png`, `avatar_leyla.png`
- Weltkacheln: `welt_piraten.webp`, `welt_sterne.webp`, `welt_antike.webp`
- Karten-Hintergründe: `map_planetenkarte.webp`, `map_ostmeer_uebersicht.webp`, `map_east_blue.webp`
- Etappen-Illustrationen: `ep_01.webp` … `ep_06.webp`
- Szenenhintergrund: `hafendamm.webp`
- Sprites: `kapitaen_neutral.png`, `kapitaen_erstaunt.png`, `nala_neutral.png`, `nala_froehlich.png`, `nala_zeigt.png`
- Quiz-Bildantworten: `antwort_<slug>.png` (Slug aus dem Antworttext: Kleinbuchstaben, Umlaute → ae/oe/ue/ss, Rest → `_`)
- **Sammelkarten**: `karte_<id>.png`, 630 × 880 px, 300 dpi — 12 Stück, siehe `data/world_piraten.json`
- Optionale Sprachaufnahmen pro Dialogzeile, z. B. `kapitaen_001.mp3`

Icons sind Lucide-Style-Strichzeichnungen auf 24er Grid mit `stroke-width: 2.75`, `stroke-linecap/linejoin: round` (Chevron, Lautsprecher, Häkchen, Kreuz). Dekorative Formen (Sterne, Schloss, Kompass, Kartenstapel) sind bewusst aus CSS-Primitiven gebaut, nicht aus SVG-Illustrationen.

## Dateien in diesem Bundle
- `prototype/index.html` — der vollständige interaktive Prototyp (alle 10 Screens)
- `prototype/ds/styles.css` — Design-System-Tokens und Basisklassen (Quelle der Wahrheit für Farben/Typo/Spacing)
- `prototype/data/world_piraten.json` — Beispiel-Content des Prototyps; **nicht** das verbindliche Content-Schema, siehe [README.md](README.md)
- `prototype/image-slot.js`, `prototype/support.js` — Prototyping-Runtime (Bild-Platzhalter und Template-Engine); **nicht** nachbauen, nur damit der Prototyp lokal läuft
- Die zugrunde liegenden Konzeptdokumente liegen im Repo: [Ursprungskonzept](../archive/2026-07/EduQuest_Engine_MVP_Konzept.md), [Content-Schema](../../data/_authoring/JSON_SCHEMA_REFERENCE.md), [Asset-Vorgaben](../../data/_authoring/ASSET_REQUIREMENTS.md)

Prototyp lokal starten: `npx serve docs/design/prototype` und `index.html` öffnen — per `file://` schlägt das JSON-Laden fehl (der Inline-Fallback greift dann).
