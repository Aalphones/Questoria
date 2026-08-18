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
  signal,
  untracked,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';

import {
  Achievement,
  DialogConfig,
  Episode,
  EpisodeEvent,
  EventFile,
  EventType,
  WorldConfig,
} from '../../models/content.types';
import { EventContext } from '../../models/event-runtime.types';
import { LoadState, StoredRun } from '../../models/game-state.types';
import { evaluate } from '../../services/achievement.rules';
import { AchievementService } from '../../services/achievement.service';
import { ContentService } from '../../services/content.service';
import { GameStateService } from '../../services/game-state.service';
import { ProgressService } from '../../services/progress.service';
import { RunStoreService } from '../../services/run-store.service';
import { ContentError } from '../../ui/content-error/content-error';
import { Hud } from '../../ui/hud/hud';
import { ImageSlot } from '../../ui/image-slot/image-slot';
import { Result } from '../result/result';
import { EpisodeRun } from './episode-run';
import { SCORED_EVENT_TYPES, assertPlayableConfig, loadEventComponent } from './event-type-map';
import { eventRefOf, resolveEventConfig } from './resolve-event-config';
import { ResumePrompt } from './resume-prompt/resume-prompt';
import { starsForRun } from './star-rules';

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
  imports: [NgComponentOutlet, Hud, ContentError, ImageSlot, Result, ResumePrompt],
  templateUrl: './episode.html',
  styleUrl: './episode.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EpisodeRun],
})
export class EpisodeScreen {
  private readonly content = inject(ContentService);
  private readonly gameState = inject(GameStateService);
  private readonly progressService = inject(ProgressService);
  private readonly achievementService = inject(AchievementService);
  private readonly runStore = inject(RunStoreService);
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
    const themeId = this.themeId();
    const episodeId = this.episodeId();

    untracked(() => {
      this.run.configure(themeId, episodeId);
      this.run.restart();
      this.newAchievements.set([]);
    });
  });

  /**
   * Angefangener Lauf im Browser-Speicher — `null` sobald die Entscheidung
   * gefallen ist oder gar keiner passt. Solange er gesetzt ist, zeigt das
   * Template den Dialog statt der Bühne (Plan Phase 6, AK 3/5).
   */
  protected readonly pendingResume = signal<StoredRun | null>(null);

  /**
   * Prüft einmal je Episodenladen, ob ein passender angefangener Lauf
   * existiert. Ein Eintrag zu einer anderen Episode bleibt unangetastet — er
   * gehört dorthin und wird erst durch deren eigenes Speichern überschrieben.
   */
  private readonly checkForResumableRun = effect(() => {
    const episode = this.loadedEpisode();
    const themeId = this.themeId();
    const episodeId = this.episodeId();

    if (episode === null) {
      return;
    }

    untracked(() => {
      const stored = this.runStore.load();

      if (stored === null || stored.themeId !== themeId || stored.episodeId !== episodeId) {
        return;
      }

      const isResumable = stored.eventIndex > 0 && stored.eventIndex < episode.events.length;

      if (isResumable) {
        this.pendingResume.set(stored);
        return;
      }

      // Beschädigt oder veraltet (Episode leer/schon durch) — still verwerfen (Plan AK 7).
      this.runStore.clear();
    });
  });

  /** Die Eventliste ist durch — der Episoden-Screen zeigt ab hier den Ergebnis-Screen statt der Bühne. */
  protected readonly isEpisodeFinished = computed<boolean>(() => {
    const episode = this.loadedEpisode();

    return episode !== null && this.run.eventIndex() >= episode.events.length;
  });

  /**
   * Summe der Dialogzeilen aller `dialog`-Events der Episode — die einzige
   * Stelle, an der das Gerüst einen Eventtyp beim Namen nennt. Es ist eine
   * Statistik über den Content, keine Ablaufsteuerung, und fällt weg, sobald
   * Meilenstein 4 echte Statistiken führt.
   */
  protected readonly dialogLineCount = computed<number>(() =>
    (this.loadedEpisode()?.events ?? [])
      .filter((event: EpisodeEvent): boolean => event.type === 'dialog')
      .reduce((sum: number, event: EpisodeEvent) => sum + (event.config as DialogConfig).lines.length, 0),
  );

  protected readonly timelineLink = computed<readonly string[]>(() => [
    '/theme',
    this.themeId(),
    'timeline',
  ]);

  /** Eingaben für den Ergebnis-Screen — der rechnet nicht selbst (Plan AK 13). */
  protected readonly resultCorrectFirstTry = this.run.correctFirstTryCount;
  protected readonly resultScoredTotal = this.run.scoredTotal;
  protected readonly resultStars = computed<number>(() =>
    starsForRun(this.run.scoredCount(), this.run.correctFirstTryCount()),
  );

  /**
   * Neu erreichte Erfolge dieses Laufs — wandern an die Pille im
   * Ergebnis-Screen (Plan Phase 7, Checkliste). Leer, solange nichts fällig
   * wurde oder die Welt keine Erfolge kennt.
   */
  protected readonly newAchievements = signal<readonly Achievement[]>([]);

  /** Schreibt den Fortschritt genau einmal, sobald die Eventliste durch ist. */
  private readonly completeWhenFinished = effect(() => {
    if (!this.isEpisodeFinished()) {
      return;
    }

    const stars = this.resultStars();
    const world = this.world();
    const themeId = this.themeId();
    const episodeId = this.episodeId();

    untracked(() => {
      // Der angefangene Lauf ist durchgespielt — vor dem Ergebnis-Screen weg (Plan AK 6).
      this.runStore.clear();
      this.progressService.completeEpisode(themeId, episodeId, stars);
      this.evaluateAchievements(world, themeId);
    });
  });

  /** „Weiterspielen": Lauf auf den gemerkten Stand setzen, Eintrag ist damit verbraucht. */
  protected resumeStoredRun(stored: StoredRun): void {
    this.run.startAt(stored.eventIndex, stored.scoredCount, stored.correctFirstTryCount);
    this.runStore.clear();
    this.pendingResume.set(null);
  }

  /** „Von vorn anfangen": Der Lauf steht bereits bei Event 0 (`resetOnEpisodeChange`), nur der Eintrag muss weg. */
  protected discardStoredRun(): void {
    this.runStore.clear();
    this.pendingResume.set(null);
  }

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

  /**
   * Wertet die Erfolge der Welt gegen den (bereits geschriebenen) Fortschritt
   * aus und schaltet neu erfüllte frei. Läuft nach `progressService.store()`
   * synchron nach — der Spielstand-Spiegel ist ein Signal, das bereits den
   * neuen Stand trägt (Plan Phase 7, AK 1/7).
   */
  private evaluateAchievements(world: WorldConfig | null, themeId: string): void {
    if (world === null || world.achievements === undefined || world.achievements.length === 0) {
      return;
    }

    const themeProgress = this.progressService.store()[themeId] ?? {};
    const satisfiedKeys = evaluate(world.achievements, world, themeProgress);
    const newKeys = satisfiedKeys.filter(
      (key: string) => !this.achievementService.isUnlocked(themeId, key),
    );

    for (const key of newKeys) {
      this.achievementService.unlock(themeId, key);
    }

    this.newAchievements.set(
      world.achievements.filter((achievement: Achievement) => newKeys.includes(achievement.key)),
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
