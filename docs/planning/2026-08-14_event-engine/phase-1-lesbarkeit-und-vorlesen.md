# Phase 1 — Lesbarkeit: `rem`-Tokens, Vorlesemodus, Sprachausgabe

**Rating:** standard

Alles, was ein Kind lesen oder hören soll, bevor die Engine überhaupt etwas
abspielt: die Oberfläche wächst mit der Schriftgrößen-Einstellung des Browsers,
die Kopfleiste bekommt ihren Modus-Umschalter und Ton-Knopf, und ein Dienst
spricht Text aus — per Aufnahme, sonst per Computerstimme.

## Kontext — vorher lesen

- [docs/design/HANDOFF.md](../../design/HANDOFF.md), Abschnitt „Interaktionen &
  Verhalten" → „Vorlese-/Bilder-Modus" (Sprechrate, Tonhöhe, Autoplay-Regel)
  und Abschnitt „Design Tokens"
- [data/_authoring/JSON_SCHEMA_REFERENCE.md](../../../data/_authoring/JSON_SCHEMA_REFERENCE.md)
  Abschnitt 6 („Vorlesemodus — zwei Textfassungen")
- `frontend/src/styles/_tokens.scss` (die Datei, die hier umgestellt wird),
  `frontend/src/styles.scss` (bindet sie ein)
- `frontend/src/app/ui/hud/hud.ts` + `hud.html` — der Kommentar am Ende des
  Templates markiert die Stelle, an der Umschalter und Ton-Knopf einhängen
- `frontend/src/app/services/progress.service.ts` als Muster für einen Dienst
  mit Signal-Zustand und Browser-Speicher (Lesen im Konstruktor, Schreiben nach
  jeder Änderung)
- [docs/conventions/angular.md](../../conventions/angular.md),
  [docs/conventions/css.md](../../conventions/css.md)

## Akzeptanzkriterien

1. **Alle Abstands-, Schrift-, Radius- und Touch-Tokens stehen in `rem`.** Bei
   Standard-Schriftgröße (16 px) sieht die App unverändert aus; stellt man die
   Browser-Schriftgröße auf 200 %, wachsen Text, Abstände und Knopfhöhen mit.
   Karten-Geometrie (`--size-map-*`, `--ring-*`, `--stroke-*`,
   `--border-width-*`) bleibt in Pixeln.
2. **Die Kopfleiste hat einen Modus-Umschalter** mit zwei beschrifteten
   Zuständen: „Bilder & Vorlesen" und „Selbst lesen". Er ist ein echter
   Umschalter (`role="switch"` bzw. zwei Radio-Knöpfe), mindestens
   `--size-touch-target` hoch, und trägt eine dezente Erklärung
   (`title`/`aria-label`): „Bilder & Vorlesen liest dir alles vor".
3. **Die Kopfleiste hat einen Ton-Knopf**, der laufende Sprachausgabe sofort
   stoppt und weitere unterdrückt. Zustand am Symbol erkennbar, nicht nur an
   der Farbe.
4. **Beide Einstellungen überstehen ein Neuladen** (Browser-Speicher
   `questoria.narration.v1`). Ein beschädigter Eintrag setzt auf die Standards
   zurück, ohne die App zu blockieren.
5. **`NarrationService.speak(text, audioUrl?)`** spricht: liegt eine
   Audiodatei vor, wird sie abgespielt, sonst die Computerstimme
   (`de-DE`, Tonhöhe 1.05, Sprechrate 0.86 im Vorlesemodus / 0.95 im Lesemodus).
   Jede neue Ausgabe bricht die laufende ab — nie zwei Stimmen gleichzeitig.
6. **Erst-Entsperrer:** Blockiert der Browser die automatische Ausgabe (kein
   `speechSynthesis` vor der ersten Nutzergeste), setzt der Dienst
   `autoplayBlocked` auf `true`; die erste Berührung/Taste irgendwo im Dokument
   ruft `unlock()` und spricht den ausstehenden Text nach. Kein sichtbarer
   Hinweis, kein Extra-Knopf — es soll einfach funktionieren.
7. **Ein wiederverwendbarer Vorlese-Knopf** `ui/read-aloud-button/` existiert:
   runder Knopf mit Lautsprecher-Symbol, Beschriftung „Nochmal vorlesen",
   Eingabe `text` (+ optional `audioUrl`), ruft `speak()`. Er ist bei
   ausgeschaltetem Ton sichtbar deaktiviert.
8. Kein Screen ruft `speechSynthesis` oder `new Audio()` selbst auf — nur der
   Dienst.

## Checkliste

### `rem`-Umstellung

- [x] `styles/_tokens.scss`: Abstände auf `rem` bei 16-px-Basis —
      `--space-1: 0.275rem` · `--space-2: 0.55rem` · `--space-3: 0.825rem` ·
      `--space-4: 1.1rem` · `--space-6: 1.65rem` · `--space-8: 2.2rem`.
- [x] Schriftgrößen: `--font-size-root: 0.9375rem` ·
      `--font-size-display: 2.625rem` · `--font-size-title: 2rem` ·
      `--font-size-section: 1.5625rem` · `--font-size-card-title: 1.0625rem` ·
      `--font-size-body: 0.9375rem` · `--font-size-control: 0.875rem` ·
      `--font-size-detail: 0.8125rem` · `--font-size-kicker: 0.6875rem`.
- [x] Radien und Touch-Ziel: `--radius-sm: 0.5rem` · `--radius-md: 1rem` ·
      `--radius-lg: 1.75rem` · `--size-touch-target: 2.875rem`.
      `--radius-card` und `--radius-pill` bleiben unverändert (abgeleitet bzw.
      Pille).
- [x] Karten-Geometrie **nicht** anfassen: `--size-map-*`, `--ring-*`,
      `--stroke-*`, `--dash-*`, `--border-width-placeholder`. Kommentar
      darüber, warum sie in Pixeln bleiben: sie hängen am Kartenbild und an
      Haarlinien, nicht am Lesetext.
- [x] Kein Komponenten-Stylesheet anfassen. Diese Umstellung ist eine
      Wertänderung in genau einer Datei — der Rückweg ist ein `git revert`
      dieser Datei.

### Vorlesedienst

- [x] `services/narration.service.ts` mit `@Service()` anlegen (Muster:
      `progress.service.ts`), Außenfläche exakt wie in [README.md](README.md)
      → Kontrakt → „Vorlesedienst".
- [x] `textFor(full, simple)`: im Modus `listen` `simple ?? full`, im Modus
      `read` immer `full`. Diese eine Funktion ist die einzige Stelle, an der
      über die Textfassung entschieden wird.
- [x] `speak(text, audioUrl?)`: vorhandene Ausgabe abbrechen
      (`speechSynthesis.cancel()` bzw. laufendes `HTMLAudioElement` pausieren),
      dann Aufnahme abspielen oder `SpeechSynthesisUtterance` mit `lang: 'de-DE'`,
      `pitch: 1.05`, `rate` nach Modus. Bei ausgeschaltetem Ton: nichts tun.
- [x] Erst-Entsperrer: schlägt die Ausgabe fehl oder meldet
      `speechSynthesis.speaking` nach dem Start nichts, den Text in einem Feld
      merken, `autoplayBlocked` setzen und einen einmaligen
      `pointerdown`/`keydown`-Lauscher am Dokument registrieren, der `unlock()`
      ruft und den gemerkten Text nachspricht. Lauscher danach entfernen.
- [x] Ablage im Browser-Speicher wie in `ProgressService`: lesen im
      Feld-Initialisierer, schreiben nach jeder Änderung, kaputter Eintrag →
      Standards + `console.warn`.
- [x] `DOCUMENT` injizieren statt `window` global anzufassen (Muster:
      `progress.service.ts`) — sonst bricht das Rendern außerhalb des Browsers.

### Kopfleiste + Vorlese-Knopf

- [x] `ui/hud/`: Modus-Umschalter und Ton-Knopf an der im Template markierten
      Stelle einbauen, `NarrationService` direkt injizieren (die Kopfleiste ist
      der Eigentümer dieser beiden Bedienelemente, sie werden nicht als Input
      durchgereicht).
- [x] `ng generate component ui/read-aloud-button --skip-tests` — Eingaben
      `text: string` und `audioUrl?: string`, Klick ruft `speak()`. Deaktiviert,
      wenn `soundOn()` falsch ist.
- [x] Beide Knöpfe erfüllen `--size-touch-target`, haben `:focus-visible`-Ring
      und eine `aria-label`, die den Zweck nennt, nicht das Symbol.

### Doku

- [x] `docs/code-map.md`: `services/narration.service.ts` und
      `ui/read-aloud-button/` in die Tabellen, Ist-Stand-Absatz nachziehen.
- [x] `docs/glossary.md`: Eintrag **Vorlesemodus** um die beiden Modus-Schlüssel
      (`listen` / `read`) ergänzen, damit Code und Doku dasselbe Wort benutzen.

## Report-Back

**Status:** complete.

- `NarrationService` (`services/narration.service.ts`) hält Modus + Ton als
  Signals, spricht per `SpeechSynthesisUtterance` (`de-DE`, Tonhöhe 1.05,
  Sprechrate 0.86/0.95) oder Aufnahme, mit Erst-Entsperrer über
  `pointerdown`/`keydown`. Ablage unter `questoria.narration.v1`.
- Kopfleiste (`ui/hud/`) trägt jetzt den Modus-Umschalter (zwei Radio-Knöpfe,
  `role="radiogroup"`) und den Ton-Knopf (Lautsprecher-Symbol, durchgestrichen
  bei stummgeschaltet — Zustand also am Symbol erkennbar, nicht nur an Farbe).
- `ui/read-aloud-button/` ist der wiederverwendbare Vorlese-Knopf, deaktiviert
  bei `soundOn() === false`.
- `_tokens.scss` komplett auf `rem` umgestellt (Abstände, Schrift, Radien,
  Touch-Ziel) — Karten-Geometrie bewusst in `px` belassen, mit Kommentar
  begründet. Kein Komponenten-Stylesheet angefasst.
- `npm run build` und `npm run lint` laufen grün (der vorbestehende
  `timeline.scss`-Budget-Hinweis ist unverändert, nicht Teil dieser Phase).

**Unsicherste Stelle:** die automatische Sprachausgabe ohne vorherige
Nutzergeste (Erst-Entsperrer-Pfad) — kann nur am echten Gerät geprüft werden,
steht als 🔴 Punkt 1/2 in der Smoke-Checkliste des Plans.
