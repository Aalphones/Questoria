import { DOCUMENT } from '@angular/common';
import { Service, inject, signal } from '@angular/core';

const STORAGE_KEY = 'questoria.narration.v1';

export type ReadingMode = 'listen' | 'read';

interface NarrationSettings {
  readonly mode: ReadingMode;
  readonly soundOn: boolean;
}

const DEFAULT_SETTINGS: NarrationSettings = { mode: 'listen', soundOn: true };

/**
 * Spricht Text vor — per Aufnahme, sonst per Computerstimme — und hält Modus-
 * und Ton-Einstellung im Browser-Speicher (Muster: `ProgressService`). Kein
 * Screen ruft `speechSynthesis`/`Audio` selbst auf, nur dieser Dienst.
 */
@Service()
export class NarrationService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly localStorage = this.window?.localStorage;

  private readonly initialSettings = this.readSettings();
  readonly mode = signal<ReadingMode>(this.initialSettings.mode);
  readonly soundOn = signal<boolean>(this.initialSettings.soundOn);
  readonly autoplayBlocked = signal(false);

  private currentAudio: HTMLAudioElement | null = null;
  private pendingText: string | null = null;
  private pendingAudioUrl: string | undefined;
  private unlockListenerAttached = false;

  setMode(mode: ReadingMode): void {
    this.mode.set(mode);
    this.persist();
  }

  toggleSound(): void {
    const nextSoundOn = !this.soundOn();
    this.soundOn.set(nextSoundOn);
    this.persist();

    if (!nextSoundOn) {
      this.stop();
    }
  }

  textFor(full: string, simple: string | undefined): string {
    return this.mode() === 'listen' ? (simple ?? full) : full;
  }

  speak(text: string, audioUrl?: string): void {
    this.stop();

    if (!this.soundOn()) {
      return;
    }

    if (audioUrl) {
      this.playAudio(text, audioUrl);
      return;
    }

    this.speakWithSynthesis(text);
  }

  stop(): void {
    this.currentAudio?.pause();
    this.currentAudio = null;
    this.window?.speechSynthesis?.cancel();
  }

  unlock(): void {
    this.autoplayBlocked.set(false);

    const text = this.pendingText;
    const audioUrl = this.pendingAudioUrl;
    this.pendingText = null;
    this.pendingAudioUrl = undefined;

    if (text !== null) {
      this.speak(text, audioUrl);
    }
  }

  private playAudio(text: string, audioUrl: string): void {
    const audioCtor = this.window?.Audio;

    if (!audioCtor) {
      this.speakWithSynthesis(text);
      return;
    }

    const audio = new audioCtor(audioUrl);
    this.currentAudio = audio;
    audio.play().catch(() => {
      this.markAutoplayBlocked(text, audioUrl);
    });
  }

  private speakWithSynthesis(text: string): void {
    const speechSynthesis = this.window?.speechSynthesis;
    const utteranceCtor = this.window?.SpeechSynthesisUtterance;

    if (!speechSynthesis || !utteranceCtor) {
      this.markAutoplayBlocked(text);
      return;
    }

    const utterance = new utteranceCtor(text);
    utterance.lang = 'de-DE';
    utterance.pitch = 1.05;
    utterance.rate = this.mode() === 'listen' ? 0.86 : 0.95;
    speechSynthesis.speak(utterance);

    if (!speechSynthesis.speaking) {
      this.markAutoplayBlocked(text);
    }
  }

  private markAutoplayBlocked(text: string, audioUrl?: string): void {
    this.pendingText = text;
    this.pendingAudioUrl = audioUrl;
    this.autoplayBlocked.set(true);
    this.attachUnlockListener();
  }

  private attachUnlockListener(): void {
    if (this.unlockListenerAttached) {
      return;
    }

    this.unlockListenerAttached = true;

    const handleUnlock = (): void => {
      this.document.removeEventListener('pointerdown', handleUnlock);
      this.document.removeEventListener('keydown', handleUnlock);
      this.unlockListenerAttached = false;
      this.unlock();
    };

    this.document.addEventListener('pointerdown', handleUnlock, { once: true });
    this.document.addEventListener('keydown', handleUnlock, { once: true });
  }

  private readSettings(): NarrationSettings {
    const raw = this.localStorage?.getItem(STORAGE_KEY);

    if (raw === null || raw === undefined) {
      return DEFAULT_SETTINGS;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<NarrationSettings>;

      if (
        (parsed.mode !== 'listen' && parsed.mode !== 'read') ||
        typeof parsed.soundOn !== 'boolean'
      ) {
        throw new Error('malformed narration settings');
      }

      return { mode: parsed.mode, soundOn: parsed.soundOn };
    } catch {
      // Ein kaputter Eintrag darf die App nicht blockieren.
      console.warn('Vorlese-Einstellung im Browser-Speicher ist beschädigt, setze zurück.');
      return DEFAULT_SETTINGS;
    }
  }

  private persist(): void {
    this.localStorage?.setItem(
      STORAGE_KEY,
      JSON.stringify({ mode: this.mode(), soundOn: this.soundOn() }),
    );
  }
}
