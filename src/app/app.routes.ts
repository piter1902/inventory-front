import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'boxes', pathMatch: 'full' },
  {
    path: 'auth/callback',
    loadComponent: () => import('./auth/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent),
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/unauthorized/unauthorized').then(m => m.Unauthorized),
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: 'boxes/new',
        loadComponent: () => import('./features/create-box/create-box').then(m => m.CreateBox),
      },
      {
        path: 'boxes',
        data: { showBack: false },
        loadComponent: () => import('./features/boxes-dashboard/boxes-dashboard').then(m => m.BoxesDashboard),
      },
      {
        path: 'boxes/:boxId',
        loadComponent: () => import('./features/box-detail/box-detail').then(m => m.BoxDetail),
      },
      {
        path: 'search',
        data: { showBack: false },
        loadComponent: () => import('./features/inventory-search/inventory-search').then(m => m.InventorySearch),
      },
      {
        path: 'boxes/:boxId/edit',
        loadComponent: () => import('./features/content-management/content-management').then(m => m.ContentManagement),
      },
      {
        path: 'zones',
        data: { showBack: false },
        loadComponent: () => import('./features/zones/zones-list').then(m => m.ZonesList),
      },
      {
        path: 'zones/new',
        loadComponent: () => import('./features/zones/zone-edit').then(m => m.ZoneEdit),
      },
      {
        path: 'zones/:zoneId',
        loadComponent: () => import('./features/zones/zone-detail').then(m => m.ZoneDetail),
      },
      {
        path: 'zones/:zoneId/edit',
        loadComponent: () => import('./features/zones/zone-edit').then(m => m.ZoneEdit),
      },
      {
        path: 'import',
        data: { showBack: false },
        loadComponent: () => import('./features/import-excel/import-excel').then(m => m.ImportExcel),
      },
      {
        path: 'boxes/:boxId/move-items',
        loadComponent: () => import('./features/move-items/move-items').then(m => m.MoveItems),
      },
      {
        path: 'logs',
        data: { showBack: false },
        loadComponent: () => import('./features/logs/logs').then(m => m.Logs),
      },
    ],
  },
];
