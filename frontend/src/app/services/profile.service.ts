import { HttpClient } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Observable, map, of, shareReplay, tap } from 'rxjs';

import { PlayerProfile } from '../models/auth.types';
import { GameStateService } from './game-state.service';

type ProfilePatch = Partial<
  Pick<PlayerProfile, 'display_name' | 'avatar' | 'selected_theme' | 'selected_level'>
>;

/**
 * Hält die Profile des angemeldeten Accounts (Plan Phase 4). `ensureLoaded()`
 * fragt die Liste genau einmal pro Sitzung ab — dabei prüft sie auch, ob das
 * lokal gemerkte aktive Profil noch zu diesem Account gehört, und wirft es
 * sonst weg ([README.md](../../../../docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/README.md) → „GameStateService um activeProfileId erweitern").
 */
@Service()
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly gameState = inject(GameStateService);

  readonly profiles = signal<PlayerProfile[]>([]);

  private loaded = false;
  private load$: Observable<PlayerProfile[]> | null = null;

  ensureLoaded(): Observable<PlayerProfile[]> {
    if (this.loaded) {
      return of(this.profiles());
    }

    if (this.load$ === null) {
      this.load$ = this.http.get<{ profiles: PlayerProfile[] }>('/api/profiles').pipe(
        map((response) => response.profiles),
        tap((profiles) => {
          this.profiles.set(profiles);
          this.loaded = true;

          const activeProfileId = this.gameState.activeProfileId();

          if (
            activeProfileId !== null &&
            !profiles.some((profile) => profile.id === activeProfileId)
          ) {
            this.gameState.clearActiveProfile();
          }
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }

    return this.load$;
  }

  create(displayName: string, avatar: string | null): Observable<PlayerProfile> {
    return this.http
      .post<{ profile: PlayerProfile }>('/api/profiles', { display_name: displayName, avatar })
      .pipe(
        map((response) => response.profile),
        tap((profile) => this.profiles.update((list) => [...list, profile])),
      );
  }

  update(profileId: number, patch: ProfilePatch): Observable<PlayerProfile> {
    return this.http.patch<{ profile: PlayerProfile }>(`/api/profiles/${profileId}`, patch).pipe(
      map((response) => response.profile),
      tap((profile) =>
        this.profiles.update((list) =>
          list.map((existing) => (existing.id === profile.id ? profile : existing)),
        ),
      ),
    );
  }

  remove(profileId: number): Observable<void> {
    return this.http.delete<void>(`/api/profiles/${profileId}`).pipe(
      tap(() => {
        this.profiles.update((list) => list.filter((profile) => profile.id !== profileId));

        if (this.gameState.activeProfileId() === profileId) {
          this.gameState.clearActiveProfile();
        }
      }),
    );
  }

  select(profileId: number): void {
    this.gameState.setActiveProfile(profileId);
  }

  /** Nach dem Abmelden — die nächste Sitzung soll die Liste neu abfragen. */
  reset(): void {
    this.profiles.set([]);
    this.loaded = false;
    this.load$ = null;
  }
}
