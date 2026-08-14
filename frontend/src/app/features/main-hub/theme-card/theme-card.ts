import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { InstalledTheme } from '../../../models/content.types';
import { ContentService } from '../../../services/content.service';

/** Reine Darstellung — eine Themenwelt als anklickbare Karte im Main-Hub. */
@Component({
  selector: 'qst-theme-card',
  imports: [NgOptimizedImage],
  templateUrl: './theme-card.html',
  styleUrl: './theme-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeCard {
  private readonly content = inject(ContentService);

  readonly theme = input.required<InstalledTheme>();
  readonly active = input<boolean>(false);
  readonly chosen = output<string>();

  coverUrl(theme: InstalledTheme): string {
    return this.content.themeAssetUrl(theme.id, theme.cover);
  }
}
