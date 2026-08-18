import { Service, inject, signal } from '@angular/core';

import { EventOutcome } from '../../models/event-runtime.types';
import { RunStoreService } from '../../services/run-store.service';

/**
 * Der Stand des laufenden Durchgangs durch eine Episode: an welchem Event er
 * steht und wie viele bewertete Events beim ersten Versuch saßen.
 *
 * Wird von `EpisodeScreen` bereitgestellt, **nicht** global — jeder Besuch
 * einer Episode bekommt einen frischen Lauf. Die Event-Komponenten kennen von
 * ihrer Umgebung nur diesen Dienst und melden über `finish()` Vollzug.
 */
/** Ein Zeitabschnitt ohne Ereignis über dieser Dauer zählt nur mit dieser Dauer (Plan Phase 8, AK 4). */
const MAX_GAP_MS = 5 * 60 * 1000;

@Service()
export class EpisodeRun {
  private readonly runStore = inject(RunStoreService);

  /** Für welche Episode dieser Lauf gerade steht — gesetzt von `EpisodeScreen`, nötig um den Fortschritt zuzuordnen (Phase 6). */
  private themeId = '';
  private episodeId = '';

  /**
   * Kennung dieses Laufs — frisch bei jeder Instanz, also bei jedem Besuch
   * der Episode neu (Plan Phase 8, Checkliste). Schützt die Statistik vor
   * Doppelzählung, wenn derselbe abgeschlossene Lauf nach totem Server
   * erneut auf die Reise geht.
   */
  readonly runId = crypto.randomUUID();

  /** Position in `Episode.events` — steht der Index hinter dem letzten Event, ist die Episode durch. */
  readonly eventIndex = signal(0);
  /** Wie viele bewertete Events (Aufgaben) bisher gespielt wurden. */
  readonly scoredCount = signal(0);
  /** Wie viele bewertete Events die Episode insgesamt hat — gesetzt vom Episoden-Screen. */
  readonly scoredTotal = signal(0);
  /** Davon beim ersten Versuch richtig — die Grundlage der Sternenformel (Phase 5). */
  readonly correctFirstTryCount = signal(0);
  /**
   * `card_id` aus einem gespielten `reward`-Event, `null` ohne eine — gemerkt,
   * nicht verwendet. Meilenstein 5 hängt hier die echte Kartenvergabe an.
   */
  readonly pendingCardId = signal<string | null>(null);

  /** Zeitstempel des zuletzt abgeschlossenen Events — Grundlage der Spielzeit-Messung. */
  private lastEventAt: number | null = null;
  /** Summe der Abstände zwischen den Events, gedeckelt (Plan Phase 8, AK 4). */
  readonly playtimeMs = signal(0);

  /** Hält den Statistik-Versand davon ab, sich bei einem erneuten Effekt-Lauf zu wiederholen. */
  private statisticsSent = false;

  /** Für welche Episode gespeichert wird — aufgerufen von `EpisodeScreen` bei jedem Episodenwechsel. */
  configure(themeId: string, episodeId: string): void {
    this.themeId = themeId;
    this.episodeId = episodeId;
  }

  finish(outcome: EventOutcome): void {
    if (outcome.kind === 'scored') {
      this.scoredCount.update((count: number) => count + 1);

      if (outcome.correctFirstTry) {
        this.correctFirstTryCount.update((count: number) => count + 1);
      }
    }

    this.eventIndex.update((index: number) => index + 1);
    this.trackPlaytime();
    this.persist();
  }

  restart(): void {
    this.eventIndex.set(0);
    this.scoredCount.set(0);
    this.correctFirstTryCount.set(0);
    this.pendingCardId.set(null);
    this.lastEventAt = null;
    this.playtimeMs.set(0);
  }

  /**
   * Einmalig aufrufbar — der Aufrufer (`EpisodeScreen`) markiert damit, dass
   * die Statistik dieses Laufs schon auf die Reise ging. `true`, wenn dieser
   * Aufruf der erste war (Plan Phase 8, Checkliste Doppelzählung a).
   */
  markStatisticsSent(): boolean {
    if (this.statisticsSent) {
      return false;
    }

    this.statisticsSent = true;
    return true;
  }

  /**
   * Zählt den Abstand zum vorherigen Event dazu, gedeckelt auf `MAX_GAP_MS` —
   * ein liegen gelassenes Spiel darf keine Stunden gutgeschrieben bekommen
   * (Plan Phase 8, AK 4). Vor dem ersten Event gibt es keinen Abstand.
   */
  private trackPlaytime(): void {
    const now = Date.now();

    if (this.lastEventAt !== null) {
      const gap = Math.min(now - this.lastEventAt, MAX_GAP_MS);
      this.playtimeMs.update((elapsed: number) => elapsed + gap);
    }

    this.lastEventAt = now;
  }

  /** Setzt einen gespeicherten Zwischenstand fort — genutzt ab Phase 6 („Weiterspielen"). */
  startAt(eventIndex: number, scoredCount: number, correctFirstTryCount: number): void {
    this.eventIndex.set(eventIndex);
    this.scoredCount.set(scoredCount);
    this.correctFirstTryCount.set(correctFirstTryCount);
  }

  /** Nach jedem abgeschlossenen Event — ein geschlossener Tab meldet sich nicht ab (Plan AK 2). */
  private persist(): void {
    if (this.themeId === '' || this.episodeId === '') {
      return;
    }

    this.runStore.save({
      themeId: this.themeId,
      episodeId: this.episodeId,
      eventIndex: this.eventIndex(),
      scoredCount: this.scoredCount(),
      correctFirstTryCount: this.correctFirstTryCount(),
    });
  }
}
