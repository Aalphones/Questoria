import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ResourceLoaderParams,
  Type,
  computed,
  effect,
  inject,
  input,
  resource,
  untracked,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';

import { Episode, EpisodeEvent, EventFile, EventType, WorldConfig } from '../../models/content.types';
import { EventContext } from '../../models/event-runtime.types';
import { LoadState } from '../../models/game-state.types';
import { ContentService } from '../../services/content.service';
import { GameStateService } from '../../services/game-state.service';
import { ProgressService } from '../../services/progress.service';
import { ContentError } from '../../ui/content-error/content-error';
import { Hud } from '../../ui/hud/hud';
import { ImageSlot } from '../../ui/image-slot/image-slot';
import { EpisodeRun } from './episode-run';
import { SCORED_EVENT_TYPES, assertPlayableConfig, loadEventComponent } from './event-type-map';
import { eventRefOf, resolveEventConfig } from './resolve-event-config';

/** Sterne, bis Phase 5 den Ergebnis-Screen und die echte Bewertung bringt. */
const PLACEHOLDER_STARS = 3;

/**
 * Das Ablauf-Gerüst unter `theme/:themeId/episode/:episodeId`: Es lädt die
 * Episode, spielt ihre Eventliste strikt der Reihe nach ab und setzt pro Event
 * die passende Komponente ein ([ADR-004](../../../../../docs/decisions/004-event-engine.md)).
 * Welcher Eventtyp gerade läuft, weiß es nicht — die Zuordnung steht allein in
 * `event-type-map.ts`.
 *
 * Heißt `EpisodeScreen`, nicht `Episode` — der Name würde sonst den
 * gleichnamigen Content-Typ verdecken, den diese Klasse selbst braucht (gleiche
 * Begründung wie bei `MapScreen`).
 */
@Component({
  selector: 'qst-episode',
  imports: [NgComponentOutlet, Hud, ContentError, ImageSlot],
  templateUrl: './episode.html',
  styleUrl: './episode.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EpisodeRun],
})
export class EpisodeScreen {
  private readonly content = inject(ContentService);
  private readonly gameState = inject(GameStateService);
  private readonly progressService = inject(ProgressService);
  private readonly router = inject(Router);
  private readonly run = inject(EpisodeRun);

  readonly themeId = input.required<string>();
  readonly episodeId = input.required<string>();
  readonly world = input<WorldConfig | null>(null);

  /** Zurück führt auf die Ortskarte, aus der die Episode gestartet wurde (Design: `dialog→map`). */
  protected readonly mapBackLink = computed<readonly string[]>(() => {
    const mapId = this.mapIdOfEpisode();

    if (mapId === null) {
      return ['/theme', this.themeId(), 'timeline'];
    }

    return ['/theme', this.themeId(), 'map', mapId];
  });

  /** Anzeigename des Orts — der Node-Name, nicht die Episode (die kennt keinen eigenen Namen). */
  protected readonly locationName = computed<string | null>(() => {
    for (const map of this.world()?.maps ?? []) {
      const node = map.nodes.find((entry) => entry.episode_ref === this.episodeId());

      if (node !== undefined) {
        return node.name;
      }
    }

    return null;
  });

  /** `themeId`/`episodeId` sind Pflicht-Inputs, erst zur Laufzeit gesetzt — der HTTP-Aufruf
   * muss also reagieren, statt sie im Feld-Initialisierer direkt zu lesen. */
  private readonly episodeRequest = computed(() => ({
    themeId: this.themeId(),
    episodeId: this.episodeId(),
  }));

  protected readonly episodeState = toSignal(
    toObservable(this.episodeRequest).pipe(
      switchMap(({ themeId, episodeId }: { themeId: string; episodeId: string }) =>
        asLoadState(this.content.getEpisode(themeId, episodeId)),
      ),
    ),
    { initialValue: { status: 'loading' } as LoadState<Episode> },
  );

  protected readonly backgroundUrl = computed<string | null>(() => {
    const episode = this.loadedEpisode();

    return episode === null
      ? null
      : this.content.assetUrl(this.themeId(), 'backgrounds', episode.background);
  });

  protected readonly backgroundLabel = computed<string>(() => this.loadedEpisode()?.background ?? '');

  /** Das Event, das gerade läuft — `null`, sobald die Eventliste durch ist. */
  protected readonly currentEvent = computed<EpisodeEvent | null>(
    () => this.loadedEpisode()?.events[this.run.eventIndex()] ?? null,
  );

  /**
   * Lädt die Komponente zum laufenden Eventtyp. Ein Typ ohne Eintrag in der
   * Tabelle landet im Fehlerzustand — das Template zeigt dann die Meldung
   * statt einer leeren Bühne.
   */
  protected readonly eventComponent = resource<Type<unknown>, EventType | undefined>({
    // Ohne laufendes Event bleibt die Ressource untätig — Angular ruft den
    // Loader nur auf, wenn `params` einen Wert liefert.
    params: (): EventType | undefined => this.currentEvent()?.type,
    loader: ({ params }: ResourceLoaderParams<EventType | undefined>): Promise<Type<unknown>> =>
      loadEventComponent(params),
  });

  private readonly eventConfigRequest = computed<EventConfigRequest>(() => ({
    event: this.currentEvent(),
    themeId: this.themeId(),
    difficultyLevelId: this.gameState.activeDifficultyLevel() ?? '',
  }));

  /**
   * Die fertige Konfiguration des laufenden Events: inline direkt aus der
   * Episode, ausgelagert über `config.ref` nachgeladen und auf die aktive
   * Lernstufe aufgelöst. Solange geladen wird, zeigt die Bühne denselben
   * Zwischenzustand wie beim Episodenladen.
   */
  protected readonly eventConfigState = toSignal(
    toObservable(this.eventConfigRequest).pipe(
      switchMap((request: EventConfigRequest) => this.loadEventConfig(request)),
    ),
    { initialValue: { status: 'loading' } as LoadState<unknown> },
  );

  /** Ein Wechsel des Events erzeugt eine neue Bühne — sonst spielt die alte Komponente mit neuen Daten weiter. */
  protected readonly eventSlot = computed<readonly number[]>(() => [this.run.eventIndex()]);

  protected readonly eventErrorMessage = computed<string | null>(() => {
    if (this.eventComponent.error() !== undefined) {
      return 'Dieses Ereignis kennt die App noch nicht — geh über „Zurück“ auf die Karte.';
    }

    if (this.eventConfigState().status === 'error') {
      return 'Dieses Ereignis konnte nicht geladen werden — geh über „Zurück“ auf die Karte.';
    }

    return null;
  });

  protected readonly eventInputs = computed<Record<string, unknown>>(() => {
    const state = this.eventConfigState();

    return {
      config: state.status === 'loaded' ? state.data : null,
      context: this.eventContext(),
    };
  });

  /** Ohne gewählte Lernstufe kommt der Screen gar nicht erst zustande — dafür sorgt der Guard. */
  private readonly eventContext = computed<EventContext>(() => ({
    themeId: this.themeId(),
    difficultyLevelId: this.gameState.activeDifficultyLevel() ?? '',
  }));

  /**
   * Wie viele Aufgaben diese Episode hat — die Aufgaben-Karte zeigt daraus ihre
   * Fortschrittspunkte. Welche Typen bewertet werden, weiß allein die Typ-Tabelle.
   */
  private readonly trackScoredTotal = effect(() => {
    const episode = this.loadedEpisode();
    const scoredEvents = (episode?.events ?? []).filter((event: EpisodeEvent) =>
      SCORED_EVENT_TYPES.has(event.type),
    );

    untracked(() => this.run.scoredTotal.set(scoredEvents.length));
  });

  /** Eine andere Episode heißt ein neuer Lauf — die Route lässt den Screen sonst stehen. */
  private readonly resetOnEpisodeChange = effect(() => {
    this.episodeId();
    untracked(() => this.run.restart());
  });

  /**
   * Zwischenstand bis Phase 5: Nach dem letzten Event gibt es pauschal drei
   * Sterne und den Rückweg auf die Ortskarte. Ergebnis-Screen und echte
   * Bewertung aus `EpisodeRun` kommen dort.
   */
  private readonly completeWhenFinished = effect(() => {
    const episode = this.loadedEpisode();

    if (episode === null || this.run.eventIndex() < episode.events.length) {
      return;
    }

    untracked(() => {
      this.progressService.completeEpisode(this.themeId(), this.episodeId(), PLACEHOLDER_STARS);
      void this.router.navigate(['/theme', this.themeId(), 'map', episode.active_map_id]);
    });
  });

  /**
   * Inline-Events sind sofort da, ausgelagerte kommen über die
   * Content-Schnittstelle. Beide Wege enden in derselben Prüfung: passt die
   * Konfiguration nicht zum Eventtyp, landet das Event im Fehlerpfad statt als
   * leere Aufgabe auf der Bühne.
   */
  private loadEventConfig(request: EventConfigRequest): Observable<LoadState<unknown>> {
    const event = request.event;

    if (event === null) {
      return of({ status: 'loaded', data: null });
    }

    const ref = eventRefOf(event.config);

    if (ref === null) {
      return asLoadState(
        of(event.config).pipe(
          map((config: unknown): unknown => {
            assertPlayableConfig(event.type, config);

            return config;
          }),
        ),
      );
    }

    return asLoadState(
      this.content.getEvent(request.themeId, ref).pipe(
        map((eventFile: EventFile): unknown => {
          const config = resolveEventConfig(
            event.config,
            eventFile,
            event.type,
            request.difficultyLevelId,
          );
          assertPlayableConfig(event.type, config);

          return config;
        }),
      ),
    );
  }

  private loadedEpisode(): Episode | null {
    const state = this.episodeState();

    return state.status === 'loaded' ? state.data : null;
  }

  private mapIdOfEpisode(): string | null {
    const world = this.world();
    const mapId = world?.maps.find((map) =>
      map.nodes.some((node) => node.episode_ref === this.episodeId()),
    )?.id;

    return mapId ?? null;
  }
}

/** Woraus die Konfiguration des laufenden Events entsteht. */
interface EventConfigRequest {
  readonly event: EpisodeEvent | null;
  readonly themeId: string;
  readonly difficultyLevelId: string;
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
