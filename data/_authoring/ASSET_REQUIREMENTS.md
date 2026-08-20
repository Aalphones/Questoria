# Asset Requirements

Jede Welt braucht fünf Asset-Typen: Hintergründe, Charakter-Sprites, Audio,
Kartengrafiken und Sammelkarten. Ohne diese Vorgaben generiert dir jedes
Bildmodell eine andere Auflösung pro Bild — und die Engine positioniert Sprites
auf zwei festen Plätzen, also reißt jede Abweichung im Seitenverhältnis die
Komposition auseinander.

---

## Ordnerstruktur pro Welt

```text
/data/themes/<theme_id>/
├── world_config.json
├── cards.json
├── cover.webp
├── maps/
│   ├── map_<map_id>.webp           ← pro Story-Arc eine Ortskarte
│   ├── <arc_overview_bg>.webp      ← Hintergrund der Etappenkarte
│   └── ep_<nr>.webp                ← Etappen-Illustration je Story-Arc
├── backgrounds/
│   └── <scene_name>.webp
├── sprites/
│   └── <character_id>/
│       └── <character_id>_<emotion>.png
├── answers/
│   └── antwort_<slug>.png          ← Bildantworten für den Vorlesemodus
├── cards/
│   └── karte_<card_id>.png         ← Sammelkarten, 630 × 880 px
├── achievements/
│   └── <icon>.png                  ← Erfolgs-Icons, 128 × 128 px
├── levels/
│   └── stufe_<level_id>.png        ← Lernstufen-Bilder, 512 × 768 px, optional
├── props/
│   └── <slug>.png                  ← Spielgegenstände (Ball, später Netz, Lasso), 512 × 512 px
├── audio/
│   └── voices/
│       └── <character_id>_<episode_id>_<line_nr>.mp3
├── episodes/                       ← Eventlisten; Dialoge stecken hier drin
└── events/                         ← Aufgaben-Events mit Lernstufen-Varianten
```

Kein eigener `dialogues/`-Ordner — Dialoge sind Events innerhalb der
Episodendatei, sonst nirgends. Kein eigener `characters/`-Stammdatenordner — Sprite,
Anzeigename und Text werden direkt pro Dialogzeile angegeben, eine
zentrale Charakterdatei wäre eine zweite Wahrheitsquelle ohne Mehrwert.

---

## 1. Hintergründe

| Eigenschaft | Vorgabe |
|---|---|
| Format | `.webp` |
| Seitenverhältnis | 16:9 |
| Auflösung | 1920×1080, **Untergrenze 1280×720** — und die nur für vorhandenes Material |
| Inhalt | Szenerie OHNE Charaktere — die kommen als separate Sprites obendrauf |
| Stil | konsistent pro Welt, ein Look durchziehen |

**1280×720 ist keine Generierungsgröße.** Die kurze Kante liegt damit unter dem
Minimum der eingesetzten Bildmodelle — neu erzeugte Hintergründe entstehen
mindestens in 1536×864, siehe
[image-prompts/MODEL_SETTINGS.md](image-prompts/MODEL_SETTINGS.md). Die
Untergrenze gilt nur für Bilder, die schon existieren.

Bosskampf-/Dramatik-Varianten desselben Hintergrunds (z. B. „verdorben")
werden als eigene Datei gespeichert, gleicher Präfix:
`hafendamm.webp` → `hafendamm_corrupted.webp`.

---

## 2. Charakter-Sprites

| Eigenschaft | Vorgabe |
|---|---|
| Format | `.png` mit Alpha-Kanal (echte Transparenz) |
| Seitenverhältnis | Hochformat, ca. 2:3 (z. B. 1024×1536) |
| Anker-Punkt | Charakter mittig im Frame, Füße nahe Bildunterkante |
| Bühnenplätze | genau zwei feste Positionen: `left`, `right` — keine freie Koordinatenwahl |
| Emotionsset (MVP) | `neutral`, `happy`, `worried`, `angry` — gebraucht wird, was der Content referenziert |

Die zwei festen Bühnenplätze sind eine Engine-Vorgabe, keine Asset-Vorgabe —
das Sprite selbst wird unabhängig von links/rechts erstellt, die Engine
spiegelt/platziert es passend zum gewählten Platz.

**Pflicht ist jedes Sprite, das eine Dialogzeile nennt** — fehlt die Datei zur
angegebenen `sprite`-Zeile, bleibt die Bühne an dieser Stelle leer. Die vier
Gefühle sind der Vorrat, aus dem Dialoge schöpfen, kein Soll pro Figur: Wer
nur `neutral` und `happy` spielt, bestellt auch nur die beiden. `pokemon_lesen`
kommt mit acht Sprites für vier Figuren aus (20.08.2026 durchgespielt); alle
vier Gefühle für jede Nebenfigur wären Aufwand ohne Gegenwert.

---

## 3. Audio

| Eigenschaft | Vorgabe |
|---|---|
| Format | `.mp3` (bevorzugt zum Ausliefern) oder `.wav` |
| Abtastrate | **24 kHz, mono** — die Ausgabe der eingesetzten Sprachmodelle |
| Bitrate | 96 kbps mp3 reicht für 24 kHz mono aus |
| Dateiname | `<character_id>_<episode_id>_<laufende_nummer>.mp3`, Nummer dreistellig |
| Pflicht? | optional pro Dialogzeile — fehlt `audio_path`, liest die Engine die Zeile über die Sprachausgabe des Geräts vor |

Die `character_id` steckt nicht in der Dialogzeile, sondern im Sprite-Namen:
aus `shanks_neutral.png` wird `shanks`. Die laufende Nummer zählt alle
Dialogzeilen der Episode durch, bei 001 beginnend — über **alle**
`dialog`-Events hinweg, nicht pro Event neu. Hat eine Episode zwei Dialoge mit
je zwei Zeilen, sind das die Nummern 001 bis 004. Sonst kollidieren die
Dateinamen innerhalb einer Episode.

**44.1 kHz ergibt hier nichts.** Beide eingesetzten Sprachmodelle liefern
24 kHz; Hochrechnen fügt keine Information hinzu, nur Dateigröße. Aufwendig
selbst eingesprochenes Material darf höher liegen — dann bleibt die Datei, wie
sie ist.

Erzeugt werden die Dateien lokal mit den Skripten unter
[voice-tools/](voice-tools/README.md). Die schreiben Name, Ordner und den
Rückverweis `audio_path` selbst — von Hand benannt wird hier nichts.

---

## 4. Map-Grafiken

| Eigenschaft | Vorgabe |
|---|---|
| Format | `.webp` |
| Seitenverhältnis | 16:9, gleiche Auflösung wie Hintergründe |
| Inhalt | begehbare Übersichtskarte mit erkennbaren Landmarken für Node-Platzierung |

**Eine Welt hat von Anfang an mehrere Maps** — eine pro Story-Arc, nicht
nachträglich angeflanscht. Bei One Piece zum Beispiel: `map_east_blue.webp`,
`map_alabasta.webp`, `map_skypiea.webp`, jede mit eigenen Episoden-Nodes.

Dazu kommt **eine Etappenkarte pro Welt** — die Übersicht über alle Arcs, mit
eigenem Hintergrund und einer kleinen Illustration je Etappe (`ep_01.webp` …).
Die Illustrationen werden als organische Inselformen beschnitten dargestellt,
also motivisch mittig anlegen und keine wichtigen Details an den Rand legen.

**Node-Koordinaten sind Prozentwerte, keine Pixel.** Position und Größe jedes
Kartenpunkts stehen als Prozent der Kartenbildbreite bzw. -höhe in
`world_config.json` (Schema-Referenz Abschnitt 2). Damit sitzt ein Punkt auf
jedem Gerät auf derselben Landmarke. Praktisch heißt das beim Zeichnen: die
Landmarken deutlich sichtbar und nicht zu nah am Bildrand platzieren, sonst
liegt der Punkt später halb außerhalb.

---

## 5. Sammelkarten

Fertige Kartenbilder, die als Belohnung freigeschaltet und auf DIN A4
ausgedruckt werden. Die Engine erzeugt sie nicht — sie liefert sie aus.

| Eigenschaft | Vorgabe |
|---|---|
| Format | `.png` |
| Auflösung | **exakt 630 × 880 px** (63 × 88 mm bei 300 dpi) — Ausgabegröße |
| Dateiname | `karte_<card_id>.png`, `card_id` identisch zu `cards.json` |
| Inhalt | randlos bis zur Kante — die Karte wird vollflächig gedruckt und ausgeschnitten |
| Farbraum | sRGB |

Randlos heißt wörtlich: Der Druckbogen legt die Bilder ohne Rahmen in ein
3×3-Raster, und geschnitten wird auf der Linie. Wichtige Motivteile und Text
mindestens 3 mm (= 30 px) von der Kante weghalten, sonst schneidet die Schere
sie ab.

**Nie in 630 × 880 generieren.** Das liegt unter dem Minimum der eingesetzten
Bildmodelle — erzeugt wird in 1024 × 1432 (bzw. 1024 × 1440) und anschließend
verkleinert.

Ein passender Prompt für Kartenrahmen und Kartenmotiv liegt in
[image-prompts/CARDS.md](image-prompts/CARDS.md).

---

## 6. Erfolgs-Icons

| Eigenschaft | Vorgabe |
|---|---|
| Format | `.png` mit Alpha-Kanal (echte Transparenz) |
| Seitenverhältnis | quadratisch, **128 × 128 px** |
| Dateiname | frei wählbar, steht als `icon` in `achievements[]` (Schema-Referenz Abschnitt 2) |
| Inhalt | ein einzelnes, kompaktes Motiv — die Engine schneidet das Icon zur Raute zu, wichtige Teile mittig halten |

## 7. Profil-Avatare

Anders als die Punkte 1–6: **nicht pro Welt**, sondern eine gemeinsame Auswahl
für die Profilanlage. Liegen deshalb nicht unter `data/themes/<theme_id>/`,
sondern eigenständig unter `data/avatars/` (selbe Drive-Ablage, eigene
NTFS-Junction — siehe `AGENTS.md` → Content-Repository).

| Eigenschaft | Vorgabe |
|---|---|
| Format | `.png` mit Alpha-Kanal (echte Transparenz) — Ausnahme die sechs alten Platzhalter, die bleiben `.svg` |
| Seitenverhältnis | quadratisch, Ausgabegröße **512 × 512 px** |
| Dateiname | `avatar_<slug>.png`, Slug in `snake_case` ohne Umlaute, frei wählbar |
| Inhalt | Brustporträt einer Figur, mittig, blickt zur Kamera — die Oberfläche schneidet quadratisch zum Kreis zu (CSS `object-fit: cover`), Details also nicht zu nah an die Ecken |
| Stil | konsistent über alle Avatare hinweg, siehe Master-Prompt |

Neue Datei nach `data/avatars/` legen, Dateiname in `AVAILABLE_AVATARS`
(`frontend/src/app/models/auth.types.ts`) ergänzen — fertig. Kein Build-Schritt,
kein Deploy-Sonderfall: `deploy.cmd content` synct `data/` ohnehin komplett.
Prompt-Vorlage: [image-prompts/AVATARS.md](image-prompts/AVATARS.md).

## 8. Bildantworten (Vorlesemodus und Zuordnung)

Für Kinder, die noch nicht lesen, zeigt jedes `multiple_choice`-Event ein Bild
über jeder Antwort. Ohne diese Bilder rät das Kind.

| Eigenschaft | Vorgabe |
|---|---|
| Format | `.png` mit Alpha-Kanal |
| Seitenverhältnis | quadratisch, **Ausgabegröße** mind. 512 × 512 px |
| Dateiname | `antwort_<slug>.png`, Slug in `snake_case` ohne Umlaute |
| Inhalt | ein einzelnes, eindeutig erkennbares Motiv, kein Text im Bild |

Dieselben Bilder benutzt die Zuordnungs-Aufgabe (`word_match`, Schema 5.6) —
dort allerdings als die eigentliche Aufgabe. **Ein Motiv für eine
Zuordnungs-Aufgabe darf das gesuchte Wort nicht zeigen**: kein Schriftzug,
kein Etikett, kein Buchstabe im Bild. Sonst löst sich die Aufgabe von
selbst, und das Kind hat kein einziges Wort gelesen.

Der Dateiname steht als `image` in der Event-Datei und wird **nicht** aus dem
Antworttext berechnet — sonst bricht jede Textkorrektur das Bild.

**512 × 512 ist die Ausgabegröße, nicht die Generierungsgröße.** Sie liegt
unter dem Minimum aller eingesetzten Bildmodelle — erzeugt wird in 1024 × 1024
und anschließend verkleinert, siehe
[image-prompts/ANSWER_IMAGES.md](image-prompts/ANSWER_IMAGES.md).

## 9. Lernstufen-Bilder

Ein Bild je Lernstufe auf der Stufenauswahl. **Optional** — eine Welt ohne
diese Bilder zeigt vollständige Karten, nur ohne Motiv
([ADR-018](../../docs/decisions/018-lernstufen-bilder-im-content.md)).

| Eigenschaft | Vorgabe |
|---|---|
| Format | `.png` mit Alpha-Kanal (echte Transparenz) |
| Seitenverhältnis | Hochformat 2:3, **Ausgabegröße 512 × 768 px** |
| Dateiname | frei wählbar, steht als `image` in `difficulty_levels[]`; Konvention `stufe_<level_id>.png` |
| Inhalt | eine einzelne freigestellte Figur oder ein einzelnes Motiv, das die Stufe verkörpert — kein Text im Bild |
| Stil | `art_style` der Welt, wörtlich wie überall |

**Das Bild trägt die Schwierigkeit nicht.** Die Reihenfolge liest das Kind an
den Punkten und am Beschreibungssatz ab — das Bild macht die Wahl schöner, nicht
verständlicher. Ein Motiv, das nur mit Fandom-Wissen als „schwer" erkennbar ist,
ist deshalb kein Fehler.

**512 × 768 ist die Ausgabegröße, nicht die Generierungsgröße.** Erzeugt wird in
Sprite-Größe (1024 × 1536) und anschließend freigestellt und verkleinert —
dieselbe Kette wie bei den Sprites, siehe
[image-prompts/GENERATING.md](image-prompts/GENERATING.md).

## 10. Spielgegenstände (props/)

Gegenstände, die ein Franchise-Spiel braucht — der Pokéball ist der erste
([`pokemon_catch`](JSON_SCHEMA_REFERENCE.md), 21.08.2026), später z. B. Netz
oder Lasso für andere Franchises.

| Eigenschaft | Vorgabe |
|---|---|
| Format | `.png` mit Alpha-Kanal (echte Transparenz) |
| Seitenverhältnis | quadratisch, **Ausgabegröße 512 × 512 px** |
| Dateiname | frei wählbar, steht im jeweiligen Eventtyp-Feld (bei `pokemon_catch`: `ball` / `ball_blink`) |
| Inhalt | ein einzelner, freigestellter Gegenstand — kein Text im Bild |
| Stil | `art_style` der Welt, wörtlich wie überall |

**Zustandspaare (z. B. blinkende Taste) sind zwei Dateien, kein CSS-Trick.**
Ein Leuchtpunkt aus CSS müsste die Position in Pixeln kennen und säße nach
jeder Bildänderung daneben. Das zweite Bild entsteht mit dem ersten als
Ankerbild (Anleitung: [image-prompts/GENERATING.md](image-prompts/GENERATING.md)),
damit beide deckungsgleich sind — nur der Zustand unterscheidet sich.

**512 × 512 ist die Ausgabegröße, nicht die Generierungsgröße** — dieselbe
Kette wie bei Bildantworten: freistellen, dann einpassen, nicht beschneiden.

---

## Naming-Konventionen — Zusammenfassung

- Alles `snake_case`, keine Leerzeichen, keine Umlaute, keine Großbuchstaben
- IDs (`theme_id`, `episode_id`, `character_id`, `event_id`) sind
  dateinamenkompatibel und werden 1:1 als Dateiname oder Ordnername verwendet
- Keine Versionsnummern im Dateinamen — Versionierung übernimmt Git
