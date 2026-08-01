/**
 * Ladezustand einer entfernten Ressource als Discriminated Union — kein
 * Nebeneinander aus `isLoading`/`error`/`data`, das ungültige Kombinationen
 * erlauben würde (siehe docs/conventions/typescript.md).
 */
export type LoadState<T> =
  { status: 'loading' } | { status: 'loaded'; data: T } | { status: 'error'; message: string };
