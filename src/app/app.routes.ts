import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'generator',
    loadComponent: () => import('./components/prompt-generator/prompt-generator.component').then(m => m.PromptGeneratorComponent),
    canActivate: [authGuard]
  },
  {
    path: 'share',
    loadComponent: () => import('./components/share-view/share-view.component').then(m => m.ShareViewComponent)
  },
  {
    path: 'share/:id',
    loadComponent: () => import('./components/share-view/share-view.component').then(m => m.ShareViewComponent)
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
