import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';

/**
 * Bildfläche mit beschriftetem Platzhalter, wenn die Datei fehlt.
 *
 * Das Fehler-Ereignis des Bildes ist die einzige verlässliche Quelle: Das
 * Hosting-Paket beantwortet fehlende Dateien mit `200` und einer HTML-Seite,
 * ein Vorab-Check über den Statuscode würde also nichts finden.
 */
@Component({
  selector: 'qst-image-slot',
  imports: [NgOptimizedImage],
  templateUrl: './image-slot.html',
  styleUrl: './image-slot.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageSlot {
  readonly src = input<string | null>(null);
  /** Text im Platzhalter — üblicherweise der erwartete Dateiname. */
  readonly label = input.required<string>();

  /** Wechselt `src`, beginnt der Fehlerzustand wieder bei „noch kein Fehler". */
  readonly failed = linkedSignal<string | null, boolean>({
    source: this.src,
    computation: () => false,
  });

  /** Adresse, solange sie geladen werden kann — sonst `null` für den Platzhalter. */
  readonly imageUrl = computed<string | null>(() => {
    const source = this.src();

    if (source === null || source.length === 0 || this.failed()) {
      return null;
    }

    return source;
  });

  markFailed(): void {
    this.failed.set(true);
  }
}
