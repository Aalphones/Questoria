import { NumberRange, ValueConstraint } from '../models/content.types';

/**
 * Ein Würfel für alle Aufgabentypen — reproduzierbare Mischung, Auswahl und
 * Zahlengenerierung über einen gemeinsamen Startwert. Reine Funktionen, kein
 * Angular-Dienst, kein Zustand (Muster wie `services/progress.rules.ts`).
 *
 * Kein `Math.random()` außerhalb dieser Datei (Plan Phase 1, AK 2) — jede
 * Stelle, die Zufall braucht, bekommt ihn über einen Generator aus
 * `seededRandom`.
 */

/** Ganzzahliger Bereich für die Bedingungsprüfung generierter Fassungen. */
const MAX_CONSTRAINT_DRAWS = 200;

/** Erzeugt aus Profil, Episode und Versuchsnummer einen deterministischen Startwert für einen Lauf. */
export function deriveRunSeed(profileId: number, episodeId: string, attempt: number): number {
  return hashText(`${profileId}:${episodeId}:${attempt}`);
}

/**
 * Leitet aus dem Lauf-Startwert und der Position in der Eventliste einen
 * eigenen Startwert je Event ab — sonst würde jede Aufgabe eines Laufs mit
 * demselben ersten Zufallswert beginnen.
 */
export function deriveEventSeed(runSeed: number, eventIndex: number): number {
  return hashText(`${runSeed}:${eventIndex}`);
}

function hashText(text: string): number {
  let hash = 0;

  for (let index = 0; index < text.length; index++) {
    hash = (Math.imul(hash, 31) + text.charCodeAt(index)) | 0;
  }

  return hash >>> 0;
}

/**
 * Deterministischer Zufallsgenerator (mulberry32) — derselbe Startwert liefert
 * bei jedem Aufruf dieselbe Zahlenfolge in `[0, 1)`.
 */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return (): number => {
    state = (state + 0x6d2b79f5) | 0;

    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates mit einem übergebenen Zufallsgenerator — liefert eine neue, gemischte Liste. */
export function shuffle<T>(list: readonly T[], random: () => number): readonly T[] {
  const shuffled = list.slice();

  for (let position = shuffled.length - 1; position > 0; position--) {
    const swapWith = Math.floor(random() * (position + 1));
    const parked = shuffled[position];

    shuffled[position] = shuffled[swapWith];
    shuffled[swapWith] = parked;
  }

  return shuffled;
}

/**
 * Wählt eine Fassung aus einem Pool. Die Meidungsliste ist Teil der Eingabe
 * der Auswahl, kein nachträglicher Filter — sonst ist ein Startwert nicht
 * mehr reproduzierbar, sobald sich die zuletzt benutzten Fassungen ändern
 * (Plan Phase 1, Risiko „Wiederholungsschutz und Startwert").
 *
 * Ist der ganze Pool auf der Meidungsliste (z. B. nur zwei Fassungen, beide
 * zuletzt benutzt), zählt die Meidung nicht — sonst gäbe es nichts zu wählen.
 */
export function selectFromPool<T extends { readonly id: string }>(
  items: readonly T[],
  random: () => number,
  avoidRecent: readonly string[],
): T {
  const eligible = items.filter((item: T) => !avoidRecent.includes(item.id));
  const pool = eligible.length > 0 ? eligible : items;
  const index = Math.floor(random() * pool.length);

  return pool[index];
}

/** Ganzzahl innerhalb eines Bereichs, beide Grenzen eingeschlossen. */
export function generateInteger(range: NumberRange, random: () => number): number {
  const span = range.max - range.min + 1;

  return range.min + Math.floor(random() * span);
}

/** Ersetzt `{key}`-Platzhalter im Text durch die erzeugten Werte. Unbekannte Platzhalter bleiben stehen. */
export function resolveTemplate(text: string, values: Readonly<Record<string, number>>): string {
  return text.replace(/\{(\w+)\}/g, (placeholder: string, key: string): string => {
    const value = values[key];

    return value === undefined ? placeholder : String(value);
  });
}

/**
 * Wie `resolveTemplate`, liefert aber eine **Zahl**, wenn der ganze Text aus
 * genau einem bekannten Platzhalter besteht. Ohne das käme aus
 * `"target": "{ziel}"` die Zeichenkette `"7"` statt der Zahl `7` — bei einem
 * Zahlenfeld wie dem Ziel des Zahlenstrahls ist das der Unterschied zwischen
 * spielbar und Fehlerpfad.
 */
export function resolveTemplateValue(
  text: string,
  values: Readonly<Record<string, number>>,
): string | number {
  const wholePlaceholder = /^\{(\w+)\}$/.exec(text);
  const single = wholePlaceholder === null ? undefined : values[wholePlaceholder[1]];

  if (single !== undefined) {
    return single;
  }

  return resolveTemplate(text, values);
}

/**
 * Prüft gezogene Werte gegen die Bedingungen einer generierten Fassung.
 * `right` ist entweder eine Zahl oder der Name eines anderen gezogenen Werts.
 */
export function satisfiesConstraints(
  values: Readonly<Record<string, number>>,
  constraints: readonly ValueConstraint[],
): boolean {
  return constraints.every((constraint: ValueConstraint) => {
    const left = values[constraint.left];
    const right =
      typeof constraint.right === 'number' ? constraint.right : values[constraint.right];

    if (left === undefined || right === undefined) {
      return false;
    }

    return compare(left, constraint.operator, right);
  });
}

function compare(left: number, operator: ValueConstraint['operator'], right: number): boolean {
  if (operator === '<') return left < right;
  if (operator === '<=') return left <= right;
  if (operator === '>') return left > right;
  if (operator === '>=') return left >= right;
  if (operator === '==') return left === right;

  return left !== right;
}

/**
 * Zieht Werte für jeden Bereich, bis die Bedingungen erfüllt sind. Kein
 * Absturz, wenn Autoren unerfüllbare Bedingungen konfigurieren — nach dem
 * Limit gilt der letzte Zug, mit einer Warnung, die den Content-Fehler
 * sichtbar macht (Muster wie `resolve-event-config.ts` → `variantFor`).
 */
export function drawConstrainedValues(
  ranges: Readonly<Record<string, NumberRange>>,
  random: () => number,
  constraints: readonly ValueConstraint[] = [],
): Record<string, number> {
  let values: Record<string, number> = {};

  for (let attempt = 0; attempt < MAX_CONSTRAINT_DRAWS; attempt++) {
    values = {};

    for (const [key, range] of Object.entries(ranges)) {
      values[key] = generateInteger(range, random);
    }

    if (constraints.length === 0 || satisfiesConstraints(values, constraints)) {
      return values;
    }
  }

  console.warn('Generierte Fassung: Bedingungen nach maximaler Zugzahl nicht erfüllt, letzter Zug gilt.');

  return values;
}
