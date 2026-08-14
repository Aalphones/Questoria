import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';

import { Episode, WorldConfig } from '../../models/content.types';
import { LoadState } from '../../models/game-state.types';
import { ContentService } from '../../services/content.service';
import { ProgressService } from '../../services/progress.service';
import { ContentError } from '../../ui/content-error/content-error';
import { Hud } from '../../ui/hud/hud';
import { ImageSlot } from '../../ui/image-slot/image-slot';

/** Wie viele Sterne der Ort-Platzhalter vergibt — echte Bewertung kommt mit der Event Engine (Meilenstein 3). */
const PLACEHOLDER_STARS = 3;

/**
 * Der Ort selbst, als ehrlicher Platzhalter unter `theme/:themeId/location/:episodeId`.
 * Zeigt, dass die Episoden-Schnittstelle trägt — die Event Engine, die hier die
 * Eventliste abspielt, kommt erst mit Meilenstein 3.
 */
@Component({
  selector: 'qst-location',
  imports: [Hud, ContentError, ImageSlot],
  templateUrl: './location.html',
  styleUrl: './location.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Location {
  private readonly content = inject(ContentService);
  private readonly progressService = inject(ProgressService);
  private readonly router = inject(Router);

  readonly themeId = input.required<string>();
  readonly episodeId = input.required<string>();
  readonly world = input<WorldConfig | null>(null);

  /** Zurück führt auf die Ortskarte, die diesen Ort zeigt (Design: `dialog→map`). */
  readonly mapBackLink = computed<readonly string[]>(() => {
    const world = this.world();
    const mapId = world?.maps.find((map) =>
      map.nodes.some((node) => node.episode_ref === this.episodeId()),
    )?.id;

    if (mapId === undefined) {
      return ['/theme', this.themeId(), 'timeline'];
    }

    return ['/theme', this.themeId(), 'map', mapId];
  });

  /** Anzeigename des Orts — der Node-Name, nicht die Episode (die kennt keinen eigenen Namen). */
  readonly locationName = computed<string | null>(() => {
    const world = this.world();

    for (const map of world?.maps ?? []) {
      const node = map.nodes.find((entry) => entry.episode_ref === this.episodeId());

      if (node !== undefined) {
        return node.name;
      }
    }

    return null;
  });

  /** `themeId`/`episodeId` sind Pflicht-Inputs, erst zur Laufzeit gesetzt — der HTTP-Aufruf
   * muss also reagieren, statt sie im Feld-Initialisierer direkt zu lesen. */
  private readonly episodeRequest = computed(() => ({ themeId: this.themeId(), episodeId: this.episodeId() }));

  readonly episodeState = toSignal(
    toObservable(this.episodeRequest).pipe(
      switchMap(({ themeId, episodeId }) => asLoadState(this.content.getEpisode(themeId, episodeId))),
    ),
    { initialValue: { status: 'loading' } as LoadState<Episode> },
  );

  readonly backgroundUrl = computed<string | null>(() => {
    const state = this.episodeState();

    return state.status === 'loaded' ? this.content.assetUrl(this.themeId(), 'backgrounds', state.data.background) : null;
  });

  completeLocation(): void {
    const state = this.episodeState();

    if (state.status !== 'loaded') {
      return;
    }

    this.progressService.completeEpisode(this.themeId(), this.episodeId(), PLACEHOLDER_STARS);
    void this.router.navigate(['/theme', this.themeId(), 'map', state.data.active_map_id]);
  }
}

/** Verpackt einen HTTP-Aufruf in den Ladezustand, den die Templates lesen. */
function asLoadState<T>(source: Observable<T>): Observable<LoadState<T>> {
  return source.pipe(
    map((data: T): LoadState<T> => ({ status: 'loaded', data })),
    startWith({ status: 'loading' } as LoadState<T>),
    catchError((error: unknown): Observable<LoadState<T>> => {
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';

      return of({ status: 'error', message });
    }),
  );
}
