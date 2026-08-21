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

/** Zoomstufen: 1 = ganze freigeschaltete Fläche eingepasst, darüber wird hineingezoomt. */
const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;

/** Erst ab dieser Bewegung gilt eine Berührung als Ziehen statt als Tipp. */
const DRAG_THRESHOLD_PX = 6;

/** Zoomänderung pro Mausrad-Rastung. */
const WHEEL_STEP = 0.15;

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
 *
 * Ziehen und Zoomen laufen ohne Fremdbibliothek (ADR-019) und sind exakt auf
 * diese Bounding-Box geklemmt: über die freigeschaltete Fläche hinaus lässt
 * sich nicht schieben.
 */
@Component({
  selector: 'qst-map-canvas',
  imports: [ImageSlot],
  templateUrl: './map-canvas.html',
  styleUrl: './map-canvas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerEnd($event)',
    '(pointercancel)': 'onPointerEnd($event)',
    '(dblclick)': 'resetView()',
  },
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

  private readonly zoom = signal<number>(MIN_ZOOM);
  /** Zusätzlicher Versatz zur eingepassten Position, in Bildschirmpixeln. */
  private readonly panX = signal<number>(0);
  private readonly panY = signal<number>(0);

  /** Läuft gerade eine Geste? Dann darf die Karte nicht zusätzlich nachanimieren. */
  protected readonly isInteracting = signal<boolean>(false);

  private readonly activePointers = new Map<number, PointerPosition>();
  private dragOrigin: PointerPosition | null = null;
  private isDragging = false;
  private suppressNextClick = false;
  private pinchDistance: number | null = null;
  private pinchCenter: PointerPosition | null = null;

  constructor() {
    const host = this.hostElement.nativeElement;

    this.measureViewport.observe(host);
    // Beide Listener von Hand: `wheel` braucht `passive: false` (sonst kein
    // preventDefault), `click` die Capture-Phase, um den Kartenpunkt zu erreichen,
    // bevor dessen eigener Handler feuert.
    host.addEventListener('wheel', this.onWheel, { passive: false });
    host.addEventListener('click', this.onClickCapture, { capture: true });

    inject(DestroyRef).onDestroy(() => {
      this.measureViewport.disconnect();
      host.removeEventListener('wheel', this.onWheel);
      host.removeEventListener('click', this.onClickCapture, { capture: true });
    });
  }

  protected readonly coverScale = computed<number>(() =>
    Math.max(this.viewportWidth() / this.worldWidth(), this.viewportHeight() / this.worldHeight()),
  );

  protected readonly scale = computed<number>(() => this.coverScale() * this.zoom());

  /** Bildschirmposition der linken Kante der freigeschalteten Fläche, ungeklemmt. */
  private readonly rawWorldLeft = computed<number>(
    () => (this.viewportWidth() - this.worldWidth() * this.scale()) / 2 + this.panX(),
  );

  private readonly rawWorldTop = computed<number>(
    () => (this.viewportHeight() - this.worldHeight() * this.scale()) / 2 + this.panY(),
  );

  private readonly translateX = computed<number>(
    () =>
      clampWorldEdge(this.rawWorldLeft(), this.viewportWidth(), this.worldWidth() * this.scale()) -
      this.worldOriginOffset().x * this.scale(),
  );

  private readonly translateY = computed<number>(
    () =>
      clampWorldEdge(this.rawWorldTop(), this.viewportHeight(), this.worldHeight() * this.scale()) -
      this.worldOriginOffset().y * this.scale(),
  );

  protected readonly worldTransform = computed<string>(
    () => `translate(${this.translateX()}px, ${this.translateY()}px) scale(${this.scale()})`,
  );

  protected readonly tileSize = TILE_SIZE;

  protected onPointerDown(event: PointerEvent): void {
    this.suppressNextClick = false;
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.activePointers.size === 1) {
      this.dragOrigin = { x: event.clientX, y: event.clientY };
      this.isDragging = false;
      return;
    }

    this.beginPinch();
  }

  protected onPointerMove(event: PointerEvent): void {
    const tracked = this.activePointers.get(event.pointerId);

    if (tracked === undefined) {
      return;
    }

    const previous: PointerPosition = tracked;
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.activePointers.size >= 2) {
      this.updatePinch(event);
      return;
    }

    this.updateDrag(event, previous);
  }

  protected onPointerEnd(event: PointerEvent): void {
    const host = this.hostElement.nativeElement;
    this.activePointers.delete(event.pointerId);

    if (host.hasPointerCapture(event.pointerId)) {
      host.releasePointerCapture(event.pointerId);
    }

    if (this.isDragging) {
      // Der Klick, der auf ein Ziehen folgt, darf keinen Kartenpunkt öffnen.
      this.suppressNextClick = true;
    }

    if (this.activePointers.size < 2) {
      this.pinchDistance = null;
      this.pinchCenter = null;
    }

    if (this.activePointers.size === 0) {
      this.isDragging = false;
      this.dragOrigin = null;
      this.isInteracting.set(false);
      this.settlePan();
    }
  }

  protected zoomBy(delta: number): void {
    const rect = this.hostElement.nativeElement.getBoundingClientRect();

    this.zoomAround(this.zoom() + delta, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  protected resetView(): void {
    this.zoom.set(MIN_ZOOM);
    this.panX.set(0);
    this.panY.set(0);
  }

  private updateDrag(event: PointerEvent, previous: PointerPosition): void {
    const origin = this.dragOrigin;

    if (origin === null) {
      return;
    }

    if (!this.isDragging) {
      const travelled = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);

      if (travelled < DRAG_THRESHOLD_PX) {
        return; // noch ein Tipp — der Kartenpunkt darunter bleibt anklickbar
      }

      this.isDragging = true;
      this.isInteracting.set(true);
      // Zeiger erst jetzt einfangen: früher würde der Klick eines reinen Tipps
      // beim Host landen statt beim Kartenpunkt.
      this.hostElement.nativeElement.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    this.panX.update((offset: number) => offset + (event.clientX - previous.x));
    this.panY.update((offset: number) => offset + (event.clientY - previous.y));
    this.settlePan();
  }

  private beginPinch(): void {
    this.isDragging = false;
    this.isInteracting.set(true);
    this.pinchDistance = null;
    this.pinchCenter = null;
  }

  private updatePinch(event: PointerEvent): void {
    const [first, second] = [...this.activePointers.values()];

    if (first === undefined || second === undefined) {
      return;
    }

    event.preventDefault();

    const distance = Math.hypot(second.x - first.x, second.y - first.y);
    const center: PointerPosition = {
      x: (first.x + second.x) / 2,
      y: (first.y + second.y) / 2,
    };
    const previousDistance = this.pinchDistance;
    const previousCenter = this.pinchCenter;

    if (previousDistance !== null && previousCenter !== null && previousDistance > 0) {
      this.panX.update((offset: number) => offset + (center.x - previousCenter.x));
      this.panY.update((offset: number) => offset + (center.y - previousCenter.y));
      this.zoomAround(this.zoom() * (distance / previousDistance), center.x, center.y);
    }

    this.pinchDistance = distance;
    this.pinchCenter = center;
  }

  /** Zoomt so, dass der Weltpunkt unter (`clientX`, `clientY`) dort liegen bleibt. */
  private zoomAround(nextZoom: number, clientX: number, clientY: number): void {
    const rect = this.hostElement.nativeElement.getBoundingClientRect();
    const focusX = clientX - rect.left;
    const focusY = clientY - rect.top;
    const previousScale = this.scale();
    const worldX = (focusX - this.translateX()) / previousScale;
    const worldY = (focusY - this.translateY()) / previousScale;

    this.zoom.set(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom)));

    const nextScale = this.scale();
    const origin = this.worldOriginOffset();

    this.setWorldEdge(
      focusX - worldX * nextScale + origin.x * nextScale,
      focusY - worldY * nextScale + origin.y * nextScale,
    );
    this.settlePan();
  }

  /** Rechnet aus einer gewünschten Kantenposition den Versatz zurück. */
  private setWorldEdge(left: number, top: number): void {
    const scale = this.scale();

    this.panX.set(left - (this.viewportWidth() - this.worldWidth() * scale) / 2);
    this.panY.set(top - (this.viewportHeight() - this.worldHeight() * scale) / 2);
  }

  /**
   * Schreibt die tatsächlich geklemmte Position in `panX`/`panY` zurück. Ohne
   * das würde ein Ziehen über die Kante hinaus einen unsichtbaren Überhang
   * ansammeln, den man beim Zurückziehen erst wieder abbauen müsste.
   */
  private settlePan(): void {
    const scale = this.scale();
    const origin = this.worldOriginOffset();

    this.setWorldEdge(this.translateX() + origin.x * scale, this.translateY() + origin.y * scale);
  }

  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault();

    const direction = event.deltaY > 0 ? -1 : 1;

    this.zoomAround(this.zoom() + direction * WHEEL_STEP, event.clientX, event.clientY);
  };

  private readonly onClickCapture = (event: MouseEvent): void => {
    if (!this.suppressNextClick) {
      return;
    }

    this.suppressNextClick = false;
    event.stopPropagation();
    event.preventDefault();
  };
}

interface PointerPosition {
  readonly x: number;
  readonly y: number;
}

/**
 * Klemmt die Bildschirmposition der linken/oberen Kante so, dass der sichtbare
 * Ausschnitt die freigeschaltete Fläche nie verlässt.
 */
function clampWorldEdge(rawEdge: number, viewportSize: number, worldPxSize: number): number {
  const lowerBound = Math.min(0, viewportSize - worldPxSize);

  return Math.min(0, Math.max(lowerBound, rawEdge));
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
