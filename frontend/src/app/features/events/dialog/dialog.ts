import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';

import { DialogConfig, DialogueLine } from '../../../models/content.types';
import { EventContext } from '../../../models/event-runtime.types';
import { ContentService } from '../../../services/content.service';
import { NarrationService } from '../../../services/narration.service';
import { ImageSlot } from '../../../ui/image-slot/image-slot';
import { ReadAloudButton } from '../../../ui/read-aloud-button/read-aloud-button';
import { EpisodeRun } from '../../episode/episode-run';
import { StageFigure } from './dialog.types';

/**
 * Eventtyp `dialog`: zwei Figuren reden, eine Zeile nach der anderen. Bühne mit
 * genau zwei Plätzen (`left`/`right`, Critical Rule 3), Textbox als
 * „Weiter"-Fläche.
 *
 * Eine Event-Komponente wie jede andere: Sie bekommt ihre Konfiguration, spielt
 * sie und meldet über `EpisodeRun.finish()` Vollzug. Sie lädt nichts nach,
 * kennt keine Route und schreibt keinen Fortschritt.
 */
@Component({
  selector: 'qst-dialog',
  imports: [ImageSlot, ReadAloudButton],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dialog {
  private readonly content = inject(ContentService);
  private readonly narration = inject(NarrationService);
  private readonly run = inject(EpisodeRun);

  readonly config = input.required<DialogConfig>();
  readonly context = input.required<EventContext>();

  private readonly lineIndex = signal(0);

  private readonly lines = computed<readonly DialogueLine[]>(() => this.config().lines);

  protected readonly currentLine = computed<DialogueLine | null>(
    () => this.lines()[this.lineIndex()] ?? null,
  );

  protected readonly lineNumber = computed<number>(() => this.lineIndex() + 1);
  protected readonly lineCount = computed<number>(() => this.lines().length);

  /** Angezeigt wird die Fassung, die zum Modus passt — im Vorlesemodus die kurze. */
  protected readonly lineText = computed<string>(() => {
    const line = this.currentLine();

    return line === null ? '' : this.narration.textFor(line.text, line.text_simple);
  });

  protected readonly speakerName = computed<string>(() => this.currentLine()?.name ?? '');

  protected readonly isSpeakingLeft = computed<boolean>(() => this.currentLine()?.position === 'left');
  protected readonly isSpeakingRight = computed<boolean>(
    () => this.currentLine()?.position === 'right',
  );

  protected readonly leftFigure = computed<StageFigure | null>(() => this.figureAt('left'));
  protected readonly rightFigure = computed<StageFigure | null>(() => this.figureAt('right'));

  /** Aufnahme, falls die Zeile eine mitbringt — sonst spricht die Computerstimme. */
  protected readonly audioUrl = computed<string | undefined>(() => {
    const audioPath = this.currentLine()?.audio_path;

    // audio_path trägt bereits den vollen Unterpfad ("audio/voices/…") —
    // assetUrl() mit demselben Ordner nochmal davor ergäbe einen doppelten,
    // nicht existierenden Pfad.
    return audioPath === undefined
      ? undefined
      : this.content.themeAssetUrl(this.context().themeId, audioPath);
  });

  /**
   * Jede neue Zeile wird im Vorlesemodus von allein gesprochen; ein
   * Zeilenwechsel bricht die vorherige Ausgabe ab. Der Modus selbst ist bewusst
   * keine Abhängigkeit — sonst würde ein Umschalten mitten im Satz neu vorlesen.
   */
  private readonly speakCurrentLine = effect(() => {
    const line = this.currentLine();

    untracked(() => {
      this.narration.stop();

      if (line === null || this.narration.mode() !== 'listen') {
        return;
      }

      this.narration.speak(this.narration.textFor(line.text, line.text_simple), this.audioUrl());
    });
  });

  protected next(): void {
    if (this.lineNumber() < this.lineCount()) {
      this.lineIndex.update((index: number) => index + 1);
      return;
    }

    this.narration.stop();
    this.run.finish({ kind: 'story' });
  }

  /** Wer auf einem Platz steht: die zuletzt gespielte Zeile dieser Seite belegt ihn. */
  private figureAt(position: DialogueLine['position']): StageFigure | null {
    const lines = this.lines();

    for (let index = this.lineIndex(); index >= 0; index -= 1) {
      const line = lines[index];

      if (line !== undefined && line.position === position) {
        return {
          name: line.name,
          sprite: line.sprite,
          spriteUrl: this.content.assetUrl(this.context().themeId, 'sprites', line.sprite),
        };
      }
    }

    return null;
  }
}
