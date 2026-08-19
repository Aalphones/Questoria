# Spielmechaniken-Katalog

Alle bisher gesammelten Spielideen für Questoria an einer Stelle — als
Ideenspeicher, aus dem geplant wird, **nicht** als Versprechen. Die Auswahl
trifft ein Plan, nicht diese Liste.

**Quelle:** `H:\Meine Ablage\U105_Questoria\questoria_variationssystem_spiele_und_episode_authoring.md`
(Stand 19.08.2026). Der Engine-Teil jener Datei — Variationssystem, Pools,
Generatoren, Startwert für reproduzierbaren Zufall — ist hier bewusst **nicht**
abgebildet; er lebt als Plan unter
[docs/planning/2026-08-19_curriculum-und-variation/](../planning/2026-08-19_curriculum-und-variation/README.md).

## Drei Klassen, drei Regeln

| Klasse | Was es ist | Regel |
|---|---|---|
| **Kernspiele** | universelle Lernmechaniken, in jeder Welt einsetzbar | tragen den Lernziel-Katalog, haben Vorrang |
| **Franchise-Spiele** | Mechaniken, die nur in einer Themenwelt Sinn ergeben | dürfen eigene Optik und Regeln haben, aber keine Markennamen im Engine-Code |
| **Auflockerungsspiele** | kurze Spaß-Momente ohne Lernziel | Belohnung zwischen zwei Aufgaben, nie Pflichtstation |

Technisch sind alle drei dasselbe: **ein Eventtyp plus eine Angular-Komponente**
(Schema-Referenz Abschnitt 5.0, `event-type-map.ts`). Die Engine braucht dafür
keine neue Architektur — die Typ-Registrierung ist bereits die Registry, die ein
Franchise-Spiel braucht.

## Kernspiele

| Mechanik | Was das Kind tut | Deckt ab | Stand |
|---|---|---|---|
| `multiple_choice` | eine von vier Antworten wählen | fast alles | ✅ gebaut |
| `text_input` | Antwort tippen | Schreiben, Rechnen | ✅ gebaut |
| `image_search` | Ziel in einer Szene finden | Wortschatz, Anlaute | ✅ gebaut |
| `word_match` | Wort und Bild paaren | Lesen, Zuordnen | ✅ gebaut |
| Sortieren | Gegenstände in Kategorien ziehen | Deutsch, Sachkunde, Mengen | Idee |
| Reihenfolge | Elemente in die richtige Ordnung bringen | Geschichten, Abläufe, Zahlenreihen | Idee |
| Platzieren (Drag & Drop) | Gegenstand auf Zielposition ziehen | Grundmechanik für Zahlenstrahl, Karten, Körperteile | Idee |
| Lücke füllen | fehlenden Buchstaben/Zahl/Wort einsetzen | Schreiben, Rechnen | Idee |
| Zahlenstrahl | Zahl auf einer Skala einordnen | Zahlenraum, Vergleiche | Idee |
| Muster | Reihe fortsetzen (ABAB, AABB, ABCABC) | Logik, Vorformen der Algebra | Idee |
| Erkunden | Szene mit anklickbaren Objekten | Sachunterricht, Wortschatz | Idee |

Die fünf, die der Lernziel-Katalog für Klasse-1-Mathematik zwingend braucht,
sind Sortieren, Reihenfolge, Lücke füllen, Zahlenstrahl und Muster — solange
keiner davon existiert, ist eine Mathe-Welt Engine-Arbeit, keine Content-Arbeit.

## Auflockerungsspiele

Sortiert nach Aufwand, günstigste zuerst.

| Spiel | Was es braucht | Anmerkung |
|---|---|---|
| Memory | eine Komponente, keine neuen Bilder | Bild↔Bild aus den vorhandenen Antwortbildern. Beste Ausbeute im ganzen Katalog. Kann auch Lernspiel sein: Bild↔Wort, Zahl↔Menge |
| Suchbild | Szene plus Fundliste | die vorhandene Bildsuche kann das fast schon |
| Zielwerfen | Wurfmechanik plus ein Wurfgegenstand | wird als Pokéball-Fangen gebaut, siehe unten |
| Malen | Zeichenfläche, Stift, Radierer, 3–6 Farben | für Klasse 1 sehr niedrigschwellig, technisch überschaubar |
| Fangspiel | fallende Gegenstände einsammeln | einfache Arcade-Schleife, braucht Bewegungsschleife pro Bild |
| Tic Tac Toe | Raster plus einfacher Gegner | der Gegner ist der Aufwand, nicht das Brett |
| Labyrinth | Wegeraster, Steuerung | kann später Raumorientierung tragen |
| Kartenspiel | generisches Farbkarten-Duell | **kein** UNO-Nachbau: keine geschützten Namen, Grafiken oder Regeltexte |

## Franchise-Spiele

Bewertung aus der Quelldatei übernommen (Lernwert / Spaß, je 1–5).

### Pokémon

| Mechanik | Lern | Spaß | Anmerkung |
|---|---|---|---|
| Pokémon fangen | ★★ | ★★★★★ | **aufgeplant** → [docs/planning/2026-08-19_pokeball-fangen/](../planning/2026-08-19_pokeball-fangen/README.md) |
| Pokémon-Kampf | ★★★★ | ★★★★★ | rundenbasiert, fünf Typen, Stärken-Dreieck. Trägt Ursache/Wirkung und Vergleiche |
| Pokédex | ★★★★★ | ★★★ | Steckbrief lesen oder hören, danach Frage dazu. Sehr gut für Lesen und Sachkunde |
| Pokémon-Ei | ★★★ | ★★★★ | Pflegesequenz in fester Reihenfolge |
| Pokécenter | ★★★ | ★★★ | untersuchen, auswählen, versorgen — Reihenfolgen und Zuordnungen |

### Andere Welten

| Welt | Mechanik | Lern | Spaß |
|---|---|---|---|
| Spider-Man | Stadt-Runner (3 Spuren), Netzschwingen, Spinnensinn (Fehler finden), Netz-Zielwerfen | ★★–★★★ | ★★★★★ |
| One Piece | Navigation mit Log Pose, Schatzkarte („2 nach rechts, 1 nach oben"), Kanonen-Zielschießen, Sanjis Kochspiel, Kopfgeld-Steckbrief | ★★★★★ | ★★★★ |
| Yu-Gi-Oh! | Kartenmatch, Karteneffekt lesen und ausführen, Monsterwerte vergleichen, Kartensammlung als Belohnung | ★★★★–★★★★★ | ★★★★ |
| Harry Potter | Zauber wirken, Rune nachzeichnen, Tränke in Reihenfolge brauen, Quidditch, Karte des Rumtreibers | ★★★★ | ★★★★★ |
| Star Wars | Droiden programmieren (Befehlsfolge ↑↑→→), R2-Reparatur, X-Wing-Runner, Lichtschwert-Block | ★★–★★★★★ | ★★★★ |
| Avatar | Element-Bändigen, Element-Zuordnung („was löscht Feuer?"), Appa-Flug, Vier-Nationen-Karte | ★★★★★ | ★★★★★ |
| Minecraft | Crafting, Mining mit Aufgabe pro Block, Redstone-Logik, Farm-Kreislauf | ★★★★★ | ★★★★★ |
| Miraculous | Paris-Runner, Yo-Yo-Schwung, Akuma-Suche, Verwandlungssequenz | ★★★ | ★★★★★ |
| Mario / Sonic | Jump & Run, Münzen/Ringe in Reihenfolge sammeln, Warp-Röhre als Antwortwahl, Boost durch richtige Antworten | ★★ | ★★★★★ |
| Wonder Woman / DCU | Lasso der Wahrheit (nur wahre Aussagen fangen), Schild-Block, Parcours | ★★★★ | ★★★★★ |
| Ninjago | Spinjitzu-Timing, Element-Ninjas sortieren, Dojo-Training | ★★ | ★★★★★ |
| Disney (Vaiana, Frozen) | zwischen Inseln segeln, Eisfelder in richtiger Reihenfolge betreten | ★★★★★ | ★★★★ |

**Auffällig:** die lernstärksten Mechaniken sind fast durchweg die ruhigen —
Navigation, Steckbrief, Crafting, Kochen, Lasso. Die Runner und Kämpfe machen
Spaß und unterrichten wenig. Eine Welt braucht beides, aber nicht in derselben
Menge.

## Wann eine Franchise-Mechanik gebaut wird

Mindestens eine der vier Bedingungen muss zutreffen:

1. Die Mechanik ist ikonisch für die Welt — ohne sie fehlt etwas.
2. Sie trägt ein Lernziel von selbst, nicht als aufgeklebte Frage.
3. Sie kann mehrere Episoden tragen, nicht nur eine.
4. Sie fühlt sich deutlich anders an als die Kernspiele.

Nicht bauen, weil „jede Welt braucht noch ein Minispiel". Das ist der direkte
Weg zu acht halbfertigen Mechaniken.

## Vier Fallen, die Geld oder Zeit kosten

- **Vertonung skaliert mit.** Jede Textvariante einer Dialogzeile braucht eine
  eigene Sprachaufnahme, sonst ist die Zeile stumm. Variation gehört deshalb in
  die Aufgaben, nicht in die Story.
- **Bilder skalieren schlimmer.** Ein Antwortbild-Pool der dreifachen Größe ist
  der dreifache Bildbestand — erzeugen geht schnell, freistellen und aussortieren
  bleibt Handarbeit am Bildschirm.
- **Marken bleiben draußen aus dem Engine-Code.** Kein `if (themeId ===
  'pokemon')`. Die Engine kennt nur Eventtypen; Figuren, Namen und Bilder kommen
  aus dem Welt-Ordner. So überlebt der Code den Austausch einer Welt.
- **Scheinvariation zählt nicht.** Gleiche Aufgabe mit anderem Knopf, anderer
  Farbe, verschobener Kachel ist keine Abwechslung. Echte Abwechslung kommt aus
  anderem Inhalt, anderem Zahlenwert, anderem Gegenstand, anderer Figur.
