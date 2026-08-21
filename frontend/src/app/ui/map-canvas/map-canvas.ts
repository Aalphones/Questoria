import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

import { RoutePair } from '../../models/content.types';
import { ImageSlot } from '../image-slot/image-slot';
import { MapCanvasPoint, MapCanvasRoute, MapCanvasTile } from './map-canvas.types';

/** Weltkoordinaten == Bildpixel einer Kachel, 1:1. */
export const TILE_SIZE = 1024;

/** Bauch der Routenkurve: 18 % ihrer Länge, aber nie mehr als 110 Einheiten. */
const BOW_RATIO = 0.18;
const MAX_BOW = 110;

/**
 * Gemeinsame Kartenfläche von Planeten-, Etappen- und Ortskarte: eine Liste
 * quadratischer Kacheln in einem offenen Koordinatensystem, Routenlinien
 * zwischen Knoten, und ein Platz für die Knoten selbst, die jeder Screen
 * eigenständig zeichnet.
 *
 * Nur freigeschaltete Kacheln (`unlockedTileIds`) werden überhaupt gerendert
 * — nicht freigeschaltete zeigen einen Nebel-Platzhalter ohne Bild-Request.
 * Die Fläche zentriert sich per Cover-Skalierung auf die Bounding-Box der
 * freigeschalteten Kacheln.
 */
@Component({
  selector: 'qst-map-canvas',
  imports: [ImageSlot],
  templateUrl: './map-canvas.html',
  styleUrl: './map-canvas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapCanvas {
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly tiles = input<readonly MapCanvasTile[]>([]);
  /** Nur für die Routengeometrie — das Aussehen der Knoten liefert der Screen. */
  readonly points = input<readonly MapCanvasPoint[]>([]);
  readonly routes = input<readonly RoutePair[]>([]);
  /** Knoten, deren Routen neutral gezeichnet werden (gesperrte Enden). */
  readonly dimmedPointIds = input<readonly string[]>([]);
  /** Welche `MapCanvasTile.id` gerade freigeschaltet sind. Fortschritt/Savegame kennt `MapCanvas` selbst nicht. */
  readonly unlockedTileIds = input<readonly string[]>([]);

  protected readonly tilesById = computed<ReadonlyMap<string, MapCanvasTile>>(
    () => new Map(this.tiles().map((tile: MapCanvasTile) => [tile.id, tile])),
  );

  protected readonly unlockedTileSet = computed<ReadonlySet<string>>(
    () => new Set(this.unlockedTileIds()),
  );

  protected readonly unlockedTiles = computed<readonly MapCanvasTile[]>(() =>
    this.tiles().filter((tile: MapCanvasTile) => this.unlockedTileSet().has(tile.id)),
  );

  protected readonly routePaths = computed<readonly MapCanvasRoute[]>(() => {
    const pointsById = new Map<string, MapCanvasPoint>(
      this.points().map((point: MapCanvasPoint) => [point.id, point]),
    );
    const dimmed = new Set<string>(this.dimmedPointIds());
    const tilesById = this.tilesById();
    const paths: MapCanvasRoute[] = [];

    for (const [fromId, toId] of this.routes()) {
      const from = pointsById.get(fromId);
      const to = pointsById.get(toId);

      // Ein Tippfehler im Content darf keinen Screen abschießen.
      if (from === undefined || to === undefined) {
        continue;
      }

      const path = buildRoutePath(from, to, tilesById);

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

  private readonly unlockedBounds = computed<WorldRect | null>(() =>
    boundingBoxOf(this.unlockedTiles()),
  );

  protected readonly worldWidth = computed<number>(() => {
    const bounds = this.unlockedBounds();

    return bounds === null ? TILE_SIZE : bounds.right - bounds.left;
  });

  protected readonly worldHeight = computed<number>(() => {
    const bounds = this.unlockedBounds();

    return bounds === null ? TILE_SIZE : bounds.bottom - bounds.top;
  });

  private readonly worldOriginOffset = computed<{ x: number; y: number }>(() => {
    const bounds = this.unlockedBounds();

    return bounds === null ? { x: 0, y: 0 } : { x: bounds.left, y: bounds.top };
  });

  /** Startwert `TILE_SIZE` verhindert Sprung/NaN vor der ersten Messung. */
  private readonly viewportWidth = signal<number>(TILE_SIZE);
  private readonly viewportHeight = signal<number>(TILE_SIZE);

  private readonly measureViewport = new ResizeObserver((entries: ResizeObserverEntry[]) => {
    const entry = entries[0];

    if (entry === undefined) {
      return;
    }

    const { inlineSize, blockSize } = entry.contentBoxSize[0] ?? {
      inlineSize: entry.contentRect.width,
      blockSize: entry.contentRect.height,
    };

    this.viewportWidth.set(inlineSize);
    this.viewportHeight.set(blockSize);
  });

  constructor() {
    this.measureViewport.observe(this.hostElement.nativeElement);
    inject(DestroyRef).onDestroy(() => this.measureViewport.disconnect());
  }

  protected readonly coverScale = computed<number>(() =>
    Math.max(this.viewportWidth() / this.worldWidth(), this.viewportHeight() / this.worldHeight()),
  );

  /** Phase 2 macht daraus eine zoomfähige Version. */
  protected readonly scale = computed<number>(() => this.coverScale());

  private readonly translateX = computed<number>(
    () =>
      -this.worldOriginOffset().x * this.scale() +
      (this.viewportWidth() - this.worldWidth() * this.scale()) / 2,
  );

  private readonly translateY = computed<number>(
    () =>
      -this.worldOriginOffset().y * this.scale() +
      (this.viewportHeight() - this.worldHeight() * this.scale()) / 2,
  );

  protected readonly worldTransform = computed<string>(
    () => `translate(${this.translateX()}px, ${this.translateY()}px) scale(${this.scale()})`,
  );

  protected readonly tileSize = TILE_SIZE;
}

interface WorldRect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

function tileWorldOrigin(tile: MapCanvasTile): { x: number; y: number } {
  return { x: tile.col * TILE_SIZE, y: tile.row * TILE_SIZE };
}

function pointWorldPosition(
  point: MapCanvasPoint,
  tilesById: ReadonlyMap<string, MapCanvasTile>,
): { x: number; y: number } | null {
  const tile = tilesById.get(point.tileId);

  if (tile === undefined) {
    return null; // Content-Tippfehler: Punkt zeigt auf unbekannte Kachel
  }

  const origin = tileWorldOrigin(tile);

  return { x: origin.x + (point.x / 100) * TILE_SIZE, y: origin.y + (point.y / 100) * TILE_SIZE };
}

function boundingBoxOf(tiles: readonly MapCanvasTile[]): WorldRect | null {
  if (tiles.length === 0) {
    return null;
  }

  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const tile of tiles) {
    const origin = tileWorldOrigin(tile);
    left = Math.min(left, origin.x);
    top = Math.min(top, origin.y);
    right = Math.max(right, origin.x + TILE_SIZE);
    bottom = Math.max(bottom, origin.y + TILE_SIZE);
  }

  return { left, top, right, bottom };
}

/** Quadratische Bézierkurve zwischen zwei Knoten (Weltkoordinaten); `null`, wenn sie keine Länge hätte. */
function buildRoutePath(
  from: MapCanvasPoint,
  to: MapCanvasPoint,
  tilesById: ReadonlyMap<string, MapCanvasTile>,
): string | null {
  const fromWorld = pointWorldPosition(from, tilesById);
  const toWorld = pointWorldPosition(to, tilesById);

  if (fromWorld === null || toWorld === null) {
    return null;
  }

  const deltaX = toWorld.x - fromWorld.x;
  const deltaY = toWorld.y - fromWorld.y;
  const length = Math.hypot(deltaX, deltaY);

  if (length === 0) {
    return null;
  }

  const bow = Math.min(MAX_BOW, length * BOW_RATIO);
  // Kontrollpunkt = Mittelpunkt, verschoben entlang der Normalen der Verbindung.
  const controlX = (fromWorld.x + toWorld.x) / 2 + (-deltaY / length) * bow;
  const controlY = (fromWorld.y + toWorld.y) / 2 + (deltaX / length) * bow;

  return `M ${fromWorld.x} ${fromWorld.y} Q ${controlX} ${controlY} ${toWorld.x} ${toWorld.y}`;
}

/**
 * Weltposition (Pixel) einer Kachel, für Screens, die `qst-map-point` direkt
 * mit Pixelkoordinaten füttern (siehe `map-point.ts`).
 */
export function resolveTileOrigin(
  tiles: readonly MapCanvasTile[],
  tileId: string,
): { x: number; y: number } | null {
  const tile = tiles.find((candidate: MapCanvasTile) => candidate.id === tileId);

  return tile === undefined ? null : { x: tile.col * TILE_SIZE, y: tile.row * TILE_SIZE };
}
