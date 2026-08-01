import { Service, signal } from '@angular/core';

/**
 * Hält, was das Kind gerade spielt. In Meilenstein 1 nur die Auswahl aus dem
 * Main-Hub; Fortschritt und Savegame kommen später dazu und leben dann
 * ebenfalls hier, nicht im Content.
 */
@Service()
export class GameStateService {
  readonly activeThemeId = signal<string | null>(null);
  readonly activeDifficultyLevel = signal<string | null>(null);

  setActiveTheme(themeId: string): void {
    this.activeThemeId.set(themeId);
    // Eine neue Welt bringt eigene Lernstufen mit — die alte Auswahl wäre dort ungültig.
    this.activeDifficultyLevel.set(null);
  }

  setActiveDifficultyLevel(levelId: string): void {
    this.activeDifficultyLevel.set(levelId);
  }

  reset(): void {
    this.activeThemeId.set(null);
    this.activeDifficultyLevel.set(null);
  }
}
