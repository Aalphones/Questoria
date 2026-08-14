import { Service, signal } from '@angular/core';

import { EventOutcome } from '../../models/event-runtime.types';

/**
 * Der Stand des laufenden Durchgangs durch eine Episode: an welchem Event er
 * steht und wie viele bewertete Events beim ersten Versuch saßen.
 *
 * Wird von `EpisodeScreen` bereitgestellt, **nicht** global — jeder Besuch
 * einer Episode bekommt einen frischen Lauf. Die Event-Komponenten kennen von
 * ihrer Umgebung nur diesen Dienst und melden über `finish()` Vollzug.
 */
@Service()
export class EpisodeRun {
  /** Position in `Episode.events` — steht der Index hinter dem letzten Event, ist die Episode durch. */
  readonly eventIndex = signal(0);
  /** Wie viele bewertete Events (Aufgaben) bisher gespielt wurden. */
  readonly scoredCount = signal(0);
  /** Davon beim ersten Versuch richtig — die Grundlage der Sternenformel (Phase 5). */
  readonly correctFirstTryCount = signal(0);

  finish(outcome: EventOutcome): void {
    if (outcome.kind === 'scored') {
      this.scoredCount.update((count: number) => count + 1);

      if (outcome.correctFirstTry) {
        this.correctFirstTryCount.update((count: number) => count + 1);
      }
    }

    this.eventIndex.update((index: number) => index + 1);
  }

  restart(): void {
    this.eventIndex.set(0);
    this.scoredCount.set(0);
    this.correctFirstTryCount.set(0);
  }

  /** Setzt einen gespeicherten Zwischenstand fort — genutzt ab Phase 6 („Weiterspielen"). */
  startAt(eventIndex: number, scoredCount: number, correctFirstTryCount: number): void {
    this.eventIndex.set(eventIndex);
    this.scoredCount.set(scoredCount);
    this.correctFirstTryCount.set(correctFirstTryCount);
  }
}
