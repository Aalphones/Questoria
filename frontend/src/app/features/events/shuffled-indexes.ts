/**
 * Gemeinsame Mischung für Aufgaben-Komponenten. Liegt bewusst außerhalb der
 * einzelnen Eventtypen: sonst bringt jeder neue Aufgabentyp seinen eigenen
 * Würfel mit, und die Mischung ist an sechs Stellen leicht verschieden.
 *
 * Noch ohne Startwert (Seed) — reproduzierbare Durchläufe kommen mit dem
 * Variationssystem, siehe `docs/planning/2026-08-19_curriculum-und-variation/`.
 */

/** Fisher-Yates — liefert die Positionen `0..length-1` in zufälliger Reihenfolge. */
export function shuffledIndexes(length: number): readonly number[] {
  const indexes = Array.from({ length }, (_unused: unknown, index: number) => index);

  for (let position = indexes.length - 1; position > 0; position--) {
    const swapWith = Math.floor(Math.random() * (position + 1));
    const parked = indexes[position];

    indexes[position] = indexes[swapWith];
    indexes[swapWith] = parked;
  }

  return indexes;
}
