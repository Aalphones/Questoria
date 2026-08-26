# Phase 6 — Assets erzeugen

**Rating:** standard (Bildarbeit, kein Angular-Code)

## Kontext

- Skill `krea2-bilder` (lokal, ComfyUI/`comfy`-MCP) — Standardweg für
  Hintergründe/Karten **und** für die neuen Stations-PNGs (Gebäude/Orte,
  keine Figuren mit Emotionsset — `flux2-bilder` ist für Charakter-Sprites
  gedacht und hier nur einschlägig, falls eine Station ausnahmsweise eine
  wiederkehrende Figur zeigen soll).
- Phase 5 → Kachel-/Stationstabelle — Quelle für Layout und Datei-Liste
  dieser Phase.
- `data/_authoring/ASSET_REQUIREMENTS.md` Abschnitt 4 (Map-Grafiken) — wird
  aktualisiert.
- **Tiled-Upscale-Workflow `Upscale Map`** — liegt seit 26.08.2026 vor und ist
  erprobt. Er skaliert um Faktor 4 (`4x_foolhardy_Remacri`), zerlegt in
  1024er-Kacheln mit 128 Überlappung, schärft jede Kachel mit FLUX.2 klein 9B
  nach und setzt sie wieder zusammen. Sein Kachel-Prompt ist auf Karten
  geschrieben und verbietet Neuerfindung ausdrücklich.
- **Die richtige ComfyUI-Instanz ist `F:\Comfy-Desktop\`** (STATE.md). Die
  gespeicherten Workflows der laufenden Instanz holt man über
  `http://127.0.0.1:8188/api/userdata?dir=workflows`, nicht aus dem Ordner, auf
  den der `comfy`-MCP-Server per Voreinstellung zeigt.

## Ziel dieser Phase

**Nicht** jede Kachel einzeln generieren — unabhängig erzeugte Kacheln haben
keinen Grund, an ihren Rändern zusammenzupassen (andere Bäume, anderer Weg,
andere Beleuchtung genau an der Kante). Stattdessen wird pro **zusammen-
hängend geplantem Kartenausschnitt** („Batch") **eine große, durchgängige
Szene** erzeugt — mit einem Tiled-Upscale-Workflow auf hohe Auflösung
gebracht, damit sie trotzdem scharf bleibt — und danach in die einzelnen
1024×1024-Ausliefer-Kacheln **zerschnitten**. Innerhalb eines Batches sind
die Kachelränder dadurch garantiert nahtlos, weil sie aus **einem** Bild
stammen. Ein späterer Ausbau (z. B. Marmoria City) bekommt seinen eigenen
Batch — nur die eine Naht zwischen zwei Batches ist nicht automatisch
perfekt, das lässt sich mit keinem Ansatz vermeiden, der offen erweiterbar
bleiben soll.

Jede der 14 Alabastia-Stationen bekommt zusätzlich ein eigenes,
freigestelltes PNG-Sprite (unabhängig vom Batch-Hintergrund — ein Gebäude/
eine Figur muss nicht mit ihren Nachbarn nahtlos verschmelzen, sie liegt als
eigene Ebene obendrauf).

## Batches für diese Phase (neu gefasst 26.08.2026)

> 🔴 **Die frühere Fassung dieser Tabelle war in zwei Punkten falsch.** Erstens
> rechnete sie die Ortskarten-Leinwand als „3×2 Kachel-Felder = 6144×2048" —
> 3 Spalten × 1024 sind **3072**, nicht 6144; die Breite war verdoppelt, die
> Höhe nicht. Zweitens kannte sie nur eine Ortskarte und je eine Einzelkachel
> für Planeten- und Weltenkarte. Beides ist mit der Drei-Ebenen-Struktur vom
> 26.08.2026 hinfällig (README → „Drei Kartenebenen").

| Batch | Leinwand | Ausliefer-Kacheln |
|---|---|---|
| **Planetenkarte** (`MainHub`) | 8192×8192 (8×8 Felder) | vorerst nur `{0,0}` |
| **Weltenkarte Kanto** (`arc_overview`) | 8192×8192 (8×8 Felder) | vorerst nur `{0,0}` |
| **Gebietskarte Alabastia** | 2048×1024 (2×1 Felder) | `alabastia` `{0,0}`, `route_1` `{0,1}` |
| **Gebietskarte Vertania** | 2048×2048 (2×2 Felder) | `vertania_city` `{0,0}`, `vertania_wald` `{-1,0}` |

**Bei der Gebietskarte Vertania werden nur zwei der vier Felder ausgeliefert.**
Die beiden unbenutzten (`{-1,1}` und `{0,1}`) werden in der Leinwand trotzdem
mitgemalt — als natürliche Umgebung, die im Spiel nie als eigene Kachel
auftaucht — und nach dem Zuschneiden verworfen. Sie sind Kontext für eine
stimmige Komposition, kein Ausliefer-Asset.

**Bei den beiden 8192er-Karten gilt dasselbe in groß:** die volle Leinwand wird
erzeugt, ausgeliefert wird nur `{0,0}`. Die Leinwand ist der Grund, warum eine
später aufgedeckte Kachel ohne neue Bildarbeit an ihre Nachbarn anschließt; sie
bleibt als Quellartefakt unter `data/_authoring/` liegen und wandert **nicht**
mit ins Spiel.

## Erzeugungsweg für die 8192er-Leinwände (entschieden 26.08.2026, Sascha)

**In 2048×2048 erzeugen, einmal um Faktor 4 hochskalieren.** Nicht in 1024
erzeugen und zweimal hochskalieren.

| | 2048 + ein Durchgang (gewählt) | 1024 + zwei Durchgänge |
|---|---|---|
| Modellbereich | Krea 2 Turbo ist bis 2k trainiert — 2048 ist sein oberes Ende, noch im gelernten Bereich | 1024 ist bequem, aber die Komposition ganz Kantos auf 1024 px zu planen ist eng |
| Zielgröße | 2048 × 4 = **8192 exakt**, kein Zwischenskalieren | 1024 → 4096 → 16384, muss halbiert werden — bezahltes Detail wird weggeworfen |
| Stiltreue | ein Nachschärf-Durchgang, eine Gelegenheit zum Abdriften | zwei Durchgänge, zweimal Neuerfindung trotz Verbot im Prompt |
| Rechenzeit | 64 Kacheln durch FLUX.2 | rund das Doppelte |

**Rückfallebene:** Fällt Krea 2 bei 2048×2048 kompositorisch auseinander
(erkennbar an verdoppelten Landmarken oder zerfallender Geografie), dann der
Weg über 1024 mit zwei Durchgängen. Das kostet ein Testbild, keine Stunde —
also **vor** der ersten großen Leinwand einmal prüfen.

**Gemessene Grundlage:** 3072×2048 (12 Kacheln) brauchen mit
`Upscale Map` rund vier Minuten. Eine 8192×8192-Leinwand liegt damit bei knapp
einer Stunde.

## ✅ Kartenverfahren — entschieden am 26.08.2026: Weg C

**Die Karte ist Untergrund, alle Bauwerke liegen als eigene Sprites obendrauf.**
Begründung und Reichweite: README → „Gebäude gehören nicht in die Karte". Kurz:
dieselbe Kachel muss zeigen können, dass ein Ort verschlossen ist, und später,
dass er offen ist — ein eingemaltes Gebäude kann das nicht.

**Folge für jeden Karten-Prompt:** nur Gelände — Wiese, Wald, Wege, Wasser,
Küste, Fels, Gebirge. **Keine** Häuser, Ortschaften, Türme, Brücken, Zäune um
Grundstücke, keine Bauwerke jeder Art. Gehört in den Positiv- **und** in den
Negativ-Prompt.

🟡 **Belegter Anlass:** Der Probelauf vom 26.08.2026 (Vorlage
`map_route_1.webp`) hat ein bestehendes Gebäude aus der alten Karte brav
mitverfeinert — genau der Zustand, den Weg C ausschließt. Die alten Karten aus
dem Bestand taugen deshalb **nicht** als Vorlage, sondern nur als Stilreferenz.

**Der Tiled-Upscale-Teil der Frage hat sich erledigt:** Der Workflow
`Upscale Map` liegt vor und ist erprobt (siehe Report-Back). ChatGPT als
Entwurfsquelle wird damit nicht gebraucht — lokal erzeugt und lokal veredelt
reicht.

<details>
<summary>Ursprüngliche Entscheidungsvorlage vom 23.08.2026 (historisch)</summary>

Sascha am 23.08.2026: *„Speziell bei der Karte können wir uns ja auch überlegen
eine detailliertere Karte mit ChatGPT zu erstellen und dann mit Tiled Upscale
und Flux 2 oder Krea 2 hochskalieren und mehr Details ergänzen. Lass uns das in
Phase 6 gemeinsam ausloten."*

Zur Entscheidung standen drei Wege:

| Weg | Grundlage | Wofür er spricht | Wogegen |
|---|---|---|---|
| **A — komplett lokal** | Krea 2 Turbo erzeugt die Leinwand, Tiled Upscale schärft sie | eine Kette, ein Stil, keine Handarbeit dazwischen | Krea 2 hält eine 3×2-Kachel-Komposition mit vier benannten Orten kaum zusammen |
| **B — ChatGPT als Entwurf, lokal veredelt** | ChatGPT/GPT Image zeichnet die Gesamtkomposition, Tiled Upscale + Flux 2 oder Krea 2 bringen Auflösung und Details | GPT Image plant Bildaufbau über eine große Fläche deutlich verlässlicher | Stilbruch zum Rest der Welt; GPT Image lehnt geschützte Figuren unvorhersehbar ab (`SPRITES.md`) — bei einer reinen Landschaftskarte ohne Pokémon aber unkritisch |
| **C — Entwurf grob, Details als eigene Ebene** | Karte bleibt schlichter Untergrund, die Detailfülle kommt aus den Stations-Sprites obendrauf | Details lassen sich einzeln ändern, ohne die Karte neu zu erzeugen; ein Ort verrutscht → nur ein PNG wandert | die Karte selbst bleibt vergleichsweise leer |

Die damals offenen Vorfragen sind alle beantwortet: der Tiled-Upscale-Workflow
liegt vor (`Upscale Map`), die richtige Instanz ist `F:\Comfy-Desktop\` (nicht
das nie existierende `B:\`), und der Probelauf ist gelaufen.

</details>

**ADR:** Weg C wird als ADR-021 festgehalten (Karten tragen kein Bauwerk).

## ✅ Freistell-Werkzeug — erledigt am 26.08.2026

Die 14 Stations-Sprites laufen durch dasselbe `cutout.py` wie die Figuren.
[Phase 7](phase-7-figuren-und-aufgabenbilder.md) Teil A wurde deshalb
vorgezogen und ist umgesetzt — inklusive der Korrektur, dass der Fehler kein
Loch ist, sondern eine **durchscheinende** Fläche (Alpha 9–64). Details dort.
Die Sprites dieser Phase können also ohne Nacharbeit durchlaufen.

## Auflösungsvorgaben

| Asset | Format | Größe |
|---|---|---|
| Krea-2-Entwurf (Zwischenschritt) | intern | ein Viertel der Zielleinwand je Kante — 2048×2048 für eine 8192er Karte, 512×256 für die Gebietskarte Alabastia |
| Batch-Leinwand nach dem Hochskalieren | intern, Quellartefakt unter `data/_authoring/` | Bounding-Box in 1024er-Vielfachen, siehe Batch-Tabelle oben |
| Ausliefer-Kachel (nach dem Zerschneiden) | `.webp` | exakt 1024×1024 je Kachel |
| Stations-Sprite | `.png` mit Alpha | Freigestelltes Einzelmotiv, Ausgabegröße 512×512 (Erzeugung in Modell-Nativgröße, danach verkleinert — dieselbe Kette wie bei Lernstufen-Bildern, ADR-018) |
| Orts-Sprite auf der Weltenkarte | `.png` mit Alpha | Alabastia und Vertania City als eigene Bauwerk-Sprites, 512×512 — **neu**, ergibt sich aus Weg C |

🟡 **Der Krea-2-Entwurf ist bewusst klein.** Die Kette skaliert um Faktor 4;
wer den Entwurf größer macht, überschießt die Zielgröße und muss verkleinern —
und wirft damit genau die Schärfe weg, für die der Umweg gebaut wurde.

## Umsetzung

**Reihenfolge der vier Batches: Gebietskarten zuerst.** Ihr Inhalt steht heute
vollständig fest (Phase 5), sie sind klein, und sie sind das einzige, was für
eine Abnahme am Bildschirm gebraucht wird. Die beiden 8192er-Karten kommen
danach.

0. **Auflösungs-Testbild:** eine Kanto-Komposition mit Krea 2 in 2048×2048
   erzeugen und ansehen — hält sie zusammen, oder verdoppeln sich Landmarken?
   Entscheidet zwischen dem gewählten Weg und der Rückfallebene über 1024.
   Ein Bild, ein paar Minuten.
1. Pro Batch: **einen** Prompt für die gesamte Szene formulieren (welches
   Gelände liegt wo in der Leinwand, welcher Übergang zwischen den Feldern —
   z. B. Weg, der von `alabastia` nach `route_1` hinüberläuft, Wald, der
   `vertania_city` nach Norden umschließt). **Nur Gelände, keine Bauwerke**
   (Weg C, Abschnitt oben) — auch nicht „ein kleines Dorf am Horizont".
   `krea2-bilder`-Skill nutzen.
2. Leinwand mit `Upscale Map` um Faktor 4 auf die Zielgröße bringen. Vor dem
   Lauf prüfen: Upscale-Modell ausgewählt, und `GetImageSize` misst das
   **hochskalierte** Bild, nicht das Eingangsbild (beides war im gelieferten
   Stand vom 26.08.2026 offen, siehe Report-Back).
3. Leinwand an den Kachel-Grenzen zerschneiden (`row`/`col` × 1024 als
   Ausschnitt-Offset), nur die tatsächlich gebrauchten Kacheln als Dateien
   speichern, unbenutzte Felder verwerfen. Leinwand als Quellartefakt behalten.
4. Für jede der 14 Stationen: eigenes freigestelltes Sprite,
   `krea2-bilder`-Skill (oder `flux2-bilder` nur bei wiederkehrender Figur).
   Dazu **zwei Orts-Sprites** für Alabastia und Vertania City auf der
   Weltenkarte.
5. Dateien unter den in Phase 5 vergebenen Namen ablegen
   (`data/hub/`, `data/themes/pokemon/maps/`).
6. `ASSET_REQUIREMENTS.md` Abschnitt 4 aktualisieren, drei Punkte:
   - **Batch-Prinzip**: „Kacheln, die aneinandergrenzen, gemeinsam als eine
     Leinwand erzeugen und zerschneiden — nie eine Kachel isoliert generieren,
     wenn sie Nachbarn hat, mit denen ihr Rand zusammenpassen muss."
   - **Gebäudeverbot**: Karten tragen nur Gelände, Bauwerke sind Sprites.
   - **Erzeugungsweg**: Entwurf in einem Viertel der Zielkantenlänge, ein
     Durchgang `Upscale Map`.

## Akzeptanzkriterien

1. Alle Ausliefer-Kacheln liegen vor, exakt 1024×1024: 2 für die Gebietskarte
   Alabastia, 2 für Vertania, je 1 für Planeten- und Weltenkarte.
2. Die Übergänge zwischen benachbarten Kacheln (`alabastia`↔`route_1`,
   `vertania_city`↔`vertania_wald`) sind nahtlos — Sichtprüfung am Bildschirm
   bei Zoom auf die jeweilige Kachelgrenze, kein sichtbarer Bruch in Weg,
   Vegetation oder Licht.
3. Alle 14 Stations-Sprites liegen vor, freigestellt, an der von Phase 5
   vergebenen Datei-Adresse — dazu die zwei Orts-Sprites der Weltenkarte.
4. **Auf keiner Kartenleinwand ist ein Bauwerk eingemalt.** Prüfung: Leinwand
   ohne Sprites ansehen — sie muss wie unbewohntes Gelände aussehen.
5. `ASSET_REQUIREMENTS.md` beschreibt Batch-Prinzip, Gebäudeverbot und
   Erzeugungsweg.
6. Die Karte hält beim Hineinzoomen bis auf Kachel-Nativgröße stand — beim
   maximalen Zoom sind noch Details zu sehen, kein Weichzeichner-Matsch. Das
   war der Anlass für den Tiled-Upscale-Umweg.
7. Die beiden 8192×8192-Leinwände liegen vollständig unter `data/_authoring/`
   und sind **nicht** mit deployt worden.
8. `deploy.cmd content` einmal durchgeführt.

## Report-Back

### Schritt 0 — Auflösungstest bestanden (26.08.2026)

**Ergebnis: Krea 2 Turbo hält eine 2048×2048-Komposition zusammen.** Der
gewählte Weg (2048 erzeugen, einmal um Faktor 4 hochskalieren) ist damit
bestätigt, die Rückfallebene über 1024 wird nicht gebraucht. Die Geografie ist
zusammenhängend — Gebirge im Norden, Waldgürtel, Wiesen mit Flusslauf und
Teichen, Trampelpfade, Küste mit Strand im Süden und Osten. Keine verdoppelten
Landmarken, kein Zerfallen. Und: **kein einziges Bauwerk**, das Verbot aus Weg C
hat auf Anhieb gegriffen.

### Stil-Rezept steht (26.08.2026, nach drei Läufen von Sascha abgenommen)

Der erste Testlauf war **nicht orthografisch von oben**, sondern leicht
perspektivisch — Horizont oben, ein Grasbüschel in Vordergrund-Größe links
unten. Für eine Rasterkarte ist das ein echtes Problem: Kacheln müssen denselben
Maßstab haben, sonst passen Norden und Süden nicht zusammen, egal wie sauber die
Naht ist.

**Zwei Hebel haben es gelöst**, beide gemessen an aufeinanderfolgenden Läufen:

1. **Die Bäume.** Solange das Modell sie mit Stamm von der Seite malt, entsteht
   automatisch ein Horizont. Die Vorgabe „Kronen von oben, keine Stämme, keine
   Seiten sichtbar" hat die Perspektive in einem Lauf beseitigt.
2. **Die Felswände.** Lauf 2 war top-down, malte aber Klippen als Seitenansicht
   — das verrät eine Blickrichtung und liest sich am Bildrand als „hier endet
   die Welt", ausgerechnet dort, wo Nachbarkacheln anschließen. Behoben durch
   „keine senkrechten Flächen, Höhe nur als umrissene Kante und Farbstufe von
   oben" plus „Gelände läuft flach bis an alle vier Bildränder".

**Der erprobte Prompt steht als Standard-Vorlage in
[`image-prompts/MAPS.md`](../../../data/_authoring/image-prompts/MAPS.md)**,
zusammen mit den beiden Bedienfallen des Krea2-Workflows. Die beiden alten
Vorlagen dort sind als überholt markiert — sie sind auf 16:9 geschrieben und
beschreiben Bauwerke als Landmarken, was Weg C ausschließt.

### Zwei Fallen im `Krea2 Txt2Img`-Workflow (Zeitverlust: ein Fehllauf)

- **Die Größe kommt aus `ResolutionSelector` (Knoten 49)**, nicht aus dem
  `EmptyLatentImage` — dessen Breite/Höhe sind vom Selector überschrieben. Und
  dessen „Megapixel" rechnen in Einheiten von **1024²**, nicht 1.000.000: 4.19
  ergibt 2096, für exakt 2048×2048 ist der Wert **4.0**.
- **Der Prompt gehört in Knoten 19** (`30/19.value`), nicht in das
  `CLIPTextEncode`-Widget (`30/6.text`) — letzteres ist tot. Setzt man das
  falsche, läuft der zuletzt dort stehende Prompt durch, ohne Fehlermeldung.
  **Kontrolle:** die Antwort des Laufs enthält unter `text_outputs` den
  tatsächlich benutzten Text — vor dem Ansehen des Bildes dort nachlesen, ob
  der eigene Prompt drinsteht.

### Gebietskarte Alabastia liegt (26.08.2026)

Die erste der vier Leinwände ist durch. Ausgeliefert:
`data/themes/pokemon/maps/map_alabastia.webp` und `map_route_1.webp`, beide
exakt 1024×1024. Quellleinwand:
`data/_authoring/map-canvases/gebiet_alabastia_2048x1024.png`.

🟡 **`map_route_1.webp` wurde überschrieben** — an dem Namen lag die alte
16:9-Karte aus dem Bestand. Das ist die Bestellung aus Phase 5, kein Versehen;
der alte Stand liegt nur noch in der Drive-Versionierung.

**Drei Vorgaben des Plans haben in der Praxis nicht getragen** — alle drei sind
in [`image-prompts/MAPS.md`](../../../data/_authoring/image-prompts/MAPS.md)
nachgezogen, damit die nächsten drei Leinwände nicht dieselbe Runde drehen:

1. **Es gibt kein 2:1.** Der `ResolutionSelector` kennt nur 1:1, 2:3, 3:2, 3:4,
   4:3, 9:16, 16:9, 21:9 — eine 2×1-Kachel-Leinwand ist aber exakt 2:1. Weg:
   in 16:9 entwerfen, **nach** dem Hochskalieren mittig auf die Zielhöhe
   stutzen. Betrifft nur Alabastia; Vertania (2×2) und die beiden 8192er sind
   quadratisch.
2. **Die Viertel-Regel hat eine Untergrenze.** Für Alabastia hätte sie einen
   Entwurf von 512×288 ergeben (0,14 MP). Zwei Läufe dort haben erfundene
   Strukturen und eine harte Farbkante mitten im Bild geliefert. Ab 1024×576
   (0,56 MP) war es sofort sauber. Der Weg für kleine Karten ist deshalb:
   in 1024er-Breite entwerfen, ×4 hochskalieren, am Ende auf die Zielgröße
   herunterrechnen. Herunterrechnen **nach** dem Nachschärfen kostet keine
   Schärfe — der Warnhinweis im Abschnitt „Auflösungsvorgaben" meint den
   anderen Fall (groß erzeugen *statt* hochskalieren) und bleibt gültig.
3. **Eigene Verbotssätze holen genau das ins Bild, was sie fernhalten sollen.**
   Lauf 1 hatte eine hölzerne Uferbefestigung am Strand. Der Nachbesserungs-
   versuch „no retaining walls, no wooden planks, no boardwalks, no piers, no
   seawalls" hat die Bretterwand in Lauf 3 quer durchs Bild und um den Teich
   gezogen — Krea 2 fährt ohne Führung und hat keinen Negativ-Zweig, jedes
   Wort ist eine Bestellung. Erst die **positive** Umformulierung („every edge
   soft, organic and grown rather than made") war die Lösung. Die
   Verbotszeilen der erprobten Vorlage selbst bleiben unangetastet.

**Ablage der Leinwände geklärt:** `data/_authoring/` liegt in Git und trug
bisher nur Markdown und drei Skripte. Die Leinwände gehen deshalb nach
`data/_authoring/map-canvases/` und der Ordner steht in `.gitignore` — AK 7
greift („liegt unter `_authoring/`", `deploy.cmd content` spart `_authoring/`
ohnehin aus), das Repo bleibt schlank. 🟡 Preis: die Leinwände liegen nur
lokal, nicht im Drive-Backup. Regenerierbar, aber die beiden 8192er kosten
je knapp eine Stunde.

### Gebietskarte Vertania liegt, und der Ablauf hat ein viertes Loch (26.08.2026)

Ausgeliefert: `map_vertania_wald.webp` (oben, `{-1,0}`) und
`map_vertania_city.webp` (unten, `{0,0}`), Quellleinwand
`gebiet_vertania_2048x2048.png`. Damit sind **alle vier Spiel-Kacheln da**.

Zwei Läufe waren nötig, beide am selben Punkt: das Modell malt dichten Wald
mit **Stämmen von der Seite** und viel zu großen Kronen. Der Hebel war nicht
die Formulierung der Blickrichtung, sondern der **Maßstab** — „jede Krone nur
ein winziger runder Fleck, etwa ein Vierzigstel der Bildbreite, viele hundert
davon". Ohne diesen Anker wären die Bäume der Gebietskarte Vertania fünfmal so
groß gewesen wie die von Alabastia; auf zwei Karten derselben Ebene ist das ein
sichtbarer Bruch. Steht in `MAPS.md`.

### 🔴 Der Kachel-Nachschärfer erzeugt ein Gitternetz (26.08.2026, von Sascha am Bildschirm gemeldet)

`Upscale Map` allein liefert **keine** brauchbare Leinwand. Beim Zusammensetzen
stößt er die nachgeschärften Kacheln **auf Stoß statt sie zu überblenden**;
jede Kachel trägt vom Dekodieren einen Rand, und diese Ränder reihen sich zu
geraden Linien über die ganze Leinwand — im Raster `Kachelgröße − Überlappung`,
bei den Vorgabewerten alle 896 px. Auf einer Karte liest sich das als
aufgedrucktes Gitternetz.

**Durchgemessen, was nicht hilft** (jeweils Gradient über die volle Bildhöhe,
Nahtpositionen numerisch bestimmt statt geschätzt):

| Versuch | Ergebnis |
|---|---|
| Überlappung 128 → 320 | Linien wandern ins 704er-Raster, bleiben |
| `denoise` 0,5 → 0,25 | **kommt gar nicht an** — der Regler liegt im Knotenpaket, comfy-cli liefert dieselbe Datei zurück. Nur Regler außerhalb des Pakets wirken |
| grobe Töne aus einem nahtlosen Durchgang übernehmen | Linien stehen unverändert — es ist kein Tonwertsprung |
| Kachel-Durchgang ganz weglassen | nahtlos, aber beim Hineinzoomen matschig → reißt AK 6 |

**Gelöst durch einen dritten Lauf plus ein Werkzeug:** derselbe Entwurf wird
zusätzlich **rein** hochskaliert (vier Knoten, direkt an die Schnittstelle,
Sekunden) — nahtlos, aber weich. `data/_authoring/image-tools/heal_map_seams.py`
setzt daraus genau die ein bis zwei Pixel je Linie ein, vorher im Tonwert an die
Umgebung angeglichen. Danach ist im 896er-Raster kein Treffer mehr messbar, und
Papierkörnung, Sandstreifen und Linienführung stehen unangetastet. Der ganze
Ablauf ist in `MAPS.md` unter „Hochskalieren — drei Läufe, nicht einer"
beschrieben; die Werkzeuge (`heal_map_seams.py`, `slice_map.py`) liegen im
Repo.

🟡 **Was das Werkzeug nicht kann:** Es findet die Linien über ihre Stärke und
darüber, dass sie durch das ganze Bild laufen. Eine Naht, die zufällig genau
auf einer langen geraden Bildkante liegt, würde es nicht von ihr unterscheiden.
Auf organisch gezeichneten Karten ist das kein Fall, auf einer Karte mit
langen geraden Kanten (Stadtplan, Raster) wäre vorher hinzusehen.

### Was noch offen ist

- Zwei Batch-Leinwände: Weltenkarte (8192×8192) → Planetenkarte (8192×8192).
- 14 Stations-Sprites + 2 Orts-Sprites.
- ADR-021 und `ASSET_REQUIREMENTS.md` Abschnitt 4.
