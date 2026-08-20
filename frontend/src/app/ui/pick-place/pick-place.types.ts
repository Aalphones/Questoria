/**
 * Ein Ablageziel, wie der Vermittler es kennt — bewusst eine Schnittstelle und
 * nicht die Direktive selbst, sonst würden sich Dienst und Direktive
 * gegenseitig importieren.
 */
export interface PickPlaceTarget {
  readonly element: HTMLElement;
  /** Der Gegenstand ist auf diesem Ziel gelandet — egal ob getippt oder gezogen. */
  place(itemId: string): void;
}

/**
 * Ab wie vielen Pixeln Fingerbewegung aus einem Tipp ein Ziehen wird. Darunter
 * bleibt es ein Tipp — ein Kinderfinger steht nie ganz still, und ohne diese
 * Schwelle würde jeder Tipp als abgebrochenes Ziehen enden.
 */
export const DRAG_THRESHOLD_PX = 8;
