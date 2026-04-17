import { type Route, type Routes } from '@angular/router';
import { createBlogRoutes, LinksPageComponent } from '@foliokit/cms-ui';
import { createHomeSiteConfigResolver } from '@foliokit/cms-core';

import { BlogAboutPageComponent } from './pages/blog-about-page.component';

/**
 * FolioKit's lazy `BlogAboutPageComponent` imports `MarkdownModule`, which with
 * root `provideMarkdown()` causes NG0203/NG0200 on this route. We swap in a
 * local About page that uses standalone `MarkdownComponent` only.
 *
 * `LinksPageComponent` is registered eagerly to avoid lazy-boundary injector
 * issues with MatIcon on this app (same class of failure as the old `/blog` 404).
 *
 * Home route: inject SSR resolver so BlogHomeComponent hydrates from TransferState
 * without a second Firestore round-trip on the client.
 */
function patchFolioBlogRoutes(): Route[] {
  const folio = createBlogRoutes() as Route[];
  return folio.map((r) => {
    if (r.pathMatch === 'full') {
      return { ...r, resolve: { ...r.resolve, homeSiteConfig: createHomeSiteConfigResolver() } };
    }
    if (r.path === 'about') {
      return {
        path: 'about',
        canActivate: r.canActivate,
        resolve: r.resolve,
        component: BlogAboutPageComponent,
      };
    }
    if (r.path === 'links') {
      return {
        path: 'links',
        title: r.title,
        canActivate: r.canActivate,
        resolve: r.resolve,
        component: LinksPageComponent,
      };
    }
    return r;
  });
}

export const routes: Routes = [
  { path: 'blog', pathMatch: 'full', redirectTo: 'posts' },
  ...patchFolioBlogRoutes(),
];
