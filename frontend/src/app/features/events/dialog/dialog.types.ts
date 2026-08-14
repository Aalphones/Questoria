import { DialogConfig } from '../../../models/content.types';

/**
 * Trägt die Konfiguration wenigstens eine Dialogzeile? Ohne diese Prüfung
 * zeigte eine kaputte Content-Datei eine leere Bühne statt der Fehlermeldung.
 */
export function isDialogConfig(config: unknown): config is DialogConfig {
  const lines = (config as { lines?: unknown } | null)?.lines;

  return Array.isArray(lines) && lines.length > 0;
}

/** Eine Figur auf einem der beiden Bühnenplätze — fertig zum Anzeigen. */
export interface StageFigure {
  readonly name: string;
  /** Dateiname des Sprites, dient auch als Beschriftung des Platzhalters. */
  readonly sprite: string;
  readonly spriteUrl: string;
}
