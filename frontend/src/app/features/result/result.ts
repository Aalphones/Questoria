import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ReadAloudButton } from '../../ui/read-aloud-button/read-aloud-button';

const HINT_TEXT = 'Toll gemacht! Du hast diesen Ort geschafft.';
const STAR_INDEXES = [0, 1, 2] as const;
/** Reine Dekoration — Anzahl und Reihenfolge sind ohne Bedeutung, nur der Effekt zählt. */
const CONFETTI_PIECES = Array.from({ length: 10 }, (_unused: unknown, index: number) => index);

/**
 * Zeigt der Episoden-Screen nach dem letzten Event — keine eigene Route, ein
 * Ergebnis ohne vorangegangenen Lauf gibt es nicht (Plan Meilenstein 3, Phase
 * 5, AK 8). Liest den Lauf, rechnet nicht selbst: Sterne und Zahlen kommen
 * als Eingaben herein.
 */
@Component({
  selector: 'qst-result',
  imports: [RouterLink, ReadAloudButton],
  templateUrl: './result.html',
  styleUrl: './result.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Result {
  readonly stars = input.required<number>();
  readonly correctFirstTry = input.required<number>();
  readonly scoredTotal = input.required<number>();
  readonly dialogLines = input.required<number>();
  readonly mapLink = input.required<readonly string[]>();
  readonly timelineLink = input.required<readonly string[]>();

  protected readonly hintText = HINT_TEXT;
  protected readonly starIndexes = STAR_INDEXES;
  protected readonly confettiPieces = CONFETTI_PIECES;

  protected readonly correctAnswersLabel = computed<string>(
    () => `${this.correctFirstTry()} / ${this.scoredTotal()}`,
  );
}
