import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Observable, map, shareReplay, tap } from 'rxjs';

import {
  EMPTY_STATISTICS_TOTALS,
  MirroredStatistics,
  StatisticsDelta,
  StatisticsMirror,
  StatisticsResponse,
  StatisticsTotals,
} from '../models/statistics.types';
import { GameStateService } from './game-state.service';

const STORAGE_KEY = 'questoria.statistics.v1';

/**
 * Vier Zahlen pro Welt und Profil, die über alle Läufe hinweg wachsen —
 * schreibt über denselben Puffer-Weg wie Spielstand und Erfolge (Plan Phase 8):
 * ein Zuwachs geht zuerst in den Browser-Speicher, dann auf die Reise.
 *
 * Anders als beim Spielstand ist ein Zuwachs additiv, nicht ersetzend — wie
 * bei den Erfolgen gibt es also keinen "Server gewinnt"-Konflikt. Anders als
 * bei den Erfolgen kann aber mehr als ein Zuwachs derselben Welt gleichzeitig
 * offen sein (mehrere Episoden bei totem Server zu Ende gespielt) — deshalb
 * eine Warteschlange statt eines einzelnen `pending`-Eintrags.
 */
@Service()
export class StatisticsService {
  private readonly http = inject(HttpClient);
  private readonly gameState = inject(GameStateService);
  private readonly localStorage = inject(DOCUMENT).defaultView?.localStorage;

  private readonly mirror = signal<StatisticsMirror>(this.readMirror());

  /** Hält einen geglückten Versand davon ab, denselben Durchlauf erneut zu starten. */
  private flushing = false;

  /** Verhindert, dass derselbe Zuwachs zweimal gleichzeitig unterwegs ist. */
  private readonly inFlight = new Set<string>();

  /** Ein Ladelauf je Profil und Sitzung — der Wächter fragt vor jedem Screen. */
  private readonly loads = new Map<number, Observable<StatisticsResponse[]>>();

  /** Bestätigter Stand plus offene Zuwächse — das zeigt der Ergebnis-Screen. */
  readonly totalsByTheme = computed<Record<string, StatisticsTotals>>(() => {
    const profileId = this.gameState.activeProfileId();

    if (profileId === null) {
      return {};
    }

    const totals: Record<string, StatisticsTotals> = {};

    for (const [themeId, entry] of Object.entries(this.mirror()[profileId] ?? {})) {
      totals[themeId] = addPending(entry.confirmed, entry.pending);
    }

    return totals;
  });

  /** Holt den Stand eines Profils genau einmal pro Sitzung. */
  ensureLoaded(profileId: number): Observable<StatisticsResponse[]> {
    const running = this.loads.get(profileId);

    if (running !== undefined) {
      return running;
    }

    const load$ = this.loadAll(profileId).pipe(
      tap({ error: () => this.loads.delete(profileId) }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.loads.set(profileId, load$);

    return load$;
  }

  loadAll(profileId: number): Observable<StatisticsResponse[]> {
    return this.http
      .get<{ statistics: StatisticsResponse[] }>(`/api/profiles/${profileId}/statistics`)
      .pipe(
        map((response: { statistics: StatisticsResponse[] }) => response.statistics),
        tap((statistics: StatisticsResponse[]) => {
          this.mergeFromServer(profileId, statistics);
          this.flushPending();
        }),
      );
  }

  /**
   * Nimmt den Zuwachs eines abgeschlossenen Laufs entgegen — immer
   * erfolgreich, der Aufrufer wartet auf nichts (Puffer-Regel 1). Derselbe
   * `runId` landet nie zweimal in der Warteschlange.
   */
  add(themeId: string, delta: StatisticsDelta): void {
    const profileId = this.gameState.activeProfileId();

    if (profileId === null) {
      console.warn('Statistik-Zuwachs ohne aktives Profil verworfen.');
      return;
    }

    this.mirror.update((mirror: StatisticsMirror) => {
      const existing = mirror[profileId]?.[themeId] ?? {
        confirmed: EMPTY_STATISTICS_TOTALS,
        pending: [],
      };

      if (existing.pending.some((entry: StatisticsDelta) => entry.runId === delta.runId)) {
        return mirror;
      }

      return {
        ...mirror,
        [profileId]: {
          ...(mirror[profileId] ?? {}),
          [themeId]: { ...existing, pending: [...existing.pending, delta] },
        },
      };
    });
    this.writeMirror(this.mirror());
    this.flushPending();
  }

  /** Schickt alle offenen Zuwächse des aktiven Profils erneut (Puffer-Regel 2). */
  flushPending(): void {
    const profileId = this.gameState.activeProfileId();

    if (profileId === null || this.flushing) {
      return;
    }

    this.flushing = true;

    try {
      const themes = this.mirror()[profileId] ?? {};

      for (const [themeId, entry] of Object.entries(themes)) {
        for (const delta of entry.pending) {
          this.push(profileId, themeId, delta);
        }
      }
    } finally {
      this.flushing = false;
    }
  }

  /**
   * Schiebt einen Zuwachs hoch. Erst die Antwort des Servers räumt ihn aus
   * der Warteschlange — bis dahin gilt der lokale Stand als der wahre.
   */
  private push(profileId: number, themeId: string, delta: StatisticsDelta): void {
    const key = `${profileId}:${themeId}:${delta.runId}`;

    if (this.inFlight.has(key)) {
      return;
    }

    this.inFlight.add(key);

    this.http
      .post<{ statistics: StatisticsResponse }>(`/api/profiles/${profileId}/statistics/${themeId}`, {
        run_id: delta.runId,
        events_completed: delta.eventsCompleted,
        correct_answers: delta.correctAnswers,
        wrong_answers: delta.wrongAnswers,
        playtime_minutes: delta.playtimeMinutes,
      })
      .subscribe({
        next: (response: { statistics: StatisticsResponse }) => {
          this.inFlight.delete(key);
          this.confirmDelta(profileId, themeId, delta.runId, toTotals(response.statistics));
        },
        error: () => {
          // Absicht: kein Aufräumen. Der Zuwachs bleibt in der Warteschlange
          // und geht beim nächsten Anlass erneut auf die Reise (Puffer-Regel 2).
          this.inFlight.delete(key);
        },
      });
  }

  private confirmDelta(profileId: number, themeId: string, runId: string, confirmed: StatisticsTotals): void {
    this.mirror.update((mirror: StatisticsMirror) => {
      const existing = mirror[profileId]?.[themeId];

      if (existing === undefined) {
        return mirror;
      }

      return {
        ...mirror,
        [profileId]: {
          ...(mirror[profileId] ?? {}),
          [themeId]: {
            confirmed,
            pending: existing.pending.filter((entry: StatisticsDelta) => entry.runId !== runId),
          },
        },
      };
    });
    this.writeMirror(this.mirror());
  }

  /**
   * Ersetzt den bestätigten Stand jeder gelieferten Welt. Offene Zuwächse
   * bleiben unangetastet und in der Warteschlange, bis der Server sie
   * bestätigt — sie stecken schon in `totalsByTheme` (optimistisch addiert).
   */
  private mergeFromServer(profileId: number, statistics: readonly StatisticsResponse[]): void {
    this.mirror.update((mirror: StatisticsMirror) => {
      const existingThemes = mirror[profileId] ?? {};
      const mergedThemes: Record<string, MirroredStatistics> = { ...existingThemes };

      for (const item of statistics) {
        mergedThemes[item.theme_id] = {
          confirmed: toTotals(item),
          pending: existingThemes[item.theme_id]?.pending ?? [],
        };
      }

      return { ...mirror, [profileId]: mergedThemes };
    });
    this.writeMirror(this.mirror());
  }

  private readMirror(): StatisticsMirror {
    const raw = this.localStorage?.getItem(STORAGE_KEY);

    if (raw === null || raw === undefined) {
      return {};
    }

    try {
      return parseMirror(JSON.parse(raw));
    } catch {
      // Ein beschädigter Spiegel wird verworfen statt geworfen — sonst kommt
      // das Kind nicht mehr ins Spiel. Muster wie `savegame.service.ts`.
      console.warn('Statistiken im Browser-Speicher sind beschädigt, verwerfe sie.');
      this.localStorage?.removeItem(STORAGE_KEY);
      return {};
    }
  }

  private writeMirror(mirror: StatisticsMirror): void {
    this.localStorage?.setItem(STORAGE_KEY, JSON.stringify(mirror));
  }
}

function toTotals(response: StatisticsResponse): StatisticsTotals {
  return {
    eventsCompleted: response.events_completed,
    correctAnswers: response.correct_answers,
    wrongAnswers: response.wrong_answers,
    playtimeMinutes: response.playtime_minutes,
  };
}

function addPending(confirmed: StatisticsTotals, pending: readonly StatisticsDelta[]): StatisticsTotals {
  return pending.reduce(
    (sum: StatisticsTotals, delta: StatisticsDelta): StatisticsTotals => ({
      eventsCompleted: sum.eventsCompleted + delta.eventsCompleted,
      correctAnswers: sum.correctAnswers + delta.correctAnswers,
      wrongAnswers: sum.wrongAnswers + delta.wrongAnswers,
      playtimeMinutes: sum.playtimeMinutes + delta.playtimeMinutes,
    }),
    confirmed,
  );
}

/** Prüft nur die Form, die der Dienst später auch anfasst. */
function parseMirror(value: unknown): StatisticsMirror {
  if (typeof value !== 'object' || value === null) {
    throw new Error('malformed statistics mirror');
  }

  const mirror: StatisticsMirror = {};

  for (const [profileId, themes] of Object.entries(value as Record<string, unknown>)) {
    if (typeof themes !== 'object' || themes === null) {
      throw new Error('malformed statistics mirror');
    }

    const parsedThemes: Record<string, MirroredStatistics> = {};

    for (const [themeId, entry] of Object.entries(themes as Record<string, unknown>)) {
      parsedThemes[themeId] = parseEntry(entry);
    }

    mirror[profileId] = parsedThemes;
  }

  return mirror;
}

function parseEntry(value: unknown): MirroredStatistics {
  const parsed = value as Partial<MirroredStatistics>;
  const confirmed = asTotals(parsed.confirmed);

  if (confirmed === null || !Array.isArray(parsed.pending)) {
    throw new Error('malformed statistics entry');
  }

  return {
    confirmed,
    pending: parsed.pending.map(parseDelta),
  };
}

function parseDelta(value: unknown): StatisticsDelta {
  const parsed = value as Partial<StatisticsDelta>;
  const totals = asTotals(parsed);

  if (typeof parsed.runId !== 'string' || totals === null) {
    throw new Error('malformed statistics delta');
  }

  return { runId: parsed.runId, ...totals };
}

/** Prüft die Form und liefert sie getypt zurück, statt nur `boolean` — sonst
 * verliert TypeScript beim Zusammenbauen des Rückgabewerts wieder die Sicherheit. */
function asTotals(value: unknown): StatisticsTotals | null {
  const parsed = value as Partial<StatisticsTotals> | undefined;

  if (
    typeof parsed?.eventsCompleted !== 'number' ||
    typeof parsed.correctAnswers !== 'number' ||
    typeof parsed.wrongAnswers !== 'number' ||
    typeof parsed.playtimeMinutes !== 'number'
  ) {
    return null;
  }

  return {
    eventsCompleted: parsed.eventsCompleted,
    correctAnswers: parsed.correctAnswers,
    wrongAnswers: parsed.wrongAnswers,
    playtimeMinutes: parsed.playtimeMinutes,
  };
}
