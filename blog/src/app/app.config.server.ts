import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import {
  BLOG_POST_SERVICE,
  AUTHOR_SERVICE,
  SITE_CONFIG_SERVICE,
  SeriesService,
} from '@foliokit/cms-core';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import {
  ServerBlogPostService,
  ServerAuthorService,
  ServerSiteConfigService,
  ServerSeriesService,
} from './services/server-services';

/**
 * FolioKit's client services inject the firebase-js-sdk Firestore, which is
 * null on the server. We override the service tokens here with Admin-SDK
 * implementations so SSR resolvers can read Firestore.
 */
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: BLOG_POST_SERVICE, useClass: ServerBlogPostService },
    { provide: AUTHOR_SERVICE, useClass: ServerAuthorService },
    { provide: SITE_CONFIG_SERVICE, useClass: ServerSiteConfigService },
    { provide: SeriesService, useClass: ServerSeriesService },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
