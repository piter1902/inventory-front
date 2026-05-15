import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'boxes', pathMatch: 'full' },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      {
        path: 'boxes/new',
        loadComponent: () => import('./features/create-box/create-box').then(m => m.CreateBox),
      },
      {
        path: 'boxes',
        loadComponent: () => import('./features/boxes-dashboard/boxes-dashboard').then(m => m.BoxesDashboard),
      },
      {
        path: 'boxes/:boxId',
        loadComponent: () => import('./features/box-detail/box-detail').then(m => m.BoxDetail),
      },
      {
        path: 'search',
        loadComponent: () => import('./features/inventory-search/inventory-search').then(m => m.InventorySearch),
      },
      {
        path: 'boxes/:boxId/edit',
        loadComponent: () => import('./features/content-management/content-management').then(m => m.ContentManagement),
      },
    ],
  },
];
