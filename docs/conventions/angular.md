# Angular Conventions — Questoria

> **Source-of-truth references:**
> - [angular.dev/assets/context/best-practices.md](https://angular.dev/assets/context/best-practices.md)
>
> **Builds on user-level baseline.** This file extends/overrides with project-specific decisions.

## Stack

| Layer | Choice |
|---|---|
| Angular | v20+, Standalone Components (default, no explicit flag) |
| Language | TypeScript strict mode — see `typescript.md` |
| Styling | BEM + scoped SCSS, Design-Tokens als CSS Custom Properties (kein Tailwind, keine Utility-Klassen) |
| State | Local signals + services with signals; `@ngrx/signals` only if shared UI state across features grows |
| Tests | keine — bewusste Projektentscheidung, siehe `testing.md` |
| Build | Angular CLI (`ng build`, `ng serve`) |
| Selector prefix | `qst-` (e.g. `qst-speech-bubble`) — set in `angular.json` |

## File & Class Naming (v20+ style guide)

Drop the `Component`/`Directive` suffix from class names and the
`.component.`/`.directive.` infix from filenames. Pipes/Services/Guards/
Interceptors keep their suffix (no other disambiguator).

| Artifact | File | Class |
|---|---|---|
| Component | `speech-bubble.ts` / `.html` / `.scss` | `SpeechBubble` |
| Service | `game-state.service.ts` | `GameStateService` |
| Pipe | `time-ago.pipe.ts` | `TimeAgoPipe` |
| Functional guard | `auth.guard.ts` | `authGuard` |
| Functional interceptor | `auth.interceptor.ts` | `authInterceptor` |
| Component-local types | `<component>.types.ts` | plain exports, no class |

## Components

- **`ChangeDetectionStrategy.OnPush` on every component** — single biggest perf lever, most-forgotten rule.
- Signals over decorators: `input.required<T>()`/`input<T>()`, `output<T>()`, `model<T>()`, `viewChild<T>()`/`viewChildren<T>()`, `contentChild<T>()`/`contentChildren<T>()`. Declare inputs/outputs/computed/signal fields `readonly`.
- State updates: `signal.set(v)` / `signal.update((prev: T) => …)` — never mutate. Update callbacks declare the parameter type explicitly.
- Host bindings in the `host` object, not `@HostBinding`/`@HostListener`.
- **No inline templates, no inline styles** — every component has its own `.html` + `.scss`. Always via `ng generate`.
- **No empty `constructor() {}`.** Field-init for `inject()` calls.
- **No `!` non-null assertions** on injected/queried fields unless provably present — comment why.
- Component size smell: `.ts` > ~150 lines (excl. template/SCSS) or template > ~80 lines → split signal, not a hard cap.

## `:host` is the root — no wrapper div

Style `:host` directly instead of wrapping the template in a root `<div>`.
`:host` must always declare a `display` value (`block`/`flex`/`grid`/…).

## Templates

- `@if`, `@for` (with `track`), `@switch` — never `*ngIf`/`*ngFor`/`*ngSwitch`
- BEM class names, no utility classes — visual styling lives in component SCSS
- Conditional classes via `[class.block__element--modifier]="signal()"` — never `ngClass`/`ngStyle`
- Async pipe for observables; no business logic in templates

## Styling — BEM + scoped SCSS

- Block name = component selector without the `qst-` prefix (`qst-speech-bubble` → block `speech-bubble`)
- No `ngClass`/`ngStyle` — `[class.bem-modifier]` bindings
- Animations via `@keyframes` in component SCSS
- **Kein Utility-CSS-Framework** (Tailwind, Bootstrap, UnoCSS) — Klassennamen benennen das Element, nicht sein Aussehen
- **Design-Tokens als CSS Custom Properties** in `src/styles/_tokens.scss`, global eingebunden. Komponenten-SCSS greift ausschließlich auf `var(--…)` zu — kein Hex-Wert, keine rohe px-Größe, keine Schriftfamilie direkt im Komponenten-Stylesheet
- Neuer Wert, der zweimal vorkommt → wird ein Token, kein zweites Literal

## Services & DI

- `inject()` function everywhere — components, services, guards, interceptors, resolvers. No constructor injection.
- One service per backend resource; `providedIn: 'root'` for singletons
- **No `.subscribe()` in components** — `async` pipe or `toSignal()`. If genuinely needed, wrap with `takeUntilDestroyed()`.
- Inject `DOCUMENT`/`LOCALE_ID`/`PLATFORM_ID` tokens instead of touching globals directly
- Wrap `localStorage`/`sessionStorage` access in a thin service when used in multiple places

## Forms

- Reactive Forms only — template-driven (`ngModel`) forbidden
- `FormBuilder` via `inject()`, `nonNullable.control()` for required fields
- Access controls via the typed `controls` property (`form.controls.avssId`, never `controls['avssId']`)

## Routing

- Lazy-loaded feature routes via `loadComponent`/`loadChildren` — eager `component:` only for the shell
- Functional guards/interceptors/resolvers (`CanActivateFn`, `HttpInterceptorFn`, `ResolveFn`) — no class-based variants

## Images

- `NgOptimizedImage` for all static images (backgrounds, sprites, maps)

## Testing

**Keine automatisierten Tests in diesem Projekt** — kein Karma, kein Jasmine,
kein Vitest, kein E2E-Framework. Begründung und was stattdessen absichert:
`testing.md`. `ng new` und jedes `ng generate` laufen mit `--skip-tests`.

## Generation

**The Angular CLI is not optional** — always `ng generate`, never hand-created component/service/guard/pipe files.

```bash
ng generate component features/timeline --skip-tests
ng generate service services/game-state --skip-tests
ng generate pipe pipes/time-ago --skip-tests
```

Never `--inline-template` or `--inline-style`.

## Subcomponent layout

Child component used only inside one parent → nest under the parent's
folder. Reused across features → hoist to `ui/`.

```
features/dialog/
├── dialog.ts / .html / .scss
└── speech-bubble/        # only used by dialog — stays nested

ui/                        # cross-feature primitives
└── progress-button/
```

## State Management

- Default: local signals + services with signals
- `@ngrx/signals` only if shared UI state across multiple components grows enough to need it — not a day-one dependency

## Project Layout

```
frontend/src/app/
├── features/
│   ├── main-hub/
│   ├── timeline/
│   ├── map/
│   ├── location/              ← Ort-Platzhalter, bis Meilenstein 3 die Event Engine bringt
│   ├── episode/               ← Event Engine: Ablauf + Event Loader
│   ├── events/<type>/        ← eine Komponente je Eventtyp (dialog, multiple-choice, ...)
│   ├── auth/
│   └── profile/
├── routing/                   ← Resolver + Guards (funktional)
├── services/
├── ui/
└── models/
```

## Critical Rules

1. **`ChangeDetectionStrategy.OnPush` on every component** — perf regressions in a game-player UI are invisible until they're a stutter mid-dialog.
2. **No inline template/style, always three files via `ng generate`** — keeps the CLI as the enforcement mechanism, not convention alone.
3. **`ngComponentOutlet` is the only way events get loaded** — never special-case an event `type` with an `@switch` in the episode shell, and that includes `dialog`: it is an event type like any other, with no privileged path through the runner. A new type must only need a new component + an `event-type-map.ts` entry.
4. **No `.subscribe()` in components** — game state must stay signal-driven so save/load and progress UI stay consistent.
