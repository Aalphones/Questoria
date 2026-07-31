# TypeScript Conventions — EduQuest

> **Source-of-truth references:**
> - This file is self-contained — the rules below are the full baseline for this project.
>
> **Builds on user-level baseline.** This file extends/overrides with project-specific decisions.

## Stack

| Layer | Choice |
|---|---|
| TypeScript | strict mode, part of Angular v20+ toolchain |

## Strict Mode

- `strict: true` — non-negotiable
- `noUncheckedIndexedAccess: true` — array/object access returns `T | undefined`
- `noUnusedLocals: true`, `noUnusedParameters: true`
- `exactOptionalPropertyTypes: true` — `{ x?: number }` means missing or number, not "number or undefined"
- `noImplicitOverride: true`

## Types

- Function parameters and return types: always explicit
- Type inference OK for local variables when obvious
- `unknown` over `any`; narrow with type guards
- Never `as any` — if escape needed, `as unknown as T` (and document why)

## Discriminated Unions over Magic Strings

```ts
type UserStatus = 'pending' | 'active' | 'archived';
interface User { status: UserStatus }

// With payload differences:
type UserState =
  | { kind: 'pending'; invitedAt: Date }
  | { kind: 'active'; lastSeenAt: Date }
  | { kind: 'archived'; archivedAt: Date };
```

This applies directly to `game_type` (the discriminator for minigame
components) and `difficulty_level` (the discriminator for content variants)
— never compare these as bare strings scattered across the codebase, funnel
them through one const-asserted union each.

## Enums

Prefer const-asserted unions over `enum` — smaller output, no runtime cost:

```ts
export const GAME_TYPES = ['MultipleChoiceGame', 'TextInputGame', 'ImageSearchGame'] as const;
export type GameType = typeof GAME_TYPES[number];
```

## Nullability

- `undefined` for "not yet known", `null` for "explicitly absent"
- Pick one and stick with it per project
- **No `!` non-null assertion** — narrow with type guard or refactor

## Imports & Modules

- `import type` for type-only imports
- No barrel files (`index.ts` re-exports) for large codebases
- Absolute imports via path aliases (`@eduquest/...`) over `../../../`

## Functions

- No `Function` type — use specific signature
- `Readonly<T>` / `readonly` arrays for params that shouldn't mutate
- Async: explicit `Promise<T>` return type
- Errors not in return type; document throws in JSDoc

## Naming

- PascalCase: types, interfaces, enums, classes, components
- camelCase: functions, variables, methods
- SCREAMING_SNAKE_CASE: true constants
- Descriptive names, no single letters/cryptic abbreviations

## Critical Rules

1. **`game_type` and `difficulty_level` are discriminated unions, never bare strings** — a typo in a comparison must fail at compile time, not silently skip a variant at runtime.
2. **No `!` non-null assertions** — content lookups (map/episode/minigame by ID) can legitimately miss; handle the `undefined` case instead of asserting it away.
