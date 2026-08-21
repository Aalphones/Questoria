import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, map, of, startWith, switchMap } from 'rxjs';

import { InstalledTheme, MainHub as MainHubContent, WorldConfig } from '../../models/content.types';
import { LoadState } from '../../models/game-state.types';
import { conditionHint } from '../../services/achievement.rules';
import { AchievementService } from '../../services/achievement.service';
import { ContentService } from '../../services/content.service';
import { stageStates } from '../../services/progress.rules';
import { ProgressService } from '../../services/progress.service';
import { ImageSlot } from '../../ui/image-slot/image-slot';
import { MapCanvas, TILE_SIZE, resolveTileOrigin } from '../../ui/map-canvas/map-canvas';
import { MapCanvasPoint, MapCanvasTile } from '../../ui/map-canvas/map-canvas.types';
import { MapPoint } from '../../ui/map-canvas/map-point/map-point';
import { ThemeCard } from './theme-card/theme-card';

/**
 * Planetenkarte unter `` — alle installierten Welten als Knoten auf derselben
 * Kartenfläche wie Etappen- und Ortskarte. Die Wahl einer Welt führt auf ihre
 * Lernstufen-Auswahl; die Lernstufe selbst wird hier nicht mehr gewählt (eigener
 * Screen seit Phase 5).
 *
 * Keine Kopfleiste: von hier führt kein Weg zurück, die Kopfleiste beginnt eine
 * Ebene tiefer (Design-Handoff, Abschnitt 0).
 */
@Component({
  selector: 'qst-main-hub',
  imports: [RouterLink, MapCanvas, MapPoint, ThemeCard, ImageSlot],
  templateUrl: './main-hub.html',
  styleUrl: './main-hub.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainHub {
  private readonly content = inject(ContentService);
  private readonly progressService = inject(ProgressService);
  private readonly achievementService = inject(AchievementService);
  private readonly router = inject(Router);

  readonly hubState = toSignal(asLoadState(this.content.getInstalledThemes()), {
    initialValue: { status: 'loading' } as LoadState<MainHubContent>,
  });

  /** Welten, in denen schon etwas geschafft wurde. */
  private readonly startedThemeIds = computed<readonly string[]>(() =>
    Object.keys(this.progressService.store()),
  );

  /**
   * Die Status-Pille braucht die Etappenliste der Welt, die nur in deren
   * Konfigurationsdatei steht. Geladen werden ausschließlich Welten mit
   * Fortschritt — sonst zöge die Planetenkarte für jede installierte Welt eine
   * eigene Datei nach, nur um am Ende „Noch nicht gestartet" anzuzeigen.
   */
  private readonly startedWorlds = toSignal(
    toObservable(this.startedThemeIds).pipe(
      switchMap((themeIds: readonly string[]) => this.loadWorlds(themeIds)),
    ),
    { initialValue: new Map<string, WorldConfig>() },
  );

  /**
   * Alle installierten Welten, unabhängig vom Fortschritt — anders als
   * `startedWorlds` unten (Status-Pille), weil das Erfolge-Panel Erfolge auch
   * für noch nicht gestartete Welten zeigt (Plan Phase 7, AK 4: "alle Erfolge
   * der Welten").
   */
  private readonly installedThemeIds = computed<readonly string[]>(() => {
    const hub = this.hubState();

    return hub.status === 'loaded' ? hub.data.installed_themes.map((theme) => theme.id) : [];
  });

  private readonly allWorlds = toSignal(
    toObservable(this.installedThemeIds).pipe(
      switchMap((themeIds: readonly string[]) => this.loadWorlds(themeIds)),
    ),
    { initialValue: new Map<string, WorldConfig>() },
  );

  /** Ein Eintrag je Erfolg jeder installierten Welt — erreicht oder offen mit Hinweis (Plan AK 4/5). */
  protected readonly achievementEntries = computed<readonly AchievementPanelEntry[]>(() => {
    const hub = this.hubState();

    if (hub.status !== 'loaded') {
      return [];
    }

    const worlds = this.allWorlds();
    const entries: AchievementPanelEntry[] = [];

    for (const theme of hub.data.installed_themes) {
      const world = worlds.get(theme.id);

      if (world === undefined) {
        continue;
      }

      const unlockedKeys = this.achievementService.unlockedByTheme()[theme.id] ?? new Set<string>();

      for (const achievement of world.achievements ?? []) {
        entries.push({
          key: `${theme.id}:${achievement.key}`,
          title: achievement.title,
          iconUrl: this.content.assetUrl(theme.id, 'achievements', achievement.icon),
          unlocked: unlockedKeys.has(achievement.key),
          hint: conditionHint(achievement.condition, world),
        });
      }
    }

    return entries;
  });

  protected readonly tiles = computed<readonly MapCanvasTile[]>(() => {
    const hub = this.hubState();

    if (hub.status !== 'loaded') {
      return [];
    }

    return hub.data.hub_map.tiles.map((tile) => ({
      id: tile.id,
      row: tile.row,
      col: tile.col,
      url: this.content.hubAssetUrl(tile.background),
    }));
  });

  /** Phase 1: noch keine Fortschritts-Berechnung — alle Kacheln offen (Phase 3 ersetzt das). */
  protected readonly unlockedTileIds = computed<readonly string[]>(() =>
    this.tiles().map((tile: MapCanvasTile) => tile.id),
  );

  protected readonly points = computed<readonly MapCanvasPoint[]>(() => {
    const hub = this.hubState();

    if (hub.status !== 'loaded') {
      return [];
    }

    return hub.data.installed_themes.map((theme: InstalledTheme) => ({
      id: theme.id,
      tileId: theme.tile_id,
      x: theme.x,
      y: theme.y,
    }));
  });

  /** Pixel-Weltposition eines Welt-Knotens, für die direkte `qst-map-point`-Bindung im Template. */
  protected pointX(tileId: string, percentX: number): number {
    const origin = resolveTileOrigin(this.tiles(), tileId);

    return origin === null ? 0 : origin.x + (percentX / 100) * TILE_SIZE;
  }

  protected pointY(tileId: string, percentY: number): number {
    const origin = resolveTileOrigin(this.tiles(), tileId);

    return origin === null ? 0 : origin.y + (percentY / 100) * TILE_SIZE;
  }

  /**
   * Welt des zuletzt geschafften Orts — Ziel von „Weiterspielen" und der Knoten,
   * der sich bewegt. `null`, solange nichts gespielt wurde oder die Welt nicht
   * mehr installiert ist; der Knopf entfällt dann, statt ins Leere zu führen.
   */
  protected readonly continueThemeId = computed<string | null>(() => {
    const hub = this.hubState();
    const lastPlayed = this.lastPlayedThemeId();

    if (hub.status !== 'loaded' || lastPlayed === null) {
      return null;
    }

    const isInstalled = hub.data.installed_themes.some(
      (theme: InstalledTheme) => theme.id === lastPlayed,
    );

    return isInstalled ? lastPlayed : null;
  });

  private readonly lastPlayedThemeId = computed<string | null>(() => {
    let latestThemeId: string | null = null;
    let latestTimestamp = '';

    for (const [themeId, episodes] of Object.entries(this.progressService.store())) {
      for (const episode of Object.values(episodes)) {
        // ISO-Zeitstempel lassen sich zeichenweise vergleichen — kein Date-Parsen nötig.
        if (episode.completedAt > latestTimestamp) {
          latestTimestamp = episode.completedAt;
          latestThemeId = themeId;
        }
      }
    }

    return latestThemeId;
  });

  /**
   * Nur auf schmalen Karten wirksam: dort startet das Info-Panel zugeklappt,
   * damit es die Welten nicht verdeckt. Ab der Schwelle in `_breakpoints.scss`
   * zeigt das Stylesheet den Inhalt unabhängig von diesem Zustand.
   */
  protected readonly panelOpen = signal<boolean>(false);

  chooseTheme(themeId: string): void {
    void this.router.navigate(['theme', themeId, 'level']);
  }

  protected togglePanel(): void {
    this.panelOpen.update((isOpen: boolean) => !isOpen);
  }

  protected statusLabel(themeId: string): string {
    const world = this.startedWorlds().get(themeId);

    if (world === undefined) {
      return 'Noch nicht gestartet';
    }

    const states = stageStates(world, (episodeId: string) =>
      this.progressService.isEpisodeCompleted(themeId, episodeId),
    );
    const stageIndex = world.arc_overview.stages.findIndex(
      (stage) => states.get(stage.map_id) === 'current',
    );

    if (stageIndex === -1) {
      return 'Alle Etappen geschafft';
    }

    return `Offen · Etappe ${stageIndex + 1}`;
  }

  private loadWorlds(themeIds: readonly string[]): Observable<Map<string, WorldConfig>> {
    if (themeIds.length === 0) {
      return of(new Map<string, WorldConfig>());
    }

    const requests = themeIds.map((themeId: string) =>
      this.content.getWorldConfig(themeId).pipe(
        map((world: WorldConfig): readonly [string, WorldConfig] | null => [themeId, world]),
        // Eine Welt, deren Konfiguration fehlt, zeigt „Noch nicht gestartet",
        // statt die ganze Planetenkarte scheitern zu lassen.
        catchError(() => of(null)),
      ),
    );

    return forkJoin(requests).pipe(
      map(
        (entries: readonly (readonly [string, WorldConfig] | null)[]) =>
          new Map<string, WorldConfig>(
            entries.filter((entry): entry is readonly [string, WorldConfig] => entry !== null),
          ),
      ),
    );
  }
}

/** Ein Eintrag im Erfolge-Panel — bereits auf Anzeigedaten reduziert. */
interface AchievementPanelEntry {
  readonly key: string;
  readonly title: string;
  readonly iconUrl: string;
  readonly unlocked: boolean;
  /** Nur für offene Erfolge gedacht — ein Kind soll wissen, was zu tun ist. */
  readonly hint: string;
}

/** Verpackt einen HTTP-Aufruf in den Ladezustand, den die Templates lesen. */
function asLoadState<T>(source: Observable<T>): Observable<LoadState<T>> {
  return source.pipe(
    map((data: T): LoadState<T> => ({ status: 'loaded', data })),
    startWith({ status: 'loading' } as LoadState<T>),
    catchError((error: unknown): Observable<LoadState<T>> => {
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';

      return of({ status: 'error', message });
    }),
  );
}
