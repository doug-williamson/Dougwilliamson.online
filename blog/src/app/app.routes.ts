import { Routes } from '@angular/router';
import { createBlogRoutes } from '@foliokit/cms-ui';

import { HomePageComponent } from './pages/home-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  ...createBlogRoutes(),
];
