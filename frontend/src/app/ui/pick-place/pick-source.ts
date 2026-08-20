import { Directive, ElementRef, computed, inject, input, signal } from '@angular/core';

import { PickPlace } from './pick-place';
import { DRAG_THRESHOLD_PX } from './pick-place.types';

/** Wo der Finger aufgesetzt hat — Bezugspunkt für die Verschiebung beim Ziehen. */
interface DragStart {
  readonly pointerId: number;
  readonly clientX: number;
  readonly clientY: number;
}

/**
 * Macht ein Element zu einem Gegenstand, den das Kind aufheben kann. Gehört auf
 * einen `<button>` — der Tipp-Weg ist damit ohne Zutun tastaturbedienbar, und
 * das Ziehen kommt obendrauf.
 *
 * **Warum Pointer-Ereignisse und nicht die Ziehen-und-Ablegen-Schnittstelle des
 * Browsers:** Die greift auf Touch-Geräten nicht zuverlässig — und genau dort
 * wird gespielt. Pointer-Ereignisse behandeln Finger, Stift und Maus gleich.
 *
 * `touch-action: none` ist Pflicht und steht deshalb hier statt im Stylesheet
 * der Aufgabe: Ohne das reißt der Browser die Geste als Bildlauf an sich, und
 * der Gegenstand bleibt liegen, während die Seite wegrutscht.
 */
@Directive({
  selector: '[qstPickSource]',
  host: {
    '[style.touch-action]': "'none'",
    '[style.translate]': 'dragTranslate()',
    '[class.pick-source--dragging]': 'isDragging()',
    '[class.pick-source--selected]': 'isSelected()',
    '[attr.aria-pressed]': 'isSelected()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerCancel()',
    '(click)': 'onClick()',
  },
})
export class PickSource {
  private readonly pickPlace = inject(PickPlace);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Die id des Gegenstands — dieselbe, die das Ziel später gemeldet bekommt. */
  readonly itemId = input.required<string>({ alias: 'qstPickSource' });

  private readonly dragStart = signal<DragStart | null>(null);
  private readonly dragOffset = signal<{ readonly x: number; readonly y: number } | null>(null);

  /**
   * Merkt sich, dass die gerade beendete Geste ein Ziehen war. Der Browser
   * schickt nach jedem `pointerup` noch ein `click` hinterher — ohne diese
   * Sperre würde ein abgelegter Gegenstand direkt danach wieder aufgehoben.
   */
  private suppressNextClick = false;

  protected readonly isSelected = computed<boolean>(
    () => this.pickPlace.selectedItemId() === this.itemId(),
  );

  protected readonly isDragging = computed<boolean>(
    () => this.pickPlace.draggedItemId() === this.itemId(),
  );

  /** Der Gegenstand klebt am Finger, statt dass ein Geisterbild durch die Seite reist. */
  protected readonly dragTranslate = computed<string | null>(() => {
    const offset = this.dragOffset();

    return offset === null ? null : `${offset.x}px ${offset.y}px`;
  });

  protected onPointerDown(event: PointerEvent): void {
    this.dragStart.set({
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
    });

    // Ohne das Einfangen verliert das Element den Finger, sobald er seine
    // Fläche verlässt — und das tut er bei jedem Ziehen sofort.
    this.hostElement.nativeElement.setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    const start = this.dragStart();

    if (start === null || start.pointerId !== event.pointerId) {
      return;
    }

    const offsetX = event.clientX - start.clientX;
    const offsetY = event.clientY - start.clientY;
    const distance = Math.hypot(offsetX, offsetY);

    if (distance < DRAG_THRESHOLD_PX && !this.isDragging()) {
      return;
    }

    this.pickPlace.draggedItemId.set(this.itemId());
    this.dragOffset.set({ x: offsetX, y: offsetY });
    this.pickPlace.hoveredTargetId.set(this.pickPlace.targetIdAt(event.clientX, event.clientY));
  }

  protected onPointerUp(event: PointerEvent): void {
    const start = this.dragStart();

    // Ein zweiter Finger auf derselben Kachel darf die laufende Geste nicht
    // beenden — Kinderhände liegen selten einzeln auf einem Tablet.
    if (start !== null && start.pointerId !== event.pointerId) {
      return;
    }

    const wasDragging = this.isDragging();
    const targetId = this.pickPlace.hoveredTargetId();

    this.endGesture();

    if (!wasDragging) {
      return;
    }

    this.suppressNextClick = true;

    if (targetId !== null) {
      this.pickPlace.place(targetId, this.itemId());
    }
  }

  protected onPointerCancel(): void {
    this.endGesture();
  }

  /** Der Tipp-Weg: aufheben, oder wieder hinlegen, wenn schon aufgehoben. */
  protected onClick(): void {
    if (this.suppressNextClick) {
      this.suppressNextClick = false;

      return;
    }

    this.pickPlace.toggleSelection(this.itemId());
  }

  /** Setzt alles zurück, was nur während einer Geste gilt — der Gegenstand springt zurück. */
  private endGesture(): void {
    this.dragStart.set(null);
    this.dragOffset.set(null);
    this.pickPlace.draggedItemId.set(null);
    this.pickPlace.hoveredTargetId.set(null);
  }
}
