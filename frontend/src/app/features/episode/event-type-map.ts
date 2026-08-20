import { Type } from '@angular/core';

import { EventType } from '../../models/content.types';
import { isDialogConfig } from '../events/dialog/dialog.types';
import { isImageSearchConfig } from '../events/image-search/image-search.types';
import { isMultipleChoiceConfig } from '../events/multiple-choice/multiple-choice.types';
import { isNumberLineConfig } from '../events/number-line/number-line.types';
import { isRewardConfig } from '../events/reward/reward.types';
import { isSortingConfig } from '../events/sorting/sorting.types';
import { isTextInputConfig } from '../events/text-input/text-input.types';
import { isWordMatchConfig } from '../events/word-match/word-match.types';

/**
 * Die einzige Stelle, an der ein Eventtyp seiner Komponente zugeordnet wird —
 * das Gegenstück zur Typ-Tabelle in `data/_authoring/JSON_SCHEMA_REFERENCE.md`
 * Abschnitt 5.0. Ein neuer Eventtyp heißt: eine Zeile hier, ein Ordner unter
 * `features/events/`, ein Eintrag im Schema. Kein `@switch` im Ablauf-Gerüst
 * (Critical Rule 9).
 *
 * Ein Typ steht hier erst, wenn seine Komponente existiert; die übrigen Typen
 * aus `EVENT_TYPES` laufen bis dahin in den Fehlerpfad des Gerüsts.
 */
export const EVENT_COMPONENTS: Readonly<Partial<Record<EventType, () => Promise<Type<unknown>>>>> =
  {
    dialog: () => import('../events/dialog/dialog').then((module) => module.Dialog),
    multiple_choice: () =>
      import('../events/multiple-choice/multiple-choice').then((module) => module.MultipleChoice),
    text_input: () => import('../events/text-input/text-input').then((module) => module.TextInput),
    image_search: () =>
      import('../events/image-search/image-search').then((module) => module.ImageSearch),
    reward: () => import('../events/reward/reward').then((module) => module.Reward),
    word_match: () => import('../events/word-match/word-match').then((module) => module.WordMatch),
    sorting: () => import('../events/sorting/sorting').then((module) => module.Sorting),
    number_line: () =>
      import('../events/number-line/number-line').then((module) => module.NumberLine),
  };

/**
 * Welche Eventtypen bewertet werden — nur sie gehen in die Sternenformel ein
 * und nur sie bekommen einen Fortschrittspunkt. Steht hier, weil das Gerüst
 * sonst anfangen müsste, einzelne Typen zu kennen.
 */
export const SCORED_EVENT_TYPES: ReadonlySet<EventType> = new Set<EventType>([
  'multiple_choice',
  'text_input',
  'image_search',
  'word_match',
  'sorting',
  'number_line',
]);

/**
 * Prüft die fertig aufgelöste Konfiguration gegen ihren Eventtyp. Ohne diese
 * Prüfung spielte eine kaputte Content-Datei als leere Aufgabe weiter, statt in
 * den Fehlerpfad zu laufen — die Komponente bekommt ihre Konfiguration ungeprüft
 * über `ngComponentOutlet`.
 */
export function assertPlayableConfig(type: EventType, config: unknown): void {
  const isPlayable = EVENT_CONFIG_GUARDS[type];

  if (isPlayable !== undefined && !isPlayable(config)) {
    throw new Error(`Konfiguration passt nicht zum Eventtyp ${type}.`);
  }
}

/** Je Typ eine Prüfung — Typen ohne Eintrag werden nicht geprüft. */
const EVENT_CONFIG_GUARDS: Readonly<Partial<Record<EventType, (config: unknown) => boolean>>> = {
  dialog: isDialogConfig,
  multiple_choice: isMultipleChoiceConfig,
  text_input: isTextInputConfig,
  image_search: isImageSearchConfig,
  reward: isRewardConfig,
  word_match: isWordMatchConfig,
  sorting: isSortingConfig,
  number_line: isNumberLineConfig,
};

/** Lädt die Komponente zu einem Eventtyp — unbekannter Typ wirft, das Gerüst zeigt die Meldung. */
export function loadEventComponent(type: EventType): Promise<Type<unknown>> {
  const load = EVENT_COMPONENTS[type];

  if (load === undefined) {
    return Promise.reject(new Error(`Unbekannter Eventtyp: ${type}`));
  }

  return load();
}
