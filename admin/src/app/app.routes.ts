import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'posts/new', loadComponent: () => import('./pages/post-editor.component').then(m => m.PostEditorComponent) },
      { path: 'posts/:id/edit', loadComponent: () => import('./pages/post-editor.component').then(m => m.PostEditorComponent) },
      { path: 'pages', loadComponent: () => import('./pages/pages-list.component').then(m => m.PagesListComponent) },
      { path: 'pages/about', loadComponent: () => import('./pages/about-editor.component').then(m => m.AboutEditorComponent) },
      { path: 'pages/links', loadComponent: () => import('./pages/links-editor.component').then(m => m.LinksEditorComponent) },
      { path: 'config', loadComponent: () => import('./pages/site-config.component').then(m => m.SiteConfigComponent) },
    ],
  },
];
