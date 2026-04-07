import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'user',
    loadComponent: () =>
      import('./pages/user/user.page').then((m) => m.UserPage),
  },
  {
    path: 'breathing',
    loadComponent: () =>
      import('./pages/breathing/breathing.page').then((m) => m.BreathingPage),
  },
  {
    path: 'article/:id',
    loadComponent: () =>
      import('./pages/article/article.page').then((m) => m.ArticlePage),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
