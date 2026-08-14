import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, startWith } from 'rxjs';

import { MainHub as MainHubContent } from '../../models/content.types';
import { LoadState } from '../../models/game-state.types';
import { ContentService } from '../../services/content.service';
import { ThemeCard } from './theme-card/theme-card';

/** Planetenkarte: alle installierten Welten. Wahl führt auf die Lernstufen-Auswahl der Welt. */
@Component({
  selector: 'qst-main-hub',
  imports: [ThemeCard],
  templateUrl: './main-hub.html',
  styleUrl: './main-hub.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainHub {
  private readonly content = inject(ContentService);
  private readonly router = inject(Router);

  readonly hubState = toSignal(asLoadState(this.content.getInstalledThemes()), {
    initialValue: { status: 'loading' } as LoadState<MainHubContent>,
  });

  chooseTheme(themeId: string): void {
    void this.router.navigate(['theme', themeId, 'level']);
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
