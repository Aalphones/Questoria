import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/main-hub/main-hub').then((module) => module.MainHub),
  },
];
