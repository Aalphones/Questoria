import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';

import { SortingCategory, SortingConfig, SortingItem } from '../../../models/content.types';
import { EventContext } from '../../../models/event-runtime.types';
import { ContentService } from '../../../services/content.service';
import { NarrationService } from '../../../services/narration.service';
import { seededRandom } from '../../../services/variation';
import { ImageSlot } from '../../../ui/image-slot/image-slot';
import { PickPlace } from '../../../ui/pick-place/pick-place';
import { PickSource } from '../../../ui/pick-place/pick-source';
import { PickTarget } from '../../../ui/pick-place/pick-target';
import { TaskCard } from '../../../ui/task-card/task-card';
import { EpisodeRun } from '../../episode/episode-run';
import { CategoryView, ItemState, ItemView, PlacedItemView, drawPlayedItems } from './sorting.types';

/** Wie lange ein falsch einsortierter Gegenstand rot bleibt, bevor er wieder normal aussieht. */
const WRONG_FEEDBACK_MS = 900;

/**
 * Eventtyp `sorting`: Zwei bis vier Körbe, ein Vorrat an Gegenständen, das Kind
 * legt jeden dorthin, wo er hingehört.
 *
 * Bedient wird auf zwei Wegen, die beide in derselben Auswertung enden
 * (`ui/pick-place/`): Gegenstand antippen und dann den Korb antippen — oder ihn
 * mit dem Finger hinüberziehen. Der Tipp-Weg trägt, weil er mit der Tastatur
 * genauso läuft wie mit dem Finger; das Ziehen ist die Zugabe.
 *
 * Ein Fehlgriff ist kein Sackgassen-Ende — der Gegenstand kommt zurück in den
 * Vorrat. Für den Stern zählt die ganze Aufgabe: nur wenn **jeder** Gegenstand
 * beim ersten Versuch im richtigen Korb landete, gibt es ihn (ADR-014).
 */
@Component({
  selector: 'qst-sorting',
  imports: [TaskCard, ImageSlot, PickSource, PickTarget],
  templateUrl: './sorting.html',
  styleUrl: './sorting.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PickPlace],
})
export class Sorting {
  private readonly content = inject(ContentService);
  private readonly narration = inject(NarrationService);
  private readonly run = inject(EpisodeRun);
  private readonly pickPlace = inject(PickPlace);
  private readonly destroyRef = inject(DestroyRef);

  readonly config = input.required<SortingConfig>();
  readonly context = input.required<EventContext>();

  /**
   * Die Gegenstände dieser Runde, gezogen aus dem Vorrat und gemischt.
   * Bewusst kein `computed`: Die Ziehung passiert einmal beim Öffnen der
   * Aufgabe, sonst sprängen die Gegenstände bei jedem Neuzeichnen.
   *
   * Der Startwert kommt aus dem Lauf, nicht aus der Komponente (Plan Phase 1,
   * AK 3) — derselbe Lauf zeigt dieselbe Ziehung wieder.
   */
  private readonly playedItems = linkedSignal<
    { readonly config: SortingConfig; readonly seed: number },
    readonly SortingItem[]
  >({
    source: () => ({ config: this.config(), seed: this.run.eventSeed() ?? 0 }),
    computation: ({ config, seed }) => drawPlayedItems(config, seededRandom(seed)),
  });

  /** Welcher Gegenstand in welchem Korb liegt — es stehen nur richtige Ablagen drin. */
  private readonly placements = signal<Readonly<Record<string, string>>>({});
  /** Der zuletzt falsch einsortierte Gegenstand, solange die Rückmeldung steht. */
  private readonly wrongItemId = signal<string | null>(null);
  /** Ein einziger Fehlgriff kostet den Stern für die ganze Aufgabe. */
  private readonly mistakeCount = signal(0);

  private wrongTimeout: ReturnType<typeof setTimeout> | undefined;

  protected readonly solved = computed<boolean>(() => this.openItems().length === 0);

  protected readonly questionText = computed<string>(() => {
    const config = this.config();

    return this.narration.textFor(config.question, config.question_simple);
  });

  /** Was noch im Vorrat liegt — ein einsortierter Gegenstand verschwindet hier. */
  protected readonly openItems = computed<readonly ItemView[]>(() => {
    const placements = this.placements();
    const selectedId = this.pickPlace.selectedItemId();
    const wrongId = this.wrongItemId();

    return this.playedItems()
      .filter((item: SortingItem) => placements[item.id] === undefined)
      .map((item: SortingItem) => ({
        id: item.id,
        label: item.label,
        imageUrl: this.assetUrlOf(item.image),
        placeholderLabel: item.image ?? item.label,
        state: itemStateFor(item.id, selectedId, wrongId),
      }));
  });

  protected readonly categoryViews = computed<readonly CategoryView[]>(() => {
    const placements = this.placements();
    const items = this.playedItems();

    return this.config().categories.map((category: SortingCategory) => {
      const placedItems = items
        .filter((item: SortingItem) => placements[item.id] === category.id)
        .map((item: SortingItem): PlacedItemView => ({
          id: item.id,
          label: item.label,
          imageUrl: this.assetUrlOf(item.image),
          placeholderLabel: item.image ?? item.label,
        }));

      return {
        id: category.id,
        label: category.label,
        imageUrl: this.assetUrlOf(category.image),
        placeholderLabel: category.image ?? category.label,
        placedItems,
        ariaLabel: ariaLabelFor(category.label, placedItems),
      };
    });
  });

  protected readonly feedbackTitle = computed<string | null>(() => {
    if (!this.solved()) {
      return null;
    }

    return this.mistakeCount() === 0 ? 'Alles richtig einsortiert!' : 'Geschafft!';
  });

  protected readonly feedbackText = computed<string>(() => {
    if (this.mistakeCount() === 0) {
      return 'Jeder Gegenstand saß auf Anhieb im richtigen Korb.';
    }

    return 'Alles liegt an seinem Platz. Weiter geht die Reise.';
  });

  /** Vor dieser Aufgabe abgeschlossene Aufgaben — der Kopf zeigt daraus die Punkte. */
  protected readonly stepDone = this.run.scoredCount;
  protected readonly stepTotal = this.run.scoredTotal;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.wrongTimeout));
  }

  /**
   * Ein Gegenstand ist in einem Korb gelandet — ob getippt oder gezogen, sieht
   * diese Stelle nicht und muss sie nicht sehen.
   */
  protected onPlaced(categoryId: string, itemId: string): void {
    const item = this.playedItems().find((candidate: SortingItem) => candidate.id === itemId);

    if (item === undefined || this.placements()[itemId] !== undefined) {
      return;
    }

    this.clearWrongFeedback();

    if (item.category === categoryId) {
      this.placements.update((placements: Readonly<Record<string, string>>) => ({
        ...placements,
        [itemId]: categoryId,
      }));

      return;
    }

    this.mistakeCount.update((count: number) => count + 1);
    this.wrongItemId.set(itemId);

    this.wrongTimeout = setTimeout(() => this.wrongItemId.set(null), WRONG_FEEDBACK_MS);
  }

  protected finish(): void {
    if (!this.solved()) {
      return;
    }

    this.narration.stop();
    this.run.finish({ kind: 'scored', correctFirstTry: this.mistakeCount() === 0 });
  }

  private assetUrlOf(fileName: string | undefined): string | null {
    if (fileName === undefined) {
      return null;
    }

    return this.content.assetUrl(this.context().themeId, 'answers', fileName);
  }

  private clearWrongFeedback(): void {
    clearTimeout(this.wrongTimeout);
    this.wrongItemId.set(null);
  }
}

function itemStateFor(
  itemId: string,
  selectedId: string | null,
  wrongId: string | null,
): ItemState {
  if (itemId === wrongId) {
    return 'wrong';
  }

  if (itemId === selectedId) {
    return 'selected';
  }

  return 'open';
}

/** Der Korb sagt Screenreadern seinen Inhalt — sonst bliebe er eine Fläche ohne Auskunft. */
function ariaLabelFor(label: string, placedItems: readonly PlacedItemView[]): string {
  if (placedItems.length === 0) {
    return `Korb ${label}, noch leer. Ausgewählten Gegenstand hier ablegen.`;
  }

  const contents = placedItems.map((item: PlacedItemView) => item.label).join(', ');

  return `Korb ${label}, enthält ${contents}. Ausgewählten Gegenstand hier ablegen.`;
}
