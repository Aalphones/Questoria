/**
 * Reine Rechnerei ohne Zugriff auf Speicher oder Signale (Plan Meilenstein 3,
 * „Entschieden vor dem Bauen" 2): Anteil der beim ersten Versuch richtig
 * gelösten bewerteten Events. Alle richtig → 3, mindestens die Hälfte → 2,
 * darunter → 1. Eine Episode ohne bewertetes Event (reine Story) gibt 3.
 */
export function starsForRun(scoredCount: number, correctFirstTryCount: number): number {
  if (scoredCount === 0) {
    return 3;
  }

  const ratio = correctFirstTryCount / scoredCount;

  if (ratio >= 1) {
    return 3;
  }

  if (ratio >= 0.5) {
    return 2;
  }

  return 1;
}
