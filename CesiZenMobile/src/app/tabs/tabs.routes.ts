import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'user',
        loadComponent: () =>
          import('../pages/user/user.page').then((m) => m.UserPage),
      },

      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'breathing',
    loadComponent: () =>
      import('../pages/breathing/breathing.page').then((m) => m.BreathingPage),
  },
  {
    path: 'article/:id',
    loadComponent: () =>
      import('../pages/article/article.page').then((m) => m.ArticlePage),
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];
