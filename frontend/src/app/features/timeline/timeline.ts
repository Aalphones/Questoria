import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MapEntry, WorldConfig } from '../../models/content.types';
import { ProgressState } from '../../models/game-state.types';
import { GameStateService } from '../../services/game-state.service';
import { stageStars, stageStates, worldProgress } from '../../services/progress.rules';
import { ProgressService } from '../../services/progress.service';
import { ContentError } from '../../ui/content-error/content-error';
import { Hud } from '../../ui/hud/hud';
import { MapCanvas } from '../../ui/map-canvas/map-canvas';
import { MapCanvasPoint } from '../../ui/map-canvas/map-canvas.types';
import { MapPoint } from '../../ui/map-canvas/map-point/map-point';

/**
 * Seekarte der Story-Etappen unter `theme/:themeId/timeline` — welche Etappe
 * ist geschafft, welche ist dran, welche noch verschlossen. Zustände kommen
 * aus `progress.rules.ts`, kein Screen rechnet selbst (Konvention).
 */
@Component({
  selector: 'qst-timeline',
  imports: [RouterLink, Hud, ContentError, MapCanvas, MapPoint],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timeline {
  private readonly gameState = inject(GameStateService);
  private readonly progressService = inject(ProgressService);

  readonly themeId = input.required<string>();
  readonly world = input<WorldConfig | null>(null);

  protected readonly starIndexes = [0, 1, 2] as const;

  private readonly isEpisodeCompleted = (episodeId: string): boolean =>
    this.progressService.isEpisodeCompleted(this.themeId(), episodeId);

  private readonly starsFor = (episodeId: string): number | null =>
    this.progressService.starsFor(this.themeId(), episodeId);

  protected readonly stageStateMap = computed<Map<string, ProgressState>>(() => {
    const world = this.world();

    return world === null ? new Map() : stageStates(world, this.isEpisodeCompleted);
  });

  protected readonly points = computed<readonly MapCanvasPoint[]>(() =>
    (this.world()?.arc_overview.stages ?? []).map((stage) => ({
      id: stage.map_id,
      x: stage.x,
      y: stage.y,
    })),
  );

  protected readonly lockedStageIds = computed<readonly string[]>(() =>
    [...this.stageStateMap().entries()]
      .filter(([, state]: [string, ProgressState]) => state === 'locked')
      .map(([mapId]: [string, ProgressState]) => mapId),
  );

  protected readonly progress = computed<{ done: number; total: number } | null>(() => {
    const world = this.world();

    return world === null ? null : worldProgress(world, this.isEpisodeCompleted);
  });

  protected readonly levelLabel = computed<string | null>(() => {
    const world = this.world();
    const levelId = this.gameState.activeDifficultyLevel();

    return world?.difficulty_levels.find((level) => level.id === levelId)?.label ?? null;
  });

  protected stateOf(mapId: string): ProgressState {
    return this.stageStateMap().get(mapId) ?? 'locked';
  }

  protected isReachable(mapId: string): boolean {
    const state = this.stateOf(mapId);

    return state === 'done' || state === 'current';
  }

  protected starsOf(mapId: string): number {
    const map = this.mapFor(mapId);

    return map === undefined ? 0 : stageStars(map, this.starsFor);
  }

  protected starsLabel(mapId: string): string {
    return `${this.starsOf(mapId)} von 3 Sternen`;
  }

  protected confirmReset(dialog: HTMLDialogElement): void {
    this.progressService.resetTheme(this.themeId());
    dialog.close();
  }

  private mapFor(mapId: string): MapEntry | undefined {
    return this.world()?.maps.find((entry: MapEntry) => entry.id === mapId);
  }
}
