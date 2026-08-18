import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

import { WorldConfig } from '../models/content.types';
import { ContentService } from '../services/content.service';
import { GameStateService } from '../services/game-state.service';
import { ProfileService } from '../services/profile.service';

/**
 * Lädt die Welt-Konfiguration für jede `theme/:themeId/…`-Route zentral und
 * setzt `GameStateService.activeThemeId`. Schlägt das Laden fehl oder fehlt
 * die ID, liefert der Resolver `null` statt die Navigation abzubrechen — der
 * Screen zeigt dann `qst-content-error`.
 *
 * Bei einem echten Wechsel der Welt wandert die Wahl zusätzlich ins aktive
 * Profil (Plan Phase 4, Checkliste „selected_theme genauso"), damit sie das
 * Gerät überlebt. Ein Fehlschlag dabei blockiert das Spielen nicht — beim
 * nächsten Wechsel wird es erneut versucht.
 */
export const worldConfigResolver: ResolveFn<WorldConfig | null> = (
  route,
): Observable<WorldConfig | null> => {
  const content = inject(ContentService);
  const gameState = inject(GameStateService);
  const profileService = inject(ProfileService);
  const themeId = route.paramMap.get('themeId');

  if (themeId === null) {
    return of(null);
  }

  const isNewTheme = gameState.activeThemeId() !== themeId;

  gameState.setActiveTheme(themeId);

  const activeProfileId = gameState.activeProfileId();

  if (isNewTheme && activeProfileId !== null) {
    profileService.update(activeProfileId, { selected_theme: themeId }).subscribe({
      // Absichtlich leer: ein Fehlschlag ist kein Grund, das Laden der Welt
      // zu blockieren — beim nächsten Wechsel wird es erneut versucht.
      error: (): void => undefined,
    });
  }

  return content.getWorldConfig(themeId).pipe(catchError(() => of(null)));
};
