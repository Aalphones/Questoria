import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { GameStateService } from '../services/game-state.service';

/**
 * Schickt ohne gewählte Lernstufe auf `theme/:themeId/level` zurück. Steht
 * nicht auf der Lernstufen-Route selbst — sonst leitet der Guard auf sich
 * selbst um (Endlosschleife).
 */
export const difficultyChosenGuard: CanActivateFn = (route) => {
  const gameState = inject(GameStateService);
  const router = inject(Router);

  if (gameState.activeDifficultyLevel() !== null) {
    return true;
  }

  const themeId = route.paramMap.get('themeId');

  return router.createUrlTree(['theme', themeId, 'level']);
};
