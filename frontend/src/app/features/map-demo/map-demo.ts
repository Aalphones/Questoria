import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { RoutePair } from '../../models/content.types';
import { ContentService } from '../../services/content.service';
import { MapCanvas } from '../../ui/map-canvas/map-canvas';
import { MapCanvasPoint } from '../../ui/map-canvas/map-canvas.types';
import { MapPoint } from '../../ui/map-canvas/map-point/map-point';

/**
 * TEMPORÄR (Phase 3): Prüfbild für die Kartenfläche unter `/map-demo`.
 * Existiert nur, damit sich Knoten, Routen und Bildplatzhalter vor den echten
 * Screens ansehen lassen. Fällt mit der Ortskarte (Phase 7) weg.
 */
@Component({
  selector: 'qst-map-demo',
  imports: [MapCanvas, MapPoint],
  templateUrl: './map-demo.html',
  styleUrl: './map-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapDemo {
  private readonly content = inject(ContentService);

  /** Koordinaten der Testwelt (`data/themes/dev_fixture`, Karte „Test-Insel"). */
  readonly points = signal<readonly MapCanvasPoint[]>([
    { id: 'dorf', x: 23, y: 64 },
    { id: 'hafen', x: 50, y: 30 },
    { id: 'leuchtturm', x: 78, y: 52 },
  ]);

  readonly routes = signal<readonly RoutePair[]>([
    ['dorf', 'hafen'],
    ['hafen', 'leuchtturm'],
    // Verweist ins Leere — die Route darf einfach entfallen, ohne dass etwas bricht.
    ['hafen', 'gibt_es_nicht'],
  ]);

  readonly dimmedPointIds = signal<readonly string[]>(['leuchtturm']);

  readonly backgroundUrl = this.content.assetUrl('dev_fixture', 'maps', 'map_test_insel.webp');
  readonly backgroundLabel = 'map_test_insel.webp';

  isDimmed(pointId: string): boolean {
    return this.dimmedPointIds().includes(pointId);
  }
}
