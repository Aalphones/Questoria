import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { InstalledTheme } from '../../../models/content.types';

/** Reine Darstellung — eine Themenwelt als anklickbare Karte im Main-Hub. */
@Component({
  selector: 'qst-theme-card',
  imports: [NgOptimizedImage],
  templateUrl: './theme-card.html',
  styleUrl: './theme-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeCard {
  readonly theme = input.required<InstalledTheme>();
  readonly active = input<boolean>(false);
  readonly chosen = output<string>();
}
