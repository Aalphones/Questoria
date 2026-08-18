import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { GameStateService } from '../services/game-state.service';
import { ProfileService } from '../services/profile.service';
import { SavegameService } from '../services/savegame.service';

/**
 * Schickt ohne gewähltes Profil auf `/profiles` zurück — dieselbe Rolle wie
 * `difficulty-chosen.guard.ts`, eine Ebene höher. Wartet einmal auf
 * `ensureLoaded()`, bevor er entscheidet: erst danach steht fest, ob das
 * lokal gemerkte Profil noch zum angemeldeten Account gehört.
 *
 * Danach holt er einmal je Sitzung den Spielstand des Profils. Das muss vor
 * dem ersten Screen passieren, sonst zeigte die Planetenkarte kurz den Stand
 * des Browsers statt den des Profils (Plan Phase 6, AK 1/2).
 */
export const profileChosenGuard: CanActivateFn = () => {
  const profileService = inject(ProfileService);
  const savegameService = inject(SavegameService);
  const gameState = inject(GameStateService);
  const router = inject(Router);

  return profileService.ensureLoaded().pipe(
    switchMap(() => {
      const profileId = gameState.activeProfileId();

      if (profileId === null) {
        return of(router.createUrlTree(['/profiles']));
      }

      return savegameService.ensureLoaded(profileId).pipe(
        map(() => true),
        // Antwortet der Server nicht, wird mit dem lokalen Spiegel gespielt —
        // ein totes Netz darf niemanden aus dem Spiel werfen (Plan AK 6).
        catchError(() => of(true)),
      );
    }),
  );
};
