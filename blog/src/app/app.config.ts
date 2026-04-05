import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  signal,
  WritableSignal,
  inject,
} from '@angular/core';
import { NavigationError, provideRouter, Router } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  BLOG_SEO_SERVICE,
  CollectionPaths,
  SITE_ID,
  type NavItem,
  provideFolioKit,
} from '@foliokit/cms-core';
import { SHELL_CONFIG, type ShellConfig, provideCmsUiMatIcons } from '@foliokit/cms-ui';
import { MARKED_OPTIONS, provideMarkdown } from 'ngx-markdown';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { SeoService } from './services/seo.service';

const DEFAULT_NAV: NavItem[] = [
  { label: 'Home', url: '/' },
  { label: 'Blog', url: '/blog' },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const paths = inject(CollectionPaths);
      const siteId = inject(SITE_ID, { optional: true });
      // #region agent log
      fetch('http://127.0.0.1:7566/ingest/58b16794-1d65-458c-83bb-2d4ff82e53d8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '966e68' },
        body: JSON.stringify({
          sessionId: '966e68',
          location: 'app.config.ts:provideAppInitializer',
          message: 'boot folio paths',
          data: {
            siteId,
            siteConfigDocPath: paths.siteConfigDocPath(),
            postsCollection: paths.collection('posts'),
            useEmulator: environment.useEmulator,
            production: environment.production,
          },
          timestamp: Date.now(),
          runId: 'pre-fix',
          hypothesisId: 'H1',
        }),
      }).catch(() => {});
      // #endregion
      const router = inject(Router);
      router.events.subscribe((e) => {
        if (e instanceof NavigationError) {
          const err = e.error as Error | undefined;
          // #region agent log
          fetch('http://127.0.0.1:7566/ingest/58b16794-1d65-458c-83bb-2d4ff82e53d8', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '966e68' },
            body: JSON.stringify({
              sessionId: '966e68',
              location: 'app.config.ts:router.events',
              message: 'navigation error',
              data: {
                navUrl: e.url,
                errName: err?.name,
                errMessage: err?.message,
              },
              timestamp: Date.now(),
              runId: 'pre-fix',
              hypothesisId: 'H4',
            }),
          }).catch(() => {});
          // #endregion
        }
      });
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideCmsUiMatIcons(),
    provideFolioKit({
      firebaseConfig: environment.firebaseConfig,
      siteId: 'dougwilliamson',
      useEmulator: environment.useEmulator,
    }),
    { provide: BLOG_SEO_SERVICE, useExisting: SeoService },
    provideMarkdown({ markedOptions: { provide: MARKED_OPTIONS, useValue: { gfm: true } } }),
    {
      provide: SHELL_CONFIG,
      useFactory: (): WritableSignal<ShellConfig> => signal({
        appName: 'Doug Williamson',
        showAuth: false,
        nav: DEFAULT_NAV,
      }),
    },
  ],
};
