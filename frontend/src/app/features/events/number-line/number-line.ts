import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

import { NumberLineConfig } from '../../../models/content.types';
import { EventContext } from '../../../models/event-runtime.types';
import { NarrationService } from '../../../services/narration.service';
import { TaskCard } from '../../../ui/task-card/task-card';
import { EpisodeRun } from '../../episode/episode-run';
import { FieldState, NumberFieldView, fieldValues, isLabelled } from './number-line.types';

/** Wie lange ein falsch getroffenes Feld rot bleibt, bevor es wieder aufgeht. */
const WRONG_FEEDBACK_MS = 900;

/**
 * Eventtyp `number_line`: Ein Zahlenstrahl mit sichtbaren Feldern, das Kind
 * tippt das gesuchte an.
 *
 * **Felder, kein freies Ziehen** (Plan Phase 3, Risiko): Für Klasse 1 wäre
 * millimetergenaues Ziehen auf einer Linie eine Feinmotorik-Prüfung statt einer
 * Rechenaufgabe. Jedes Feld ist ein eigener Knopf — damit ist der Strahl ohne
 * Zutun mit der Tastatur bedienbar (AK 2).
 *
 * Ein Fehlgriff ist kein Sackgassen-Ende — das Feld geht wieder auf. Für den
 * Stern zählt der erste Versuch (ADR-014).
 */
@Component({
  selector: 'qst-number-line',
  imports: [TaskCard],
  templateUrl: './number-line.html',
  styleUrl: './number-line.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberLine {
  private readonly narration = inject(NarrationService);
  private readonly run = inject(EpisodeRun);
  private readonly destroyRef = inject(DestroyRef);

  readonly config = input.required<NumberLineConfig>();
  /** Wird von jeder Aufgabe gefüllt; der Zahlenstrahl hat keine eigenen Bilddateien. */
  readonly context = input.required<EventContext>();

  /** Das getroffene Feld — gesetzt, sobald die Zahl stimmt. */
  private readonly foundValue = signal<number | null>(null);
  /** Das zuletzt falsch getippte Feld, solange die Rückmeldung steht. */
  private readonly wrongValue = signal<number | null>(null);
  private readonly mistakeCount = signal(0);

  private wrongTimeout: ReturnType<typeof setTimeout> | undefined;

  protected readonly solved = computed<boolean>(() => this.foundValue() !== null);

  protected readonly questionText = computed<string>(() => {
    const config = this.config();

    return this.narration.textFor(config.question, config.question_simple);
  });

  protected readonly fields = computed<readonly NumberFieldView[]>(() => {
    const config = this.config();
    const values = fieldValues(config);
    const found = this.foundValue();
    const wrong = this.wrongValue();

    return values.map((value: number, index: number) => {
      const state = fieldStateFor(value, found, wrong);

      return {
        value,
        label: isLabelled(config, index, values.length) ? String(value) : null,
        state,
        locked: found !== null,
      };
    });
  });

  protected readonly feedbackTitle = computed<string | null>(() => {
    if (!this.solved()) {
      return null;
    }

    return this.mistakeCount() === 0 ? 'Genau die richtige Zahl!' : 'Gefunden!';
  });

  protected readonly feedbackText = computed<string>(() => {
    if (this.mistakeCount() === 0) {
      return 'Auf Anhieb die richtige Stelle getroffen.';
    }

    return `Die ${this.config().target} war es. Weiter geht die Reise.`;
  });

  /** Vor dieser Aufgabe abgeschlossene Aufgaben — der Kopf zeigt daraus die Punkte. */
  protected readonly stepDone = this.run.scoredCount;
  protected readonly stepTotal = this.run.scoredTotal;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.wrongTimeout));
  }

  protected pickField(value: number): void {
    if (this.solved()) {
      return;
    }

    clearTimeout(this.wrongTimeout);
    this.wrongValue.set(null);

    if (value === this.config().target) {
      this.foundValue.set(value);

      return;
    }

    this.mistakeCount.update((count: number) => count + 1);
    this.wrongValue.set(value);

    this.wrongTimeout = setTimeout(() => this.wrongValue.set(null), WRONG_FEEDBACK_MS);
  }

  protected finish(): void {
    if (!this.solved()) {
      return;
    }

    this.narration.stop();
    this.run.finish({ kind: 'scored', correctFirstTry: this.mistakeCount() === 0 });
  }
}

function fieldStateFor(value: number, found: number | null, wrong: number | null): FieldState {
  if (value === found) {
    return 'correct';
  }

  if (value === wrong) {
    return 'wrong';
  }

  return 'open';
}
