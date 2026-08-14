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
}
