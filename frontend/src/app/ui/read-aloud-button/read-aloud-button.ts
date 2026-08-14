import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { NarrationService } from '../../services/narration.service';

/**
 * Runder Vorlese-Knopf. Ruft `NarrationService.speak()` mit dem übergebenen
 * Text auf — lädt selbst nichts nach, kennt keine Routen.
 */
@Component({
  selector: 'qst-read-aloud-button',
  imports: [],
  templateUrl: './read-aloud-button.html',
  styleUrl: './read-aloud-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadAloudButton {
  private readonly narration = inject(NarrationService);

  readonly text = input.required<string>();
  readonly audioUrl = input<string>();

  protected readonly soundOn = this.narration.soundOn;

  protected handleClick(): void {
    this.narration.speak(this.text(), this.audioUrl());
  }
}
