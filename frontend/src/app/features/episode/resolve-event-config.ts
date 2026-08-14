import { EventFile, EventType } from '../../models/content.types';

/**
 * Auflösung ausgelagerter Event-Konfigurationen — reine Funktionen, kein
 * Signal, kein HTTP. Das Gerüst löst `config.ref` und die Lernstufen-Variante
 * auf; eine Event-Komponente bekommt eine fertige Konfiguration und sieht weder
 * `ref` noch die übrigen Varianten (Schema Abschnitt 4 + Varianten-Regel).
 */

/** Die Event-ID, wenn die Konfiguration ausgelagert ist — sonst `null` (inline). */
export function eventRefOf(episodeConfig: unknown): string | null {
  if (typeof episodeConfig !== 'object' || episodeConfig === null) {
    return null;
  }

  const ref = (episodeConfig as { ref?: unknown }).ref;

  return typeof ref === 'string' && ref.length > 0 ? ref : null;
}

/**
 * Führt Auftritts-Felder aus der Episode und die Variante der aktiven Lernstufe
 * zusammen. Bei gleichem Feldnamen gewinnt die Variante — die Episode ergänzt
 * den Auftritt (`background`, `music`), sie überschreibt die Aufgabe nicht.
 *
 * Wirft, wenn die Datei nicht zum Event passt: eine kaputte Content-Datei soll
 * in den Fehlerpfad des Gerüsts laufen, statt als leere Aufgabe durchzurutschen.
 */
export function resolveEventConfig(
  episodeConfig: unknown,
  eventFile: EventFile,
  eventType: EventType,
  difficultyLevelId: string,
): Record<string, unknown> {
  if (eventFile.type !== eventType) {
    throw new Error(
      `Event-Datei "${eventFile.event_id}" ist vom Typ ${eventFile.type}, die Episode erwartet ${eventType}.`,
    );
  }

  return { ...appearanceFields(episodeConfig), ...variantFor(eventFile, difficultyLevelId) };
}

/** Alles neben `ref` betrifft den Auftritt und darf pro Episode anders sein. */
function appearanceFields(episodeConfig: unknown): Record<string, unknown> {
  if (typeof episodeConfig !== 'object' || episodeConfig === null) {
    return {};
  }

  const appearance: Record<string, unknown> = { ...(episodeConfig as Record<string, unknown>) };
  delete appearance['ref'];

  return appearance;
}

/**
 * Fehlt die Variante der aktiven Lernstufe, spielt die erste vorhandene: ein
 * Kind darf nicht vor einer unvollständigen Content-Datei stehenbleiben. Die
 * Warnung macht den Fehler für den Autor sichtbar.
 */
function variantFor(eventFile: EventFile, difficultyLevelId: string): Record<string, unknown> {
  const variants = eventFile.variants;
  const requested = variants?.[difficultyLevelId];

  if (isConfigObject(requested)) {
    return requested;
  }

  const fallback = Object.values(variants ?? {}).find((variant: unknown) =>
    isConfigObject(variant),
  );

  if (!isConfigObject(fallback)) {
    throw new Error(`Event-Datei "${eventFile.event_id}" hat keine brauchbare Variante.`);
  }

  console.warn(
    `Event "${eventFile.event_id}" hat keine Variante für die Lernstufe "${difficultyLevelId}" — es wird die erste vorhandene gespielt.`,
  );

  return fallback;
}

function isConfigObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
