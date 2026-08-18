import { ProgressStore, StoredRun } from './game-state.types';

/**
 * Was in `game_state_json` einer Welt steht (Kontrakt-Version 1). Das Backend
 * liest den Inhalt nicht — die Form gilt nur hier (ADR-009).
 */
export interface SavegameState {
  readonly version: 1;
  /** Fortschritt **dieser** Welt, indiziert über `episode_id`. */
  readonly progress: ProgressStore[string];
  /** Der angefangene Lauf ohne die Welt-Kennung — die steckt schon im Eintrag. */
  readonly run: SavegameRun | null;
  readonly settings: SavegameSettings;
}

export type SavegameRun = Omit<StoredRun, 'themeId'>;

export interface SavegameSettings {
  readonly difficultyLevel: string | null;
}

/** Position im Spiel, getrennt vom Zustand gespeichert (eigene Spalten). */
export interface SavegamePosition {
  readonly episodeId: string | null;
  readonly nodeId: string | null;
}

/** Ein Spielstand, wie ihn der Server liefert. */
export interface Savegame extends SavegamePosition {
  readonly themeId: string;
  readonly state: SavegameState;
  readonly updatedAt: string | null;
}

/** Antwortform des Servers — Schlangenschrift wie im Kontrakt. */
export interface SavegameResponse {
  readonly theme_id: string;
  readonly episode_id: string | null;
  readonly node_id: string | null;
  readonly state: SavegameState;
  readonly updated_at: string | null;
}

/**
 * Ein Eintrag im lokalen Spiegel. `pending` heißt: der Server hat diesen Stand
 * noch nicht bestätigt — beim nächsten Laden gewinnt dann der lokale Stand,
 * nicht der Server (Plan Phase 5, Puffer-Regel 3).
 */
export interface MirroredSavegame extends SavegamePosition {
  readonly state: SavegameState;
  readonly pending: boolean;
}

/** Aufbau von `questoria.savegame.v1`: Profil → Welt → Eintrag. */
export type SavegameMirror = Record<string, Record<string, MirroredSavegame>>;

export const EMPTY_SAVEGAME_STATE: SavegameState = {
  version: 1,
  progress: {},
  run: null,
  settings: { difficultyLevel: null },
};
