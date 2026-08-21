/** Eine Kachel, so wie die Kartenfläche sie braucht: Position und aufgelöste Bild-URL. */
export interface MapCanvasTile {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  /** Aufgelöste Bild-URL — `null` heißt „freigeschaltet, aber Datei fehlt" (zeigt Platzhalter, kein Nebel). */
  readonly url: string | null;
}

/** Ein Knoten, so wie die Kartenfläche ihn braucht: Kennung, Kachel und Position darauf. */
export interface MapCanvasPoint {
  readonly id: string;
  readonly tileId: string;
  /** horizontale Position, in % der Kachelbreite (0–100, bezogen auf DIESE Kachel, nicht die ganze Karte) */
  readonly x: number;
  /** vertikale Position, in % der Kachelhöhe */
  readonly y: number;
}

/** Eine fertig gerechnete Routenlinie in Weltkoordinaten (Pixel) der Karte. */
export interface MapCanvasRoute {
  readonly id: string;
  readonly path: string;
  readonly dimmed: boolean;
}
