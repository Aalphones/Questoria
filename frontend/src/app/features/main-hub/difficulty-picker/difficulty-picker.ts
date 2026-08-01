import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { DifficultyLevel } from '../../../models/content.types';

/** Reine Darstellung — die Lernstufen einer Welt zur Auswahl. */
@Component({
  selector: 'qst-difficulty-picker',
  imports: [],
  templateUrl: './difficulty-picker.html',
  styleUrl: './difficulty-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DifficultyPicker {
  readonly levels = input.required<DifficultyLevel[]>();
  readonly selectedLevelId = input<string | null>(null);
  readonly chosen = output<string>();

  /** Erklärt Eltern und Kind, was die Lernstufe überhaupt ändert. */
  protected readonly explanation =
    'Die Lernstufe bestimmt den Schwierigkeitsgrad der Aufgaben — Story und Charaktere bleiben für alle gleich.';
}
