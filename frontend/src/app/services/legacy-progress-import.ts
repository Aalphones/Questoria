import { EpisodeProgress, ProgressStore, ThemeProgress } from '../models/game-state.types';

const LEGACY_PROGRESS_KEY = 'questoria.progress.v1';
const LEGACY_RUN_KEY = 'questoria.run.v1';

/**
 * Liest den vor Meilenstein 4 im Browser gehaltenen Fortschritt und räumt
 * beide alten Schlüssel weg — auch den des angefangenen Laufs, der ohne
 * Übernahme verfällt (Plan Phase 6). Ein zweiter Aufruf findet nichts mehr;
 * genau darauf beruht die Zusage, dass ein alter Stand nur einmal umzieht.
 */
export function takeLegacyProgress(localStorage: Storage | undefined): ProgressStore {
  const raw = localStorage?.getItem(LEGACY_PROGRESS_KEY) ?? null;

  localStorage?.removeItem(LEGACY_PROGRESS_KEY);
  localStorage?.removeItem(LEGACY_RUN_KEY);

  if (raw === null) {
    return {};
  }

  try {
    return parseProgressStore(JSON.parse(raw));
  } catch {
    // Ein kaputter Alt-Stand ist kein Grund, den Umstieg zu blockieren — er
    // ist ohnehin schon weggeräumt.
    console.warn('Alter Fortschritt im Browser-Speicher ist beschädigt, übernehme nichts.');
    return {};
  }
}

function parseProgressStore(value: unknown): ProgressStore {
  if (typeof value !== 'object' || value === null) {
    throw new Error('malformed legacy progress');
  }

  const store: ProgressStore = {};

  for (const [themeId, episodes] of Object.entries(value as Record<string, unknown>)) {
    if (typeof episodes !== 'object' || episodes === null) {
      throw new Error('malformed legacy progress');
    }

    const themeProgress: ThemeProgress = {};

    for (const [episodeId, entry] of Object.entries(episodes as Record<string, unknown>)) {
      themeProgress[episodeId] = parseEpisodeProgress(entry);
    }

    store[themeId] = themeProgress;
  }

  return store;
}

function parseEpisodeProgress(value: unknown): EpisodeProgress {
  const parsed = value as Partial<EpisodeProgress>;

  if (typeof parsed?.stars !== 'number' || typeof parsed?.completedAt !== 'string') {
    throw new Error('malformed legacy progress');
  }

  return { stars: parsed.stars, completedAt: parsed.completedAt };
}
