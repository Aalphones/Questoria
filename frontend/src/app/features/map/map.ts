import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { WorldConfig } from '../../models/content.types';
import { ContentError } from '../../ui/content-error/content-error';
import { Hud } from '../../ui/hud/hud';

/**
 * Vorläufiger Platzhalter — Routing/Kopfleiste sind fertig (Phase 5), die
 * echte Ortskarte (Punkte, Routen, Kompassrose) kommt in Phase 7.
 */
@Component({
  selector: 'qst-map',
  imports: [Hud, ContentError],
  templateUrl: './map.html',
  styleUrl: './map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Map {
  readonly themeId = input.required<string>();
  readonly mapId = input.required<string>();
  readonly world = input<WorldConfig | null>(null);
}
