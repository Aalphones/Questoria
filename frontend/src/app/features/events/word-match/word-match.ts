import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';

import { WordMatchConfig, WordPair } from '../../../models/content.types';
import { EventContext } from '../../../models/event-runtime.types';
import { ContentService } from '../../../services/content.service';
import { NarrationService } from '../../../services/narration.service';
import { seededRandom, shuffle } from '../../../services/variation';
import { ImageSlot } from '../../../ui/image-slot/image-slot';
import { TaskCard } from '../../../ui/task-card/task-card';
import { EpisodeRun } from '../../episode/episode-run';
import { ImageTileView, SlotState, WordCardView } from './word-match.types';

/** Wie lange ein falsch gelegtes Paar rot stehen bleibt, bevor beides wieder aufgeht. */
const WRONG_FEEDBACK_MS = 900;

/**
 * Eventtyp `word_match`: drei oder vier Bilder, ebenso viele Wortkarten, das
 * Kind legt zusammen, was zusammengehört — erst ein Bild antippen, dann die
 * Karte (oder umgekehrt).
 *
 * Die Aufgabe, bei der wirklich gelesen wird: **Die Wörter werden nie
 * vorgelesen**, auch im Vorlesemodus nicht. Gesprochen wird nur die Frage, und
 * die spricht die Aufgaben-Hülle von allein.
 *
 * Ein Fehlgriff ist kein Sackgassen-Ende — beide Karten gehen wieder auf. Für
 * den Stern zählt die ganze Aufgabe: nur wenn **jedes** Paar beim ersten
 * Versuch saß, gibt es ihn (ADR-014).
 */
@Component({
  selector: 'qst-word-match',
  imports: [TaskCard, ImageSlot],
  templateUrl: './word-match.html',
  styleUrl: './word-match.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WordMatch {
  private readonly content = inject(ContentService);
  private readonly narration = inject(NarrationService);
  private readonly run = inject(EpisodeRun);
  private readonly destroyRef = inject(DestroyRef);

  readonly config = input.required<WordMatchConfig>();
  readonly context = input.required<EventContext>();

  /**
   * Die Reihenfolge der Wortkarten — sonst stünde Wort 1 neben Bild 1 und die
   * Aufgabe löste sich von selbst. Bewusst kein `computed`: Die Mischung wird
   * einmal beim Öffnen der Aufgabe gezogen und bleibt dann stehen, sonst
   * sprängen die Karten bei jedem Neuzeichnen.
   *
   * Der Startwert kommt aus dem Lauf, nicht aus der Komponente (Plan Phase 1,
   * AK 3) — derselbe Lauf zeigt dieselbe Mischung wieder.
   */
  private readonly wordOrder = linkedSignal<
    { readonly config: WordMatchConfig; readonly seed: number },
    readonly number[]
  >({
    source: () => ({ config: this.config(), seed: this.run.eventSeed() ?? 0 }),
    computation: ({ config, seed }) => {
      const indexes = Array.from(
        { length: config.pairs.length },
        (_unused: unknown, index: number) => index,
      );

      return shuffle(indexes, seededRandom(seed));
    },
  });

  /** Gelegte Paare in der Reihenfolge des Legens — daraus kommt die Paarnummer. */
  private readonly matchedPairs = signal<readonly number[]>([]);
  private readonly selectedImage = signal<number | null>(null);
  private readonly selectedWord = signal<number | null>(null);
  /** Das zuletzt falsch gelegte Paar, solange die Rückmeldung steht. */
  private readonly wrongAttempt = signal<{ readonly image: number; readonly word: number } | null>(
    null,
  );
  /** Ein einziger Fehlgriff kostet den Stern für die ganze Aufgabe. */
  private readonly mistakeCount = signal(0);

  private wrongTimeout: ReturnType<typeof setTimeout> | undefined;

  protected readonly solved = computed<boolean>(
    () => this.matchedPairs().length === this.config().pairs.length,
  );

  protected readonly questionText = computed<string>(() => {
    const config = this.config();

    return this.narration.textFor(config.question, config.question_simple);
  });

  protected readonly imageTiles = computed<readonly ImageTileView[]>(() => {
    const wrong = this.wrongAttempt();
    const selected = this.selectedImage();

    return this.config().pairs.map((pair: WordPair, pairIndex: number) => {
      const state = this.slotState(pairIndex, selected, wrong?.image ?? null);
      const badge = this.pairBadge(pairIndex);

      return {
        pairIndex,
        imageUrl: this.content.assetUrl(this.context().themeId, 'answers', pair.image),
        placeholderLabel: pair.image,
        state,
        badge,
        stateLabel: stateLabelFor(state, badge),
        locked: state === 'matched',
      };
    });
  });

  protected readonly wordCards = computed<readonly WordCardView[]>(() => {
    const pairs = this.config().pairs;
    const wrong = this.wrongAttempt();
    const selected = this.selectedWord();

    return this.wordOrder().map((pairIndex: number) => {
      const state = this.slotState(pairIndex, selected, wrong?.word ?? null);
      const badge = this.pairBadge(pairIndex);

      return {
        pairIndex,
        word: pairs[pairIndex].word,
        state,
        badge,
        stateLabel: stateLabelFor(state, badge),
        locked: state === 'matched',
      };
    });
  });

  protected readonly feedbackTitle = computed<string | null>(() => {
    if (!this.solved()) {
      return null;
    }

    return this.mistakeCount() === 0 ? 'Alles richtig!' : 'Geschafft!';
  });

  protected readonly feedbackText = computed<string>(() => {
    if (this.mistakeCount() === 0) {
      return 'Jedes Wort saß auf Anhieb — weiter geht die Reise.';
    }

    return 'Alle Paare liegen. Weiter geht die Reise.';
  });

  /** Vor dieser Aufgabe abgeschlossene Aufgaben — der Kopf zeigt daraus die Punkte. */
  protected readonly stepDone = this.run.scoredCount;
  protected readonly stepTotal = this.run.scoredTotal;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.wrongTimeout));
  }

  protected pickImage(pairIndex: number): void {
    if (this.isLocked(pairIndex)) {
      return;
    }

    this.clearWrongAttempt();

    const chosenWord = this.selectedWord();

    if (chosenWord === null) {
      this.selectedImage.set(pairIndex);

      return;
    }

    this.resolveAttempt(pairIndex, chosenWord);
  }

  protected pickWord(pairIndex: number): void {
    if (this.isLocked(pairIndex)) {
      return;
    }

    this.clearWrongAttempt();

    const chosenImage = this.selectedImage();

    if (chosenImage === null) {
      this.selectedWord.set(pairIndex);

      return;
    }

    this.resolveAttempt(chosenImage, pairIndex);
  }

  protected finish(): void {
    if (!this.solved()) {
      return;
    }

    this.narration.stop();
    this.run.finish({ kind: 'scored', correctFirstTry: this.mistakeCount() === 0 });
  }

  /** Beide Tipps liegen vor: Passen sie zusammen, bleibt das Paar liegen, sonst geht es auf. */
  private resolveAttempt(imagePairIndex: number, wordPairIndex: number): void {
    this.selectedImage.set(null);
    this.selectedWord.set(null);

    if (imagePairIndex === wordPairIndex) {
      this.matchedPairs.update((matched: readonly number[]) => [...matched, imagePairIndex]);

      return;
    }

    this.mistakeCount.update((count: number) => count + 1);
    this.wrongAttempt.set({ image: imagePairIndex, word: wordPairIndex });

    clearTimeout(this.wrongTimeout);
    this.wrongTimeout = setTimeout(() => this.wrongAttempt.set(null), WRONG_FEEDBACK_MS);
  }

  private clearWrongAttempt(): void {
    clearTimeout(this.wrongTimeout);
    this.wrongAttempt.set(null);
  }

  private isLocked(pairIndex: number): boolean {
    return this.solved() || this.matchedPairs().includes(pairIndex);
  }

  private slotState(
    pairIndex: number,
    selectedPairIndex: number | null,
    wrongPairIndex: number | null,
  ): SlotState {
    if (this.matchedPairs().includes(pairIndex)) {
      return 'matched';
    }

    if (pairIndex === wrongPairIndex) {
      return 'wrong';
    }

    if (pairIndex === selectedPairIndex) {
      return 'selected';
    }

    return 'open';
  }

  /** Gelegte Paare tragen beidseitig dieselbe Nummer — der Zustand hängt nie allein an der Farbe. */
  private pairBadge(pairIndex: number): string | null {
    const position = this.matchedPairs().indexOf(pairIndex);

    if (position === -1) {
      return null;
    }

    return String(position + 1);
  }
}

/** Fassung des Zustands für Screenreader — offene Karten sagen nichts dazu. */
function stateLabelFor(state: SlotState, badge: string | null): string | null {
  if (state === 'matched') {
    return `Zugeordnet als Paar ${badge}`;
  }

  if (state === 'selected') {
    return 'Ausgewählt';
  }

  if (state === 'wrong') {
    return 'Passt nicht zusammen';
  }

  return null;
}
