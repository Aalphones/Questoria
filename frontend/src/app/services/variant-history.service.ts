import { Service, inject } from '@angular/core';

import { GameStateService } from './game-state.service';
import { SavegameService } from './savegame.service';

/** Wie viele zuletzt benutzte Fassungs-IDs je Aufgabe gemieden werden (Plan Phase 1, AK 5). */
const RECENT_LIMIT = 3;

/**
 * Die letzten benutzten Pool-Fassungen je Aufgabe — überlebt das Beenden der
 * App, anders als der angefangene Lauf. Schlüssel ist `event_id`, nicht die
 * Episode: dieselbe ausgelagerte Aufgabe kann in mehreren Episoden auftauchen
 * und teilt sich dort die Meidungsliste (Schema Abschnitt 4).
 */
@Service()
export class VariantHistoryService {
  private readonly savegame = inject(SavegameService);
  private readonly gameState = inject(GameStateService);

  recentIdsFor(eventId: string): readonly string[] {
    const themeId = this.gameState.activeThemeId();

    if (themeId === null) {
      return [];
    }

    // `?? {}`: ältere Spielstände kennen `recentVariants` noch nicht (Plan Phase 1, Risiko 1).
    return this.savegame.stateFor(themeId).recentVariants?.[eventId] ?? [];
  }

  /** Merkt eine benutzte Fassung vor — keine Wirkung, wenn sie schon die zuletzt gemerkte ist. */
  recordUse(eventId: string, usedPoolItemId: string): void {
    const themeId = this.gameState.activeThemeId();

    if (themeId === null) {
      return;
    }

    const state = this.savegame.stateFor(themeId);
    const recentVariants = state.recentVariants ?? {};
    const existing = recentVariants[eventId] ?? [];

    if (existing[existing.length - 1] === usedPoolItemId) {
      return;
    }

    const updated = [...existing, usedPoolItemId].slice(-RECENT_LIMIT);

    this.savegame.save(
      themeId,
      { ...state, recentVariants: { ...recentVariants, [eventId]: updated } },
      this.savegame.positionFor(themeId) ?? { episodeId: null, nodeId: null },
    );
  }
}
