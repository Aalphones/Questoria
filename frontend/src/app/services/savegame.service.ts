import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Observable, map, shareReplay, tap } from 'rxjs';

import {
  EMPTY_SAVEGAME_STATE,
  MirroredSavegame,
  Savegame,
  SavegameMirror,
  SavegamePosition,
  SavegameResponse,
  SavegameState,
} from '../models/savegame.types';
import { GameStateService } from './game-state.service';
import { takeLegacyProgress } from './legacy-progress-import';

const STORAGE_KEY = 'questoria.savegame.v1';

/**
 * Der Spielstand mit einem Puffer davor (Plan Phase 5). Das Spiel wartet nie
 * auf den Server: jede Änderung geht zuerst in den Browser-Speicher, dann auf
 * die Reise. Klappt die Reise nicht, bleibt der Eintrag als offen markiert und
 * wird beim nächsten Anlass erneut geschickt.
 *
 * Seit Phase 6 hängen `ProgressService` und `RunStoreService` hier ein — der
 * Spielstand ist damit die einzige Quelle für Fortschritt und angefangenen
 * Lauf, der Browser-Speicher nur noch der Puffer davor.
 */
@Service()
export class SavegameService {
  private readonly http = inject(HttpClient);
  private readonly gameState = inject(GameStateService);
  private readonly localStorage = inject(DOCUMENT).defaultView?.localStorage;

  private readonly mirror = signal<SavegameMirror>(this.readMirror());

  /** Hält einen geglückten Versand davon ab, denselben Durchlauf erneut zu starten. */
  private flushing = false;

  /** Ein Ladelauf je Profil und Sitzung — der Wächter fragt vor jedem Screen. */
  private readonly loads = new Map<number, Observable<Savegame[]>>();

  /**
   * Der Zustand jeder Welt des aktiven Profils — die Datenquelle von
   * `ProgressService`. Reaktiv: ein eintreffender Serverstand färbt sofort auf
   * die Planetenkarte durch.
   */
  readonly statesByTheme = computed<Record<string, SavegameState>>(() => {
    const profileId = this.gameState.activeProfileId();

    if (profileId === null) {
      return {};
    }

    const states: Record<string, SavegameState> = {};

    for (const [themeId, entry] of Object.entries(this.mirror()[profileId] ?? {})) {
      states[themeId] = entry.state;
    }

    return states;
  });

  /**
   * Holt den Stand eines Profils genau einmal pro Sitzung und übernimmt danach
   * einen etwaigen alten Browser-Stand (Plan Phase 6, AK 5). Antwortet der
   * Server nicht, wird der Versuch vergessen statt gemerkt — beim nächsten
   * Screenwechsel darf er erneut laufen.
   */
  ensureLoaded(profileId: number): Observable<Savegame[]> {
    const running = this.loads.get(profileId);

    if (running !== undefined) {
      return running;
    }

    const load$ = this.loadAll(profileId).pipe(
      tap({
        next: () => this.adoptLegacyProgress(profileId),
        error: () => this.loads.delete(profileId),
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.loads.set(profileId, load$);

    return load$;
  }

  /**
   * Holt den Stand des Profils vom Server und legt ihn über den Spiegel.
   * **Der Server gewinnt — außer für Welten mit offenem Eintrag**: dort hat das
   * Kind bei totem Netz gespielt, und dieser Stand wird stattdessen sofort
   * hochgeschoben (Puffer-Regel 3).
   */
  loadAll(profileId: number): Observable<Savegame[]> {
    return this.http
      .get<{ savegames: SavegameResponse[] }>(`/api/profiles/${profileId}/savegames`)
      .pipe(
        map((response: { savegames: SavegameResponse[] }) => response.savegames.map(toSavegame)),
        tap((savegames: Savegame[]) => {
          this.mergeFromServer(profileId, savegames);
          this.flushPending();
        }),
      );
  }

  /** Der Stand einer Welt aus dem Spiegel — nie ein Netzaufruf. */
  stateFor(themeId: string): SavegameState {
    return this.entryFor(themeId)?.state ?? EMPTY_SAVEGAME_STATE;
  }

  positionFor(themeId: string): SavegamePosition | null {
    const entry = this.entryFor(themeId);

    if (entry === null) {
      return null;
    }

    return { episodeId: entry.episodeId, nodeId: entry.nodeId };
  }

  /**
   * Nimmt eine Änderung entgegen — immer erfolgreich. Der Aufrufer wartet auf
   * nichts und bekommt keinen Fehler zu sehen (Puffer-Regel 1).
   */
  save(themeId: string, state: SavegameState, position: SavegamePosition): void {
    const profileId = this.gameState.activeProfileId();

    if (profileId === null) {
      // Ohne Profil gibt es keinen Platz im Spiegel. Kann nur passieren, wenn
      // etwas außerhalb der Profilwahl zu spielen anfängt.
      console.warn('Spielstand ohne aktives Profil verworfen.');
      return;
    }

    this.writeEntry(profileId, themeId, {
      state,
      episodeId: position.episodeId,
      nodeId: position.nodeId,
      pending: true,
    });
    this.push(profileId, themeId);
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

      for (const [themeId, entry] of Object.entries(themes)) {
        if (entry.pending) {
          this.push(profileId, themeId);
        }
      }
    } finally {
      this.flushing = false;
    }
  }

  /**
   * Schiebt einen Eintrag hoch. Erst die Antwort des Servers räumt die Marke
   * `pending` weg — bis dahin gilt der lokale Stand als der wahre.
   */
  private push(profileId: number, themeId: string): void {
    const entry = this.mirror()[profileId]?.[themeId];

    if (entry === undefined) {
      return;
    }

    this.http
      .put<{ savegame: SavegameResponse }>(`/api/profiles/${profileId}/savegames/${themeId}`, {
        episode_id: entry.episodeId,
        node_id: entry.nodeId,
        state: entry.state,
      })
      .subscribe({
        next: () => {
          // Bewusst der Eintrag von vorhin und nicht der aktuelle: hat das Kind
          // während des Versands weitergespielt, steht dort schon ein neuerer
          // Stand, der noch offen bleiben muss.
          const current = this.mirror()[profileId]?.[themeId];

          if (current === entry) {
            this.writeEntry(profileId, themeId, { ...entry, pending: false });
          }

          this.flushPending();
        },
        error: () => {
          // Absicht: kein Aufräumen, keine Meldung. Der Eintrag bleibt offen
          // und geht beim nächsten Anlass erneut auf die Reise.
        },
      });
  }

  /**
   * Übernimmt einen vor Meilenstein 4 im Browser gespielten Stand — einmalig,
   * und nur für Welten, die dieses Profil noch nicht kennt (Plan Phase 6,
   * AK 5/6). Die alten Schlüssel verschwinden in jedem Fall: ein liegen
   * gebliebener Rest stünde sonst bei jedem Start erneut zur Debatte.
   *
   * Läuft bewusst nur nach einer **geglückten** Antwort des Servers. Bei totem
   * Netz wüsste niemand, ob das Profil längst einen Stand hat — die Übernahme
   * würde ihn überschreiben, sobald die Leitung wieder steht.
   */
  private adoptLegacyProgress(profileId: number): void {
    for (const [themeId, progress] of Object.entries(takeLegacyProgress(this.localStorage))) {
      if (this.mirror()[profileId]?.[themeId] !== undefined) {
        continue;
      }

      this.writeEntry(profileId, themeId, {
        state: { ...EMPTY_SAVEGAME_STATE, progress },
        episodeId: null,
        nodeId: null,
        pending: true,
      });
      this.push(profileId, themeId);
    }
  }

  private mergeFromServer(profileId: number, savegames: Savegame[]): void {
    const existing = this.mirror()[profileId] ?? {};
    const merged: Record<string, MirroredSavegame> = {};

    for (const savegame of savegames) {
      const local = existing[savegame.themeId];

      if (local !== undefined && local.pending) {
        // Hier hat das Kind bei totem Netz gespielt — der Server ist älter.
        merged[savegame.themeId] = local;
      } else {
        merged[savegame.themeId] = {
          state: savegame.state,
          episodeId: savegame.episodeId,
          nodeId: savegame.nodeId,
          pending: false,
        };
      }
    }

    // Welten, die der Server nicht kennt: nur offene Einträge überleben. Ein
    // bestätigter Eintrag ohne Gegenstück auf dem Server gehört zu einem
    // gelöschten Stand und würde sonst ewig wieder auftauchen.
    for (const [themeId, entry] of Object.entries(existing)) {
      if (merged[themeId] === undefined && entry.pending) {
        merged[themeId] = entry;
      }
    }

    this.mirror.update((mirror: SavegameMirror) => ({ ...mirror, [profileId]: merged }));
    this.writeMirror(this.mirror());
  }

  private entryFor(themeId: string): MirroredSavegame | null {
    const profileId = this.gameState.activeProfileId();

    if (profileId === null) {
      return null;
    }

    return this.mirror()[profileId]?.[themeId] ?? null;
  }

  private writeEntry(profileId: number, themeId: string, entry: MirroredSavegame): void {
    this.mirror.update((mirror: SavegameMirror) => ({
      ...mirror,
      [profileId]: { ...(mirror[profileId] ?? {}), [themeId]: entry },
    }));
    this.writeMirror(this.mirror());
  }

  private readMirror(): SavegameMirror {
    const raw = this.localStorage?.getItem(STORAGE_KEY);

    if (raw === null || raw === undefined) {
      return {};
    }

    try {
      return parseMirror(JSON.parse(raw));
    } catch {
      // Ein beschädigter Spiegel wird verworfen statt geworfen — sonst kommt
      // das Kind nicht mehr ins Spiel. Muster wie `run-store.service.ts`.
      console.warn('Spielstand im Browser-Speicher ist beschädigt, verwerfe ihn.');
      this.localStorage?.removeItem(STORAGE_KEY);
      return {};
    }
  }

  private writeMirror(mirror: SavegameMirror): void {
    this.localStorage?.setItem(STORAGE_KEY, JSON.stringify(mirror));
  }
}

function toSavegame(response: SavegameResponse): Savegame {
  return {
    themeId: response.theme_id,
    episodeId: response.episode_id,
    nodeId: response.node_id,
    state: response.state,
    updatedAt: response.updated_at,
  };
}

/**
 * Prüft nur die Form, die der Dienst später auch anfasst. Ein einzelner
 * kaputter Eintrag reißt den ganzen Spiegel mit — das ist gewollt: er ist ein
 * Puffer, kein Archiv, und der bestätigte Stand liegt auf dem Server.
 */
function parseMirror(value: unknown): SavegameMirror {
  if (typeof value !== 'object' || value === null) {
    throw new Error('malformed savegame mirror');
  }

  const mirror: SavegameMirror = {};

  for (const [profileId, themes] of Object.entries(value as Record<string, unknown>)) {
    if (typeof themes !== 'object' || themes === null) {
      throw new Error('malformed savegame mirror');
    }

    const parsedThemes: Record<string, MirroredSavegame> = {};

    for (const [themeId, entry] of Object.entries(themes as Record<string, unknown>)) {
      parsedThemes[themeId] = parseEntry(entry);
    }

    mirror[profileId] = parsedThemes;
  }

  return mirror;
}

function parseEntry(value: unknown): MirroredSavegame {
  const parsed = value as Partial<MirroredSavegame>;

  if (
    typeof parsed.pending !== 'boolean' ||
    typeof parsed.state !== 'object' ||
    parsed.state === null ||
    parsed.state.version !== 1
  ) {
    throw new Error('malformed savegame entry');
  }

  return {
    state: parsed.state,
    episodeId: typeof parsed.episodeId === 'string' ? parsed.episodeId : null,
    nodeId: typeof parsed.nodeId === 'string' ? parsed.nodeId : null,
    pending: parsed.pending,
  };
}
