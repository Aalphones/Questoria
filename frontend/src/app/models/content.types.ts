/**
 * Content-Schema, verbindlich beschrieben in
 * `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 1 + 2.
 * Feldnamen sind snake_case, weil sie 1:1 aus den JSON-Dateien kommen.
 */

/** Ein Paar aus zwei ids derselben Ebene — zeichnet eine Verbindungslinie. */
export type RoutePair = readonly [string, string];

export interface HubMap {
  /** Dateiname unter assets/hub/, 16:9 */
  background: string;
  routes: RoutePair[];
}

export interface InstalledTheme {
  id: string;
  title: string;
  /** relativer Pfad zum Cover-Bild der Welt */
  cover: string;
  /** relativer Pfad zur world_config.json der Welt */
  config_path: string;
  /** horizontale Position auf der Planetenkarte, in % der Kartenbreite */
  x: number;
  /** vertikale Position auf der Planetenkarte, in % der Kartenhöhe */
  y: number;
  /** Durchmesser des Weltknotens, in % der Kartenbreite */
  size: number;
}

export interface MainHub {
  hub_map: HubMap;
  installed_themes: InstalledTheme[];
}

export interface DifficultyLevel {
  id: string;
  label: string;
}

export interface ArcStage {
  /** verweist auf MapEntry.id */
  map_id: string;
  name: string;
  x: number;
  y: number;
  /** Breite der Etappeninsel, in % der Kartenbreite */
  size: number;
  /** Höhe geteilt durch Breite der Insel */
  aspect: number;
  /** CSS-border-radius-Wert für die Inselform */
  shape: string;
  /** Dateiname unter maps/ */
  illustration: string;
}

export interface ArcOverview {
  title: string;
  background: string;
  stages: ArcStage[];
  routes: RoutePair[];
}

export interface MapNode {
  id: string;
  name: string;
  x: number;
  y: number;
  /** episode_id, die dieser Kartenpunkt startet */
  episode_ref: string;
}

export interface MapEntry {
  id: string;
  name: string;
  /** Dateiname unter maps/ */
  file: string;
  nodes: MapNode[];
  routes: RoutePair[];
}

export interface WorldConfig {
  theme_id: string;
  title: string;
  /** Lernfach, z.B. Sachkunde */
  subject: string;
  difficulty_levels: DifficultyLevel[];
  arc_overview: ArcOverview;
  maps: MapEntry[];
}
