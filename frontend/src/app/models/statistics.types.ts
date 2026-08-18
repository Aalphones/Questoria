/** Antwortform des Servers — Schlangenschrift wie im Kontrakt. */
export interface StatisticsResponse {
  readonly theme_id: string;
  readonly events_completed: number;
  readonly correct_answers: number;
  readonly wrong_answers: number;
  readonly playtime_minutes: number;
  readonly updated_at: string | null;
}

/** Die vier Zahlen einer Welt, über alle Läufe hinweg gewachsen. */
export interface StatisticsTotals {
  readonly eventsCompleted: number;
  readonly correctAnswers: number;
  readonly wrongAnswers: number;
  readonly playtimeMinutes: number;
}

export const EMPTY_STATISTICS_TOTALS: StatisticsTotals = {
  eventsCompleted: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  playtimeMinutes: 0,
};

/**
 * Der Zuwachs eines einzelnen, abgeschlossenen Laufs — trägt seine eigene
 * Kennung, damit derselbe Lauf nach einem Aussetzer nicht doppelt gezählt
 * wird (Plan Phase 8, Puffer-Regel 2).
 */
export interface StatisticsDelta extends StatisticsTotals {
  readonly runId: string;
}

/**
 * Bestätigter Stand einer Welt plus die Warteschlange noch nicht bestätigter
 * Zuwächse. Anders als beim Spielstand ist ein Zuwachs additiv, nicht
 * ersetzend — deshalb eine Warteschlange statt eines einzelnen
 * überschriebenen Eintrags (Muster wie `achievement.types.ts`, aber mit
 * mehreren offenen Einträgen je Welt statt eines `pending`-Flags).
 */
export interface MirroredStatistics {
  readonly confirmed: StatisticsTotals;
  readonly pending: readonly StatisticsDelta[];
}

/** Aufbau von `questoria.statistics.v1`: Profil → Welt → Stand. */
export type StatisticsMirror = Record<string, Record<string, MirroredStatistics>>;
