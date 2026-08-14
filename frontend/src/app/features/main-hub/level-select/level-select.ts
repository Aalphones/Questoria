import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { WorldConfig } from '../../../models/content.types';
import { GameStateService } from '../../../services/game-state.service';
import { ContentError } from '../../../ui/content-error/content-error';
import { Hud } from '../../../ui/hud/hud';
import { DifficultyPicker } from '../difficulty-picker/difficulty-picker';

/**
 * Eigener Screen unter `theme/:themeId/level` — zog aus dem Main-Hub-Screen
 * um, weil es in Meilenstein 1 noch keinen Router gab (`difficulty-picker`
 * bleibt dabei unverändert).
 */
@Component({
  selector: 'qst-level-select',
  imports: [Hud, ContentError, DifficultyPicker],
  templateUrl: './level-select.html',
  styleUrl: './level-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelSelect {
  private readonly router = inject(Router);
  private readonly gameState = inject(GameStateService);

  readonly themeId = input.required<string>();
  readonly world = input<WorldConfig | null>(null);

  readonly activeDifficultyLevel = this.gameState.activeDifficultyLevel;

  chooseDifficultyLevel(levelId: string): void {
    this.gameState.setActiveDifficultyLevel(levelId);
    void this.router.navigate(['theme', this.themeId(), 'timeline']);
  }
}
