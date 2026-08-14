import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';

import { NarrationService } from '../../services/narration.service';
import { ReadAloudButton } from '../read-aloud-button/read-aloud-button';
import { TaskStep, TaskStepState } from './task-card.types';

/**
 * Die Hülle, die sich alle Aufgaben-Typen teilen: Kopf mit Aufgaben-Tag und
 * Fortschrittspunkten, Frage mit Vorlese-Knopf, darunter der Aufgabenkörper und
 * die Feedback-Leiste.
 *
 * Vorlesen lebt hier — im Vorlesemodus spricht die Frage beim Öffnen von
 * allein, sonst nur auf Knopfdruck. Ein Aufgaben-Typ kümmert sich damit nur
 * noch um seine eigene Mechanik.
 */
@Component({
  selector: 'qst-task-card',
  imports: [ReadAloudButton],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCard {
  private readonly narration = inject(NarrationService);

  /** Auszeichnung über der Frage, z. B. „Aufgabe · Quiz". */
  readonly tag = input.required<string>();
  /** Bereits in der Fassung, die zum Vorlesemodus passt. */
  readonly question = input.required<string>();
  readonly questionAudioUrl = input<string>();
  /** Wie viele bewertete Events dieser Episode vor dieser Aufgabe lagen. */
  readonly stepDone = input.required<number>();
  readonly stepTotal = input.required<number>();

  protected readonly steps = computed<readonly TaskStep[]>(() => {
    const done = this.stepDone();

    return Array.from({ length: this.stepTotal() }, (_unused: unknown, index: number) => ({
      position: index + 1,
      state: stepStateAt(index, done),
    }));
  });

  protected readonly stepsLabel = computed<string>(
    () => `Aufgabe ${this.stepDone() + 1} von ${this.stepTotal()}`,
  );

  /**
   * Jede neue Frage wird im Vorlesemodus von allein gesprochen. Der Modus ist
   * bewusst keine Abhängigkeit — ein Umschalten mitten in der Aufgabe soll
   * nicht neu vorlesen (gleiche Regel wie im Dialog).
   */
  private readonly speakQuestion = effect(() => {
    const question = this.question();

    untracked(() => {
      this.narration.stop();

      if (this.narration.mode() !== 'listen') {
        return;
      }

      this.narration.speak(question, this.questionAudioUrl());
    });
  });
}

function stepStateAt(index: number, done: number): TaskStepState {
  if (index < done) {
    return 'done';
  }

  if (index === done) {
    return 'current';
  }

  return 'open';
}
