import { TextInputConfig } from '../../../models/content.types';

/**
 * Taugt die aufgelöste Konfiguration überhaupt als Texteingabe? Ohne diese
 * Prüfung zeigte eine kaputte Content-Datei eine leere Aufgabe statt der
 * Fehlermeldung des Gerüsts.
 */
export function isTextInputConfig(config: unknown): config is TextInputConfig {
  const candidate = config as Partial<TextInputConfig> | null;
  const acceptedAnswers = candidate?.accepted_answers;

  if (typeof candidate?.question !== 'string') {
    return false;
  }

  if (candidate.input_type !== 'text' && candidate.input_type !== 'number') {
    return false;
  }

  return (
    Array.isArray(acceptedAnswers) &&
    acceptedAnswers.length > 0 &&
    acceptedAnswers.every((answer: unknown) => typeof answer === 'string')
  );
}

/**
 * Vergleicht die Eingabe gegen `accepted_answers`. Ohne `case_sensitive: true`
 * wird Groß-/Kleinschreibung ignoriert und äußerer Leerraum abgeschnitten.
 * Sonst nichts — keine Ähnlichkeitssuche, kein Tippfehler-Ausgleich.
 */
export function matchesAcceptedAnswer(rawInput: string, config: TextInputConfig): boolean {
  const caseSensitive = config.case_sensitive === true;
  const normalizedInput = normalize(rawInput, caseSensitive);

  return config.accepted_answers.some(
    (answer: string) => normalize(answer, caseSensitive) === normalizedInput,
  );
}

function normalize(value: string, caseSensitive: boolean): string {
  const trimmed = value.trim();

  return caseSensitive ? trimmed : trimmed.toLowerCase();
}
