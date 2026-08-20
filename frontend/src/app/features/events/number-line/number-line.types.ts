import { NumberLineConfig } from '../../../models/content.types';

/**
 * Wie viele Felder ein Strahl höchstens hat. Darüber wird jedes einzelne
 * schmaler als ein Kinderfinger — dann ist es keine Aufgabe mehr, sondern
 * Zielübung.
 */
const MAX_FIELDS = 21;

/** Zustand eines Felds auf dem Strahl. */
export type FieldState = 'open' | 'correct' | 'wrong';

/** Ein Feld auf dem Zahlenstrahl, fertig zum Anzeigen. */
export interface NumberFieldView {
  readonly value: number;
  /** Nur beschriftete Felder zeigen ihre Zahl — die übrigen tragen einen Strich. */
  readonly label: string | null;
  readonly state: FieldState;
  readonly locked: boolean;
}

/**
 * Taugt die aufgelöste Konfiguration als Zahlenstrahl? Der teuerste Fehler
 * wäre ein Ziel, das auf keinem Feld liegt: Der Strahl sähe vollständig aus
 * und das Kind könnte jedes Feld antippen, ohne je richtig zu liegen. Deshalb
 * Fehlerpfad statt Anzeige.
 */
export function isNumberLineConfig(config: unknown): config is NumberLineConfig {
  const candidate = config as Partial<NumberLineConfig> | null;

  if (typeof candidate?.question !== 'string') {
    return false;
  }

  const { min, max, target } = candidate;

  if (!isInteger(min) || !isInteger(max) || !isInteger(target) || min >= max) {
    return false;
  }

  const step = candidate.step ?? 1;

  if (!isInteger(step) || step <= 0) {
    return false;
  }

  const labelEvery = candidate.label_every ?? 1;

  if (!isInteger(labelEvery) || labelEvery <= 0) {
    return false;
  }

  const fieldCount = Math.floor((max - min) / step) + 1;

  if (fieldCount > MAX_FIELDS) {
    return false;
  }

  // Das Ziel muss auf dem Raster liegen, nicht bloß im Bereich: Bei `step: 2`
  // ist die 7 zwischen zwei Feldern und damit nicht antippbar.
  return target >= min && target <= max && (target - min) % step === 0;
}

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

/** Die Felder des Strahls, von links nach rechts. */
export function fieldValues(config: NumberLineConfig): readonly number[] {
  const step = config.step ?? 1;
  const count = Math.floor((config.max - config.min) / step) + 1;

  return Array.from({ length: count }, (_unused: unknown, index: number) => config.min + index * step);
}

/** Trägt dieses Feld seine Zahl? Erstes und letztes immer — sonst hätte der Strahl keine Enden. */
export function isLabelled(config: NumberLineConfig, index: number, count: number): boolean {
  const labelEvery = config.label_every ?? 1;

  return index === 0 || index === count - 1 || index % labelEvery === 0;
}
