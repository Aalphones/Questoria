import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { WorldConfig } from '../../models/content.types';
import { ContentError } from '../../ui/content-error/content-error';
import { Hud } from '../../ui/hud/hud';

/**
 * Vorläufiger Platzhalter — Routing/Kopfleiste sind fertig (Phase 5), der
 * ehrliche Ort-Platzhalter (Name, Hintergrund, Hinweistext) kommt in
 * Phase 7. Die Event Engine dahinter erst mit Meilenstein 3.
 */
@Component({
  selector: 'qst-location',
  imports: [Hud, ContentError],
  templateUrl: './location.html',
  styleUrl: './location.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Location {
  readonly themeId = input.required<string>();
  readonly episodeId = input.required<string>();
  readonly world = input<WorldConfig | null>(null);

  /** Zurück führt auf die Ortskarte, die diesen Ort zeigt (Design: `dialog→map`). */
  readonly mapBackLink = computed<readonly string[]>(() => {
    const world = this.world();
    const mapId = world?.maps.find((map) =>
      map.nodes.some((node) => node.episode_ref === this.episodeId()),
    )?.id;

    if (mapId === undefined) {
      return ['/theme', this.themeId(), 'timeline'];
    }

    return ['/theme', this.themeId(), 'map', mapId];
  });
}
