import { Route } from '@angular/router';
import { adminRoutes } from '@foliokit/cms-admin-ui';

const loginRoute = adminRoutes.find((r): r is Route => r.path === 'login');
if (!loginRoute) {
  throw new Error('FolioKit adminRoutes missing login route');
}

/**
 * FolioKit `AdminLoginComponent` has a `redirectTo` signal input. With
 * `withComponentInputBinding()`, a missing/empty `?redirectTo=` query param can
 * override the default with `undefined`, causing `Router.navigate([undefined])`
 * (NG04008). Explicit `data.redirectTo` keeps a valid target; the postinstall
 * patch in `scripts/patch-foliokit.js` adds a `navigateByUrl` fallback as well.
 */
export const appRoutes: Route[] = [
  {
    ...loginRoute,
    data: { ...(loginRoute.data ?? {}), redirectTo: '/posts' },
  },
  ...adminRoutes.filter((r) => r.path !== 'login'),
];
