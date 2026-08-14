/** Eine Figur auf einem der beiden Bühnenplätze — fertig zum Anzeigen. */
export interface StageFigure {
  readonly name: string;
  /** Dateiname des Sprites, dient auch als Beschriftung des Platzhalters. */
  readonly sprite: string;
  readonly spriteUrl: string;
}
