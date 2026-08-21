import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  OnInit,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { PokemonCatchConfig, PokemonCatchTarget } from '../../../models/content.types';
import { EventContext } from '../../../models/event-runtime.types';
import { ContentService } from '../../../services/content.service';
import { NarrationService } from '../../../services/narration.service';
import { seededRandom, shuffle } from '../../../services/variation';
import { ImageSlot } from '../../../ui/image-slot/image-slot';
import { ReadAloudButton } from '../../../ui/read-aloud-button/read-aloud-button';
import { EpisodeRun } from '../../episode/episode-run';
import {
  ARC_SHARE,
  DWELL_JITTER_SHARE,
  DWELL_MS,
  EASY_FROM_THROW,
  FLICK_REACH_SECONDS,
  FLICK_SAMPLE_WINDOW_MS,
  FLIGHT_PIXELS_PER_SECOND,
  Flick,
  FlickSample,
  GUARANTEED_FROM_THROW,
  HIT_TOLERANCE_SHARE,
  INTRO_VISIBLE_MS,
  MAX_FLIGHT_MS,
  MAX_REACH_SHARE,
  MIN_FLICK_SPEED,
  MIN_FLIGHT_MS,
  MIN_REACH_SHARE,
  RETURN_MS,
  TARGET_SLOTS,
  TargetSlot,
  ThrowState,
} from './pokemon-catch.types';

/**
 * Eventtyp `pokemon_catch`: der Wurf, das erste Franchise-Spiel (Plan
 * `docs/planning/2026-08-19_pokeball-fangen/`). Ein Story-Event ohne
 * Bewertung (`kind: 'story'`) — es kann nicht schiefgehen (README
 * „Entschieden vor dem Bauen" 2+3).
 *
 * Gespielt wird mit dem Finger, nicht mit einem Knopf — nach dem Vorbild von
 * Pokémon GO und Let's Go:
 *
 * - Der Ball liegt unten und wird angefasst.
 * - Die **Richtung** des Wischers bestimmt, wohin er fliegt, sein **Schwung**
 *   wie weit. Zu kurz heißt: er fällt davor zu Boden. Zu weit: er fliegt drüber.
 * - Das Ziel läuft nicht durch, es steht auf einem von drei Plätzen und springt
 *   alle paar Sekunden auf einen anderen.
 *
 * Ob das ein Treffer war, wird am Ende der Flugbahn **gemessen** und nicht aus
 * der Zeit nachgerechnet — sonst zeigt ein stotterndes Gerät einen Treffer,
 * den die Rechnung als Fehlwurf zählt.
 *
 * Der beschriftete Knopf darunter bleibt der Weg über die Tastatur: er wirft
 * mit Zielhilfe genau dorthin, wo das Ziel gerade steht.
 */
@Component({
  selector: 'qst-pokemon-catch',
  imports: [ImageSlot, ReadAloudButton],
  templateUrl: './pokemon-catch.html',
  styleUrl: './pokemon-catch.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonCatch implements OnInit {
  private readonly content = inject(ContentService);
  private readonly narration = inject(NarrationService);
  private readonly run = inject(EpisodeRun);
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly config = input.required<PokemonCatchConfig>();
  readonly context = input.required<EventContext>();

  private readonly stageElement = viewChild<ElementRef<HTMLElement>>('stage');
  private readonly targetElement = viewChild<ElementRef<HTMLElement>>('target');
  private readonly ballElement = viewChild<ElementRef<HTMLElement>>('ball');

  /**
   * Das gezogene Ziel — einmal beim Öffnen bestimmt über dieselbe Mischung
   * wie bei `multiple_choice` (README-Checkliste „Ziel-Auswahl über die
   * vorhandene Mischung"). Bewusst `linkedSignal` statt `computed`: ein
   * Neuzeichnen darf das Ziel nicht neu ziehen.
   */
  private readonly target = linkedSignal<
    { readonly config: PokemonCatchConfig; readonly seed: number },
    PokemonCatchTarget
  >({
    source: () => ({ config: this.config(), seed: this.run.eventSeed() ?? 0 }),
    computation: ({ config, seed }) => {
      const order = shuffle(config.targets, seededRandom(seed));

      return order[0];
    },
  });

  /**
   * Einmal beim Öffnen gelesen. Ein Kind schaltet die Bewegungsreduktion des
   * Geräts nicht mitten im Wurf um — ein Beobachter dafür wäre Aufwand ohne
   * Fall dahinter.
   */
  private readonly reducedMotion = signal<boolean>(
    this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches === true,
  );

  private readonly throwState = signal<ThrowState>('bereit');
  private readonly throwCount = signal(0);
  protected readonly missed = signal(false);
  /** Der Wischer war zu zaghaft — das kostet keinen Ball, nur einen Hinweis. */
  protected readonly weakFlick = signal(false);
  /** Auf welchem der drei Plätze das Ziel gerade steht. */
  protected readonly targetSlot = signal<TargetSlot>('mitte');
  /** Die Ansage steht nur die ersten Sekunden — danach ist die Bühne frei. */
  protected readonly introVisible = signal(true);
  /** Die Fangsequenz ist durchgelaufen — erst dann steht der Name da. */
  protected readonly celebrated = signal(false);
  /** Das Blink-Bild fehlt oder lädt nicht: dann blinkt es eben nicht. */
  private readonly blinkFailed = signal(false);

  /** Der laufende Zeiger und seine Messpunkte — bewusst kein Signal: kein Bild hängt daran. */
  private activePointerId: number | null = null;
  private pointerStart: FlickSample = { x: 0, y: 0, time: 0 };
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
  private flickSamples: FlickSample[] = [];
  private returnTimer: number | null = null;
  private hopTimer: number | null = null;
  private introTimer: number | null = null;

  protected readonly targetName = computed<string>(() => this.target().name);

  protected readonly targetSpriteUrl = computed<string>(() =>
    this.content.assetUrl(this.context().themeId, 'sprites', this.target().sprite),
  );

  protected readonly ballUrl = computed<string>(() =>
    this.content.assetUrl(this.context().themeId, 'props', this.config().ball),
  );

  protected readonly blinkUrl = computed<string | null>(() => {
    const blink = this.config().ball_blink;

    if (blink === undefined || this.blinkFailed()) {
      return null;
    }

    return this.content.assetUrl(this.context().themeId, 'props', blink);
  });

  protected readonly intro = computed<string>(() => this.config().intro);

  /**
   * Die Aufnahme zur Ansage, wenn es eine gibt. `intro_audio_path` trägt wie
   * bei Dialogzeilen bereits den vollen Unterpfad („audio/voices/…"), deshalb
   * `themeAssetUrl` statt `assetUrl` mit Ordner.
   */
  protected readonly introAudioUrl = computed<string | undefined>(() => {
    const audioPath = this.config().intro_audio_path;

    if (audioPath === undefined) {
      return undefined;
    }

    return this.content.themeAssetUrl(this.context().themeId, audioPath);
  });

  /**
   * Was unter der Bühne steht — Erfolg, Fehlwurf oder die Anleitung. Bewusst
   * hier und nicht als Verzweigungskette im Rahmen: Der Rahmen soll nur noch
   * entscheiden, ob überhaupt etwas dasteht.
   */
  protected readonly message = computed<string | null>(() => {
    if (this.celebrated()) {
      return `${this.targetName()} gefangen!`;
    }

    if (this.caught()) {
      // Die Fangsequenz läuft — jetzt gehört die Aufmerksamkeit dem Ball.
      return null;
    }

    if (this.missed()) {
      return 'Knapp daneben — noch einen Ball?';
    }

    if (this.weakFlick()) {
      return 'Etwas mehr Schwung — wisch den Ball nach oben!';
    }

    return 'Wisch den Ball zum Pokémon.';
  });

  protected readonly holding = computed<boolean>(() => this.throwState() === 'zieht');
  protected readonly flying = computed<boolean>(() => this.throwState() === 'fliegt');
  protected readonly caught = computed<boolean>(() => this.throwState() === 'gefangen');

  /** Wie bei jedem Story-Text: im Vorlesemodus spricht die Computerstimme von allein. */
  private readonly speakIntro = effect(() => {
    const text = this.intro();
    const audioUrl = this.introAudioUrl();

    untracked(() => {
      if (this.narration.mode() === 'listen') {
        this.narration.speak(text, audioUrl);
      }
    });
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.clearReturnTimer();
      this.clearTimer(this.hopTimer);
      this.clearTimer(this.introTimer);
    });
  }

  /**
   * Beide Uhren starten hier und nicht im Konstruktor: `scheduleHop` liest
   * `config()`, und eine Pflicht-Eingabe ist im Konstruktor noch nicht gesetzt.
   * Der Zugriff dort warf NG0950 und ließ die Bühne komplett leer.
   */
  ngOnInit(): void {
    this.introTimer =
      this.document.defaultView?.setTimeout(() => this.introVisible.set(false), INTRO_VISIBLE_MS) ??
      null;

    this.scheduleHop();
  }

  // ── Das Ziel ─────────────────────────────────────────────────────────────

  /**
   * Das Ziel läuft nicht durch, es steht und springt: Nach ein paar Sekunden
   * wechselt es auf einen der beiden anderen Plätze (Vorbild: Let's Go). Der
   * nächste Sprung wird jedes Mal neu geplant, weil die Standzeit einen
   * Zufallsanteil trägt — ein gleichmäßiger Takt wäre nach drei Würfen
   * abgezählt.
   */
  private scheduleHop(): void {
    this.clearTimer(this.hopTimer);

    const base = DWELL_MS[this.config().speed] * (this.throwCount() >= EASY_FROM_THROW ? 2 : 1);
    const dwell = base * (1 + (Math.random() * 2 - 1) * DWELL_JITTER_SHARE);

    this.hopTimer =
      this.document.defaultView?.setTimeout(() => {
        this.hopTimer = null;
        this.hop();
      }, dwell) ?? null;
  }

  private hop(): void {
    // Solange ein Ball unterwegs ist, bleibt das Ziel stehen — sonst springt es
    // unter dem fliegenden Ball weg und ein sauberer Wurf sähe aus wie Pech.
    if (this.throwState() === 'gefangen') {
      return;
    }

    if (this.throwState() === 'fliegt') {
      this.scheduleHop();

      return;
    }

    const others = TARGET_SLOTS.filter((slot: TargetSlot) => slot !== this.targetSlot());

    this.targetSlot.set(others[Math.floor(Math.random() * others.length)]);
    this.scheduleHop();
  }

  // ── Der Wischer ──────────────────────────────────────────────────────────

  /** Ein Finger (oder die Maus) nimmt den Ball auf. */
  protected onBallPointerDown(event: PointerEvent): void {
    const ballElement = this.ballElement()?.nativeElement;

    if (this.throwState() !== 'bereit' || ballElement === undefined) {
      return;
    }

    // Sonst zieht der Browser stattdessen die Seite oder das Ballbild.
    event.preventDefault();
    ballElement.setPointerCapture(event.pointerId);

    this.activePointerId = event.pointerId;
    this.pointerStart = { x: event.clientX, y: event.clientY, time: event.timeStamp };
    this.dragOffset = { x: 0, y: 0 };
    this.flickSamples = [this.pointerStart];
    this.missed.set(false);
    this.weakFlick.set(false);
    this.applyDragOffset();
    this.throwState.set('zieht');

    // Das Mitziehen schreibt nur Custom Properties — dafür muss Angular nicht
    // bei jedem Zwischenschritt neu zeichnen.
    this.zone.runOutsideAngular(() => {
      ballElement.addEventListener('pointermove', this.handlePointerMove);
      ballElement.addEventListener('pointerup', this.handlePointerUp);
      ballElement.addEventListener('pointercancel', this.handlePointerUp);
    });
  }

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    this.dragOffset = {
      x: event.clientX - this.pointerStart.x,
      y: event.clientY - this.pointerStart.y,
    };
    this.applyDragOffset();
    this.rememberSample(event);
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    this.rememberSample(event);
    this.stopTracking(event.pointerId);
    this.zone.run(() => this.release());
  };

  /** Der Finger ist weg — jetzt entscheidet der Schwung, ob und wohin es geht. */
  private release(): void {
    const flick = this.readFlick();

    if (flick === null) {
      this.weakFlick.set(true);
      this.returnBall();

      return;
    }

    this.launch(flick);
  }

  /**
   * Richtung und Weite aus den letzten Messpunkten. `null` heißt: das war ein
   * Antippen oder ein Schubsen, kein Wurf.
   */
  private readFlick(): Flick | null {
    const last = this.flickSamples.at(-1);
    const first = this.oldestSampleInWindow();

    if (last === undefined || first === undefined) {
      return null;
    }

    const seconds = (last.time - first.time) / 1000;

    if (seconds <= 0) {
      return null;
    }

    const velocityX = (last.x - first.x) / seconds;
    const velocityY = (last.y - first.y) / seconds;
    const speed = Math.hypot(velocityX, velocityY);

    if (speed < MIN_FLICK_SPEED) {
      return null;
    }

    const distance = this.clampReach(speed * FLICK_REACH_SECONDS);

    return {
      x: this.dragOffset.x + (velocityX / speed) * distance,
      y: this.dragOffset.y + (velocityY / speed) * distance,
      distance,
      durationMs: clamp((distance / FLIGHT_PIXELS_PER_SECOND) * 1000, MIN_FLIGHT_MS, MAX_FLIGHT_MS),
    };
  }

  private oldestSampleInWindow(): FlickSample | undefined {
    const last = this.flickSamples.at(-1);

    if (last === undefined) {
      return undefined;
    }

    const inWindow = this.flickSamples.filter(
      (sample: FlickSample) => last.time - sample.time <= FLICK_SAMPLE_WINDOW_MS,
    );

    return inWindow[0] ?? this.flickSamples[0];
  }

  private rememberSample(event: PointerEvent): void {
    this.flickSamples.push({ x: event.clientX, y: event.clientY, time: event.timeStamp });

    // Mehr als eine Handvoll Punkte braucht niemand — das Fenster ist kurz.
    if (this.flickSamples.length > 12) {
      this.flickSamples.shift();
    }
  }

  private stopTracking(pointerId: number): void {
    const ballElement = this.ballElement()?.nativeElement;

    ballElement?.removeEventListener('pointermove', this.handlePointerMove);
    ballElement?.removeEventListener('pointerup', this.handlePointerUp);
    ballElement?.removeEventListener('pointercancel', this.handlePointerUp);

    if (ballElement?.hasPointerCapture(pointerId) === true) {
      ballElement.releasePointerCapture(pointerId);
    }

    this.activePointerId = null;
  }

  // ── Der Wurf ─────────────────────────────────────────────────────────────

  /**
   * Der Weg über die Tastatur und über den beschrifteten Knopf: geworfen wird
   * mit Zielhilfe genau dorthin, wo das Ziel gerade steht. Ohne Zielhilfe wäre
   * das Spiel per Tastatur nicht spielbar.
   */
  protected throwBall(): void {
    if (this.throwState() !== 'bereit') {
      return;
    }

    this.dragOffset = { x: 0, y: 0 };
    this.applyDragOffset();
    this.missed.set(false);
    this.weakFlick.set(false);

    const aimed = this.aimAtTarget();

    if (aimed === null) {
      return;
    }

    this.launch(aimed);
  }

  /** Ball weg, Vorzeichen gesetzt, Uhr läuft. */
  private launch(flick: Flick): void {
    this.throwCount.update((count: number) => count + 1);

    // Ab dem sicheren Wurf zählt nicht mehr, wohin gewischt wurde: der Ball
    // fliegt sichtbar zum Ziel, sonst sähe der geschenkte Fang aus wie ein Fehler.
    const guaranteed = this.throwCount() >= GUARANTEED_FROM_THROW;

    this.applyFlightPath(guaranteed ? (this.aimAtTarget() ?? flick) : flick);
    this.throwState.set('fliegt');

    if (this.reducedMotion()) {
      // Ohne Flugbahn gibt es kein `animationend`, das die Landung meldet.
      this.land();
    }
  }

  /** Die Flugbahn ist durch — hier fällt die Trefferentscheidung. */
  protected onFlightEnd(event: AnimationEvent): void {
    if (event.target !== event.currentTarget || this.throwState() !== 'fliegt') {
      return;
    }

    this.land();
  }

  /** Die Fangsequenz ist durch — jetzt erst steht der Name da. */
  protected onCatchEnd(event: AnimationEvent): void {
    if (event.target !== event.currentTarget) {
      return;
    }

    this.celebrated.set(true);
  }

  protected markBlinkFailed(): void {
    this.blinkFailed.set(true);
  }

  protected finish(): void {
    this.narration.stop();
    this.run.finish({ kind: 'story' });
  }

  /**
   * Treffer oder nicht. Gemessen werden **beide** Kästen im selben Augenblick —
   * damit können Anzeige und Logik nicht auseinandergehen, auch wenn der
   * Zeitgeber auf einem ausgelasteten Gerät spät dran ist.
   */
  private land(): void {
    if (this.hits()) {
      this.narration.stop();
      this.throwState.set('gefangen');

      return;
    }

    this.missed.set(true);
    this.returnBall();
  }

  private hits(): boolean {
    if (this.reducedMotion() || this.throwCount() >= GUARANTEED_FROM_THROW) {
      return true;
    }

    const targetElement = this.targetElement()?.nativeElement;
    const ballElement = this.ballElement()?.nativeElement;

    if (targetElement === undefined || ballElement === undefined) {
      return false;
    }

    const targetBox = targetElement.getBoundingClientRect();
    const ballBox = ballElement.getBoundingClientRect();
    const share =
      this.throwCount() >= EASY_FROM_THROW ? HIT_TOLERANCE_SHARE * 2 : HIT_TOLERANCE_SHARE;

    // Die Größe des Ziel-Kastens, nicht die des Motivs darin: das freigestellte
    // Sprite kann schmaler sein, aber der Kasten ist die Fläche, die das Kind
    // als „das Pokémon" sieht.
    return (
      Math.abs(centerX(targetBox) - centerX(ballBox)) <= targetBox.width * share &&
      Math.abs(centerY(targetBox) - centerY(ballBox)) <= targetBox.height * share
    );
  }

  /** Kurzer Rückweg an den Startplatz, danach ist der Ball wieder greifbar. */
  private returnBall(): void {
    this.dragOffset = { x: 0, y: 0 };
    this.applyDragOffset();
    this.throwState.set('zurueck');
    this.clearReturnTimer();

    this.returnTimer =
      this.document.defaultView?.setTimeout(() => {
        this.returnTimer = null;
        this.throwState.set('bereit');
      }, RETURN_MS) ?? null;
  }

  private clearReturnTimer(): void {
    this.clearTimer(this.returnTimer);
    this.returnTimer = null;
  }

  private clearTimer(timer: number | null): void {
    if (timer !== null) {
      this.document.defaultView?.clearTimeout(timer);
    }
  }

  // ── Geometrie ────────────────────────────────────────────────────────────

  /** Der Wurf, der garantiert dort landet, wo das Ziel **jetzt** steht. */
  private aimAtTarget(): Flick | null {
    const targetElement = this.targetElement()?.nativeElement;
    const ballElement = this.ballElement()?.nativeElement;

    if (targetElement === undefined || ballElement === undefined) {
      return null;
    }

    const targetBox = targetElement.getBoundingClientRect();
    const ballBox = ballElement.getBoundingClientRect();
    const x = centerX(targetBox) - centerX(ballBox) + this.dragOffset.x;
    const y = centerY(targetBox) - centerY(ballBox) + this.dragOffset.y;
    const distance = Math.hypot(x - this.dragOffset.x, y - this.dragOffset.y);

    return {
      x,
      y,
      distance,
      durationMs: clamp((distance / FLIGHT_PIXELS_PER_SECOND) * 1000, MIN_FLIGHT_MS, MAX_FLIGHT_MS),
    };
  }

  /** Die Flugweite bleibt in einem Rahmen, den die Bühne hergibt. */
  private clampReach(distance: number): number {
    const stageHeight = this.stageElement()?.nativeElement.getBoundingClientRect().height ?? 0;

    if (stageHeight <= 0) {
      return distance;
    }

    return clamp(distance, stageHeight * MIN_REACH_SHARE, stageHeight * MAX_REACH_SHARE);
  }

  private applyDragOffset(): void {
    const style = this.hostElement.nativeElement.style;

    style.setProperty('--pokemon-catch-drag-x', `${this.dragOffset.x}px`);
    style.setProperty('--pokemon-catch-drag-y', `${this.dragOffset.y}px`);
  }

  /** Ziel, Bogenhöhe und Flugzeit als Custom Properties für die Bildfolge. */
  private applyFlightPath(flick: Flick): void {
    const style = this.hostElement.nativeElement.style;

    style.setProperty('--pokemon-catch-throw-x', `${flick.x}px`);
    style.setProperty('--pokemon-catch-throw-y', `${flick.y}px`);
    style.setProperty('--pokemon-catch-arc', `${flick.distance * ARC_SHARE}px`);
    style.setProperty('--pokemon-catch-flight', `${Math.round(flick.durationMs)}ms`);
  }
}

function centerX(box: DOMRect): number {
  return box.left + box.width / 2;
}

function centerY(box: DOMRect): number {
  return box.top + box.height / 2;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
