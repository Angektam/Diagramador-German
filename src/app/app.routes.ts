import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  { 
    path: 'gallery', 
    loadComponent: () => import('./components/map-gallery/map-gallery.component').then(m => m.MapGalleryComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'editor', 
    loadComponent: () => import('./components/editor/editor.component').then(m => m.EditorComponent),
    canActivate: [authGuard]
  },
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];