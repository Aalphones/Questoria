import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from '@angular/core';

import { RewardConfig } from '../../../models/content.types';
import { EventContext } from '../../../models/event-runtime.types';
import { NarrationService } from '../../../services/narration.service';
import { ReadAloudButton } from '../../../ui/read-aloud-button/read-aloud-button';
import { EpisodeRun } from '../../episode/episode-run';

const MESSAGE = 'Du hast alles geschafft — super gemacht!';

/**
 * Eventtyp `reward`: der kurze Belohnungs-Moment am Ende einer Episode. Zeigt
 * in Meilenstein 3 ausschließlich Sterne — keine Sammelkarte, kein
 * Kartenrahmen (Plan, AK 2). Die `card_id` wird nur gemerkt
 * (`EpisodeRun.pendingCardId`), Meilenstein 5 hängt die echte Vergabe daran.
 */
@Component({
  selector: 'qst-reward',
  imports: [ReadAloudButton],
  templateUrl: './reward.html',
  styleUrl: './reward.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reward {
  private readonly narration = inject(NarrationService);
  private readonly run = inject(EpisodeRun);

  readonly config = input.required<RewardConfig>();
  readonly context = input.required<EventContext>();

  protected readonly message = MESSAGE;

  /** Wird einmal beim Erscheinen gemerkt — Meilenstein 5 vergibt die Karte, hier nur der Haken. */
  private readonly rememberCard = effect(() => {
    const cardId = this.config().card_id ?? null;

    untracked(() => this.run.pendingCardId.set(cardId));
  });

  /** Wie bei jedem Story-Text: im Vorlesemodus spricht die Computerstimme von allein. */
  private readonly speakMessage = effect(() => {
    untracked(() => {
      if (this.narration.mode() === 'listen') {
        this.narration.speak(MESSAGE);
      }
    });
  });

  protected finish(): void {
    this.narration.stop();
    this.run.finish({ kind: 'story' });
  }
}
