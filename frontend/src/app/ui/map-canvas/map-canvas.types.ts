/** Ein Knoten, so wie die Kartenfläche ihn braucht: nur Kennung und Position. */
export interface MapCanvasPoint {
  readonly id: string;
  /** horizontale Position, in % der Kartenbreite */
  readonly x: number;
  /** vertikale Position, in % der Kartenhöhe */
  readonly y: number;
}

/** Eine fertig gerechnete Routenlinie im viewBox-Koordinatensystem der Karte. */
export interface MapCanvasRoute {
  readonly id: string;
  readonly path: string;
  readonly dimmed: boolean;
}
