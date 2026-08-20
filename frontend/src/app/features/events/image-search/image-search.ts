import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

import { ImageSearchConfig, SearchTarget } from '../../../models/content.types';
import { EventContext } from '../../../models/event-runtime.types';
import { ContentService } from '../../../services/content.service';
import { NarrationService } from '../../../services/narration.service';
import { ImageSlot } from '../../../ui/image-slot/image-slot';
import { MapPoint } from '../../../ui/map-canvas/map-point/map-point';
import { TaskCard } from '../../../ui/task-card/task-card';
import { EpisodeRun } from '../../episode/episode-run';
import { hitTarget } from './image-search.types';

/** Bezugsseitenverhältnis der Suchfläche — passend zum Rest der App (`qst-map-canvas`). */
const IMAGE_ASPECT_RATIO = 16 / 9;
/** Wie lange die „Da ist nichts"-Rückmeldung stehen bleibt. */
const MISS_FEEDBACK_MS = 1200;

interface TargetView {
  readonly target: SearchTarget;
  readonly index: number;
  readonly found: boolean;
}

/**
 * Eventtyp `image_search`: ein Suchbild, versteckte Ziele darauf.
 *
 * Ein Tipp neben einem Ziel ist kein Sackgassen-Ende — er zählt als
 * Fehlversuch, das Weitersuchen bleibt möglich. Für die Sterne zählt, ob beim
 * Lösen **kein** Fehlgriff passiert ist (Plan Meilenstein 3, „Entschieden vor
 * dem Bauen" 1+2).
 */
@Component({
  selector: 'qst-image-search',
  imports: [TaskCard, ImageSlot, MapPoint],
  templateUrl: './image-search.html',
  styleUrl: './image-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageSearch {
  private readonly content = inject(ContentService);
  private readonly narration = inject(NarrationService);
  private readonly run = inject(EpisodeRun);
  private readonly destroyRef = inject(DestroyRef);

  readonly config = input.required<ImageSearchConfig>();
  readonly context = input.required<EventContext>();

  protected readonly foundIndexes = signal<readonly number[]>([]);
  protected readonly missCount = signal(0);
  protected readonly missMarker = signal<{ readonly x: number; readonly y: number } | null>(null);

  private missMarkerTimeout: ReturnType<typeof setTimeout> | undefined;

  protected readonly questionText = computed<string>(() => {
    const config = this.config();

    return this.narration.textFor(config.question, config.question_simple);
  });

  protected readonly imageUrl = computed<string>(() =>
    this.content.assetUrl(this.context().themeId, 'backgrounds', this.config().image),
  );

  protected readonly targetViews = computed<readonly TargetView[]>(() => {
    const found = this.foundIndexes();

    return this.config().targets.map((target: SearchTarget, index: number) => ({
      target,
      index,
      found: found.includes(index),
    }));
  });

  protected readonly foundLabel = computed<string>(
    () => `Gefunden ${this.foundIndexes().length} von ${this.requiredFinds()}`,
  );

  /**
   * Wie viele Treffer zum Lösen reichen — `find_count` deckt Aufgaben ab, bei
   * denen mehr gültige Objekte im Bild stecken als verlangt werden (jedes
   * davon zählt, nicht nur eine fest verdrahtete Teilmenge).
   */
  private readonly requiredFinds = computed<number>(() => {
    const config = this.config();

    return config.find_count ?? (config.find_all ? config.targets.length : 1);
  });

  protected readonly solved = computed<boolean>(
    () => this.foundIndexes().length >= this.requiredFinds(),
  );

  protected readonly feedbackTitle = computed<string | null>(() =>
    this.solved() ? 'Richtig!' : null,
  );

  protected readonly stepDone = this.run.scoredCount;
  protected readonly stepTotal = this.run.scoredTotal;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.missMarkerTimeout));
  }

  /** Fängt Tipps auf die Bildfläche — egal ob auf einem unsichtbaren Ziel oder daneben. */
  protected onImageTap(event: MouseEvent): void {
    if (this.solved()) {
      return;
    }

    const area = event.currentTarget as HTMLElement;
    const rect = area.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;

    this.registerTap(xPercent, yPercent);
  }

  /** Tastatur-Weg: ein Ziel aus der unsichtbaren Liste — Enter zählt als Tipp genau darauf. */
  protected pickTarget(index: number): void {
    if (this.solved() || this.foundIndexes().includes(index)) {
      return;
    }

    this.markFound(index);
  }

  protected clearMissMarker(): void {
    this.missMarker.set(null);
  }

  protected finish(): void {
    if (!this.solved()) {
      return;
    }

    this.narration.stop();
    this.run.finish({ kind: 'scored', correctFirstTry: this.missCount() === 0 });
  }

  private registerTap(xPercent: number, yPercent: number): void {
    const targets = this.config().targets;
    const hit = hitTarget(targets, xPercent, yPercent, 1 / IMAGE_ASPECT_RATIO);

    if (hit === null) {
      this.registerMiss(xPercent, yPercent);

      return;
    }

    const index = targets.indexOf(hit);

    if (this.foundIndexes().includes(index)) {
      return;
    }

    this.markFound(index);
  }

  private registerMiss(xPercent: number, yPercent: number): void {
    this.missCount.update((count: number) => count + 1);
    this.missMarker.set({ x: xPercent, y: yPercent });

    clearTimeout(this.missMarkerTimeout);
    this.missMarkerTimeout = setTimeout(() => this.clearMissMarker(), MISS_FEEDBACK_MS);
  }

  private markFound(index: number): void {
    this.foundIndexes.update((found: readonly number[]) => [...found, index]);
  }
}
