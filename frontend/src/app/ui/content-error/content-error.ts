import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Meldung, wenn Welt oder Ort nicht geladen werden konnten — Screen bleibt
 * verständlich statt leerer Seite oder Konsolenfehler. Wird von Etappenkarte,
 * Ortskarte und Ort benutzt.
 */
@Component({
  selector: 'qst-content-error',
  imports: [RouterLink],
  templateUrl: './content-error.html',
  styleUrl: './content-error.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentError {
  readonly message = input.required<string>();
}
