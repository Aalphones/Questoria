import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Observable, map, shareReplay, tap } from 'rxjs';

import {
  AchievementMirror,
  AchievementResponse,
  MirroredAchievement,
  UnlockedAchievement,
} from '../models/achievement.types';
import { GameStateService } from './game-state.service';

const STORAGE_KEY = 'questoria.achievements.v1';

/**
 * Wer welchen Erfolgs-Schlüssel wann bekam — schreibt über denselben
 * Puffer-Weg wie der Spielstand (Plan Phase 7, Checkliste): eine Freischaltung
 * geht zuerst in den Browser-Speicher, dann auf die Reise, und erscheint damit
 * sofort im Ergebnis-Screen, auch bei totem Server (AK 7).
 *
 * Anders als beim Spielstand ist ein Eintrag additiv — ein Erfolg wird nie
 * wieder aberkannt, deshalb gibt es keinen "Server gewinnt"-Konflikt zu lösen.
 */
@Service()
export class AchievementService {
  private readonly http = inject(HttpClient);
  private readonly gameState = inject(GameStateService);
  private readonly localStorage = inject(DOCUMENT).defaultView?.localStorage;

  private readonly mirror = signal<AchievementMirror>(this.readMirror());

  /** Hält einen geglückten Versand davon ab, denselben Durchlauf erneut zu starten. */
  private flushing = false;

  /** Ein Ladelauf je Profil und Sitzung — der Wächter fragt vor jedem Screen. */
  private readonly loads = new Map<number, Observable<UnlockedAchievement[]>>();

  /** Erreichte Erfolgs-Schlüssel des aktiven Profils, gruppiert nach Welt. */
  readonly unlockedByTheme = computed<Record<string, ReadonlySet<string>>>(() => {
    const profileId = this.gameState.activeProfileId();

    if (profileId === null) {
      return {};
    }

    const result: Record<string, ReadonlySet<string>> = {};

    for (const [themeId, keys] of Object.entries(this.mirror()[profileId] ?? {})) {
      result[themeId] = new Set(Object.keys(keys));
    }

    return result;
  });

  /** Holt den Stand eines Profils genau einmal pro Sitzung. */
  ensureLoaded(profileId: number): Observable<UnlockedAchievement[]> {
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

  loadAll(profileId: number): Observable<UnlockedAchievement[]> {
    return this.http
      .get<{ achievements: AchievementResponse[] }>(`/api/profiles/${profileId}/achievements`)
      .pipe(
        map((response: { achievements: AchievementResponse[] }) =>
          response.achievements.map(toUnlockedAchievement),
        ),
        tap((achievements: UnlockedAchievement[]) => {
          this.mergeFromServer(profileId, achievements);
          this.flushPending();
        }),
      );
  }

  isUnlocked(themeId: string, achievementKey: string): boolean {
    return this.unlockedByTheme()[themeId]?.has(achievementKey) ?? false;
  }

  /**
   * Nimmt eine Freischaltung entgegen — immer erfolgreich, der Aufrufer
   * wartet auf nichts (Puffer-Regel 1). Ein bereits bekannter Schlüssel wird
   * nicht erneut angestoßen (AK 3: kein zweites "neu").
   */
  unlock(themeId: string, achievementKey: string): void {
    const profileId = this.gameState.activeProfileId();

    if (profileId === null) {
      console.warn('Erfolg ohne aktives Profil verworfen.');
      return;
    }

    if (this.mirror()[profileId]?.[themeId]?.[achievementKey] !== undefined) {
      return;
    }

    this.writeEntry(profileId, themeId, achievementKey, {
      unlockedAt: new Date().toISOString(),
      pending: true,
    });
    this.push(profileId, themeId, achievementKey);
  }

  /** Schickt alle offenen Einträge des aktiven Profils erneut (Puffer-Regel 2). */
  flushPending(): void {
    const profileId = this.gameState.activeProfileId();

    if (profileId === null || this.flushing) {
      return;
    }

    this.flushing = true;

    try {
      const themes = this.mirror()[profileId] ?? {};

      for (const [themeId, keys] of Object.entries(themes)) {
        for (const [achievementKey, entry] of Object.entries(keys)) {
          if (entry.pending) {
            this.push(profileId, themeId, achievementKey);
          }
        }
      }
    } finally {
      this.flushing = false;
    }
  }

  private push(profileId: number, themeId: string, achievementKey: string): void {
    const entry = this.mirror()[profileId]?.[themeId]?.[achievementKey];

    if (entry === undefined) {
      return;
    }

    this.http
      .post<{ achievement: AchievementResponse }>(`/api/profiles/${profileId}/achievements`, {
        theme_id: themeId,
        achievement_key: achievementKey,
      })
      .subscribe({
        next: () => {
          const current = this.mirror()[profileId]?.[themeId]?.[achievementKey];

          if (current === entry) {
            this.writeEntry(profileId, themeId, achievementKey, { ...entry, pending: false });
          }

          this.flushPending();
        },
        error: () => {
          // Absicht: kein Aufräumen. Der Eintrag bleibt offen und geht beim
          // nächsten Anlass erneut auf die Reise (Puffer-Regel 2).
        },
      });
  }

  /**
   * Additiv: ein bestätigter lokaler Eintrag verschwindet nie. Der Server
   * ergänzt nur, was lokal noch fehlt — anders als beim Spielstand gibt es
   * hier keinen "Server gewinnt"-Konflikt zu lösen (kein Feld wird ersetzt).
   */
  private mergeFromServer(profileId: number, achievements: UnlockedAchievement[]): void {
    for (const achievement of achievements) {
      const existing = this.mirror()[profileId]?.[achievement.themeId]?.[achievement.achievementKey];

      if (existing === undefined) {
        this.writeEntry(profileId, achievement.themeId, achievement.achievementKey, {
          unlockedAt: achievement.unlockedAt,
          pending: false,
        });
      } else if (existing.pending) {
        this.writeEntry(profileId, achievement.themeId, achievement.achievementKey, {
          ...existing,
          pending: false,
        });
      }
    }
  }

  private writeEntry(
    profileId: number,
    themeId: string,
    achievementKey: string,
    entry: MirroredAchievement,
  ): void {
    this.mirror.update((mirror: AchievementMirror) => ({
      ...mirror,
      [profileId]: {
        ...(mirror[profileId] ?? {}),
        [themeId]: { ...(mirror[profileId]?.[themeId] ?? {}), [achievementKey]: entry },
      },
    }));
    this.writeMirror(this.mirror());
  }

  private readMirror(): AchievementMirror {
    const raw = this.localStorage?.getItem(STORAGE_KEY);

    if (raw === null || raw === undefined) {
      return {};
    }

    try {
      return parseMirror(JSON.parse(raw));
    } catch {
      // Ein beschädigter Spiegel wird verworfen statt geworfen — sonst kommt
      // das Kind nicht mehr ins Spiel. Muster wie `savegame.service.ts`.
      console.warn('Erfolge im Browser-Speicher sind beschädigt, verwerfe sie.');
      this.localStorage?.removeItem(STORAGE_KEY);
      return {};
    }
  }

  private writeMirror(mirror: AchievementMirror): void {
    this.localStorage?.setItem(STORAGE_KEY, JSON.stringify(mirror));
  }
}

function toUnlockedAchievement(response: AchievementResponse): UnlockedAchievement {
  return {
    themeId: response.theme_id,
    achievementKey: response.achievement_key,
    unlockedAt: response.unlocked_at,
  };
}

/** Prüft nur die Form, die der Dienst später auch anfasst — Muster wie `savegame.service.ts`. */
function parseMirror(value: unknown): AchievementMirror {
  if (typeof value !== 'object' || value === null) {
    throw new Error('malformed achievement mirror');
  }

  const mirror: AchievementMirror = {};

  for (const [profileId, themes] of Object.entries(value as Record<string, unknown>)) {
    if (typeof themes !== 'object' || themes === null) {
      throw new Error('malformed achievement mirror');
    }

    const parsedThemes: Record<string, Record<string, MirroredAchievement>> = {};

    for (const [themeId, keys] of Object.entries(themes as Record<string, unknown>)) {
      if (typeof keys !== 'object' || keys === null) {
        throw new Error('malformed achievement mirror');
      }

      const parsedKeys: Record<string, MirroredAchievement> = {};

      for (const [achievementKey, entry] of Object.entries(keys as Record<string, unknown>)) {
        parsedKeys[achievementKey] = parseEntry(entry);
      }

      parsedThemes[themeId] = parsedKeys;
    }

    mirror[profileId] = parsedThemes;
  }

  return mirror;
}

function parseEntry(value: unknown): MirroredAchievement {
  const parsed = value as Partial<MirroredAchievement>;

  if (typeof parsed.pending !== 'boolean') {
    throw new Error('malformed achievement entry');
  }

  return {
    unlockedAt: typeof parsed.unlockedAt === 'string' ? parsed.unlockedAt : null,
    pending: parsed.pending,
  };
}
