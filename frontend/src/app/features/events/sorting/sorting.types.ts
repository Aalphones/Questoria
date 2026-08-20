import { SortingCategory, SortingConfig, SortingItem } from '../../../models/content.types';
import { shuffle } from '../../../services/variation';

/** Zwei bis vier Körbe — mehr passt auf dem Tablet nicht nebeneinander (Schema 5.7). */
const MIN_CATEGORIES = 2;
const MAX_CATEGORIES = 4;

/** Weniger als zwei Gegenstände sind keine Sortier-Aufgabe, mehr als acht sprengen die Fläche. */
const MIN_ITEMS = 2;
const MAX_PLAYED_ITEMS = 8;

/** Zustand eines Gegenstands im Vorrat. */
export type ItemState = 'open' | 'selected' | 'wrong';

/** Ein Gegenstand, der noch auf seinen Korb wartet. */
export interface ItemView {
  readonly id: string;
  readonly label: string;
  /** `null`, wenn der Gegenstand ohne Bild auskommt — dann trägt ihn allein sein Wort. */
  readonly imageUrl: string | null;
  /** Text im Platzhalter, wenn die Bilddatei fehlt — der Dateiname, nie das Wort. */
  readonly placeholderLabel: string;
  readonly state: ItemState;
}

/** Ein Gegenstand, der schon in seinem Korb liegt. */
export interface PlacedItemView {
  readonly id: string;
  readonly label: string;
  readonly imageUrl: string | null;
  readonly placeholderLabel: string;
}

/** Ein Korb samt allem, was schon darin liegt. */
export interface CategoryView {
  readonly id: string;
  readonly label: string;
  readonly imageUrl: string | null;
  readonly placeholderLabel: string;
  readonly placedItems: readonly PlacedItemView[];
  /** Ganzer Satz für Screenreader — der Knopf sagt sonst nur seinen Namen. */
  readonly ariaLabel: string;
}

/**
 * Taugt die aufgelöste Konfiguration als Sortier-Aufgabe? Ohne diese Prüfung
 * spielte eine kaputte Content-Datei als leere Aufgabe weiter, statt in den
 * Fehlerpfad des Gerüsts zu laufen.
 *
 * Ein Gegenstand, dessen `category` auf keinen Korb zeigt, ist der teuerste
 * Fehler: Die Aufgabe sähe vollständig aus und wäre nicht lösbar — das Kind
 * würde jeden Korb durchprobieren und keiner wäre richtig.
 */
export function isSortingConfig(config: unknown): config is SortingConfig {
  const candidate = config as Partial<SortingConfig> | null;
  const categories = candidate?.categories;
  const items = candidate?.items;

  if (typeof candidate?.question !== 'string' || !Array.isArray(categories) || !Array.isArray(items)) {
    return false;
  }

  if (categories.length < MIN_CATEGORIES || categories.length > MAX_CATEGORIES) {
    return false;
  }

  if (!categories.every(isSortingCategory) || !items.every(isSortingItem)) {
    return false;
  }

  const categoryIds = categories.map((category: SortingCategory) => category.id);

  if (!isFreeOfDuplicates(categoryIds) || !isFreeOfDuplicates(items.map((item: SortingItem) => item.id))) {
    return false;
  }

  if (items.length < MIN_ITEMS || !items.every((item: SortingItem) => categoryIds.includes(item.category))) {
    return false;
  }

  // Ein Korb, in den nichts gehört, steht die ganze Aufgabe über leer da und
  // sieht für das Kind wie eine übersehene Aufgabe aus.
  if (!categoryIds.every((categoryId: string) => items.some((item: SortingItem) => item.category === categoryId))) {
    return false;
  }

  return isValidShowCount(candidate.show_count, categories.length, items.length);
}

function isValidShowCount(
  showCount: unknown,
  categoryCount: number,
  itemCount: number,
): boolean {
  if (showCount === undefined) {
    return itemCount <= MAX_PLAYED_ITEMS;
  }

  if (typeof showCount !== 'number' || !Number.isInteger(showCount)) {
    return false;
  }

  // Unter der Zahl der Körbe bliebe zwangsläufig einer leer, über dem Vorrat
  // verspricht die Zahl Gegenstände, die es nicht gibt.
  return showCount >= categoryCount && showCount <= Math.min(itemCount, MAX_PLAYED_ITEMS);
}

function isSortingCategory(category: unknown): category is SortingCategory {
  const candidate = category as Partial<SortingCategory> | null;

  return isFilledText(candidate?.id) && isFilledText(candidate?.label) && isOptionalText(candidate?.image);
}

function isSortingItem(item: unknown): item is SortingItem {
  const candidate = item as Partial<SortingItem> | null;

  return (
    isFilledText(candidate?.id) &&
    isFilledText(candidate?.label) &&
    isFilledText(candidate?.category) &&
    isOptionalText(candidate?.image)
  );
}

function isFilledText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isOptionalText(value: unknown): boolean {
  return value === undefined || isFilledText(value);
}

function isFreeOfDuplicates(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

/**
 * Zieht die Gegenstände einer Runde aus dem Vorrat (Plan Phase 3, AK 4).
 * Ohne `show_count` ist die Liste selbst schon die Runde und wird nur gemischt.
 *
 * **Jeder Korb bekommt zuerst einen Gegenstand**, erst danach wird aufgefüllt.
 * Ohne diese Reihenfolge könnte eine Ziehung alle Gegenstände aus einem
 * einzigen Korb liefern — die Aufgabe wäre lösbar, aber sinnlos.
 */
export function drawPlayedItems(
  config: SortingConfig,
  random: () => number,
): readonly SortingItem[] {
  const showCount = config.show_count;

  if (showCount === undefined || showCount >= config.items.length) {
    return shuffle(config.items, random);
  }

  const drawn: SortingItem[] = [];

  for (const category of config.categories) {
    const inCategory = config.items.filter((item: SortingItem) => item.category === category.id);
    drawn.push(shuffle(inCategory, random)[0]);
  }

  const remaining = config.items.filter(
    (item: SortingItem) => !drawn.some((chosen: SortingItem) => chosen.id === item.id),
  );

  drawn.push(...shuffle(remaining, random).slice(0, showCount - drawn.length));

  return shuffle(drawn, random);
}
