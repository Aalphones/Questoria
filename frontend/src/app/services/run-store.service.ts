import { DOCUMENT } from '@angular/common';
import { Service, inject } from '@angular/core';

import { StoredRun } from '../models/game-state.types';

const STORAGE_KEY = 'questoria.run.v1';

/**
 * Ablage des einen angefangenen Laufs im Browser-Speicher — genau einer für
 * die ganze App, keiner pro Episode (Plan Phase 6, AK 1). Muster wie
 * `ProgressService`. Wird beim Umstieg auf die Savegame-Schnittstelle
 * (Meilenstein 4) getauscht, siehe FINDINGS.md.
 */
@Service()
export class RunStoreService {
  private readonly localStorage = inject(DOCUMENT).defaultView?.localStorage;

  load(): StoredRun | null {
    const raw = this.localStorage?.getItem(STORAGE_KEY);

    if (raw === null || raw === undefined) {
      return null;
    }

    try {
      return parseStoredRun(JSON.parse(raw));
    } catch {
      // Ein kaputter Eintrag darf die App nicht blockieren — die Episode
      // startet stattdessen normal (Plan AK 7).
      console.warn('Angefangener Lauf im Browser-Speicher ist beschädigt, verwerfe ihn.');
      this.clear();
      return null;
    }
  }

  save(run: StoredRun): void {
    this.localStorage?.setItem(STORAGE_KEY, JSON.stringify(run));
  }

  clear(): void {
    this.localStorage?.removeItem(STORAGE_KEY);
  }
}

function parseStoredRun(value: unknown): StoredRun {
  const parsed = value as Partial<StoredRun>;

  if (
    typeof parsed.themeId !== 'string' ||
    typeof parsed.episodeId !== 'string' ||
    typeof parsed.eventIndex !== 'number' ||
    typeof parsed.scoredCount !== 'number' ||
    typeof parsed.correctFirstTryCount !== 'number'
  ) {
    throw new Error('malformed stored run');
  }

  return {
    themeId: parsed.themeId,
    episodeId: parsed.episodeId,
    eventIndex: parsed.eventIndex,
    scoredCount: parsed.scoredCount,
    correctFirstTryCount: parsed.correctFirstTryCount,
  };
}
