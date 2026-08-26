# Phase 7 — Figuren- und Aufgabenbilder neu

**Rating:** standard (ein kleiner Code-Block im Freistell-Werkzeug, sonst
Bildarbeit)

Diese Phase ist am 23.08.2026 dazugekommen (Sascha). Sie hängt inhaltlich an
Phase 5 (welche Aufgaben es überhaupt gibt) und ist von Phase 6 getrennt, weil
Kartenkacheln und Figurenbilder nichts miteinander zu tun haben außer dem
Zeitpunkt.

## Kontext (lesen, bevor du anfängst)

- `data/_authoring/image-tools/cutout.py` — das Freistell-Werkzeug, das den
  Fehler verursacht hat.
- `data/_authoring/image-prompts/SPRITES.md` — Vorlage und Nachbearbeitung,
  wird hier ergänzt.
- `data/_authoring/image-prompts/ANSWER_IMAGES.md` — Regeln für Bildantworten,
  wird hier ergänzt.
- Skill `flux2-bilder` (Figuren mit Emotionsset), Skill `krea2-bilder`
  (Einzelmotive ohne Referenzbild).
- 🟡 Die Eingabepfade in beiden Skills stimmen auf dieser Maschine nicht — die
  laufende ComfyUI ist `B:\ComfyUI_windows_portable\ComfyUI\` (STATE.md).

## Teil A — Der Loch-Fresser im Freistell-Werkzeug

> **Status: erledigt am 26.08.2026**, vorgezogen aus Phase 6 (die 14
> Stations-Sprites laufen durch dasselbe Werkzeug). Werkzeug und `SPRITES.md`
> sind nachgezogen. Die **Figuren selbst** sind damit noch nicht neu — das ist
> Teil B und bleibt offen.

**Belegter Befund:** In `bisasam_neutral.png` ist das linke Auge vollständig
durchsichtig, im rechten fehlt ein Teil des Weißen. Ursache ist nicht der
Prompt, sondern `rembg`: das Modell hält eine helle, vom Rest der Figur
**umschlossene** Fläche für Hintergrund und stanzt sie heraus. Bei jeder
gezeichneten Figur mit weißem Augapfel, Zähnen oder Glanzlicht passiert das
wieder — die heutige Anleitung („Backdrop-Farbe wählen, die nicht in der Figur
vorkommt") hilft dagegen nicht, weil Augenweiß in *jeder* Figur vorkommt.

🔴 **Korrektur der Mechanik (26.08.2026, beim Vorziehen in Phase 6 gemessen):**
Der Fehler ist **kein Loch**. In `bisasam_neutral.png` liegt das ausgefressene
Augenweiß bei **Alpha 9–64** — durchscheinend, nicht ausgestanzt. Die unten
ursprünglich vorgesehene Suche nach „durchsichtigen Flächen ohne Randverbindung"
kann ihn deshalb prinzipiell nicht finden: für sie ist die Fläche Figur.
Nachgemessen: der Randfüller erreicht **alle** 818713 durchsichtigen Pixel des
Bildes, und auch mit bis zu 13 px Nahtzugabe (morphologisches Schließen) bleibt
die Zahl gefundener Innenlöcher bei 0.

**Umgesetzter Fix in `cutout.py`, nach `remove()` und vor dem Zuschneiden:**
Gesucht werden eingeschlossene Flächen, die **nicht voll deckend** sind. Sie
werden wieder deckend gemacht, die Farben kommen aus dem Originalbild.

- Maske ist „Alpha ≥ 200" (voll deckende Figur), nicht „Alpha > 8". Das ist der
  Kern der Korrektur — gegen die niedrige Schwelle geprüft, ist die Fläche
  Figur und fällt nie auf.
- Umsetzung ohne neue Abhängigkeit: Maske in eine um ein Pixel größere Leinwand
  einsetzen, mit `PIL.ImageDraw.floodfill` von der Ecke `(0, 0)` aus füllen. Was
  danach ungefüllt bleibt, liegt ringsum von voll deckender Figur eingeschlossen.
- **Belegte Wirkung:** Findet im ganzen Bisasam genau zwei Flecken — 4206 px
  (Augenweiß) und 516 px (Glanzpunkt), beide im linken Auge, sonst nichts. Kein
  Fehlalarm an der Silhouette, keine Halo-Kante nach dem Füllen. Professor Eich
  bekommt 795 px repariert, Pikachu und Rattfratz null.
- Die Farbwerte für gefüllte Löcher kommen aus dem **Originalbild** — rembg
  liefert an diesen Stellen keine brauchbaren Farben zurück.
- 🟡 **Eine Aussparung kann auch richtig sein** (der Ring eines Henkels, ein
  Spalt zwischen Arm und Körper, der nicht bis zum Rand durchläuft). Deshalb nur
  Flächen unterhalb eines Flächenanteils füllen (umgesetzt: 2 % der Figur — das
  Bisasam-Auge liegt bei 0,57 %) und den Schalter `--keep-holes`, der die
  Reparatur ganz abschaltet.
- **Ausgabe erweitern:** Anzahl und Gesamtfläche der gefüllten Löcher in die
  bestehende Erfolgszeile aufnehmen. Ein stiller Fix, der irgendwann nicht
  mehr greift, ist kein Fix — man muss sehen, dass er gearbeitet hat.

**`SPRITES.md` nachziehen:** Der Abschnitt „Nachbearbeitung — Pflichtschritt"
verweist heute auf den nackten `rembg`-Aufruf. Er muss auf `cutout.py`
verweisen, und die Prüfliste bekommt eine Zeile: *„Augen, Zähne und Glanzlichter
angesehen — auf dunklem Grund, nicht auf weißem."* Die alte Prüfzeile „keine
Löcher in Kleidung" hat den Fehler nicht gefangen, weil niemand das Bild vor
dunklem Hintergrund angesehen hat.

## Teil B — Figuren neu

> **Status: erledigt am 26.08.2026 — mit geänderter Erzeugungs-Methode.**
> Statt freihändig via Prompt (ursprünglicher Plan) lieferte Sascha für acht
> Figuren echte Referenzbilder (offizielle Artwork/Anime-Standbilder,
> `Downloads/*.png`) — Grund: die freihändig erzeugten Basisbilder aus dem
> ersten Anlauf gefielen nicht. Erzeugt mit `flux2-bilder` (Referenzbild als
> Image 1, `keep face/hair/outfit/proportions identical, change only the
> expression`), pro Figur erst `neutral` gegen die echte Vorlage, danach die
> weiteren Emotionen gegen das eigene `neutral`-Ergebnis als Anker (SPRITES.md
> „Referenzbild (belastbar)"-Weg). `verkaeufer` und `nachbar` (keine
> Kanon-Figur, freihändig) liefen über Krea2-Text-zu-Bild für `neutral`, danach
> genauso mit FLUX.2 verkettet — FLUX.2 lehnt einen Lauf ganz ohne Referenzbild
> technisch ab (Pflichteingang am Paket-Knoten).
>
> **Bestand (10 Figuren, 18 Dateien):** `bisasam` (neutral/happy/worried/angry
> — vollständiges Set nach AK 2), `pikachu`/`prof_eich`
> (neutral/happy), `rattfratz` (neutral/worried), `blau`/`mama`/`schwester`/
> `kaefersammler`/`verkaeufer`/`nachbar` (neutral/happy) — exakt das, was der
> Content referenziert (`grep` gegen alle `episodes/*.json`).
>
> 🟡 **Widerspruch zwischen AK 2 und `ASSET_REQUIREMENTS.md` gefunden, nicht
> aufgelöst:** AK 2 verlangt für „alle vier bestehenden Figuren" ein
> vollständiges Vier-Emotionen-Set. `ASSET_REQUIREMENTS.md` § 2 sagt
> ausdrücklich das Gegenteil („kein Soll pro Figur … Aufwand ohne Gegenwert").
> Umgesetzt: `bisasam` vollständig (deckt AK 2 dem Buchstaben nach für eine
> Figur), `pikachu`/`prof_eich`/`rattfratz` nur die tatsächlich referenzierten
> zwei Emotionen — dem Doc-Grundsatz folgend, AK 2 damit nicht wörtlich
> erfüllt. Nachzuziehen ist entweder AK 2 (lockern) oder die drei Figuren
> (ergänzen) — Entscheidung steht aus.
>
> **Ein echter Freistell-Fund unterwegs:** Bei `schwester` (Nurse-Joy-Frisur,
> zwei große Haarschlaufen) hat `cutout.py` die Schlaufen-Löcher zuerst als
> „durchscheinenden Ausfall" gewertet und mit der grauen Hintergrundfarbe
> zugemalt — genau der in `cutout.py --help` beschriebene Henkel-Fall, nur
> zum ersten Mal real getroffen. Mit `--keep-holes` neu freigestellt, danach
> auf dunklem Grund geprüft: korrekt. `kaefersammler` (Kescher-Ring) vorsorglich
> gleich mit `--keep-holes` erzeugt.
>
> **Ein Nacharbeit-Fall:** `rattfratz_neutral` brauchte drei Anläufe — die
> ersten beiden übernahmen den fauchenden Kampf-Ausdruck der Vorlage trotz
> Prompt-Vorgabe „calm and even". Sascha entschied sich für den zweiten
> (fauchenden) Versuch als Anker, nicht den dritten (bewusst beruhigten) —
> geschmacklich seine Entscheidung, nicht meine.

Ursprünglicher (nicht mehr genutzter) Plantext unten stehen gelassen als
Kontext, was ursprünglich vorgesehen war:

Bestand heute: `bisasam`, `pikachu`, `prof_eich`, `rattfratz` — **je zwei von
vier Emotionen.** `SPRITES.md` verlangt alle vier, sonst bleibt die Figur bei
der falschen Dialogzeile stumm. Die Neuerstellung schließt diese Lücke mit,
sonst wird sie zweimal angefasst.

| Figur | Heute vorhanden | Fehlt |
|---|---|---|
| `bisasam` | `neutral`, `happy` | `worried`, `angry` |
| `pikachu` | `neutral`, `happy` | `worried`, `angry` |
| `prof_eich` | `neutral`, `happy` | `worried`, `angry` |
| `rattfratz` | `neutral`, `worried` | `happy`, `angry` |

Dazu kommen die Figuren, die Phase 5 neu einführt (Rivale, Käfersammler,
Markt-/Center-Personal) — wie viele es werden, steht erst nach Phase 5 fest,
deshalb hier keine Zahl.

**Vorgehen je Figur:** vier Läufe hintereinander mit `flux2-bilder`, gleicher
Seed, das erste gelungene Bild als Referenz in die drei weiteren, nur der
Ausdruckssatz wird getauscht (`SPRITES.md`). Danach `cutout.py` mit dem
reparierten Loch-Füller.

**Backdrop:** `mid grey` bleibt. Für Bisasam ausdrücklich **kein** Grün.

## Teil C — Zählbilder: Pokébälle statt Sterne

> **Status: erledigt am 26.08.2026.** `antwort_pokeball_1..4.png` liegen unter
> `data/themes/pokemon/answers/`, erzeugt mit `Krea2 Txt2Img` (1024×1024,
> Backdrop blasses Flieder wie der Rest des Antwortbestands), freigestellt mit
> `cutout.py --trim` (kein Loch-Fund — Pokébälle haben keine umschlossenen
> hellen Flächen). `silben_klatschen.json` referenzierte die neuen Dateinamen
> bereits seit Phase 5, `antwort_ziffer_1..4.png` sind gelöscht, kein Treffer
> mehr im Content. `ANSWER_IMAGES.md` ist auf `cutout.py` statt nacktem
> `rembg` umgestellt (galt vorher nur für Sprites) und trägt jetzt die
> Pokémon-Universum-Motivregel aus Teil D.

`antwort_ziffer_1..4.png` zeigen heute weiße Sterne auf weißem Grund — auf dem
hellen Antwortfeld praktisch unsichtbar, unabhängig vom Thema. Sie werden
ersetzt durch **ein bis vier Pokébälle**, Bildsprache passend zum bereits
vorhandenen `props/pokeball.png`.

- Neue Dateien: `answers/antwort_pokeball_1.png` … `_4.png`, 512×512 mit Alpha.
- Anordnung: 1 = mittig, 2 = nebeneinander, 3 = Dreieck, 4 = 2×2. Auf einen
  Blick abzählbar, nicht in einer Reihe zusammengedrängt.
- Kräftiger Kontrast (roter Deckel, weißer Boden, dunkler Ring) — genau der
  Punkt, an dem die Sterne versagt haben.
- Die alten `antwort_ziffer_*.png` werden gelöscht, nicht liegen gelassen.
  Umgestellt wird der Verweis in `events/silben_klatschen.json` (Phase 5).

## Teil D — Bildantworten aus dem Pokémon-Universum

> **Status: erledigt am 26.08.2026.** Bestand gegen alle `events/*.json` und
> `episodes/*.json` gegengeprüft (Skript: `grep` über alle `"image"`-Felder),
> nicht aus der Bestellliste des Phase-5-Report-Backs übernommen — die listete
> `antwort_pokeball_item.png` und 14 weitere Motive, real gebraucht wurden
> dieselben 14 plus ein zusätzliches, im Report-Back vergessenes
> `antwort_trank.png` (Trank ≠ Heiltrank, zwei getrennte Wörter im
> Content). Alle 14 neuen Motive erzeugt mit Krea2 (1024×1024, Backdrop
> blasses Flieder, `art_style` der Welt), `antwort_rattfratz.png` stattdessen
> mit FLUX.2 gegen den in Teil B erzeugten Rattfratz-Anker, damit Sprite und
> Bildantwort dieselbe Figur zeigen. `antwort_pokeball_item.png` ist keine
> Neugenerierung, sondern eine Kopie von `antwort_pokeball_1.png` (identisches
> Motiv, beide Kontexte). Die acht nicht mehr referenzierten alten Motive
> (`antwort_auto/ball/blume/boot/igel/katze/milch/ofen.png`) sind gelöscht.
> Abgleich am Ende: kein referenziertes Bild fehlt, keine Datei ist verwaist.
>
> 🟡 **Ein zweiter echter Freistell-Fund:** `antwort_fahrrad.png` hatte
> dieselbe Klasse Fehler wie `schwester` in Teil B — beide Radzentren (echte,
> gewollte Löcher) wurden beim ersten Lauf mit der lilafarbenen
> Backdrop-Nachbarfarbe zugemalt. Mit `--keep-holes` neu freigestellt. Zwei
> Treffer in einer Phase heißt: Kreisförmige Aussparungen (Ring, Rad,
> Henkel) sind der Regelfall, nicht die Ausnahme — nach jedem `cutout.py`-Lauf
> mit einer nicht ganz kleinen "Ausfälle gefüllt"-Zahl (hier: 2,1 % der
> Fahrrad-Fläche) lohnt der Blick aufs Ergebnis, bevor es als erledigt gilt.

Phase 5 legt fest, **welche** Wörter die Aufgaben künftig benutzen. Diese Phase
erzeugt die zugehörigen Bilder. Der Bestand `answers/` enthält heute 21
allgemeine Motive (Auto, Boot, Vase, Ofen, Hose, Dose, Milch, Mais, Laus …);
was davon in der neuen Wortliste nicht mehr vorkommt, wird gelöscht.

**Regel für die neuen Motive** (in `ANSWER_IMAGES.md` ergänzen): Ein Bild in
dieser Welt zeigt einen Gegenstand, wie er im Pokémon-Universum vorkommt —
Pokéball, Beere, Trank, Angel, Kescher, Lagerfeuer, Fahrrad, Baumstumpf — statt
eines beliebigen Alltagsgegenstands. Die Eindeutigkeitsregel aus
`ANSWER_IMAGES.md` bleibt darüber stehen: **im Zweifel gewinnt das erkennbarere
Bild, nicht das thematisch passendere.** Ein Kind, das rät, hat nichts gelernt,
egal wie hübsch das Motiv zum Thema passt.

Erzeugung wie bisher: `krea2-bilder`, 1024×1024, danach auf 512 verkleinert,
freigestellt mit `cutout.py --trim`.

## Umsetzung

1. `cutout.py` reparieren (Teil A), `--keep-holes` und die erweiterte
   Ausgabezeile ergänzen.
2. Gegenprobe am kaputten Bestand: das heutige `bisasam_neutral.png` ist kein
   gültiger Testfall (es ist bereits freigestellt) — stattdessen ein neu
   erzeugtes Rohbild durchlaufen lassen und die Augen auf dunklem Grund prüfen.
3. `SPRITES.md` und `ANSWER_IMAGES.md` nachziehen (Teile A und D).
4. Figuren neu erzeugen, vier Emotionen je Figur (Teil B).
5. Pokéball-Zählbilder erzeugen, alte Ziffernbilder löschen (Teil C).
6. Bildantworten zur neuen Wortliste aus Phase 5 erzeugen, nicht mehr genutzte
   löschen (Teil D).
7. `ASSET_REQUIREMENTS.md` Abschnitt zu Sprites/Bildantworten auf den neuen
   Stand bringen.
8. `deploy.cmd content`.

## Akzeptanzkriterien

1. `cutout.py` füllt Innenlöcher und meldet in seiner Ausgabe, wie viele es
   waren. `--keep-holes` schaltet das ab.
2. Alle vier bestehenden Figuren liegen in **vier** Emotionen vor, alle
   identisch zugeschnitten (kein Springen beim Emotionswechsel im Dialog).
3. Jede neue Sprite-Datei einmal vor dunklem Hintergrund angesehen: Augen,
   Zähne und Glanzlichter sind da.
4. `antwort_pokeball_1..4.png` liegen vor, die Anzahl ist am Handy auf einen
   Blick abzählbar (Prüfung am Gerät, nicht am Monitor).
5. Kein `antwort_ziffer_*.png` mehr im Bestand, kein Verweis darauf im Content.
6. Jedes in den Aufgaben genutzte `image` existiert als Datei, und keine Datei
   in `answers/` ist verwaist.
7. `SPRITES.md`, `ANSWER_IMAGES.md` und `ASSET_REQUIREMENTS.md` beschreiben den
   tatsächlichen Stand.

## Report-Back

**Umgesetzt am 26.08.2026.** Alle vier Teile durch. AK 8 (`deploy.cmd
content`) aus Phase 7 selbst ist **kein** offener Punkt dieser Phase — den
gibt es hier gar nicht, Umsetzungsschritt 8 „deploy.cmd content" ist bewusst
**nicht** ausgeführt: Nachtrag 5b (README/Phase 5 — Umgruppierung von einer
Ortskarte mit vier Kacheln auf zwei Gebietskarten mit je zwei) ist noch nicht
gemacht, `world_config.json` steht nachweislich noch auf dem alten Schema
(`maps[0].id == "route_1"`, vier Kacheln in einer Karte). Deploy bleibt
gesperrt bis 5b fertig ist — deckt sich mit der schon in STATE.md stehenden
Reihenfolge „Bilder zuerst, Umgruppierung danach".

**Akzeptanzkriterien:**

1. ✅ `cutout.py` füllt Innenlöcher und meldet die Anzahl (Teil A, aus Phase 6
   vorgezogen, Commit `4b59882`).
2. 🟡 **Teilweise, mit dokumentiertem Zielkonflikt.** `bisasam` hat alle vier
   Emotionen identisch zugeschnitten. Die drei anderen Bestandsfiguren
   (`pikachu`, `prof_eich`, `rattfratz`) haben nur die vom Content
   tatsächlich referenzierten zwei — nach `ASSET_REQUIREMENTS.md` § 2 korrekt
   („kein Soll pro Figur"), nach dem Wortlaut dieser AK nicht. Entscheidung
   steht aus: AK lockern oder drei Figuren nachbestellen.
3. ✅ Jedes neue Sprite auf dunklem Grund geprüft — zwei echte Aussparungen
   gefunden (`schwester`-Haarschlaufen, `kaefersammler`-Netzring) und mit
   `--keep-holes` korrekt freigestellt.
4. 🟡 `antwort_pokeball_1..4.png` liegen vor (Teil C). Abzählbarkeit **am
   Handy** ist nicht durch mich geprüft — das kann nur der User.
5. ✅ Kein `antwort_ziffer_*.png` mehr im Bestand, kein Verweis im Content.
6. ✅ Jedes referenzierte `image` existiert, keine Datei in `answers/` ist
   verwaist (`comm`-Abgleich gegen alle `events/*.json`/`episodes/*.json`).
7. ✅ `SPRITES.md`, `ANSWER_IMAGES.md` und `ASSET_REQUIREMENTS.md`
   beschreiben den tatsächlichen Stand.

**Von der Plan-Vorgabe abgewichen (Sascha, während der Umsetzung):** Teil B
sollte laut Plantext freihändig per Prompt entstehen. Die ersten freihändigen
Basisbilder gefielen nicht — Sascha lieferte stattdessen acht echte
Referenzbilder (offizielle Artwork/Anime-Standbilder), zwei Figuren
(`verkaeufer`, `nachbar`) blieben freihändig, weil sie keine Kanon-Vorlage
haben. Erzeugungsweg dadurch verändert: `neutral` gegen die echte Referenz
(bzw. bei den beiden freihändigen Figuren über Krea2, weil FLUX.2 kein Bild
ganz ohne Referenz erzeugen kann), danach die weiteren Emotionen gegen das
eigene `neutral`-Ergebnis. Details und der eine Nacharbeit-Fall
(`rattfratz`, drei Anläufe) stehen in Teil B oben.

**Unsicherste Stelle:** AK 2 (Vier-Emotionen-Vorgabe vs. `ASSET_REQUIREMENTS.md`
„kein Soll pro Figur") — siehe Findungspunkt in Teil B. Zweitunsicherste:
AK 4, weil die Abzählbarkeit der Pokébälle nur am Bildschirm beurteilt wurde,
nicht am Gerät.

**Files touched:** `data/_authoring/image-prompts/ANSWER_IMAGES.md`,
`data/_authoring/ASSET_REQUIREMENTS.md`, `data/themes/pokemon/sprites/**`
(18 Dateien, 10 Figuren, außerhalb Git), `data/themes/pokemon/answers/**`
(30 Dateien, außerhalb Git).

**Nicht angefasst — bewusst außerhalb dieser Phase:** Nachtrag 5b
(`world_config.json`-Umgruppierung), Phase 8 (Vertonung).
