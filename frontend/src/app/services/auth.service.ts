import { HttpClient } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';

import { AuthUser } from '../models/auth.types';

/**
 * Hält den angemeldeten Benutzer im Speicher — die Sitzung selbst steckt im
 * HttpOnly-Cookie ([ADR-008](../../../../docs/decisions/008-zugang-und-sitzung.md)),
 * hier landet nie ein Token.
 */
@Service()
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly currentUser = signal<AuthUser | null>(null);

  // Merkt sich, ob eine Sitzungsprüfung bereits gelaufen ist (per `GET
  // /api/auth/me`, Login oder Logout) — ohne diese Markierung würde ein
  // gecachtes `restoreSession()`-Ergebnis von vor dem Login/Logout weiter
  // ausgeliefert und der Wächter träfe eine veraltete Entscheidung.
  private sessionChecked = false;

  private restoreSession$: Observable<AuthUser | null> | null = null;

  login(email: string, password: string): Observable<AuthUser> {
    return this.http.post<{ user: AuthUser }>('/api/auth/login', { email, password }).pipe(
      map((response) => response.user),
      tap((user) => {
        this.currentUser.set(user);
        this.sessionChecked = true;
      }),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', null).pipe(tap(() => this.markSignedOut()));
  }

  /**
   * Von jedem Ort aufrufbar, der eine ungültige Sitzung feststellt — aktuell
   * der `session-expired.interceptor.ts` bei einem `401`. Setzt den Benutzer
   * zurück, ohne einen erneuten `restoreSession()`-Aufruf gegen den Server
   * auszulösen (die Sitzung ist ja bereits nachweislich ungültig).
   */
  markSignedOut(): void {
    this.currentUser.set(null);
    this.sessionChecked = true;
  }

  /**
   * Prüft die bestehende Sitzung genau einmal pro Seitenaufruf — der Wächter
   * (`auth.guard.ts`) wartet einmal darauf, bevor er auf `/login` umleitet,
   * sonst wirft ein Neuladen jeden angemeldeten Benutzer raus.
   */
  restoreSession(): Observable<AuthUser | null> {
    if (this.sessionChecked) {
      return of(this.currentUser());
    }

    if (this.restoreSession$ === null) {
      this.restoreSession$ = this.http.get<{ user: AuthUser }>('/api/auth/me').pipe(
        map((response) => response.user),
        tap((user) => this.currentUser.set(user)),
        catchError(() => {
          this.currentUser.set(null);

          return of(null);
        }),
        tap(() => {
          this.sessionChecked = true;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }

    return this.restoreSession$;
  }
}
