import { Routes } from '@angular/router';
import { adminRoutes } from '@foliokit/cms-admin-ui';

const folioRoutesWithoutLogin = adminRoutes.filter((r) => r.path !== 'login');

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/admin-login-page.component').then((m) => m.AdminLoginPageComponent),
  },
  ...folioRoutesWithoutLogin,
];
