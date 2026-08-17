import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

const LOGIN_REQUEST_URL = '/api/auth/login';

/**
 * Fängt eine während des Spielens abgelaufene Sitzung ab (Plan Phase 3, AK 4)
 * — jeder `401` schickt auf den Anmeldebildschirm statt in eine
 * Fehlerkaskade. Der Anmelde-Aufruf selbst ist ausgenommen: dessen `401` ist
 * die normale Fehlermeldung im Formular, kein Sitzungsverlust.
 */
export const sessionExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (req.url === LOGIN_REQUEST_URL) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.markSignedOut();
        void router.navigateByUrl('/login');
      }

      return throwError(() => error);
    }),
  );
};
