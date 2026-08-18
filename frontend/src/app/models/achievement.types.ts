/** Ein erreichter Erfolg, wie ihn der Server liefert (Kontrakt-Version 1). */
export interface UnlockedAchievement {
  readonly themeId: string;
  readonly achievementKey: string;
  readonly unlockedAt: string | null;
}

/** Antwortform des Servers — Schlangenschrift wie im Kontrakt. */
export interface AchievementResponse {
  readonly theme_id: string;
  readonly achievement_key: string;
  readonly unlocked_at: string | null;
}

/**
 * Ein Eintrag im lokalen Spiegel. `pending` heißt: der Server hat diese
 * Freischaltung noch nicht bestätigt — Puffer wie beim Spielstand (Plan
 * Phase 5, Puffer-Regel 1), aber additiv: ein Eintrag verschwindet nie wieder.
 */
export interface MirroredAchievement {
  readonly unlockedAt: string | null;
  readonly pending: boolean;
}

/** Aufbau von `questoria.achievements.v1`: Profil → Welt → Schlüssel → Eintrag. */
export type AchievementMirror = Record<string, Record<string, Record<string, MirroredAchievement>>>;
