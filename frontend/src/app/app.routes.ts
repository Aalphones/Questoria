import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/main-hub/main-hub').then((module) => module.MainHub),
  },
  {
    // TEMPORÄR (Phase 3): Prüfbild für die Kartenfläche. Entfällt mit der Ortskarte.
    path: 'map-demo',
    loadComponent: () => import('./features/map-demo/map-demo').then((module) => module.MapDemo),
  },
];
