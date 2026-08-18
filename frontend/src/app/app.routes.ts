import { Routes } from '@angular/router';

import { authGuard } from './routing/auth.guard';
import { difficultyChosenGuard } from './routing/difficulty-chosen.guard';
import { profileChosenGuard } from './routing/profile-chosen.guard';
import { worldConfigResolver } from './routing/world-config.resolver';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then((module) => module.Login),
  },
  {
    path: 'profiles',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile').then((module) => module.ProfilePicker),
  },
  {
    path: '',
    canActivate: [authGuard, profileChosenGuard],
    loadComponent: () => import('./features/main-hub/main-hub').then((module) => module.MainHub),
  },
  {
    path: 'theme/:themeId/level',
    canActivate: [authGuard, profileChosenGuard],
    resolve: { world: worldConfigResolver },
    loadComponent: () =>
      import('./features/main-hub/level-select/level-select').then(
        (module) => module.LevelSelect,
      ),
  },
  {
    path: 'theme/:themeId/timeline',
    canActivate: [authGuard, profileChosenGuard, difficultyChosenGuard],
    resolve: { world: worldConfigResolver },
    loadComponent: () => import('./features/timeline/timeline').then((module) => module.Timeline),
  },
  {
    path: 'theme/:themeId/map/:mapId',
    canActivate: [authGuard, profileChosenGuard, difficultyChosenGuard],
    resolve: { world: worldConfigResolver },
    loadComponent: () => import('./features/map/map').then((module) => module.MapScreen),
  },
  {
    path: 'theme/:themeId/episode/:episodeId',
    canActivate: [authGuard, profileChosenGuard, difficultyChosenGuard],
    resolve: { world: worldConfigResolver },
    loadComponent: () =>
      import('./features/episode/episode').then((module) => module.EpisodeScreen),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
