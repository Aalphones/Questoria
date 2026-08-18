import { WordMatchConfig, WordPair } from '../../../models/content.types';

/** Drei oder vier Paare — mehr sprengt die Fläche auf dem Tablet (Schema 5.6). */
const MIN_PAIRS = 3;
const MAX_PAIRS = 4;

/**
 * Zustand eines Bildes oder einer Wortkarte.
 *
 * `selected` ist der erste der beiden Tipps, `wrong` die kurze Rückmeldung auf
 * ein falsch gelegtes Paar — danach steht beides wieder auf `open`.
 */
export type SlotState = 'open' | 'selected' | 'matched' | 'wrong';

/** Ein Bild in der linken Spalte, fertig zum Anzeigen. */
export interface ImageTileView {
  /** Index des Paares in `config.pairs` — die Zuordnung wird darüber geprüft. */
  readonly pairIndex: number;
  readonly imageUrl: string;
  /** Text im Platzhalter, wenn die Datei fehlt — der Dateiname, nie das Wort. */
  readonly placeholderLabel: string;
  readonly state: SlotState;
  /** Nummer des gelegten Paares — der Zustand hängt nie allein an der Farbe. */
  readonly badge: string | null;
  /** Fassung des Zustands für Screenreader. */
  readonly stateLabel: string | null;
  readonly locked: boolean;
}

/** Eine Wortkarte in der rechten Spalte, fertig zum Anzeigen. */
export interface WordCardView {
  /** Index des Paares in `config.pairs`, nicht die Position auf dem Schirm. */
  readonly pairIndex: number;
  readonly word: string;
  readonly state: SlotState;
  readonly badge: string | null;
  readonly stateLabel: string | null;
  readonly locked: boolean;
}

/**
 * Taugt die aufgelöste Konfiguration überhaupt als Zuordnungs-Aufgabe? Ohne
 * diese Prüfung zeigte eine kaputte Content-Datei eine leere Aufgabe statt der
 * Fehlermeldung des Gerüsts.
 *
 * Doppelte Wörter oder doppelte Bilder sind nicht bloß unschön: Die Aufgabe
 * hätte dann zwei richtige Antworten für dieselbe Karte und wäre nicht sauber
 * lösbar — deshalb Fehlerpfad statt Anzeige.
 */
export function isWordMatchConfig(config: unknown): config is WordMatchConfig {
  const candidate = config as Partial<WordMatchConfig> | null;
  const pairs = candidate?.pairs;

  if (typeof candidate?.question !== 'string' || !Array.isArray(pairs)) {
    return false;
  }

  if (pairs.length < MIN_PAIRS || pairs.length > MAX_PAIRS || !pairs.every(isWordPair)) {
    return false;
  }

  return (
    isFreeOfDuplicates(pairs.map((pair: WordPair) => pair.word)) &&
    isFreeOfDuplicates(pairs.map((pair: WordPair) => pair.image))
  );
}

function isWordPair(pair: unknown): pair is WordPair {
  const candidate = pair as Partial<WordPair> | null;

  return (
    typeof candidate?.word === 'string' &&
    candidate.word.trim().length > 0 &&
    typeof candidate.image === 'string' &&
    candidate.image.trim().length > 0
  );
}

/** Vergleicht ohne Rücksicht auf Groß-/Kleinschreibung — „Ball" und „ball" wären dasselbe Wort. */
function isFreeOfDuplicates(values: readonly string[]): boolean {
  const normalized = values.map((value: string) => value.trim().toLowerCase());

  return new Set(normalized).size === normalized.length;
}
