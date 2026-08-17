# Plan: Event Engine (Meilenstein 3)

Deckt Meilenstein 3 aus [docs/PROJECT.md](../../PROJECT.md) ab: der eine
Ablaufmechanismus, der eine Episode als Eventliste abspielt
([ADR-004](../../decisions/004-event-engine.md)), die fünf Starttypen `dialog`,
`multiple_choice`, `text_input`, `image_search` und `reward`, dazu der
Vorlesemodus vollständig.

Am Ende ist eine Episode durchspielbar: Ortskarte → Episode → Dialog → Aufgaben
→ Belohnung → Ergebnis mit echten Sternen → zurück auf die Karte. Der
Ort-Platzhalter aus Meilenstein 2 verschwindet.

## Overview

| Phase | Thema | Rating | Status |
|---|---|---|---|
| 1 | [Lesbarkeit: `rem`-Tokens, Vorlesemodus, Sprachausgabe](phase-1-lesbarkeit-und-vorlesen.md) | standard | complete |
| 2 | [Ablauf-Gerüst, Event Loader, `dialog`](phase-2-ablauf-geruest-und-dialog.md) | heikel | complete |
| 3 | [Ausgelagerte Events + `multiple_choice`](phase-3-ausgelagerte-events-und-quiz.md) | heikel | complete |
| 4 | [`text_input` + `image_search`](phase-4-texteingabe-und-bildsuche.md) | standard | complete |
| 5 | [`reward` + Ergebnis-Screen + echte Sterne](phase-5-belohnung-und-ergebnis.md) | standard | complete |
| 6 | [Weiterspielen nach Abbruch](phase-6-weiterspielen.md) | standard | complete |
| 7 | [Testwelt, Authoring-Toolkit, Doku](phase-7-testwelt-und-doku.md) | mechanisch | complete |

Reihenfolge ist bindend: 1 liefert den Vorlesedienst, den jede
Event-Komponente braucht. 2 legt den Kontrakt fest, in den 3–5 einhängen. 6
setzt auf dem Laufzustand aus 2 und der Bewertung aus 5 auf. 7 räumt hinterher
auf, wenn alle fünf Typen wirklich existieren.

## Entschieden vor dem Bauen

1. **Falsche Antworten sind kein Sackgassen-Ende** (Sascha, 14.08.2026). Eine
   falsche Antwort wird ausgegraut, das Kind darf weitertippen, bis es richtig
   ist. Für die Sterne zählt ausschließlich der **erste** Versuch. Damit bleibt
   die Bewertung ehrlich, ohne dass ein Sechsjähriger an einer Frage hängen
   bleibt. Das weicht bewusst vom Prototyp ab, der nach dem ersten Klick
   endgültig sperrt.
2. **Sternenformel:** Anteil der beim ersten Versuch richtig gelösten
   bewerteten Events — alle richtig = 3 Sterne, mindestens die Hälfte = 2,
   darunter = 1. Eine Episode ohne bewertetes Event (reine Story) gibt 3.
   `ProgressService.completeEpisode()` verschlechtert ein bestehendes Ergebnis
   nicht (bestehendes Verhalten).
3. **Abbruch mitten in der Episode wird aufgefangen** (Sascha, 14.08.2026,
   Phase 6). Beim Wiedereintritt fragt der Screen „Weiterspielen oder von
   vorn?". Genau ein angefangener Lauf wird gemerkt, nicht einer pro Episode.
4. **Die Route heißt `theme/:themeId/episode/:episodeId`.** `features/location/`
   war der ehrliche Platzhalter, mit dem Meilenstein 2 belegt hat, dass die
   Episoden-Schnittstelle trägt (Name, Hintergrund, Event-Anzahl, „Ort
   geschafft" mit pauschal 3 Sternen). Diese Aufgabe ist erledigt — der Ordner
   wird durch `features/episode/` ersetzt, nicht daneben stehen gelassen.
5. **Ausgelagerte Event-Dateien kommen über die Content-Schnittstelle**, nicht
   als statische Datei am Backend vorbei (→ ADR-007, entsteht in Phase 3).
6. **Die Engine löst auf, die Komponenten spielen.** `config.ref` und die
   Lernstufen-Variante werden im Ablauf-Gerüst aufgelöst; eine Event-Komponente
   bekommt eine fertige Konfiguration und lädt selbst nichts nach.

## Kontrakt (gilt ab Phase 2)

### Content-Schnittstelle — ein neuer Aufruf (Phase 3)

| Aufruf | Antwort |
|---|---|
| `GET /api/content/themes/{themeId}/events/{eventId}` | Inhalt von `data/themes/{themeId}/events/{eventId}.json`, unverändert |

Gleiche Regeln wie bei Episoden: ID-Muster `^[a-z0-9_]{1,64}$`, sonst `404`
mit `{"error":"Not Found"}`; kein Schreibzugriff.

🟡 **Warum das Critical Rule 8 nicht verletzt** („neue Gameplay-Features
brauchen keine neuen REST-Endpunkte"): Der Aufruf liefert Content aus, er
interpretiert kein Gameplay. Er entsteht **einmal** für alle Eventtypen —
`text_input`, `image_search` und jeder künftige Typ nutzen denselben Pfad.
Käme pro Eventtyp ein Endpunkt dazu, wäre der Schnitt falsch. Begründung als
ADR, damit die Frage nicht in vier Wochen neu aufgerollt wird.

### Ergebnis eines Events (`models/event-runtime.types.ts`, Phase 2)

```ts
/** Was ein Event zurückmeldet, wenn es fertig ist. */
export type EventOutcome =
  | { readonly kind: 'story' }
  | { readonly kind: 'scored'; readonly correctFirstTry: boolean };

/** Was jede Event-Komponente über die Umgebung wissen darf — mehr nicht. */
export interface EventContext {
  readonly themeId: string;
  readonly difficultyLevelId: string;
}
```

`kind: 'story'` melden Events ohne Bewertung (`dialog`, `reward`),
`kind: 'scored'` die Aufgaben-Typen. Nur `scored`-Events gehen in die
Sternenformel ein.

### Kontrakt jeder Event-Komponente (Phase 2)

Eine Event-Komponente ist standalone, `OnPush`, liegt unter
`features/events/<type>/` und hat genau diese Außenfläche:

```ts
readonly config = input.required<TConfig>();      // fertig aufgelöst
readonly context = input.required<EventContext>();
private readonly run = inject(EpisodeRun);        // run.finish(outcome) meldet Vollzug
```

- **Keine Komponente lädt Content nach**, keine kennt Routen, keine schreibt
  Fortschritt. Sie bekommt Konfiguration, spielt sie, meldet ein Ergebnis.
- Gemeldet wird über den Dienst `EpisodeRun`, nicht über `output()` —
  `ngComponentOutlet` bindet Inputs, aber keine Outputs.
- Nach `run.finish()` schaltet das Gerüst weiter; die Komponente wird zerstört.

### Event Loader (`features/episode/event-type-map.ts`, Phase 2)

```ts
export const EVENT_COMPONENTS: Readonly<Record<EventType, () => Promise<Type<unknown>>>> = {
  dialog: () => import('../events/dialog/dialog').then((module) => module.Dialog),
  // je Typ eine Zeile — kein @switch im Ablauf-Gerüst (Critical Rule 9)
};
```

Ein neuer Eventtyp heißt: eine Zeile in dieser Tabelle, ein Ordner unter
`features/events/`, ein Eintrag in `JSON_SCHEMA_REFERENCE.md` Abschnitt 5.0.
Sonst nichts.

### Vorlesedienst (`services/narration.service.ts`, Phase 1)

```ts
export type ReadingMode = 'listen' | 'read';   // 'Bilder & Vorlesen' | 'Selbst lesen'

readonly mode: Signal<ReadingMode>;            // Default 'listen'
readonly soundOn: Signal<boolean>;             // Default true
readonly autoplayBlocked: Signal<boolean>;
setMode(mode: ReadingMode): void;
toggleSound(): void;
textFor(full: string, simple: string | undefined): string;  // 'listen' → simple ?? full
speak(text: string, audioUrl?: string): void;  // Aufnahme schlägt Computerstimme
stop(): void;
unlock(): void;                                // erste Nutzergeste, siehe Phase 1
```

Ablage im Browser-Speicher unter `questoria.narration.v1`. Kein Screen liest
`speechSynthesis` selbst an.

## Finale Akzeptanzkriterien (gesamter Plan)

1. `cd frontend && npm run build` und `npm run lint` laufen grün,
   `cd backend && composer lint` ebenfalls.
2. Eine Episode der Testwelt ist von der Ortskarte aus komplett durchspielbar:
   Dialog mit zwei Bühnenplätzen → Multiple Choice → Texteingabe → Bildsuche →
   Belohnung → Ergebnis-Screen → zurück auf die Ortskarte, wo der Ort geschafft
   aussieht und der nächste offen ist.
3. Der Umschalter in der Kopfleiste wechselt zwischen „Bilder & Vorlesen" und
   „Selbst lesen": im Vorlesemodus kurze Texte, Bilder über den Antworten,
   Ziffern 1–4, automatische Sprachausgabe; im Lesemodus lange Texte,
   Buchstaben A–D, Vorlesen nur auf Knopfdruck. Die Wahl übersteht ein
   Neuladen.
4. Die Sterne auf der Ortskarte entsprechen der Formel oben — dieselbe Episode
   zweimal gespielt verschlechtert das Ergebnis nicht.
5. Episode mittendrin verlassen und neu betreten fragt „Weiterspielen oder von
   vorn?" und spielt bei „Weiterspielen" am richtigen Event weiter, mit den
   bisherigen Treffern.
6. Ein Event, dessen Datei fehlt oder dessen Typ unbekannt ist, zeigt die
   Meldung aus `qst-content-error` statt eines weißen Screens — die Episode
   bricht nicht stumm ab.
7. `docs/code-map.md`, `docs/glossary.md`, `AGENTS.md`,
   `data/_authoring/JSON_SCHEMA_REFERENCE.md`, `docs/design/README.md` und
   ADR-007 sind auf dem Stand des Gebauten.

## Smoke-Checkliste (macht Sascha am Plan-Ende)

Die ersten drei Punkte sind die Stellen, an denen ich unsicher bin — dort
zuerst schauen.

1. 🔴 **Vorlesen am echten Gerät.** Episode auf dem Tablet/Telefon öffnen, mit
   dem das Kind spielen wird: Liest die Stimme beim Öffnen des ersten Dialogs
   von allein vor, ohne dass vorher irgendwo hingetippt wurde? Falls nicht,
   greift der Erst-Entsperrer (ein Tipp irgendwo auf den Screen) — dann sagen,
   ob das im Alltag reicht.
2. 🔴 **Klingt die Computerstimme brauchbar?** Deutsch, Tempo, Betonung — die
   offene Frage aus PROJECT.md („reicht die Browser-Stimme oder braucht es
   vorproduzierte Aufnahmen?") wird hier beantwortet, nicht vorher.
3. 🔴 **Weiterspielen.** Mitten in der Episode Tab schließen, App neu öffnen,
   Episode erneut betreten: Kommt die Frage, und landet „Weiterspielen"
   wirklich am richtigen Event?
4. Sterne: eine Episode absichtlich mit Fehlern spielen (dritte Antwort erst
   nach zwei Fehlversuchen richtig) → 1 oder 2 Sterne auf der Ortskarte.
   Dieselbe Episode fehlerfrei wiederholen → 3 Sterne, und sie bleiben.
5. Beide Modi einmal durchspielen. Im Vorlesemodus: sind die Antwortbilder da,
   wo der Text steht, und passt die Kurzfassung?
6. Tastatur: mit Tab durch Dialog und Quiz, sichtbarer Fokusrahmen, Enter
   löst aus. Auf einem schmalen Fenster (360 px) darf nichts überlappen.
7. Fenster auf 200 % Schriftgröße stellen (Browser-Einstellung, nicht Zoom) —
   die Oberfläche wächst mit, statt zu zerbrechen (`rem`-Umstellung, Phase 1).

## Konfidenz-Ausweis

- 🟡 **Ob eine per `ngComponentOutlet` geladene Komponente den `EpisodeRun`-Dienst
  des Episoden-Screens sieht.** Der Kontrakt oben baut darauf, dass die
  eingesetzte Komponente den Element-Injektor des Gerüsts erbt.
  **Check:** In Phase 2 die Dialog-Komponente `inject(EpisodeRun)` aufrufen
  lassen und im Browser einmal durchspielen; scheitert es, wird der Injektor
  über `[ngComponentOutletInjector]` explizit mitgegeben (in der Phase als
  Rückfallweg beschrieben). Beides ohne Änderung am Kontrakt.
- 🟡 **Automatische Sprachausgabe ohne vorherige Nutzergeste.** Safari/iOS
  blockiert `speechSynthesis`, bis der Nutzer einmal getippt hat — genau das
  hat „liest beim Öffnen vor" nicht. **Check:** Smoke-Punkt 1 am echten Gerät.
  Der Erst-Entsperrer in Phase 1 ist die Absicherung, nicht der Beweis.
- 🟡 **`rem`-Umstellung der Tokens.** Rechnerisch ändert sich bei
  Standard-Schriftgröße nichts (16 px Basis, 1:1 umgerechnet), aber
  Layout-Wirkung sieht man nur am Bildschirm. Die Umstellung ändert **nur**
  `styles/_tokens.scss` — Rückweg ist ein einziger `git revert` dieser Datei.
  **Check:** Smoke-Punkt 7.

## Bewusste Auslassungen

Steht hier, damit es nicht als Lücke gelesen wird:

- **`reward` schaltet noch keine Sammelkarte frei.** Es zeigt die Belohnung und
  meldet Vollzug; Kartenbesitz, Trophäenhalle und Druckbogen sind Meilenstein 5
  (PROJECT.md). Die `card_id` wird gelesen und weitergereicht, nicht ignoriert.
- **Der Ergebnis-Screen zeigt keine Erfolge und keine echten Statistiken.**
  Sterne und die Zahl der gelösten Aufgaben kommen aus dem Lauf; Achievements
  und dauerhafte Statistiken hängen an der Datenbank (Meilenstein 4).
- **Keine Verzweigungen in der Eventliste.** Die Engine spielt strikt der Reihe
  nach ab (Schema-Regel, Abschnitt 4). Ein `choice`-Event, das Folgen abbildet,
  ist ein späterer Eventtyp, kein Umbau des Gerüsts.
- **Keine Hintergrundmusik, kein `music`-Feld.** Das Schema erlaubt es am
  Auftritt eines Events; ein Tonmischer für Musik plus Sprache gehört nicht in
  diesen Meilenstein.
- **Kein Kartenknopf, keine Profile** in der Kopfleiste — Meilenstein 5 bzw. 4.

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
