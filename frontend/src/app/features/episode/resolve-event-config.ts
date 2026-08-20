import { EventFile, EventType, GeneratedSlot, PoolItem } from '../../models/content.types';
import {
  drawConstrainedValues,
  resolveTemplate,
  selectFromPool,
} from '../../services/variation';

/**
 * Auflösung ausgelagerter Event-Konfigurationen — reine Funktionen, kein
 * Signal, kein HTTP. Das Gerüst löst `config.ref`, die Lernstufen-Variante und
 * seit dem Variationssystem (Plan Phase 1) auch `pool`/`generated` auf; eine
 * Event-Komponente bekommt eine fertige Konfiguration und sieht weder `ref`
 * noch Varianten, Pools oder Zahlenbereiche (Schema Abschnitt 4 + Varianten-Regel).
 */

/** Ergebnis der Fassungsauswahl — `usedPoolItemId` nur gesetzt, wenn die Fassung aus einem Pool kam. */
export interface ResolvedVariant {
  readonly config: Record<string, unknown>;
  readonly usedPoolItemId: string | null;
}

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
  random: () => number,
  recentPoolItemIds: readonly string[],
): ResolvedVariant {
  if (eventFile.type !== eventType) {
    throw new Error(
      `Event-Datei "${eventFile.event_id}" ist vom Typ ${eventFile.type}, die Episode erwartet ${eventType}.`,
    );
  }

  const resolved = variantFor(eventFile, difficultyLevelId, random, recentPoolItemIds);

  return {
    config: { ...appearanceFields(episodeConfig), ...resolved.config },
    usedPoolItemId: resolved.usedPoolItemId,
  };
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
function variantFor(
  eventFile: EventFile,
  difficultyLevelId: string,
  random: () => number,
  recentPoolItemIds: readonly string[],
): ResolvedVariant {
  const variants = eventFile.variants;
  const requested = variants?.[difficultyLevelId];

  if (isConfigObject(requested)) {
    return resolveSlot(requested, random, recentPoolItemIds);
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

  return resolveSlot(fallback, random, recentPoolItemIds);
}

/**
 * Löst eine Lernstufen-Variante zur eigentlichen Aufgabe auf: `pool` sticht
 * `generated`, fehlen beide, ist der Eintrag selbst schon die Aufgabe (die
 * Form vor dem Variationssystem, weiterhin gültig — README Kontrakt).
 */
function resolveSlot(
  slot: Record<string, unknown>,
  random: () => number,
  recentPoolItemIds: readonly string[],
): ResolvedVariant {
  const pool = slot['pool'];

  if (Array.isArray(pool) && pool.length > 0) {
    const chosen = selectFromPool(pool as PoolItem[], random, recentPoolItemIds);
    const { id: usedPoolItemId, ...config } = chosen;

    return { config, usedPoolItemId };
  }

  const generated = slot['generated'];

  if (isConfigObject(generated)) {
    // `as unknown as GeneratedSlot`: die Form ist zur Laufzeit nicht geprüft,
    // eine kaputte Content-Datei läuft stattdessen ungeprüft durch `resolveGenerated`
    // — dieselbe Fehlerklasse toleriert das Gerüst schon bei inline-Konfigurationen.
    return {
      config: resolveGenerated(generated as unknown as GeneratedSlot, random),
      usedPoolItemId: null,
    };
  }

  return { config: slot, usedPoolItemId: null };
}

/** Zieht Werte innerhalb der Bedingungen und löst sie in jedem Textfeld der Vorlage auf. */
function resolveGenerated(generated: GeneratedSlot, random: () => number): Record<string, unknown> {
  const values = drawConstrainedValues(generated.ranges, random, generated.constraints ?? []);

  return resolveTemplateDeep(generated.template, values) as Record<string, unknown>;
}

function resolveTemplateDeep(value: unknown, values: Readonly<Record<string, number>>): unknown {
  if (typeof value === 'string') {
    return resolveTemplate(value, values);
  }

  if (Array.isArray(value)) {
    return value.map((item: unknown) => resolveTemplateDeep(item, values));
  }

  if (isConfigObject(value)) {
    const resolved: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(value)) {
      resolved[key] = resolveTemplateDeep(entry, values);
    }

    return resolved;
  }

  return value;
}

function isConfigObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
