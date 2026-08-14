import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';

import { AnswerOption, MultipleChoiceConfig } from '../../../models/content.types';
import { EventContext } from '../../../models/event-runtime.types';
import { ContentService } from '../../../services/content.service';
import { NarrationService, ReadingMode } from '../../../services/narration.service';
import { ImageSlot } from '../../../ui/image-slot/image-slot';
import { TaskCard } from '../../../ui/task-card/task-card';
import { EpisodeRun } from '../../episode/episode-run';
import { AnswerState, AnswerView } from './multiple-choice.types';

const LETTER_KEYS = ['A', 'B', 'C', 'D'] as const;

const ANSWER_MARKS: Readonly<Record<AnswerState, string | null>> = {
  open: null,
  correct: '✓',
  wrong: '✕',
};

const ANSWER_STATE_LABELS: Readonly<Record<AnswerState, string | null>> = {
  open: null,
  correct: 'Richtige Antwort',
  wrong: 'Falsche Antwort',
};

/**
 * Eventtyp `multiple_choice`: eine Frage, vier Antworten im 2×2-Raster.
 *
 * Eine falsche Antwort ist kein Sackgassen-Ende — sie wird ausgegraut, das Kind
 * darf weitertippen, bis es richtig ist. Für die Sterne zählt ausschließlich der
 * erste Versuch (Plan Meilenstein 3, „Entschieden vor dem Bauen" 1+2).
 */
@Component({
  selector: 'qst-multiple-choice',
  imports: [TaskCard, ImageSlot],
  templateUrl: './multiple-choice.html',
  styleUrl: './multiple-choice.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultipleChoice {
  private readonly content = inject(ContentService);
  private readonly narration = inject(NarrationService);
  private readonly run = inject(EpisodeRun);

  readonly config = input.required<MultipleChoiceConfig>();
  readonly context = input.required<EventContext>();

  /** Alle bereits angetippten Antworten — jede bleibt sichtbar ausgewertet. */
  private readonly pickedIndexes = signal<readonly number[]>([]);
  /** Nur der erste Tipp entscheidet über den Stern (`correctFirstTry`). */
  private readonly firstPick = signal<number | null>(null);

  protected readonly solved = computed<boolean>(() =>
    this.pickedIndexes().includes(this.config().correct_index),
  );

  protected readonly questionText = computed<string>(() => {
    const config = this.config();

    return this.narration.textFor(config.question, config.question_simple);
  });

  /** Im Vorlesemodus steht über jeder Antwort ein Bildplatz — auch ohne Datei. */
  protected readonly showAnswerImages = computed<boolean>(
    () => this.narration.mode() === 'listen',
  );

  protected readonly answers = computed<readonly AnswerView[]>(() => {
    const config = this.config();
    const picked = this.pickedIndexes();
    const solved = this.solved();
    const mode = this.narration.mode();

    return config.options.map((option: AnswerOption, index: number) => {
      const state = answerState(index, config.correct_index, picked);

      return {
        index,
        label: option.label,
        key: answerKey(index, mode),
        imageUrl: this.answerImageUrl(option, mode),
        state,
        mark: ANSWER_MARKS[state],
        stateLabel: ANSWER_STATE_LABELS[state],
        locked: solved || picked.includes(index),
      };
    });
  });

  /** Erscheint nach dem ersten Tipp und wird bei jedem weiteren aktualisiert. */
  protected readonly feedbackTitle = computed<string | null>(() => {
    if (this.firstPick() === null) {
      return null;
    }

    return this.solved() ? 'Richtig!' : 'Fast!';
  });

  protected readonly feedbackText = computed<string>(() =>
    this.solved()
      ? 'Super gemacht — weiter geht die Reise.'
      : 'Das war es noch nicht. Probier eine andere Antwort, du schaffst das.',
  );

  /** Vor dieser Aufgabe abgeschlossene Aufgaben — der Kopf zeigt daraus die Punkte. */
  protected readonly stepDone = this.run.scoredCount;
  protected readonly stepTotal = this.run.scoredTotal;

  protected pick(index: number): void {
    if (this.solved() || this.pickedIndexes().includes(index)) {
      return;
    }

    if (this.firstPick() === null) {
      this.firstPick.set(index);
    }

    this.pickedIndexes.update((picked: readonly number[]) => [...picked, index]);
  }

  protected finish(): void {
    if (!this.solved()) {
      return;
    }

    this.narration.stop();
    this.run.finish({
      kind: 'scored',
      correctFirstTry: this.firstPick() === this.config().correct_index,
    });
  }

  /** Im Lesemodus trägt die Antwort keinen Bildplatz — dort steht nur Text. */
  private answerImageUrl(option: AnswerOption, mode: ReadingMode): string | null {
    if (mode !== 'listen' || option.image === undefined) {
      return null;
    }

    return this.content.assetUrl(this.context().themeId, 'answers', option.image);
  }
}

/** Vorlesemodus: Ziffern, Lesemodus: Buchstaben. */
function answerKey(index: number, mode: ReadingMode): string {
  if (mode === 'listen') {
    return String(index + 1);
  }

  return LETTER_KEYS[index] ?? String(index + 1);
}

function answerState(
  index: number,
  correctIndex: number,
  picked: readonly number[],
): AnswerState {
  if (!picked.includes(index)) {
    return 'open';
  }

  return index === correctIndex ? 'correct' : 'wrong';
}
