import { Routes } from '@angular/router';
import { adminRoutes } from '@foliokit/cms-admin-ui';

// withComponentInputBinding() calls setInput() for every declared input on every
// route activation, passing undefined for any key absent from the merged
// { ...queryParams, ...params, ...data } object. AdminLoginComponent.redirectTo is
// a signal input whose default ('/dashboard') gets overwritten with undefined unless
// the route data provides it explicitly.
export const appRoutes: Routes = adminRoutes.map(route =>
  route.path === 'login'
    ? { ...route, data: { ...route.data, redirectTo: '/dashboard' } }
    : route
);
