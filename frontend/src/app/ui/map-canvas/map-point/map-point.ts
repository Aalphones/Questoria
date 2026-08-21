import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input } from '@angular/core';

/**
 * Setzt ein beliebiges Kind auf eine Weltposition (Pixel) der Kartenfläche.
 *
 * Die Größe kommt als Anteil der sichtbaren Bildschirmbreite (`cqw`) heraus,
 * nicht der Weltbreite — ein Punkt bleibt dadurch bei jedem Zoomstand gleich
 * gut antippbar, statt mit der Karte mitzuschrumpfen/-wachsen.
 */
@Component({
  selector: 'qst-map-point',
  imports: [],
  templateUrl: './map-point.html',
  styleUrl: './map-point.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.left.px]': 'x()',
    '[style.top.px]': 'y()',
  },
})
export class MapPoint {
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  /** horizontale Weltposition, in Pixeln (Kachel-Ursprung + Anteil, siehe `resolveTileOrigin`) */
  readonly x = input.required<number>();
  /** vertikale Weltposition, in Pixeln */
  readonly y = input.required<number>();
  /** Durchmesser des Knotens, in % der sichtbaren Bildschirmbreite */
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
