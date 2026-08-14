import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Kopfleiste auf jedem Spiel-Screen außer der Planetenkarte. Wird von jedem
 * Screen selbst eingebunden, nicht aus der Hülle heraus — jeder Screen kennt
 * seinen eigenen Rückweg (Design: `hub→login, level→hub, timeline→level,
 * map→timeline, dialog→map`).
 */
@Component({
  selector: 'qst-hud',
  imports: [RouterLink],
  templateUrl: './hud.html',
  styleUrl: './hud.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hud {
  readonly backLink = input<readonly string[] | null>(null);
  readonly worldTitle = input<string | null>(null);
  readonly levelLabel = input<string | null>(null);
  readonly levelLink = input<readonly string[] | null>(null);
  readonly progress = input<{ done: number; total: number } | null>(null);

  protected readonly levelExplanation = 'Die Lernstufe bestimmt, wie schwer die Aufgaben sind';
  protected readonly progressExplanation = 'Geschaffte Orte in dieser Welt';
}
