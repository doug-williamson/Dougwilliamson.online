import { Routes } from '@angular/router';
import { AboutPageComponent, LinksPageComponent, CMS_ROUTE_DATA_KEY } from '@foliokit/cms-ui';

import { HomePageComponent } from './pages/home-page.component';
import { BlogListComponent } from './pages/blog-list.component';
import { BlogPostComponent } from './pages/blog-post.component';
import { aboutPageResolver, linksPageResolver } from './resolvers/page.resolver';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'blog', component: BlogListComponent },
  { path: 'blog/:slug', component: BlogPostComponent },
  {
    path: 'about',
    component: AboutPageComponent,
    resolve: { [CMS_ROUTE_DATA_KEY]: aboutPageResolver },
  },
  {
    path: 'links',
    component: LinksPageComponent,
    resolve: { [CMS_ROUTE_DATA_KEY]: linksPageResolver },
  },
];
