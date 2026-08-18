import { DOCUMENT } from '@angular/common';
import { Service, inject, signal } from '@angular/core';

const ACTIVE_PROFILE_STORAGE_KEY = 'questoria.profile.v1';

/**
 * Hält, was das Kind gerade spielt. In Meilenstein 1 nur die Auswahl aus dem
 * Main-Hub; Fortschritt und Savegame kommen später dazu und leben dann
 * ebenfalls hier, nicht im Content.
 *
 * `activeProfileId` überlebt ein Neuladen der Seite über den Browser-Speicher
 * (Plan Phase 4, AK 5) — geprüft gegen die geladene Profilliste wird der Wert
 * in `ProfileService.ensureLoaded()`, nicht hier: diese Klasse kennt nur den
 * Speicherplatz, nicht den Account.
 */
@Service()
export class GameStateService {
  private readonly localStorage = inject(DOCUMENT).defaultView?.localStorage;

  readonly activeThemeId = signal<string | null>(null);
  readonly activeDifficultyLevel = signal<string | null>(null);
  readonly activeProfileId = signal<number | null>(this.readStoredProfileId());

  setActiveProfile(profileId: number): void {
    this.activeProfileId.set(profileId);
    this.localStorage?.setItem(ACTIVE_PROFILE_STORAGE_KEY, String(profileId));
  }

  clearActiveProfile(): void {
    this.activeProfileId.set(null);
    this.localStorage?.removeItem(ACTIVE_PROFILE_STORAGE_KEY);
  }

  setActiveTheme(themeId: string): void {
    const isNewTheme = this.activeThemeId() !== themeId;

    this.activeThemeId.set(themeId);

    if (isNewTheme) {
      // Eine neue Welt bringt eigene Lernstufen mit — die alte Auswahl wäre dort ungültig.
      // Der Resolver ruft diese Methode bei jeder Navigation innerhalb derselben Welt
      // erneut auf — ohne die Prüfung würde die Stufenwahl bei jedem Screenwechsel verloren gehen.
      this.activeDifficultyLevel.set(null);
    }
  }

  setActiveDifficultyLevel(levelId: string): void {
    this.activeDifficultyLevel.set(levelId);
  }

  reset(): void {
    this.activeThemeId.set(null);
    this.activeDifficultyLevel.set(null);
  }

  private readStoredProfileId(): number | null {
    const raw = this.localStorage?.getItem(ACTIVE_PROFILE_STORAGE_KEY);

    if (raw === null || raw === undefined) {
      return null;
    }

    const parsed = Number(raw);

    return Number.isInteger(parsed) ? parsed : null;
  }
}
