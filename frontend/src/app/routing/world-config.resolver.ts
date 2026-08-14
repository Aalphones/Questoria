import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

import { WorldConfig } from '../models/content.types';
import { ContentService } from '../services/content.service';
import { GameStateService } from '../services/game-state.service';

/**
 * Lädt die Welt-Konfiguration für jede `theme/:themeId/…`-Route zentral und
 * setzt `GameStateService.activeThemeId`. Schlägt das Laden fehl oder fehlt
 * die ID, liefert der Resolver `null` statt die Navigation abzubrechen — der
 * Screen zeigt dann `qst-content-error`.
 */
export const worldConfigResolver: ResolveFn<WorldConfig | null> = (
  route,
): Observable<WorldConfig | null> => {
  const content = inject(ContentService);
  const gameState = inject(GameStateService);
  const themeId = route.paramMap.get('themeId');

  if (themeId === null) {
    return of(null);
  }

  gameState.setActiveTheme(themeId);

  return content.getWorldConfig(themeId).pipe(catchError(() => of(null)));
};
