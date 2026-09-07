import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MapEntry, MapNode, WorldConfig } from '../../models/content.types';
import { ProgressState } from '../../models/game-state.types';
import { ContentService } from '../../services/content.service';
import { GameStateService } from '../../services/game-state.service';
import {
  derivedUnlockedTileIds,
  nodeRevealStates,
  nodeStates,
  RevealState,
  stageStates,
} from '../../services/progress.rules';
import { ProgressService } from '../../services/progress.service';
import { ContentError } from '../../ui/content-error/content-error';
import { Hud } from '../../ui/hud/hud';
import { MapCanvas, TILE_SIZE, resolveTileOrigin } from '../../ui/map-canvas/map-canvas';
import { MapCanvasPoint, MapCanvasTile } from '../../ui/map-canvas/map-canvas.types';
import { MapPoint } from '../../ui/map-canvas/map-point/map-point';
import { MapPanel } from '../../ui/map-panel/map-panel';

/**
 * Ortskarte eines Arcs unter `theme/:themeId/map/:mapId` — die Orte, an denen
 * Episoden starten. Zustände kommen wie überall aus `progress.rules.ts`.
 *
 * Heißt `MapScreen`, nicht `Map` — der Name würde sonst das globale `Map`
 * (den Container-Typ, den diese Klasse selbst braucht) im ganzen File verdecken.
 */
@Component({
  selector: 'qst-map',
  imports: [RouterLink, Hud, ContentError, MapCanvas, MapPoint, MapPanel],
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

  /** Zwischenstand fürs Karten-Panel: erkundete Orte / Orte mit eigener Episode. */
  protected readonly mapProgress = computed<{ done: number; total: number }>(() => {
    const nodesWithEpisode = (this.mapEntry()?.nodes ?? []).filter(
      (node: MapNode) => node.episode_ref !== undefined,
    );
    const states = this.nodeStateMap();
    const done = nodesWithEpisode.filter((node: MapNode) => states.get(node.id) === 'done').length;

    return { done, total: nodesWithEpisode.length };
  });

  /** Reihenfolge aus dem Content — dieselbe, auf der `nodeStates` schon läuft. */
  private readonly orderedNodeIds = computed<readonly string[]>(
    () => this.mapEntry()?.nodes.map((node: MapNode) => node.id) ?? [],
  );

  protected readonly revealStateMap = computed<Map<string, RevealState>>(() =>
    nodeRevealStates(this.orderedNodeIds(), this.nodeStateMap()),
  );

  protected readonly points = computed<readonly MapCanvasPoint[]>(() =>
    (this.mapEntry()?.nodes ?? []).map((node: MapNode) => ({
      id: node.id,
      tileId: node.tile_id,
      x: node.x,
      y: node.y,
    })),
  );

  /** Ort, auf den `MapCanvas` beim Öffnen zentriert — der aktuelle, sonst der letzte. */
  protected readonly focusNodeId = computed<string | null>(() => {
    const states = this.nodeStateMap();
    const nodes = this.mapEntry()?.nodes ?? [];
    const current = nodes.find((node: MapNode) => states.get(node.id) === 'current');

    return current?.id ?? nodes.at(-1)?.id ?? null;
  });

  protected readonly lockedNodeIds = computed<readonly string[]>(() =>
    [...this.nodeStateMap().entries()]
      .filter(([, state]: [string, ProgressState]) => state === 'locked')
      .map(([nodeId]: [string, ProgressState]) => nodeId),
  );

  protected readonly tiles = computed<readonly MapCanvasTile[]>(() => {
    const map = this.mapEntry();

    if (map === null) {
      return [];
    }

    return map.tiles.map((tile) => ({
      id: tile.id,
      row: tile.row,
      col: tile.col,
      url: this.content.assetUrl(this.themeId(), 'maps', tile.background),
    }));
  });

  private readonly orderedTileIds = computed<readonly string[]>(
    () => this.mapEntry()?.tiles.map((tile) => tile.id) ?? [],
  );

  /** Die Orts-Zustände nach Kachel gruppiert — Eingabe der Freischalt-Regel. */
  private readonly nodeStatesByTile = computed<ReadonlyMap<string, readonly ProgressState[]>>(
    () => {
      const nodes = this.mapEntry()?.nodes ?? [];
      const states = this.nodeStateMap();
      const byTile = new Map<string, ProgressState[]>();

      for (const node of nodes) {
        const list = byTile.get(node.tile_id) ?? [];
        list.push(states.get(node.id) ?? 'locked');
        byTile.set(node.tile_id, list);
      }

      return byTile;
    },
  );

  /** Abgeleiteter Stand vereinigt mit der gespeicherten Hochwassermarke (ADR-020). */
  protected readonly unlockedTileIds = computed<readonly string[]>(() => {
    const derived = derivedUnlockedTileIds(this.orderedTileIds(), this.nodeStatesByTile());
    const persisted = this.progressService.revealedTileIds(this.themeId(), this.mapId());

    return [...new Set([...derived, ...persisted])];
  });

  private readonly persistUnlockedTiles = effect(() => {
    this.progressService.syncRevealedTiles(this.themeId(), this.mapId(), this.unlockedTileIds());
  });

  protected pointX(tileId: string, percentX: number): number {
    const origin = resolveTileOrigin(this.tiles(), tileId);

    return origin === null ? 0 : origin.x + (percentX / 100) * TILE_SIZE;
  }

  protected pointY(tileId: string, percentY: number): number {
    const origin = resolveTileOrigin(this.tiles(), tileId);

    return origin === null ? 0 : origin.y + (percentY / 100) * TILE_SIZE;
  }

  protected stateOf(nodeId: string): ProgressState {
    return this.nodeStateMap().get(nodeId) ?? 'locked';
  }

  protected revealOf(nodeId: string): RevealState {
    return this.revealStateMap().get(nodeId) ?? 'unknown';
  }

  protected nodeImageUrl(illustration: string): string {
    return this.content.assetUrl(this.themeId(), 'maps', illustration);
  }

  /** Text im Hinweis-Dialog eines Knotens ohne `episode_ref` (z. B. die Arena). */
  protected readonly hintText = signal<string>('');

  protected openHint(hintText: string | undefined, dialog: HTMLDialogElement): void {
    this.hintText.set(hintText ?? '');
    dialog.showModal();
  }
}
