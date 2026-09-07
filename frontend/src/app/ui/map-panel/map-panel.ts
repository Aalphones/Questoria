import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/**
 * Gemeinsames Info-Panel aller drei Kartenebenen — Tag, Titel, Hinweis, dazu
 * optional ein Zwischenstand mit Balken. Ersetzt drei auseinandergedriftete
 * Kopien (Planetenkarte, Etappenkarte hatten je ihre eigene, die Ortskarte gar
 * keine). Lebt in `map-canvas`' Projektion, nicht in `map-canvas` selbst — die
 * Kartenfläche kennt keinen Fortschritt, nur ihre Screens.
 *
 * Aufklapp-Verhalten wie zuvor in den Screens: der Zustand steuert nur das
 * Ausklappen, ob er überhaupt sichtbar wird, entscheidet allein das
 * Container-Query in `map-panel.scss` (E3 der Phase-5-Planung).
 */
@Component({
  selector: 'qst-map-panel',
  imports: [],
  templateUrl: './map-panel.html',
  styleUrl: './map-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.map-panel--open]': 'panelOpen()',
  },
})
export class MapPanel {
  /** Auszeichnung über dem Titel, z. B. „Pokémon · Sachkunde". */
  readonly tag = input.required<string>();
  readonly title = input.required<string>();
  readonly hint = input.required<string>();
  /** `null` auf der Planetenkarte — dort gibt es keinen Zwischenstand. */
  readonly progressDone = input<number | null>(null);
  readonly progressTotal = input<number | null>(null);

  protected readonly panelOpen = signal<boolean>(false);

  protected readonly progressPercent = computed<number>(() => {
    const done = this.progressDone();
    const total = this.progressTotal();

    return total === null || total === 0 ? 0 : Math.round((100 * (done ?? 0)) / total);
  });

  protected togglePanel(): void {
    this.panelOpen.update((isOpen: boolean) => !isOpen);
  }
}
