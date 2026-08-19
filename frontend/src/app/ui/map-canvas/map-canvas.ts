import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { RoutePair } from '../../models/content.types';
import { ImageSlot } from '../image-slot/image-slot';
import { MapCanvasPoint, MapCanvasRoute } from './map-canvas.types';

/** Koordinatensystem der Routenebene — 16:9, passend zum Seitenverhältnis der Fläche. */
const VIEWBOX_WIDTH = 1600;
const VIEWBOX_HEIGHT = 900;

/** Bauch der Routenkurve: 18 % ihrer Länge, aber nie mehr als 110 Einheiten. */
const BOW_RATIO = 0.18;
const MAX_BOW = 110;

/**
 * Gemeinsame Kartenfläche von Planeten-, Etappen- und Ortskarte: Hintergrund,
 * Routenlinien und ein Platz für die Knoten, die jeder Screen selbst zeichnet.
 *
 * Das feste Seitenverhältnis ist der ganze Trick — dadurch liegen Bild, Knoten
 * und Routen auf jeder Fensterbreite auf denselben Punkten, ohne dass etwas
 * verzerrt gestreckt werden muss.
 */
@Component({
  selector: 'qst-map-canvas',
  imports: [ImageSlot],
  templateUrl: './map-canvas.html',
  styleUrl: './map-canvas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapCanvas {
  /** Bildadresse des Hintergrunds; `null` = keine Bildfläche, es bleibt beim Gitternetz-Fallback. */
  readonly background = input<string | null>(null);
  readonly backgroundLabel = input<string>('');
  /** Nur für die Routengeometrie — das Aussehen der Knoten liefert der Screen. */
  readonly points = input<readonly MapCanvasPoint[]>([]);
  readonly routes = input<readonly RoutePair[]>([]);
  /** Knoten, deren Routen neutral gezeichnet werden (gesperrte Enden). */
  readonly dimmedPointIds = input<readonly string[]>([]);

  readonly routePaths = computed<readonly MapCanvasRoute[]>(() => {
    const pointsById = new Map<string, MapCanvasPoint>(
      this.points().map((point: MapCanvasPoint) => [point.id, point]),
    );
    const dimmed = new Set<string>(this.dimmedPointIds());
    const paths: MapCanvasRoute[] = [];

    for (const [fromId, toId] of this.routes()) {
      const from = pointsById.get(fromId);
      const to = pointsById.get(toId);

      // Ein Tippfehler im Content darf keinen Screen abschießen.
      if (from === undefined || to === undefined) {
        continue;
      }

      const path = buildRoutePath(from, to);

      if (path === null) {
        continue;
      }

      paths.push({
        id: `${fromId}--${toId}`,
        path,
        dimmed: dimmed.has(fromId) || dimmed.has(toId),
      });
    }

    return paths;
  });

  protected readonly viewBox = `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`;
}

/** Quadratische Bézierkurve zwischen zwei Knoten; `null`, wenn sie keine Länge hätte. */
function buildRoutePath(from: MapCanvasPoint, to: MapCanvasPoint): string | null {
  const fromX = (from.x / 100) * VIEWBOX_WIDTH;
  const fromY = (from.y / 100) * VIEWBOX_HEIGHT;
  const toX = (to.x / 100) * VIEWBOX_WIDTH;
  const toY = (to.y / 100) * VIEWBOX_HEIGHT;

  const deltaX = toX - fromX;
  const deltaY = toY - fromY;
  const length = Math.hypot(deltaX, deltaY);

  if (length === 0) {
    return null;
  }

  const bow = Math.min(MAX_BOW, length * BOW_RATIO);
  // Kontrollpunkt = Mittelpunkt, verschoben entlang der Normalen der Verbindung.
  const controlX = (fromX + toX) / 2 + (-deltaY / length) * bow;
  const controlY = (fromY + toY) / 2 + (deltaX / length) * bow;

  return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
}
