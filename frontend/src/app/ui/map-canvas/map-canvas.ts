import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
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

/** Ein Weltpixel ist ein Bildschirmpixel — eine Kachel erreicht ihre native Größe. */
const NATIVE_SCALE = 1;

/** Sichtbarer Nebelrand um die freigeschaltete Fläche, damit „hier geht es weiter" lesbar ist. */
const FOG_MARGIN = TILE_SIZE;

/** Erst ab dieser Bewegung gilt eine Berührung als Ziehen statt als Tipp. */
const DRAG_THRESHOLD_PX = 6;

/**
 * Zoomschritte sind multiplikativ, nicht additiv: ein fester Summand fühlt
 * sich am herausgezoomten Ende träge und am hineingezoomten ruckartig an,
 * weil derselbe Betrag dort ein Vielfaches und hier ein Bruchteil ist.
 */
const WHEEL_FACTOR = 1.15;
const BUTTON_FACTOR = 1.4;

/**
 * Gemeinsame Kartenfläche von Planeten-, Etappen- und Ortskarte: eine Liste
 * quadratischer Kacheln in einem offenen Koordinatensystem, Routenlinien
 * zwischen Knoten, und ein Platz für die Knoten selbst, die jeder Screen
 * eigenständig zeichnet.
 *
 * Nur freigeschaltete Kacheln (`unlockedTileIds`) werden überhaupt gerendert
 * — nicht freigeschaltete zeigen einen Nebel-Platzhalter ohne Bild-Request.
 *
 * Die sichtbare Fläche ist die Bounding-Box der freigeschalteten Kacheln,
 * um eine Kachelbreite erweitert und auf die Gesamtfläche beschnitten
 * (ADR-022). So ist immer so viel Nebel zu sehen, dass er als „hier geht es
 * weiter" liest, ohne dass man in eine leere Fläche hinauswandern kann.
 *
 * Ziehen und Zoomen laufen ohne Fremdbibliothek (ADR-019) und sind auf diese
 * Fläche geklemmt. Der herausgezoomte Anschlag zeigt sie vollständig
 * (`fitScale`), der Startzustand füllt die Bühne randlos (`coverScale`,
 * ADR-017), und hinein geht es bis zur nativen Kachelgröße.
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
  /** Punkt, auf den beim Laden/Wechsel animiert zentriert wird — `null` heißt keine Zentrierung. */
  readonly focusPointId = input<string | null>(null);
  readonly focusZoom = input<number>(1.6);

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

  private readonly allTilesBounds = computed<WorldRect | null>(() => boundingBoxOf(this.tiles()));

  /**
   * Die Fläche, auf der gezoomt und geklemmt wird: freigeschaltete Kacheln
   * plus einen Kachelrand Nebel, beschnitten auf das, was die Karte überhaupt
   * hergibt. Sind alle Kacheln frei, ist der Rand automatisch weg.
   */
  private readonly visibleBounds = computed<WorldRect | null>(() => {
    const unlocked = this.unlockedBounds();
    const all = this.allTilesBounds();

    if (unlocked === null) {
      return all;
    }

    if (all === null) {
      return unlocked;
    }

    return {
      left: Math.max(all.left, unlocked.left - FOG_MARGIN),
      top: Math.max(all.top, unlocked.top - FOG_MARGIN),
      right: Math.min(all.right, unlocked.right + FOG_MARGIN),
      bottom: Math.min(all.bottom, unlocked.bottom + FOG_MARGIN),
    };
  });

  protected readonly worldWidth = computed<number>(() => {
    const bounds = this.visibleBounds();

    return bounds === null ? TILE_SIZE : bounds.right - bounds.left;
  });

  protected readonly worldHeight = computed<number>(() => {
    const bounds = this.visibleBounds();

    return bounds === null ? TILE_SIZE : bounds.bottom - bounds.top;
  });

  private readonly worldOriginOffset = computed<{ x: number; y: number }>(() => {
    const bounds = this.visibleBounds();

    return bounds === null ? { x: 0, y: 0 } : { x: bounds.left, y: bounds.top };
  });

  /** Startwert `TILE_SIZE` verhindert Sprung/NaN vor der ersten Messung. */
  private readonly viewportWidth = signal<number>(TILE_SIZE);
  private readonly viewportHeight = signal<number>(TILE_SIZE);
  /** Erst wahr, sobald der `ResizeObserver` einmal echte Maße geliefert hat — vorher wäre jede Fokus-Zentrierung auf den Platzhalterwert verkehrt. */
  private readonly hasMeasured = signal<boolean>(false);

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
    this.hasMeasured.set(true);
  });

  /**
   * Der vom Nutzer gewünschte Maßstab — `null` heißt „noch keiner gewählt",
   * dann gilt der randlos füllende Startzustand. Bewusst der Maßstab selbst
   * und kein Faktor darauf: ein Faktor müsste sich bei jeder Änderung der
   * freigeschalteten Fläche mit umrechnen lassen, sonst springt die Ansicht.
   */
  private readonly requestedScale = signal<number | null>(null);
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

  /** Randlos füllend — die Fläche wird an der schmaleren Achse angeschnitten. */
  protected readonly coverScale = computed<number>(() =>
    Math.max(this.viewportWidth() / this.worldWidth(), this.viewportHeight() / this.worldHeight()),
  );

  /** Vollständig sichtbar — an der breiteren Achse bleibt Rand stehen. */
  protected readonly fitScale = computed<number>(() =>
    Math.min(this.viewportWidth() / this.worldWidth(), this.viewportHeight() / this.worldHeight()),
  );

  /**
   * Hinein bis zur nativen Kachelgröße. `coverScale` ist die Untergrenze
   * davon: eine kleine Karte auf einem großen Bildschirm füllt schon über
   * nativer Größe, und dann darf der Startzustand nicht über dem Anschlag
   * liegen.
   */
  private readonly maxScale = computed<number>(() =>
    Math.max(this.coverScale(), NATIVE_SCALE),
  );

  protected readonly scale = computed<number>(() => {
    const requested = this.requestedScale();

    return clamp(requested ?? this.coverScale(), this.fitScale(), this.maxScale());
  });

  /**
   * Kehrwert des Maßstabs, damit Kartenknoten ihre Bildschirmgröße behalten,
   * statt mit der Karte zu wachsen und zu schrumpfen — sonst fällt ein
   * Antippziel beim Herauszoomen unter die 44-Pixel-Grenze.
   *
   * Als Custom Property auf dem Host, nicht als Style-Bindung im Template:
   * Angulars Bindung auf Custom Properties ist nicht zugesichert (dieselbe
   * Begründung wie in `map-point.ts`), und über den Host erbt sie an jeden
   * `qst-map-point` weiter.
   */
  private readonly applyInverseScale = effect(() => {
    this.hostElement.nativeElement.style.setProperty(
      '--map-inverse-scale',
      String(1 / this.scale()),
    );
  });

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

  /** `factor > 1` zoomt hinein, `factor < 1` heraus — immer um die Mitte der Fläche. */
  protected zoomBy(factor: number): void {
    const rect = this.hostElement.nativeElement.getBoundingClientRect();

    this.zoomAround(
      this.scale() * factor,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
  }

  protected readonly buttonFactor = BUTTON_FACTOR;

  /** Zurück auf den randlos füllenden Startzustand, mittig. */
  protected resetView(): void {
    this.requestedScale.set(null);
    this.panX.set(0);
    this.panY.set(0);
  }

  private readonly focusPoint = computed<MapCanvasPoint | null>(
    () => this.points().find((point: MapCanvasPoint) => point.id === this.focusPointId()) ?? null,
  );

  private readonly focusWorldPosition = computed<{ x: number; y: number } | null>(() => {
    const point = this.focusPoint();

    if (point === null) {
      return null;
    }

    const origin = resolveTileOrigin(this.tiles(), point.tileId);

    if (origin === null) {
      return null; // Content-Tippfehler: Fokuspunkt zeigt auf unbekannte Kachel
    }

    return { x: origin.x + (point.x / 100) * TILE_SIZE, y: origin.y + (point.y / 100) * TILE_SIZE };
  });

  private readonly lastAppliedFocusId = signal<string | null>(null);

  /**
   * Zentriert automatisch auf den aktuellen Fokuspunkt, sobald er sich ändert
   * — aber nur einmal pro Punkt, damit ein manueller Zoom/Pan danach nicht
   * ungefragt zurückgesetzt wird (Phase-4-AK 3). Wartet auf die erste echte
   * Viewport-Messung, sonst würde mit dem `TILE_SIZE`-Platzhalter zentriert.
   */
  private readonly applyFocusEffect = effect(() => {
    const point = this.focusPoint();

    if (point === null || point.id === this.lastAppliedFocusId()) {
      return;
    }

    if (!this.hasMeasured()) {
      return;
    }

    const worldPosition = this.focusWorldPosition();

    if (worldPosition === null) {
      return;
    }

    // Sicherheitsnetz: die aktuelle Station sollte laut Phase 3 immer auf
    // einer freigeschalteten Kachel liegen — als Sonnet-Phase trotzdem
    // geprüft statt stillschweigend vorausgesetzt.
    if (!this.unlockedTileSet().has(point.tileId)) {
      console.warn(
        `qst-map-canvas: Fokuspunkt "${point.id}" liegt auf der gesperrten Kachel "${point.tileId}" — Zentrierung übersprungen.`,
      );
      this.lastAppliedFocusId.set(point.id);
      return;
    }

    this.lastAppliedFocusId.set(point.id);
    this.applyFocus(worldPosition);
  });

  private applyFocus(worldPosition: { x: number; y: number }): void {
    // `focusZoom` ist ein Vielfaches des randlos füllenden Startzustands,
    // nicht des herausgezoomten Anschlags — sonst würde die Zentrierung mit
    // dem Zoom-Boden aus ADR-022 stillschweigend weiter wegrücken.
    this.requestedScale.set(this.coverScale() * this.focusZoom());

    const scale = this.scale();
    const origin = this.worldOriginOffset();

    this.setWorldEdge(
      this.viewportWidth() / 2 - worldPosition.x * scale + origin.x * scale,
      this.viewportHeight() / 2 - worldPosition.y * scale + origin.y * scale,
    );
    this.settlePan();
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
      this.zoomAround(this.scale() * (distance / previousDistance), center.x, center.y);
    }

    this.pinchDistance = distance;
    this.pinchCenter = center;
  }

  /** Zoomt so, dass der Weltpunkt unter (`clientX`, `clientY`) dort liegen bleibt. */
  private zoomAround(wantedScale: number, clientX: number, clientY: number): void {
    const rect = this.hostElement.nativeElement.getBoundingClientRect();
    const focusX = clientX - rect.left;
    const focusY = clientY - rect.top;
    const previousScale = this.scale();
    const worldX = (focusX - this.translateX()) / previousScale;
    const worldY = (focusY - this.translateY()) / previousScale;

    this.requestedScale.set(wantedScale);

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

    const factor = event.deltaY > 0 ? 1 / WHEEL_FACTOR : WHEEL_FACTOR;

    this.zoomAround(this.scale() * factor, event.clientX, event.clientY);
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

function clamp(value: number, lowest: number, highest: number): number {
  return Math.min(highest, Math.max(lowest, value));
}

/**
 * Klemmt die Bildschirmposition der linken/oberen Kante so, dass der sichtbare
 * Ausschnitt die Karte nie verlässt.
 *
 * Zwei Fälle, und der zweite ist neu (ADR-022): Ist die Karte auf dieser Achse
 * **kleiner** als die Fläche — herausgezoomt bis zum Anschlag —, gibt es
 * nichts zu klemmen, sondern zu zentrieren. Ohne diesen Zweig würde die Karte
 * dort in die linke obere Ecke gedrückt, weil die alte Rechnung stillschweigend
 * voraussetzte, dass die Welt immer größer als die Fläche ist.
 */
function clampWorldEdge(rawEdge: number, viewportSize: number, worldPxSize: number): number {
  if (worldPxSize <= viewportSize) {
    return (viewportSize - worldPxSize) / 2;
  }

  return clamp(rawEdge, viewportSize - worldPxSize, 0);
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
