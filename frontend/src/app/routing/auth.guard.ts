import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Lässt nur einen angemeldeten Aufruf durch. Wartet einmal auf
 * `restoreSession()`, bevor er auf `/login` umleitet — sonst wirft ein
 * Neuladen jeden angemeldeten Benutzer raus. Die ursprünglich gewünschte
 * Adresse wandert als `redirectTo`-Query-Parameter mit.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser() !== null) {
    return true;
  }

  return authService
    .restoreSession()
    .pipe(
      map((user) =>
        user !== null ? true : router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } }),
      ),
    );
};
