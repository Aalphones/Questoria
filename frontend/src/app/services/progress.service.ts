import { DOCUMENT } from '@angular/common';
import { Service, inject, signal } from '@angular/core';

import { ProgressStore } from '../models/game-state.types';

const STORAGE_KEY = 'questoria.progress.v1';

/**
 * Ablage des Fortschritts im Browser-Speicher. Bis Meilenstein 4 (Savegame-
 * Schnittstelle) die einzige Datenquelle — beim Umstieg wird genau diese
 * Datei getauscht, `progress.rules.ts` und die Screens bleiben unberührt
 * (ADR-006).
 */
@Service()
export class ProgressService {
  private readonly localStorage = inject(DOCUMENT).defaultView?.localStorage;

  readonly store = signal<ProgressStore>(this.readStore());

  isEpisodeCompleted(themeId: string, episodeId: string): boolean {
    return this.store()[themeId]?.[episodeId] !== undefined;
  }

  starsFor(themeId: string, episodeId: string): number | null {
    return this.store()[themeId]?.[episodeId]?.stars ?? null;
  }

  completeEpisode(themeId: string, episodeId: string, stars: number): void {
    const themeProgress = this.store()[themeId] ?? {};
    const existing = themeProgress[episodeId];

    // Ein zweiter, schlechterer Durchlauf darf ein Ergebnis nicht verschlechtern.
    if (existing !== undefined && existing.stars >= stars) {
      return;
    }

    this.store.update((store: ProgressStore) => ({
      ...store,
      [themeId]: {
        ...themeProgress,
        [episodeId]: { stars, completedAt: existing?.completedAt ?? new Date().toISOString() },
      },
    }));
    this.writeStore(this.store());
  }

  resetTheme(themeId: string): void {
    this.store.update((store: ProgressStore) =>
      Object.fromEntries(Object.entries(store).filter(([id]) => id !== themeId)),
    );
    this.writeStore(this.store());
  }

  private readStore(): ProgressStore {
    const raw = this.localStorage?.getItem(STORAGE_KEY);

    if (raw === null || raw === undefined) {
      return {};
    }

    try {
      return JSON.parse(raw) as ProgressStore;
    } catch {
      // Ein kaputter Eintrag darf die App nicht blockieren — das Kind kommt
      // sonst nicht mehr rein und niemand weiß warum.
      console.warn('Fortschritt im Browser-Speicher ist beschädigt, setze zurück.');
      return {};
    }
  }

  private writeStore(store: ProgressStore): void {
    this.localStorage?.setItem(STORAGE_KEY, JSON.stringify(store));
  }
}
