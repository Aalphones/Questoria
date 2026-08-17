import { Service, inject, signal } from '@angular/core';

import { EventOutcome } from '../../models/event-runtime.types';
import { RunStoreService } from '../../services/run-store.service';

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
  private readonly runStore = inject(RunStoreService);

  /** Für welche Episode dieser Lauf gerade steht — gesetzt von `EpisodeScreen`, nötig um den Fortschritt zuzuordnen (Phase 6). */
  private themeId = '';
  private episodeId = '';

  /** Position in `Episode.events` — steht der Index hinter dem letzten Event, ist die Episode durch. */
  readonly eventIndex = signal(0);
  /** Wie viele bewertete Events (Aufgaben) bisher gespielt wurden. */
  readonly scoredCount = signal(0);
  /** Wie viele bewertete Events die Episode insgesamt hat — gesetzt vom Episoden-Screen. */
  readonly scoredTotal = signal(0);
  /** Davon beim ersten Versuch richtig — die Grundlage der Sternenformel (Phase 5). */
  readonly correctFirstTryCount = signal(0);
  /**
   * `card_id` aus einem gespielten `reward`-Event, `null` ohne eine — gemerkt,
   * nicht verwendet. Meilenstein 5 hängt hier die echte Kartenvergabe an.
   */
  readonly pendingCardId = signal<string | null>(null);

  /** Für welche Episode gespeichert wird — aufgerufen von `EpisodeScreen` bei jedem Episodenwechsel. */
  configure(themeId: string, episodeId: string): void {
    this.themeId = themeId;
    this.episodeId = episodeId;
  }

  finish(outcome: EventOutcome): void {
    if (outcome.kind === 'scored') {
      this.scoredCount.update((count: number) => count + 1);

      if (outcome.correctFirstTry) {
        this.correctFirstTryCount.update((count: number) => count + 1);
      }
    }

    this.eventIndex.update((index: number) => index + 1);
    this.persist();
  }

  restart(): void {
    this.eventIndex.set(0);
    this.scoredCount.set(0);
    this.correctFirstTryCount.set(0);
    this.pendingCardId.set(null);
  }

  /** Setzt einen gespeicherten Zwischenstand fort — genutzt ab Phase 6 („Weiterspielen"). */
  startAt(eventIndex: number, scoredCount: number, correctFirstTryCount: number): void {
    this.eventIndex.set(eventIndex);
    this.scoredCount.set(scoredCount);
    this.correctFirstTryCount.set(correctFirstTryCount);
  }

  /** Nach jedem abgeschlossenen Event — ein geschlossener Tab meldet sich nicht ab (Plan AK 2). */
  private persist(): void {
    if (this.themeId === '' || this.episodeId === '') {
      return;
    }

    this.runStore.save({
      themeId: this.themeId,
      episodeId: this.episodeId,
      eventIndex: this.eventIndex(),
      scoredCount: this.scoredCount(),
      correctFirstTryCount: this.correctFirstTryCount(),
    });
  }
}
