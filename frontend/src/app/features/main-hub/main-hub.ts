import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';

import { InstalledTheme, MainHub as MainHubContent } from '../../models/content.types';
import { LoadState } from '../../models/game-state.types';
import { ContentService } from '../../services/content.service';
import { GameStateService } from '../../services/game-state.service';
import { DifficultyPicker } from './difficulty-picker/difficulty-picker';
import { ThemeCard } from './theme-card/theme-card';

/** Startbildschirm: alle installierten Welten, danach die Lernstufe der gewählten Welt. */
@Component({
  selector: 'qst-main-hub',
  imports: [ThemeCard, DifficultyPicker],
  templateUrl: './main-hub.html',
  styleUrl: './main-hub.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainHub {
  private readonly content = inject(ContentService);
  private readonly gameState = inject(GameStateService);

  private readonly selectedTheme = signal<InstalledTheme | null>(null);

  readonly hubState = toSignal(asLoadState(this.content.getInstalledThemes()), {
    initialValue: { status: 'loading' } as LoadState<MainHubContent>,
  });

  readonly worldState = toSignal(
    toObservable(this.selectedTheme).pipe(
      switchMap((theme: InstalledTheme | null) => {
        if (theme === null) {
          return of(null);
        }

        return asLoadState(this.content.getWorldConfig(theme.id));
      }),
    ),
    { initialValue: null },
  );

  readonly activeThemeId = this.gameState.activeThemeId;
  readonly activeDifficultyLevel = this.gameState.activeDifficultyLevel;

  readonly confirmation = computed(() => {
    const world = this.worldState();
    const levelId = this.gameState.activeDifficultyLevel();

    if (world === null || world.status !== 'loaded' || levelId === null) {
      return null;
    }

    const level = world.data.difficulty_levels.find(
      (candidate: { id: string }) => candidate.id === levelId,
    );

    if (level === undefined) {
      return null;
    }

    return `${world.data.title} · ${level.label}`;
  });

  chooseTheme(themeId: string): void {
    const hub = this.hubState();

    if (hub.status !== 'loaded') {
      return;
    }

    const theme = hub.data.installed_themes.find(
      (candidate: InstalledTheme) => candidate.id === themeId,
    );

    if (theme === undefined) {
      return;
    }

    this.selectedTheme.set(theme);
    this.gameState.setActiveTheme(theme.id);
  }

  chooseDifficultyLevel(levelId: string): void {
    this.gameState.setActiveDifficultyLevel(levelId);
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
