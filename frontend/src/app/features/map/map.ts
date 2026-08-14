import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MapEntry, MapNode, WorldConfig } from '../../models/content.types';
import { ProgressState } from '../../models/game-state.types';
import { ContentService } from '../../services/content.service';
import { GameStateService } from '../../services/game-state.service';
import { nodeStates, stageStates } from '../../services/progress.rules';
import { ProgressService } from '../../services/progress.service';
import { ContentError } from '../../ui/content-error/content-error';
import { Hud } from '../../ui/hud/hud';
import { MapCanvas } from '../../ui/map-canvas/map-canvas';
import { MapCanvasPoint } from '../../ui/map-canvas/map-canvas.types';
import { MapPoint } from '../../ui/map-canvas/map-point/map-point';

/**
 * Ortskarte eines Arcs unter `theme/:themeId/map/:mapId` — die Orte, an denen
 * Episoden starten. Zustände kommen wie überall aus `progress.rules.ts`.
 *
 * Heißt `MapScreen`, nicht `Map` — der Name würde sonst das globale `Map`
 * (den Container-Typ, den diese Klasse selbst braucht) im ganzen File verdecken.
 */
@Component({
  selector: 'qst-map',
  imports: [RouterLink, Hud, ContentError, MapCanvas, MapPoint],
  templateUrl: './map.html',
  styleUrl: './map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapScreen {
  private readonly content = inject(ContentService);
  private readonly gameState = inject(GameStateService);
  private readonly progressService = inject(ProgressService);

  readonly themeId = input.required<string>();
  readonly mapId = input.required<string>();
  readonly world = input<WorldConfig | null>(null);

  private readonly isEpisodeCompleted = (episodeId: string): boolean =>
    this.progressService.isEpisodeCompleted(this.themeId(), episodeId);

  protected readonly mapEntry = computed<MapEntry | null>(
    () => this.world()?.maps.find((entry: MapEntry) => entry.id === this.mapId()) ?? null,
  );

  protected readonly levelLabel = computed<string | null>(() => {
    const world = this.world();
    const levelId = this.gameState.activeDifficultyLevel();

    return world?.difficulty_levels.find((level) => level.id === levelId)?.label ?? null;
  });

  private readonly stageState = computed<ProgressState>(() => {
    const world = this.world();

    return world === null ? 'locked' : (stageStates(world, this.isEpisodeCompleted).get(this.mapId()) ?? 'locked');
  });

  protected readonly nodeStateMap = computed<Map<string, ProgressState>>(() => {
    const map = this.mapEntry();

    return map === null ? new Map() : nodeStates(map, this.isEpisodeCompleted, this.stageState());
  });

  protected readonly points = computed<readonly MapCanvasPoint[]>(() =>
    (this.mapEntry()?.nodes ?? []).map((node: MapNode) => ({ id: node.id, x: node.x, y: node.y })),
  );

  protected readonly lockedNodeIds = computed<readonly string[]>(() =>
    [...this.nodeStateMap().entries()]
      .filter(([, state]: [string, ProgressState]) => state === 'locked')
      .map(([nodeId]: [string, ProgressState]) => nodeId),
  );

  protected readonly backgroundUrl = computed<string | null>(() => {
    const map = this.mapEntry();

    return map === null ? null : this.content.assetUrl(this.themeId(), 'maps', map.file);
  });

  protected readonly backgroundLabel = computed<string>(() => this.mapEntry()?.file ?? '');

  protected stateOf(nodeId: string): ProgressState {
    return this.nodeStateMap().get(nodeId) ?? 'locked';
  }

  protected isReachable(nodeId: string): boolean {
    const state = this.stateOf(nodeId);

    return state === 'done' || state === 'current';
  }
}
