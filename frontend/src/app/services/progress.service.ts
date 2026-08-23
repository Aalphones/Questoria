import { Service, computed, inject } from '@angular/core';

import { ProgressStore, ThemeProgress } from '../models/game-state.types';
import { SavegameState } from '../models/savegame.types';
import { SavegameService } from './savegame.service';

/**
 * Der Fortschritt aller Welten. Seit Meilenstein 4 kommt er aus dem Spielstand
 * des aktiven Profils statt aus dem Browser-Speicher (ADR-009 löst ADR-006 ab)
 * — die öffentliche Form ist dieselbe geblieben, `progress.rules.ts` und die
 * Screens haben den Umzug nicht bemerkt.
 */
@Service()
export class ProgressService {
  private readonly savegame = inject(SavegameService);

  /**
   * Welten mit mindestens einer geschafften Episode. Ein Spielstand ohne
   * Fortschritt bleibt draußen: die Planetenkarte liest diese Schlüssel als
   * „hier wurde schon etwas geschafft", und eine bloß gewählte Lernstufe
   * gehört nicht dazu.
   */
  readonly store = computed<ProgressStore>(() => {
    const store: ProgressStore = {};

    for (const [themeId, state] of Object.entries(this.savegame.statesByTheme())) {
      if (Object.keys(state.progress).length > 0) {
        store[themeId] = state.progress;
      }
    }

    return store;
  });

  isEpisodeCompleted(themeId: string, episodeId: string): boolean {
    return this.store()[themeId]?.[episodeId] !== undefined;
  }

  starsFor(themeId: string, episodeId: string): number | null {
    return this.store()[themeId]?.[episodeId]?.stars ?? null;
  }

  completeEpisode(themeId: string, episodeId: string, stars: number): void {
    const themeProgress = this.savegame.stateFor(themeId).progress;
    const existing = themeProgress[episodeId];

    // Ein zweiter, schlechterer Durchlauf darf ein Ergebnis nicht verschlechtern.
    if (existing !== undefined && existing.stars >= stars) {
      return;
    }

    this.writeProgress(themeId, {
      ...themeProgress,
      [episodeId]: { stars, completedAt: existing?.completedAt ?? new Date().toISOString() },
    });
  }

  /**
   * Setzt die Welt auf Anfang — inklusive der freigeschalteten Kacheln. Blieben
   * die stehen, zeigte die Karte nach dem Zurücksetzen weiter die ganze Route,
   * obwohl kein Ort mehr geschafft ist.
   */
  resetTheme(themeId: string): void {
    const state = this.savegame.stateFor(themeId);

    this.write(themeId, { ...state, progress: {}, revealedTiles: {} });
  }

  /** Die schon aufgedeckten Kacheln eines Karten-Geltungsbereichs (ADR-020). */
  revealedTileIds(themeId: string, scope: string): readonly string[] {
    // `?? {}`: ältere Spielstände kennen `revealedTiles` noch nicht.
    return this.savegame.stateFor(themeId).revealedTiles?.[scope] ?? [];
  }

  /**
   * Vereinigt `tileIds` mit dem bisherigen Stand — die Hochwassermarke wird nie
   * ersetzt und nie kleiner (ADR-020). Bringt der Aufruf nichts Neues, wird
   * auch nicht geschrieben: sonst schickte jeder Kartenaufruf einen Spielstand
   * an den Server.
   */
  syncRevealedTiles(themeId: string, scope: string, tileIds: readonly string[]): void {
    const state = this.savegame.stateFor(themeId);
    const revealedTiles = state.revealedTiles ?? {};
    const existing = new Set(revealedTiles[scope] ?? []);
    const merged = new Set([...existing, ...tileIds]);

    if (merged.size === existing.size) {
      return;
    }

    this.write(themeId, {
      ...state,
      revealedTiles: { ...revealedTiles, [scope]: [...merged] },
    });
  }

  private writeProgress(themeId: string, progress: ThemeProgress): void {
    this.write(themeId, { ...this.savegame.stateFor(themeId), progress });
  }

  private write(themeId: string, state: SavegameState): void {
    const position = this.savegame.positionFor(themeId);

    this.savegame.save(themeId, state, position ?? { episodeId: null, nodeId: null });
  }
}
