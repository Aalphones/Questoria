import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { WorldConfig } from '../../models/content.types';
import { ContentError } from '../../ui/content-error/content-error';
import { Hud } from '../../ui/hud/hud';

/**
 * Vorläufiger Platzhalter — Routing/Kopfleiste sind fertig (Phase 5), die
 * echte Etappenkarte (Seekarte, Inseln, Legende) kommt in Phase 6.
 */
@Component({
  selector: 'qst-timeline',
  imports: [Hud, ContentError],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timeline {
  readonly themeId = input.required<string>();
  readonly world = input<WorldConfig | null>(null);
}
