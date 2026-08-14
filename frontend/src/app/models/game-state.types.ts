/**
 * Ladezustand einer entfernten Ressource als Discriminated Union — kein
 * Nebeneinander aus `isLoading`/`error`/`data`, das ungültige Kombinationen
 * erlauben würde (siehe docs/conventions/typescript.md).
 */
export type LoadState<T> =
  { status: 'loading' } | { status: 'loaded'; data: T } | { status: 'error'; message: string };

/**
 * Zustand eines Orts oder einer Etappe auf den Karten — Regeln dazu in
 * `services/progress.rules.ts`.
 */
export type ProgressState = 'done' | 'current' | 'locked';

export interface EpisodeProgress {
  readonly stars: number;
  readonly completedAt: string;
}

/** Fortschritt einer Welt, indiziert über `episode_id`. */
export type ThemeProgress = Record<string, EpisodeProgress>;

/** Gesamter gespeicherter Stand, indiziert über `theme_id`. */
export type ProgressStore = Record<string, ThemeProgress>;
