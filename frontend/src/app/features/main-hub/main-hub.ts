import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, map, of, startWith, switchMap } from 'rxjs';

import { InstalledTheme, MainHub as MainHubContent, WorldConfig } from '../../models/content.types';
import { LoadState } from '../../models/game-state.types';
import { ContentService } from '../../services/content.service';
import { stageStates } from '../../services/progress.rules';
import { ProgressService } from '../../services/progress.service';
import { MapCanvas } from '../../ui/map-canvas/map-canvas';
import { MapCanvasPoint } from '../../ui/map-canvas/map-canvas.types';
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
  imports: [RouterLink, MapCanvas, MapPoint, ThemeCard],
  templateUrl: './main-hub.html',
  styleUrl: './main-hub.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainHub {
  private readonly content = inject(ContentService);
  private readonly progressService = inject(ProgressService);
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

  protected readonly backgroundFile = computed<string>(() => {
    const hub = this.hubState();

    return hub.status === 'loaded' ? hub.data.hub_map.background : '';
  });

  protected readonly backgroundUrl = computed<string | null>(() => {
    const file = this.backgroundFile();

    return file === '' ? null : this.content.hubAssetUrl(file);
  });

  protected readonly points = computed<readonly MapCanvasPoint[]>(() => {
    const hub = this.hubState();

    if (hub.status !== 'loaded') {
      return [];
    }

    return hub.data.installed_themes.map((theme: InstalledTheme) => ({
      id: theme.id,
      x: theme.x,
      y: theme.y,
    }));
  });

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

  chooseTheme(themeId: string): void {
    void this.router.navigate(['theme', themeId, 'level']);
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
