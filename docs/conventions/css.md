# CSS / Styling Conventions — Questoria

> Doktrin: semantische Klassennamen nach BEM, gekapselte SCSS pro Komponente,
> CSS Custom Properties als Design-Tokens — **kein Utility-Framework**, kein
> Tailwind. Gleiche Linie wie im Schwesterprojekt CardMaker; die Tokenwerte
> selbst stammen aus dem eigenen Prototyp (`docs/design/`).

## Stack

| Ebene | Wahl |
|---|---|
| Token-Definition | `frontend/src/styles/_tokens.scss`, ein `:root`-Block, kein Build-Plugin |
| Schriften | `frontend/src/styles/_fonts.scss` |
| Komponenten-Styling | Eine `.scss` pro Komponente, Angular kapselt sie; BEM-Klassennamen |

## Zwei Token-Ebenen — Komponenten sehen nur die obere

Unten die **Palette** (rohe Werte: `--palette-accent-500`, `--space-4`), darüber
die **Zweck-Tokens** (`--color-surface`, `--color-text-muted`, `--radius-card`).

**Komponenten-Stylesheets greifen ausschließlich auf Zweck-Tokens zu.** Kein Hex,
kein `rgb()`, keine rohe Pixelgröße, keine Schriftfamilie direkt in einer
Komponente. Ein Wert, der zweimal vorkommt, wird ein Token.

```scss
.theme-card {
  &__button {
    padding: var(--space-3);
    border-radius: var(--radius-card);
    background: var(--color-surface);

    &--active {
      border-color: var(--color-accent);
    }
  }
}
```

## Klassennamen benennen die Sache, nicht das Aussehen

`.theme-card__title`, `.difficulty-picker--active` — nie `.mt-4`,
`.text-orange-600`, `.flex-center`. Ein Block pro Komponentendatei, höchstens
zwei Verschachtelungsebenen.

Ausnahme sind echte Funktions-Helfer wie `.visually-hidden` — die beschreiben
eine Funktion, kein Aussehen, und stehen global.

## HTML trägt die Bedeutung

`<button>`, `<nav>`, `<ul>`, `<dialog>`, `<label>` statt generischer Container.
Ein `<div>` mit Klick-Handler ist ein Bug, kein Stil-Thema — gerade in einer App,
die Kinder mit Tastatur oder Vorlesefunktion bedienen können sollen.
`<div>`/`<span>` nur als bedeutungsfreie Layout-Träger.

## Plattform-Primitive statt Nachbau

Alles davon ist breit verfügbar und im Bestand bereits in Gebrauch:

- logische Eigenschaften (`inline-size`, `padding-block`, `margin-inline`) statt `left`/`right`
- `gap` statt Rand-Tricks, Grid/Flex statt Float
- Container Queries für komponenteneigene Umbrüche, Media Queries nur für echte Seitenlayout-Wechsel
- `:has()` / `:is()` / `:where()` statt aus TypeScript angehefteter Zustandsklassen
- `clamp()` für fluide Größen, `color-mix()` für abgeleitete Farbwerte

## Bewegung fragt nach

Jede Animation und jeder Übergang hat seinen `prefers-reduced-motion`-Zweig.
Fehlt der, ist die Animation nicht fertig. Umgesetzt ist das zentral: der Block
am Ende von `_tokens.scss` setzt `--duration-fast` auf `0ms`. Wer eine eigene
Dauer hart in eine Komponente schreibt, umgeht diesen Schalter — genau deshalb
kommen Dauern aus Tokens.

## Spezifität flach halten

Keine ID-Selektoren, kein `!important`, keine Selektorketten über zwei Glieder.
`@layer` braucht es hier nicht: Angular kapselt Komponenten-Styles ohnehin, und
global stehen nur Tokens, Schriften und ein schlanker Grundstil.

## Critical Rules

1. **Kein Utility-Framework** — auch nicht „nur kurz für einen Einzelfall", auch nicht als reine Token-Fabrik im Hintergrund.
2. **Komponenten konsumieren nur Zweck-Tokens**, nie die Palette direkt.
3. **Kein `style="…"` im Template.** Einzige Ausnahme sind Werte, die erst zur Laufzeit entstehen — die Prozentkoordinaten der Karten- und Weltknoten (`AGENTS.md`, Critical Rule 7). Die gehören dann über eine gebundene Custom Property in die Komponente, nicht als fertige Regel ins Attribut.

## Offener Punkt

🟡 **Schriftgrößen und Abstände stehen in Pixeln** (`--font-size-body: 15px`,
`--space-1: 4.4px`). Damit ignoriert die Oberfläche die Schriftgrößen-Einstellung
des Browsers — für eine Lern-App, die Kinder auch mit vergrößerter Schrift
bedienen, ist das eine echte Einschränkung, keine Stilfrage. Die krummen Werte
stammen wertgleich aus dem Prototyp. Umstellung auf `rem` ist in
`docs/planning/…/FINDINGS.md` für die Kartenansichten vorgemerkt; sie ändert nur
`_tokens.scss`, keine Komponente.
