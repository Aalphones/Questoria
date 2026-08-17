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
  /** Dateiname unter dem Welt-Ordner */
  cover: string;
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

/**
 * Eventtypen, verbindlich in `JSON_SCHEMA_REFERENCE.md` Abschnitt 5.0 — ein
 * Typ steht hier erst, wenn seine Angular-Komponente existiert.
 */
export const EVENT_TYPES = ['dialog', 'reward', 'multiple_choice', 'text_input', 'image_search'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface DialogueLine {
  position: 'left' | 'right';
  /** Dateiname unter sprites/<character>/ */
  sprite: string;
  name: string;
  text: string;
  /** kurze Fassung für den Vorlesemodus, siehe Abschnitt 6 */
  text_simple?: string;
  /** relativer Pfad unter audio/voices/ */
  audio_path?: string;
}

/** Die aufgelöste Konfiguration eines `dialog`-Events (Abschnitt 5.1, inline). */
export interface DialogConfig {
  lines: DialogueLine[];
}

/** Eine Antwortmöglichkeit eines Quiz-Events (Abschnitt 5.3). */
export interface AnswerOption {
  label: string;
  /** Dateiname unter answers/ — im Vorlesemodus die einzige Information für ein nicht lesendes Kind. */
  image?: string;
}

/** Die aufgelöste Konfiguration eines `multiple_choice`-Events (Abschnitt 5.3, ausgelagert). */
export interface MultipleChoiceConfig {
  question: string;
  /** kurze Fassung für den Vorlesemodus, siehe Abschnitt 6 */
  question_simple?: string;
  options: AnswerOption[];
  /** 0-basiert, Index in options */
  correct_index: number;
}

/** Die aufgelöste Konfiguration eines `text_input`-Events (Abschnitt 5.4, ausgelagert). */
export interface TextInputConfig {
  question: string;
  /** kurze Fassung für den Vorlesemodus, siehe Abschnitt 6 */
  question_simple?: string;
  input_type: 'text' | 'number';
  accepted_answers: string[];
  /** default false — ohne `true` wird Groß-/Kleinschreibung ignoriert */
  case_sensitive?: boolean;
}

/** Ein Suchziel eines `image_search`-Events (Abschnitt 5.5). */
export interface SearchTarget {
  label: string;
  /** horizontale Position, in % der Bildbreite */
  x: number;
  /** vertikale Position, in % der Bildhöhe */
  y: number;
  /** Toleranzradius, in % der Bildbreite — dasselbe Bezugsmaß wie `x` */
  radius: number;
}

/** Die aufgelöste Konfiguration eines `image_search`-Events (Abschnitt 5.5, ausgelagert). */
export interface ImageSearchConfig {
  /** Dateiname unter backgrounds/ oder eigenem images/-Ordner */
  image: string;
  question: string;
  question_simple?: string;
  targets: SearchTarget[];
  find_all: boolean;
}

/** Die Konfiguration eines `reward`-Events (Abschnitt 5.2, inline). */
export interface RewardConfig {
  /**
   * cards[].id aus cards.json — in Meilenstein 3 nur gemerkt, nicht vergeben.
   * Fehlt sie, gibt es eben nur Sterne (Plan Phase 5, AK 3).
   */
  card_id?: string;
}

/**
 * Eine ausgelagerte Event-Datei unter `events/<event_id>.json` mit einer
 * Variante je Lernstufe (Abschnitt 4 „Inline oder ausgelagert" + Varianten-Regel).
 * Welche Variante gespielt wird, entscheidet das Gerüst — nicht die Komponente.
 */
export interface EventFile<TVariant = unknown> {
  event_id: string;
  type: EventType;
  /** Schlüssel ist eine `difficulty_levels[].id` aus `world_config.json`. */
  variants: Record<string, TVariant>;
}

/**
 * `config` ist typabhängig (Abschnitt 5) — `unknown` statt eines einzelnen
 * Union-Typs, weil die Engine sie ungeprüft an die per `ngComponentOutlet`
 * geladene Komponente reicht.
 */
export interface EpisodeEvent {
  type: EventType;
  config: unknown;
}

export interface Episode {
  episode_id: string;
  /** muss eine maps[].id aus world_config.json sein */
  active_map_id: string;
  /** muss eine nodes[].id dieser Map sein */
  node_id: string;
  /** Dateiname unter backgrounds/ */
  background: string;
  events: EpisodeEvent[];
}
