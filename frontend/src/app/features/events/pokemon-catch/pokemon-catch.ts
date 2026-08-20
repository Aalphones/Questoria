import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, untracked } from '@angular/core';

import { PokemonCatchConfig, PokemonCatchTarget } from '../../../models/content.types';
import { EventContext } from '../../../models/event-runtime.types';
import { ContentService } from '../../../services/content.service';
import { NarrationService } from '../../../services/narration.service';
import { seededRandom, shuffle } from '../../../services/variation';
import { ImageSlot } from '../../../ui/image-slot/image-slot';
import { ReadAloudButton } from '../../../ui/read-aloud-button/read-aloud-button';
import { EpisodeRun } from '../../episode/episode-run';

/**
 * Eventtyp `pokemon_catch`: der Wurf, das erste Franchise-Spiel (Plan
 * `docs/planning/2026-08-19_pokeball-fangen/`). Ein Story-Event ohne
 * Bewertung (`kind: 'story'`) — es kann nicht schiefgehen (README
 * „Entschieden vor dem Bauen" 2+3).
 *
 * Phase 1 baut nur die Bühne: gezogenes Ziel, ruhender Ball, Ansagetext,
 * ein Knopf zum Abschließen. Die Wurfmechanik selbst kommt in Phase 2.
 */
@Component({
  selector: 'qst-pokemon-catch',
  imports: [ImageSlot, ReadAloudButton],
  templateUrl: './pokemon-catch.html',
  styleUrl: './pokemon-catch.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonCatch {
  private readonly content = inject(ContentService);
  private readonly narration = inject(NarrationService);
  private readonly run = inject(EpisodeRun);

  readonly config = input.required<PokemonCatchConfig>();
  readonly context = input.required<EventContext>();

  /**
   * Das gezogene Ziel — einmal beim Öffnen bestimmt über dieselbe Mischung
   * wie bei `multiple_choice` (Startwert aus dem Lauf, README-Checkliste
   * „Ziel-Auswahl über die vorhandene Mischung"). Bewusst `linkedSignal`
   * statt `computed`: ein Neuzeichnen darf das Ziel nicht neu ziehen.
   */
  private readonly target = linkedSignal<
    { readonly config: PokemonCatchConfig; readonly seed: number },
    PokemonCatchTarget
  >({
    source: () => ({ config: this.config(), seed: this.run.eventSeed() ?? 0 }),
    computation: ({ config, seed }) => {
      const order = shuffle(config.targets, seededRandom(seed));

      return order[0];
    },
  });

  protected readonly targetName = computed<string>(() => this.target().name);

  protected readonly targetSpriteUrl = computed<string>(() =>
    this.content.assetUrl(this.context().themeId, 'sprites', this.target().sprite),
  );

  protected readonly ballUrl = computed<string>(() =>
    this.content.assetUrl(this.context().themeId, 'props', this.config().ball),
  );

  protected readonly intro = computed<string>(() => this.config().intro);

  /** Wie bei jedem Story-Text: im Vorlesemodus spricht die Computerstimme von allein. */
  private readonly speakIntro = effect(() => {
    const text = this.intro();

    untracked(() => {
      if (this.narration.mode() === 'listen') {
        this.narration.speak(text);
      }
    });
  });

  protected finish(): void {
    this.narration.stop();
    this.run.finish({ kind: 'story' });
  }
}
