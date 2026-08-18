# Bestellliste Phase 2 — alle Bilddateien der Welt

Erzeugt aus dem fertigen Content von Phase 1 (jede Datei, die eine JSON-Datei
referenziert und die noch nicht existiert). Nachprüfbar mit dem Prüfskript aus
dem Report-Back von Phase 1.

**52 Dateien**, nicht die im Plan geschätzten „rund 25" — die Antwortbilder
sind der Grund (25 Stück, weil jede Reim-Aufgabe drei Lernstufen mit je vier
Bildantworten hat, und die Zuordnungs-Aufgabe pro Wort ein eigenes Bild
braucht statt der einen Wortkarten-Grafik). Vorgaben je Ordner:
`data/_authoring/ASSET_REQUIREMENTS.md`.

## Was wo hingehört

| Ordner | Anzahl | Vorgabe |
|---|---|---|
| `cover.webp` + `maps/` | 4 | 16:9, mind. 1536 × 864 |
| `backgrounds/` | 5 | 16:9, mind. 1536 × 864 — davon 2 Suchbilder |
| `sprites/` | 8 | PNG mit Transparenz, Hochformat ~2:3 |
| `answers/` | 25 | PNG, quadratisch, Ausgabe 512 × 512 |
| `cards/` | 6 | PNG, exakt 630 × 880, randlos |
| `achievements/` | 4 | PNG mit Transparenz, 128 × 128 |

## Zwei Bilder, die Erklärung brauchen

- **`backgrounds/suchbild_labor_dinge.webp`** trägt beide Anlaut-Aufgaben von
  Episode 1. Darauf müssen sichtbar und gut getrennt liegen: **Ball, Blatt,
  Beere, Mütze, Malstift, Muschel** — an genau den Prozentpunkten aus
  `events/anlaut_b_suche.json` und `events/anlaut_m_suche.json`. Wer das Bild
  malt, malt die Koordinaten mit; sonst müssen die Zahlen hinterher nachgezogen
  werden.
- **`backgrounds/suchbild_waldlichtung.webp`** genauso für Episode 3:
  **Sonne, Stein, Specht**, Koordinaten aus `events/wald_suche.json`.
- **`answers/antwort_wortkarte.png` entfällt.** Die beiden Wortkarten-Aufgaben
  sind Zuordnungs-Aufgaben (`word_match`) geworden — dort braucht jedes Wort
  ein eigenes Motivbild, sonst lässt sich nichts zuordnen. Die neue Bildregel
  in `ASSET_REQUIREMENTS.md` Abschnitt 8 verbietet dafür Text im Bild selbst
  (siehe FINDINGS).

## Vollständige Liste

- `achievements/buchstaben_meister.png`
- `achievements/erstes_abenteuer.png`
- `achievements/labor_perfekt.png`
- `achievements/sternenjaeger.png`
- `answers/antwort_auto.png`
- `answers/antwort_ball.png`
- `answers/antwort_baum.png`
- `answers/antwort_blume.png`
- `answers/antwort_boot.png`
- `answers/antwort_dose.png`
- `answers/antwort_hase.png`
- `answers/antwort_haus.png`
- `answers/antwort_hose.png`
- `answers/antwort_igel.png`
- `answers/antwort_katze.png`
- `answers/antwort_laus.png`
- `answers/antwort_mais.png`
- `answers/antwort_maus.png`
- `answers/antwort_milch.png`
- `answers/antwort_mond.png`
- `answers/antwort_mund.png`
- `answers/antwort_nase.png`
- `answers/antwort_ofen.png`
- `answers/antwort_rose.png`
- `answers/antwort_vase.png`
- `answers/antwort_ziffer_1.png`
- `answers/antwort_ziffer_2.png`
- `answers/antwort_ziffer_3.png`
- `answers/antwort_ziffer_4.png`
- `backgrounds/alabastia_labor.webp`
- `backgrounds/route_1_wiese.webp`
- `backgrounds/suchbild_labor_dinge.webp`
- `backgrounds/suchbild_waldlichtung.webp`
- `backgrounds/vertania_wald.webp`
- `cards/karte_bisasam_begleiter.png`
- `cards/karte_buchstabe_b.png`
- `cards/karte_pikachu_freund.png`
- `cards/karte_professor_eich.png`
- `cards/karte_rattfratz_frech.png`
- `cards/karte_reimpaar_maus_haus.png`
- `cover.webp`
- `maps/ep_01.webp`
- `maps/map_route_1.webp`
- `maps/map_route_uebersicht.webp`
- `sprites/bisasam/bisasam_happy.png`
- `sprites/bisasam/bisasam_neutral.png`
- `sprites/pikachu/pikachu_happy.png`
- `sprites/pikachu/pikachu_neutral.png`
- `sprites/prof_eich/prof_eich_happy.png`
- `sprites/prof_eich/prof_eich_neutral.png`
- `sprites/rattfratz/rattfratz_neutral.png`
- `sprites/rattfratz/rattfratz_worried.png`
