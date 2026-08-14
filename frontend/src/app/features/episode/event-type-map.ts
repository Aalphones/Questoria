import { Type } from '@angular/core';

import { EventType } from '../../models/content.types';

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
export const EVENT_COMPONENTS: Readonly<Partial<Record<EventType, () => Promise<Type<unknown>>>>> = {
  dialog: () => import('../events/dialog/dialog').then((module) => module.Dialog),
};

/** Lädt die Komponente zu einem Eventtyp — unbekannter Typ wirft, das Gerüst zeigt die Meldung. */
export function loadEventComponent(type: EventType): Promise<Type<unknown>> {
  const load = EVENT_COMPONENTS[type];

  if (load === undefined) {
    return Promise.reject(new Error(`Unbekannter Eventtyp: ${type}`));
  }

  return load();
}
