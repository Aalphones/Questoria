import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { InstalledTheme } from '../../../models/content.types';
import { ContentService } from '../../../services/content.service';
import { ImageSlot } from '../../../ui/image-slot/image-slot';

/**
 * Reine Darstellung — eine Themenwelt als Knoten auf der Planetenkarte: rundes
 * Cover mit Ring, darunter eine Pille aus Weltname und Status.
 *
 * Die Größe kommt als `--map-point-size` von `qst-map-point` (Anteil der
 * Kartenbreite), nicht aus einem eigenen Wert.
 */
@Component({
  selector: 'qst-theme-card',
  imports: [ImageSlot],
  templateUrl: './theme-card.html',
  styleUrl: './theme-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeCard {
  private readonly content = inject(ContentService);

  readonly theme = input.required<InstalledTheme>();
  /** Kurztext unter dem Namen, z. B. „Offen · Etappe 2". */
  readonly status = input<string>('');
  /** Zuletzt gespielte Welt — bewegt sich sanft und trägt den Akzent-Ring. */
  readonly active = input<boolean>(false);
  readonly chosen = output<string>();

  coverUrl(theme: InstalledTheme): string {
    return this.content.themeAssetUrl(theme.id, theme.cover);
  }
}
