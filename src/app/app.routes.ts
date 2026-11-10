import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', loadComponent: () => import('./features/auth/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register').then(m => m.RegisterComponent) },
  { path: 'dashboard', canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent) },
  { path: 'wallet', canActivate: [authGuard],
    loadComponent: () => import('./features/wallet/add-money').then(m => m.AddMoneyComponent) },
  { path: 'send', canActivate: [authGuard],
    loadComponent: () => import('./features/transactions/send-money').then(m => m.SendMoneyComponent) },
  { path: 'history', canActivate: [authGuard],
    loadComponent: () => import('./features/transactions/history').then(m => m.HistoryComponent) },
  { path: 'admin', canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin').then(m => m.AdminComponent) },
  { path: '**', redirectTo: 'dashboard' },
];