import { Routes } from '@angular/router';
import { createBlogRoutes } from '@foliokit/cms-ui';

import { HomePageComponent } from './pages/home-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  // FolioKit lists posts at `/posts`; keep `/blog` working for bookmarks and old links.
  { path: 'blog', pathMatch: 'full', redirectTo: 'posts' },
  ...createBlogRoutes(),
];
