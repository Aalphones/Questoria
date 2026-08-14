import { MultipleChoiceConfig } from '../../../models/content.types';

/** Zustand einer Antwort, nachdem sie angetippt wurde. */
export type AnswerState = 'open' | 'correct' | 'wrong';

/** Eine Antwort, fertig zum Anzeigen. */
export interface AnswerView {
  readonly index: number;
  readonly label: string;
  /** Ziffer im Vorlesemodus, Buchstabe im Lesemodus. */
  readonly key: string;
  /** Nur im Vorlesemodus gesetzt; `null` zeigt den beschrifteten Platzhalter. */
  readonly imageUrl: string | null;
  readonly state: AnswerState;
  /** Symbol neben der Antwort — der Zustand hängt nie allein an der Farbe. */
  readonly mark: string | null;
  /** Fassung des Zustands für Screenreader. */
  readonly stateLabel: string | null;
  readonly locked: boolean;
}

/**
 * Taugt die aufgelöste Konfiguration überhaupt als Quiz? Ohne diese Prüfung
 * zeigte eine kaputte Content-Datei eine leere Aufgabe statt der Fehlermeldung
 * des Gerüsts.
 */
export function isMultipleChoiceConfig(config: unknown): config is MultipleChoiceConfig {
  const candidate = config as Partial<MultipleChoiceConfig> | null;
  const options = candidate?.options;
  const correctIndex = candidate?.correct_index;

  if (typeof candidate?.question !== 'string' || !Array.isArray(options) || options.length < 2) {
    return false;
  }

  return (
    typeof correctIndex === 'number' &&
    Number.isInteger(correctIndex) &&
    correctIndex >= 0 &&
    correctIndex < options.length
  );
}
