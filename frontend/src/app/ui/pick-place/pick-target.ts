import { Directive, ElementRef, computed, effect, inject, input, output } from '@angular/core';

import { PickPlace } from './pick-place';

/**
 * Macht ein Element zum Ablageziel. Gehört auf einen `<button>` — dann ist der
 * Tipp-Weg ohne Zutun mit der Tastatur erreichbar und auslösbar (Plan Phase 3,
 * AK 2), und das Loslassen eines gezogenen Gegenstands landet an derselben
 * Stelle.
 *
 * Meldet über `placed`, welcher Gegenstand hier gelandet ist. Ob er dorthin
 * gehört, entscheidet die Aufgabe — dieses Stück kennt keine richtigen und
 * falschen Ablagen.
 */
@Directive({
  selector: '[qstPickTarget]',
  host: {
    '[class.pick-target--hovered]': 'isHovered()',
    '[class.pick-target--ready]': 'isReady()',
    '(click)': 'onClick()',
  },
})
export class PickTarget {
  private readonly pickPlace = inject(PickPlace);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly targetId = input.required<string>({ alias: 'qstPickTarget' });

  /** Ein Gegenstand ist hier gelandet — getippt oder gezogen, das bleibt offen. */
  readonly placed = output<string>();

  /** Der ziehende Finger steht gerade über diesem Ziel. */
  protected readonly isHovered = computed<boolean>(
    () => this.pickPlace.hoveredTargetId() === this.targetId(),
  );

  /** Ein Gegenstand ist aufgehoben — alle Ziele zeigen, dass sie jetzt etwas annehmen. */
  protected readonly isReady = computed<boolean>(() => this.pickPlace.selectedItemId() !== null);

  /**
   * An- und Abmeldung im Effekt statt im Konstruktor, weil `targetId` eine
   * Eingabe ist: Wechselt sie, muss die alte Anmeldung weg, sonst zeigt der
   * Vermittler auf ein Ziel, das es unter dem Namen nicht mehr gibt.
   */
  private readonly registration = effect((onCleanup: (cleanup: () => void) => void) => {
    const targetId = this.targetId();

    this.pickPlace.registerTarget(targetId, {
      element: this.hostElement.nativeElement,
      place: (itemId: string) => this.placed.emit(itemId),
    });

    onCleanup(() => this.pickPlace.unregisterTarget(targetId));
  });

  /** Der Tipp-Weg: Es liegt etwas in der Hand, also fällt es hier hinein. */
  protected onClick(): void {
    const itemId = this.pickPlace.selectedItemId();

    if (itemId === null) {
      return;
    }

    this.pickPlace.place(this.targetId(), itemId);
  }
}
