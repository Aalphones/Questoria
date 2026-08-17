import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';

import { TextInputConfig } from '../../../models/content.types';
import { EventContext } from '../../../models/event-runtime.types';
import { NarrationService } from '../../../services/narration.service';
import { TaskCard } from '../../../ui/task-card/task-card';
import { EpisodeRun } from '../../episode/episode-run';
import { matchesAcceptedAnswer } from './text-input.types';

/**
 * Eventtyp `text_input`: eine Frage, ein Eingabefeld, ein Prüfen-Knopf.
 *
 * Wie beim Quiz ist eine falsche Eingabe kein Sackgassen-Ende — das Feld bleibt
 * bearbeitbar, bis die richtige Antwort steht. Für die Sterne zählt nur der
 * erste Versuch (Plan Meilenstein 3, „Entschieden vor dem Bauen" 1+2).
 */
@Component({
  selector: 'qst-text-input',
  imports: [TaskCard],
  templateUrl: './text-input.html',
  styleUrl: './text-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextInput {
  private readonly narration = inject(NarrationService);
  private readonly run = inject(EpisodeRun);

  readonly config = input.required<TextInputConfig>();
  readonly context = input.required<EventContext>();

  protected readonly value = signal('');
  protected readonly solved = signal(false);
  /** Nur der erste Prüf-Versuch entscheidet über den Stern. */
  private readonly firstTryCorrect = signal<boolean | null>(null);

  protected readonly questionText = computed<string>(() => {
    const config = this.config();

    return this.narration.textFor(config.question, config.question_simple);
  });

  protected readonly inputMode = computed<'numeric' | 'text'>(() =>
    this.config().input_type === 'number' ? 'numeric' : 'text',
  );

  protected readonly feedbackTitle = computed<string | null>(() => {
    if (this.firstTryCorrect() === null) {
      return null;
    }

    return this.solved() ? 'Richtig!' : 'Fast!';
  });

  protected readonly feedbackText = computed<string>(() =>
    this.solved()
      ? 'Super gemacht — weiter geht die Reise.'
      : 'Das war es noch nicht. Versuch es nochmal, du schaffst das.',
  );

  protected readonly stepDone = this.run.scoredCount;
  protected readonly stepTotal = this.run.scoredTotal;

  protected onInput(event: Event): void {
    const field = event.target as HTMLInputElement;

    this.value.set(field.value);
  }

  protected check(event: Event): void {
    event.preventDefault();

    if (this.solved()) {
      return;
    }

    const correct = matchesAcceptedAnswer(this.value(), this.config());

    if (this.firstTryCorrect() === null) {
      this.firstTryCorrect.set(correct);
    }

    if (correct) {
      this.solved.set(true);
    }
  }

  protected finish(): void {
    if (!this.solved()) {
      return;
    }

    this.narration.stop();
    this.run.finish({ kind: 'scored', correctFirstTry: this.firstTryCorrect() === true });
  }
}
