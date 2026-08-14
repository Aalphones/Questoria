import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { Episode, EventFile, MainHub, WorldConfig } from '../models/content.types';

/**
 * Liest den Content über die Backend-Schnittstelle ([ADR-005](../../../../docs/decisions/005-content-auslieferung-ab-meilenstein-2.md)).
 * Einzige Ladestelle für Content im Frontend — dort hängt später der
 * Offline-Cache (Meilenstein 6).
 */
@Service()
export class ContentService {
  private readonly http = inject(HttpClient);

  private readonly worldConfigCache = new Map<string, Observable<WorldConfig>>();

  private readonly eventFileCache = new Map<string, Observable<EventFile>>();

  getInstalledThemes(): Observable<MainHub> {
    return this.http.get<MainHub>('/api/content/themes');
  }

  /**
   * Zwischengespeichert pro Welt-ID — der Resolver (Phase 5) fragt sonst bei
   * jedem Screenwechsel neu an.
   */
  getWorldConfig(themeId: string): Observable<WorldConfig> {
    const cached = this.worldConfigCache.get(themeId);

    if (cached !== undefined) {
      return cached;
    }

    const request$ = this.http
      .get<WorldConfig>(`/api/content/themes/${themeId}`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.worldConfigCache.set(themeId, request$);

    return request$;
  }

  getEpisode(themeId: string, episodeId: string): Observable<Episode> {
    return this.http.get<Episode>(`/api/content/themes/${themeId}/episodes/${episodeId}`);
  }

  /**
   * Eine ausgelagerte Event-Datei, zwischengespeichert pro Welt und Event —
   * dieselbe Aufgabe in zwei Episoden wird einmal geladen.
   */
  getEvent(themeId: string, eventId: string): Observable<EventFile> {
    const cacheKey = `${themeId}/${eventId}`;
    const cached = this.eventFileCache.get(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    const request$ = this.http
      .get<EventFile>(`/api/content/themes/${themeId}/events/${eventId}`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.eventFileCache.set(cacheKey, request$);

    return request$;
  }

  /** Datei in einem Asset-Unterordner der Welt, z. B. `sprites/luffy_wuetend.png`. */
  assetUrl(themeId: string, folder: string, file: string): string {
    return `/content/themes/${themeId}/${folder}/${file}`;
  }

  /** Datei direkt im Welt-Ordner, z. B. das Cover. */
  themeAssetUrl(themeId: string, file: string): string {
    return `/content/themes/${themeId}/${file}`;
  }

  hubAssetUrl(file: string): string {
    return `/content/hub/${file}`;
  }
}
