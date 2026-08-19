import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { DifficultyLevel } from '../../../models/content.types';
import { ContentService } from '../../../services/content.service';
import { ImageSlot } from '../../../ui/image-slot/image-slot';

/** Ordner unter der Welt, in dem die Bilder der Lernstufen liegen (ADR-018). */
const LEVEL_IMAGE_FOLDER = 'levels';

/** Eine Stufe, fertig für die Anzeige — Rohdaten plus Rang, Farbstufe und Bildadresse. */
interface LevelCard {
  id: string;
  label: string;
  description: string | null;
  imageUrl: string | null;
  imageLabel: string;
  /** Position in der Reihenfolge, 1-basiert — so viele Punkte leuchten. */
  rank: number;
  /** Ein Eintrag je Punkt auf der Karte, 1-basiert. */
  pips: number[];
  /** Farbstufe aus den Zweck-Tokens; ab der vierten Stufe `rest`. */
  tier: string;
}

/** Wie viele Farbstufen die Tokens hergeben — darüber greift die neutrale Fläche. */
const TIER_COUNT = 3;

/**
 * Reine Darstellung — die Lernstufen einer Welt als Auswahlkarten.
 *
 * Nennt eine Stufe ein Bild, steht es oben auf der Karte; nennt sie keins,
 * bleibt die Karte ohne Bildfläche. Die Reihenfolge der Schwierigkeit hängt nie
 * am Bild und nie allein an der Farbe, sondern an den Punkten unter dem Namen
 * (ADR-018).
 */
@Component({
  selector: 'qst-difficulty-picker',
  imports: [ImageSlot],
  templateUrl: './difficulty-picker.html',
  styleUrl: './difficulty-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DifficultyPicker {
  private readonly content = inject(ContentService);

  readonly themeId = input.required<string>();
  readonly levels = input.required<DifficultyLevel[]>();
  readonly selectedLevelId = input<string | null>(null);
  readonly chosen = output<string>();

  /** Erklärt Eltern und Kind, was die Lernstufe überhaupt ändert. */
  protected readonly explanation =
    'Die Lernstufe bestimmt den Schwierigkeitsgrad der Aufgaben — Story und Charaktere bleiben für alle gleich.';

  protected readonly cards = computed<LevelCard[]>(() => {
    const levels: DifficultyLevel[] = this.levels();
    const themeId: string = this.themeId();
    const pips: number[] = levels.map((_level: DifficultyLevel, index: number) => index + 1);

    return levels.map((level: DifficultyLevel, index: number) => {
      const rank: number = index + 1;

      return {
        id: level.id,
        label: level.label,
        description: level.description ?? null,
        imageUrl:
          level.image === undefined
            ? null
            : this.content.assetUrl(themeId, LEVEL_IMAGE_FOLDER, level.image),
        imageLabel: level.image_label ?? '',
        rank,
        pips,
        tier: rank <= TIER_COUNT ? String(rank) : 'rest',
      };
    });
  });
}
