import { Service, signal } from '@angular/core';

import { PickPlaceTarget } from './pick-place.types';

/**
 * Der Vermittler zwischen Gegenständen und Ablagezielen — die gemeinsame Mitte
 * von „Aufheben und Ablegen".
 *
 * **Zwei Bedienarten, ein Weg.** Das Kind kann einen Gegenstand antippen und
 * dann sein Ziel antippen, oder es zieht ihn mit dem Finger hinüber. Beide
 * Wege enden in `place()` — die aufrufende Aufgabe sieht keinen Unterschied
 * und muss die Ablage nur einmal auswerten. Der Tipp-Weg ist der tragende: er
 * funktioniert mit Tastatur, Maus und Finger gleichermaßen. Das Ziehen ist die
 * Zugabe, die ohne den anderen Weg nie allein dastehen darf (Plan Phase 3,
 * AK 2).
 *
 * Wird **pro Aufgabe** bereitgestellt (`providers: [PickPlace]`), nicht global
 * — zwei Aufgaben teilen sich keine Auswahl (gleiches Muster wie `EpisodeRun`).
 */
@Service()
export class PickPlace {
  /** Ziele melden sich selbst an, weil nur sie ihr eigenes Element kennen. */
  private readonly targets = new Map<string, PickPlaceTarget>();

  /** Der angetippte Gegenstand, der auf sein Ziel wartet — `null`, wenn nichts aufgehoben ist. */
  readonly selectedItemId = signal<string | null>(null);

  /** Der Gegenstand, der gerade am Finger hängt. Unabhängig von `selectedItemId`. */
  readonly draggedItemId = signal<string | null>(null);

  /** Das Ziel unter dem ziehenden Finger — färbt sich ein, damit sichtbar ist, wo losgelassen wird. */
  readonly hoveredTargetId = signal<string | null>(null);

  registerTarget(targetId: string, target: PickPlaceTarget): void {
    this.targets.set(targetId, target);
  }

  unregisterTarget(targetId: string): void {
    this.targets.delete(targetId);
  }

  /** Hebt einen Gegenstand auf oder legt ihn wieder hin, wenn er schon aufgehoben war. */
  toggleSelection(itemId: string): void {
    this.selectedItemId.update((selected: string | null) =>
      selected === itemId ? null : itemId,
    );
  }

  clearSelection(): void {
    this.selectedItemId.set(null);
  }

  /**
   * Legt einen Gegenstand auf ein Ziel — der einzige Punkt, an dem Tippen und
   * Ziehen zusammenlaufen. Ein unbekanntes Ziel passiert beim Loslassen über
   * freier Fläche und ist kein Fehler: Dann bleibt einfach alles liegen.
   */
  place(targetId: string, itemId: string): void {
    const target = this.targets.get(targetId);

    if (target === undefined) {
      return;
    }

    this.clearSelection();
    target.place(itemId);
  }

  /**
   * Welches Ziel liegt unter diesem Punkt? Gefragt wird bei jedem
   * Fingerzug — deshalb über die eigenen Rechtecke statt über
   * `document.elementFromPoint`, das beim gezogenen Gegenstand selbst landen
   * würde, weil der unter dem Finger klebt.
   */
  targetIdAt(clientX: number, clientY: number): string | null {
    for (const [targetId, target] of this.targets) {
      const bounds = target.element.getBoundingClientRect();

      const isInside =
        clientX >= bounds.left &&
        clientX <= bounds.right &&
        clientY >= bounds.top &&
        clientY <= bounds.bottom;

      if (isInside) {
        return targetId;
      }
    }

    return null;
  }
}
