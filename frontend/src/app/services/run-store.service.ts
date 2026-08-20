import { Service, inject } from '@angular/core';

import { StoredRun } from '../models/game-state.types';
import { SavegameRun } from '../models/savegame.types';
import { GameStateService } from './game-state.service';
import { SavegameService } from './savegame.service';
import { deriveRunSeed } from './variation';

/**
 * Der eine angefangene Lauf — seit Meilenstein 4 im Spielstand der aktiven
 * Welt statt im Browser-Speicher (ADR-009). Dort hängt er schon an einer Welt
 * und trägt deren Kennung nicht mit; `StoredRun` behält sie für die Aufrufer
 * in `features/episode/`, abgeleitet wird sie aus der aktiven Welt.
 */
@Service()
export class RunStoreService {
  private readonly savegame = inject(SavegameService);
  private readonly gameState = inject(GameStateService);

  load(): StoredRun | null {
    const themeId = this.gameState.activeThemeId();

    if (themeId === null) {
      return null;
    }

    const run = this.savegame.stateFor(themeId).run;

    if (run === null) {
      return null;
    }

    if (!isCompleteRun(run)) {
      // Ein kaputter Eintrag darf die App nicht blockieren — die Episode
      // startet stattdessen normal (Meilenstein 3, Plan AK 7).
      console.warn('Angefangener Lauf im Spielstand ist beschädigt, verwerfe ihn.');
      this.clear();
      return null;
    }

    return { themeId, ...run };
  }

  save(run: StoredRun): void {
    this.writeRun(run.themeId, {
      episodeId: run.episodeId,
      eventIndex: run.eventIndex,
      scoredCount: run.scoredCount,
      correctFirstTryCount: run.correctFirstTryCount,
      seed: run.seed,
    });
  }

  /**
   * Zählt den Versuch dieser Episode hoch, persistiert ihn und liefert daraus
   * den Startwert für den neuen Lauf (Plan Phase 1, AK 3). Der Zähler lebt im
   * Spielstand, nicht im angefangenen Lauf — er muss auch überleben, wenn
   * dieser Lauf durchgespielt und danach gelöscht wird.
   */
  startSeedFor(episodeId: string): number {
    const themeId = this.gameState.activeThemeId();
    const profileId = this.gameState.activeProfileId();

    if (themeId === null || profileId === null) {
      // Kann nur passieren, wenn eine Episode außerhalb der Profil-/Weltwahl
      // zu spielen anfängt — kein Absturz, aber auch keine Reproduzierbarkeit
      // über Sitzungen hinweg.
      console.warn('Startwert ohne aktives Profil oder aktive Welt gezogen.');
      return deriveRunSeed(0, episodeId, 0);
    }

    const state = this.savegame.stateFor(themeId);
    // `?? {}`: ältere Spielstände kennen `attempts` noch nicht (Plan Phase 1, Risiko 1).
    const attempts = state.attempts ?? {};
    const attempt = (attempts[episodeId] ?? 0) + 1;

    this.savegame.save(
      themeId,
      { ...state, attempts: { ...attempts, [episodeId]: attempt } },
      this.savegame.positionFor(themeId) ?? { episodeId: null, nodeId: null },
    );

    return deriveRunSeed(profileId, episodeId, attempt);
  }

  clear(): void {
    const themeId = this.gameState.activeThemeId();

    if (themeId === null) {
      return;
    }

    this.writeRun(themeId, null);
  }

  private writeRun(themeId: string, run: SavegameRun | null): void {
    const state = this.savegame.stateFor(themeId);

    // Der Episoden-Screen räumt an mehreren Stellen auf; ohne diese Bremse
    // ginge jedes Mal ein unveränderter Spielstand auf die Reise.
    if (state.run === null && run === null) {
      return;
    }

    const position = this.savegame.positionFor(themeId);

    this.savegame.save(
      themeId,
      { ...state, run },
      {
        episodeId: run?.episodeId ?? position?.episodeId ?? null,
        nodeId: position?.nodeId ?? null,
      },
    );
  }
}

/**
 * Der Spiegel prüft beim Einlesen nur die Hülle des Zustands — ob der Lauf
 * darin vollständig ist, entscheidet sich erst hier.
 */
function isCompleteRun(run: SavegameRun): boolean {
  return (
    typeof run.episodeId === 'string' &&
    typeof run.eventIndex === 'number' &&
    typeof run.scoredCount === 'number' &&
    typeof run.correctFirstTryCount === 'number'
  );
}
