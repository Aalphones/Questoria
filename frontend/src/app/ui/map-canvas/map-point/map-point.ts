import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input } from '@angular/core';

/**
 * Setzt ein beliebiges Kind auf eine Prozent-Position der Kartenfläche.
 *
 * Die Größe kommt als Anteil der Kartenbreite (`cqw`) heraus, nicht in Pixeln —
 * dadurch behalten die Knoten auf schmalen Fenstern ihre Abstände zueinander.
 */
@Component({
  selector: 'qst-map-point',
  imports: [],
  templateUrl: './map-point.html',
  styleUrl: './map-point.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.left.%]': 'x()',
    '[style.top.%]': 'y()',
  },
})
export class MapPoint {
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  /** horizontale Position, in % der Kartenbreite */
  readonly x = input.required<number>();
  /** vertikale Position, in % der Kartenhöhe */
  readonly y = input.required<number>();
  /** Durchmesser des Knotens, in % der Kartenbreite */
  readonly size = input<number | null>(null);

  /**
   * Die Größe geht als Custom Property an die projizierten Kinder. Direkt
   * gesetzt statt über `[style.--map-point-size]`, weil Angulars Style-Bindung
   * auf Custom Properties nicht zugesichert ist — Verhalten identisch.
   */
  private readonly applySize = effect(() => {
    const size = this.size();
    const element = this.hostElement.nativeElement;

    if (size === null) {
      element.style.removeProperty('--map-point-size');

      return;
    }

    element.style.setProperty('--map-point-size', `${size}cqw`);
  });
}
