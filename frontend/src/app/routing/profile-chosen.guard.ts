import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { GameStateService } from '../services/game-state.service';
import { ProfileService } from '../services/profile.service';

/**
 * Schickt ohne gewähltes Profil auf `/profiles` zurück — dieselbe Rolle wie
 * `difficulty-chosen.guard.ts`, eine Ebene höher. Wartet einmal auf
 * `ensureLoaded()`, bevor er entscheidet: erst danach steht fest, ob das
 * lokal gemerkte Profil noch zum angemeldeten Account gehört.
 */
export const profileChosenGuard: CanActivateFn = () => {
  const profileService = inject(ProfileService);
  const gameState = inject(GameStateService);
  const router = inject(Router);

  return profileService
    .ensureLoaded()
    .pipe(
      map(() => (gameState.activeProfileId() !== null ? true : router.createUrlTree(['/profiles']))),
    );
};
