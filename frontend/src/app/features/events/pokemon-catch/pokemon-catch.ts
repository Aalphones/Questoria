import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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
  EASY_FROM_THROW,
  GUARANTEED_FROM_THROW,
  HIT_TOLERANCE_SHARE,
  ThrowState,
} from './pokemon-catch.types';

/**
 * Eventtyp `pokemon_catch`: der Wurf, das erste Franchise-Spiel (Plan
 * `docs/planning/2026-08-19_pokeball-fangen/`). Ein Story-Event ohne
 * Bewertung (`kind: 'story'`) — es kann nicht schiefgehen (README
 * „Entschieden vor dem Bauen" 2+3).
 *
 * Gespielt wird auf Timing, nicht auf Zielen: Das Ziel läuft hin und her, ein
 * Auslöser wirft den Ball auf die Stelle, an der es beim Abwurf stand. Ob das
 * ein Treffer war, wird am Ende der Flugbahn **gemessen** und nicht aus der
 * Zeit nachgerechnet — sonst zeigt ein stotterndes Gerät einen Treffer, den
 * die Rechnung als Fehlwurf zählt (Phase-2-Risiko).
 */
@Component({
  selector: 'qst-pokemon-catch',
  imports: [ImageSlot, ReadAloudButton],
  templateUrl: './pokemon-catch.html',
  styleUrl: './pokemon-catch.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonCatch {
  private readonly content = inject(ContentService);
  private readonly narration = inject(NarrationService);
  private readonly run = inject(EpisodeRun);
  private readonly document = inject(DOCUMENT);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly config = input.required<PokemonCatchConfig>();
  readonly context = input.required<EventContext>();

  private readonly targetElement = viewChild<ElementRef<HTMLElement>>('target');
  private readonly ballElement = viewChild<ElementRef<HTMLElement>>('ball');

  /**
   * Das gezogene Ziel — einmal beim Öffnen bestimmt über dieselbe Mischung
   * wie bei `multiple_choice` (Startwert aus dem Lauf, README-Checkliste
   * „Ziel-Auswahl über die vorhandene Mischung"). Bewusst `linkedSignal`
   * statt `computed`: ein Neuzeichnen darf das Ziel nicht neu ziehen.
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
  /** Die Fangsequenz ist durchgelaufen — erst dann steht der Name da. */
  protected readonly celebrated = signal(false);
  /** Das Blink-Bild fehlt oder lädt nicht: dann blinkt es eben nicht. */
  private readonly blinkFailed = signal(false);

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

  protected readonly flying = computed<boolean>(() => this.throwState() === 'fliegt');
  protected readonly caught = computed<boolean>(() => this.throwState() === 'gefangen');

  /**
   * Auf einem sicheren Wurf bleibt das Ziel stehen, sobald der Ball fliegt.
   * Sonst landet der Ball auf einer leeren Stelle und das Pokémon verschwindet
   * daneben — der garantierte Fang sähe aus wie ein Fehler.
   */
  protected readonly targetWaiting = computed<boolean>(
    () => this.flying() && this.throwCount() >= GUARANTEED_FROM_THROW,
  );

  /** Wie bei jedem Story-Text: im Vorlesemodus spricht die Computerstimme von allein. */
  private readonly speakIntro = effect(() => {
    const text = this.intro();

    untracked(() => {
      if (this.narration.mode() === 'listen') {
        this.narration.speak(text);
      }
    });
  });

  /**
   * Laufdauer als Custom Property am Wirt, nicht als Style-Bindung im Template:
   * Angulars Bindung auf Custom Properties ist nicht zugesichert (siehe
   * `map-point.ts`). Ab dem vierten Wurf läuft das Ziel halb so schnell.
   */
  private readonly applyWalkDuration = effect(() => {
    const base = `var(--duration-pokemon-walk-${this.config().speed})`;
    const eased = this.throwCount() >= EASY_FROM_THROW;

    this.hostElement.nativeElement.style.setProperty(
      '--pokemon-catch-walk',
      eased ? `calc(${base} * 2)` : base,
    );
  });

  protected throwBall(): void {
    if (this.throwState() !== 'bereit') {
      return;
    }

    const targetElement = this.targetElement()?.nativeElement;
    const ballElement = this.ballElement()?.nativeElement;

    if (targetElement === undefined || ballElement === undefined) {
      return;
    }

    this.missed.set(false);
    this.throwCount.update((count: number) => count + 1);
    this.aimAt(targetElement, ballElement);
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
   * Legt Weg und Höhe des Wurfs als Custom Properties ab: von der Ballmitte zu
   * der Stelle, an der das Ziel **jetzt** steht.
   */
  private aimAt(targetElement: HTMLElement, ballElement: HTMLElement): void {
    const targetBox = targetElement.getBoundingClientRect();
    const ballBox = ballElement.getBoundingClientRect();
    const style = this.hostElement.nativeElement.style;

    style.setProperty('--pokemon-catch-throw-x', `${centerX(targetBox) - centerX(ballBox)}px`);
    style.setProperty('--pokemon-catch-throw-y', `${centerY(targetBox) - centerY(ballBox)}px`);
  }

  /**
   * Treffer oder nicht. Gemessen werden **beide** Kästen im selben Augenblick —
   * damit kann Anzeige und Logik nicht auseinandergehen, auch wenn der Zeitgeber
   * auf einem ausgelasteten Gerät spät dran ist.
   */
  private land(): void {
    if (this.hits()) {
      this.narration.stop();
      this.throwState.set('gefangen');

      return;
    }

    this.throwState.set('bereit');
    this.missed.set(true);
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

    // Die Breite des Ziel-Kastens, nicht die des Motivs darin: das freigestellte
    // Sprite kann schmaler sein, aber der Kasten ist die Größe, die das Kind als
    // „das Pokémon" sieht.
    return Math.abs(centerX(targetBox) - centerX(ballBox)) <= targetBox.width * share;
  }
}

function centerX(box: DOMRect): number {
  return box.left + box.width / 2;
}

function centerY(box: DOMRect): number {
  return box.top + box.height / 2;
}
