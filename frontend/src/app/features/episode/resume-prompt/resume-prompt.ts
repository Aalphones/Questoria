import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  output,
  untracked,
  viewChild,
} from '@angular/core';

import { ContentService } from '../../../services/content.service';
import { NarrationService } from '../../../services/narration.service';

/** Die Ansage ist ein fester Engine-Satz, keine Content-Zeile — eine Aufnahme reicht für jede Welt. */
const QUESTION_AUDIO_FILE = 'erzaehler_resume_prompt.mp3';

const QUESTION = 'Du warst hier schon mittendrin! Willst du weiterspielen oder von vorn anfangen?';

/**
 * Fragt beim Wiedereintritt in eine angefangene Episode, ob es weitergehen
 * soll (Plan Phase 6, AK 3). Eigene Komponente statt Markup in `episode.html`
 * — der Screen ist ohnehin die komplexeste Datei des Features.
 *
 * Öffnet sich selbst per `showModal()`, sobald sie eingesetzt wird — das
 * Elterngerüst entscheidet nur, *ob* sie erscheint (`@if`), nicht *wie* sie
 * sich öffnet. Schließt sich nicht durch Klick daneben oder Escape: beide
 * Antworten sind Entscheidungen, keine hat den Rang eines „Abbrechen“.
 */
@Component({
  selector: 'qst-resume-prompt',
  templateUrl: './resume-prompt.html',
  styleUrl: './resume-prompt.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumePrompt {
  private readonly content = inject(ContentService);
  private readonly narration = inject(NarrationService);

  readonly resumeRun = output<void>();
  readonly restartRun = output<void>();

  protected readonly question = QUESTION;
  protected readonly questionAudioUrl = this.content.engineAudioUrl(QUESTION_AUDIO_FILE);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /** Öffnet den Dialog und liest die Frage im Vorlesemodus automatisch vor — wie jeder Story-Text. */
  private readonly openAndSpeak = effect(() => {
    untracked(() => {
      this.dialog().nativeElement.showModal();

      if (this.narration.mode() === 'listen') {
        this.narration.speak(QUESTION, this.questionAudioUrl);
      }
    });
  });

  protected chooseResume(): void {
    this.narration.stop();
    this.resumeRun.emit();
  }

  protected chooseRestart(): void {
    this.narration.stop();
    this.restartRun.emit();
  }

  /** Fängt Escape ab — der native `cancel`-Event würde sonst ohne Entscheidung schließen. */
  protected preventCancel(event: Event): void {
    event.preventDefault();
  }
}
