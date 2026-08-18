# Meilenstein 5 — Sammelkarten & Druckbogen

Das `reward`-Event schaltet echte Sammelkarten frei, die Trophäenhalle zeigt
sie, und ausgewählte Karten landen maßstabsgetreu auf einem DIN-A4-Bogen.
Danach ist der MVP spielbar (`docs/PROJECT.md` → Meilensteine).

**Profil:** private (lean) · **Format:** Ordner-Plan, 6 Phasen

## Phasen

| # | Phase | Inhalt | Rating | Status |
|---|---|---|---|---|
| 1 | [Kartenbesitz-Fundament](phase-1-kartenbesitz-fundament.md) | Karten über den Welt-Aufruf ausliefern, Spielstand-Format v2, `CardService`, zwei ADRs | heikel | pending |
| 2 | [Kartenvergabe im Spielfluss](phase-2-kartenvergabe.md) | `reward`-Event vergibt die Karte, Banner „Neue Sammelkarte" im Ergebnis | standard | pending |
| 3 | [Trophäenhalle](phase-3-trophaeenhalle.md) | Route, Kopfbereich, Fortschrittskarte, Filter, Gruppen, Kacheln, Detail-Dialog | standard | pending |
| 4 | [Druckauswahl](phase-4-druckauswahl.md) | Auswahl-Häkchen, schwebende Auswahlleiste, Auswahl-Dienst, Weg zum Bogen | standard | pending |
| 5 | [Druckbogen](phase-5-druckbogen.md) | A4-Geometrie nach [Wissensdatei](../../knowledge/druckbogen-geometrie.md), Vorschau, PDF-Ausgabe in Millimetern | heikel | pending |
| 6 | [Karten-Knopf, Testwelt, Doku](phase-6-knopf-testwelt-doku.md) | Karten-Knopf in der Kopfleiste, Testwelt-Karten, alle Doku-Nachträge | mechanisch | pending |

## Kontrakt (Frontend ↔ Backend)

Es kommt **kein neuer Endpunkt** dazu. Zwei bestehende Wege ändern ihre Form:

**1. Welt-Aufruf liefert die Karten mit** — `GET /api/content/themes/{themeId}`
antwortet zusätzlich mit den beiden Blöcken aus `cards.json` der Welt:

```jsonc
{
  "theme_id": "dev_fixture",
  // ... bisheriger Inhalt von world_config.json unverändert ...
  "card_format": { "width_mm": 63, "height_mm": 88, "canvas": [630, 880], "dpi": 300, "sheet": "A4", "grid": [3, 3] },
  "cards": [
    { "id": "leuchtturm_karte", "name": "Leuchtturm-Wächter", "set": "Test-Insel",
      "rarity": "haeufig", "asset": "karte_leuchtturm_karte.png",
      "flavor": "…", "hint": "…" }
  ]
}
```

Fehlt `cards.json`, stehen `cards: []` und `card_format: null` in der Antwort —
kein Fehler. Kartenbilder kommen über den bestehenden Asset-Weg
(`GET /content/themes/{themeId}/cards/<datei>`, im Frontend
`ContentService.assetUrl(themeId, 'cards', asset)`). Begründung: [ADR-011](../../decisions/011-karten-im-welt-aufruf.md).

**2. Spielstand-Block steigt auf Version 2** — `game_state_json` bekommt ein
Feld `cards`: Karten-ID → Datum der Freischaltung (ISO, `YYYY-MM-DD`).

```jsonc
{ "version": 2, "progress": {}, "run": null, "settings": { "difficultyLevel": null },
  "cards": { "leuchtturm_karte": "2026-08-18" } }
```

`SavegameValidator::SUPPORTED_STATE_VERSION` steigt auf `2`; ein Stand der
Version 1 vom Server wird beim Laden im Frontend hochgezogen (leeres
`cards`-Objekt). Begründung: [ADR-012](../../decisions/012-kartenbesitz-im-spielstand.md).

## Finale Abnahmekriterien (das Ganze)

1. Eine Episode mit `reward`-Event schaltet die genannte Karte frei; das
   Ergebnis zeigt das Banner „Neue Sammelkarte" mit Bild, Name, Seltenheit und
   Spruch. Zweites Durchspielen vergibt sie nicht doppelt.
2. Die Kopfleiste zeigt in jeder Welt einen Karten-Knopf mit Zähler
   „besessen / gesamt"; er führt in die Trophäenhalle und ist dort hervorgehoben.
3. Die Trophäenhalle zeigt alle Karten der Welt, gruppiert nach `set`, mit
   Fortschrittskarte, drei Filtern und dem Detail-Dialog für besessene Karten.
   Verschlossene Karten zeigen Streifenmuster, Schloss und ihren `hint`.
4. Besessene Karten lassen sich zum Drucken auswählen; die Auswahlleiste nennt
   die Anzahl und führt zum Druckbogen.
5. Der Druckbogen legt 9 Karten je Blatt in einem 3×3-Raster aus 63 × 88 mm an,
   paginiert über mehrere Blätter und speichert das Ganze als A4-PDF-Datei.
   Der Maßstab hängt an der Datei, nicht am Druckdialog ([ADR-013](../../decisions/013-druckbogen-als-pdf.md)).
6. **Eine ausgedruckte Karte misst nachgemessen 63 × 88 mm** (± 1 mm).
7. Ein Neuladen der Seite verliert keinen Kartenbesitz; die Druckauswahl darf
   verloren gehen (sie ist bewusst flüchtig).
8. Kein neuer REST-Endpunkt (Critical Rule 8), kein Kartengenerator
   (Critical Rule 5), Kartenmaße nur in Millimetern (Design-Vorgabe).

## Smoke-Checkliste (Sascha, nach der letzten Phase)

Die drei ersten Punkte sind die Stellen, an denen ich am unsichersten bin.

1. 🔴 **Maßstab:** PDF erzeugen und mit „tatsächliche Größe / 100 %" drucken,
   Karte mit dem Lineal messen — 63 mm breit, 88 mm hoch. Weicht es ab, liegt
   es am Druckdialog, nicht an der Datei (in der PDF selbst lässt sich das Maß
   im Betrachter nachprüfen).
2. 🔴 **Zweiter Bogen:** 10 Karten auswählen → zwei Seiten in einer Datei, die
   zweite mit einer Karte und acht leeren Plätzen samt Schnittlinien.
3. 🔴 **Besitz überlebt:** Karte gewinnen → Seite neu laden → Karte ist in der
   Halle noch da (prüft, dass der Spielstand-Aufstieg auf Version 2 sitzt).
4. Karte zweimal gewinnen (Episode wiederholen) — kein zweites Banner, Zähler
   bleibt gleich.
5. Verschlossene Karte antippen — passiert nichts, kein Detail-Dialog.
6. Filter „Freigespielt" / „Noch offen" zeigen jeweils die richtige Menge, die
   Gruppenzähler stimmen.
7. Karten-Knopf in der Kopfleiste zählt richtig und ist in der Halle
   hervorgehoben; „Zurück" führt aus der Halle auf die Planetenkarte.
8. Auf dem Handy (schmale Ansicht): Halle ist bedienbar, nichts überlappt,
   die Auswahlleiste verdeckt keine Karte dauerhaft.

## Summary

*(beim Archivieren füllen)*

## Files touched

*(beim Archivieren füllen)*

## Commits

*(beim Archivieren füllen)*

## Deviations from plan

*(beim Archivieren füllen)*

## Follow-ups

*(beim Archivieren füllen)*
