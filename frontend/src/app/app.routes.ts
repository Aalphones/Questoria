import { Routes } from '@angular/router';

import { difficultyChosenGuard } from './routing/difficulty-chosen.guard';
import { worldConfigResolver } from './routing/world-config.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/main-hub/main-hub').then((module) => module.MainHub),
  },
  {
    path: 'theme/:themeId/level',
    resolve: { world: worldConfigResolver },
    loadComponent: () =>
      import('./features/main-hub/level-select/level-select').then(
        (module) => module.LevelSelect,
      ),
  },
  {
    path: 'theme/:themeId/timeline',
    resolve: { world: worldConfigResolver },
    canActivate: [difficultyChosenGuard],
    loadComponent: () => import('./features/timeline/timeline').then((module) => module.Timeline),
  },
  {
    path: 'theme/:themeId/map/:mapId',
    resolve: { world: worldConfigResolver },
    canActivate: [difficultyChosenGuard],
    loadComponent: () => import('./features/map/map').then((module) => module.MapScreen),
  },
  {
    path: 'theme/:themeId/episode/:episodeId',
    resolve: { world: worldConfigResolver },
    canActivate: [difficultyChosenGuard],
    loadComponent: () =>
      import('./features/episode/episode').then((module) => module.EpisodeScreen),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
