import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideFolioKit, type NavItem } from '@foliokit/cms-core';
import { SHELL_CONFIG } from '@foliokit/cms-ui';
import { MARKED_OPTIONS, provideMarkdown } from 'ngx-markdown';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

const nav: NavItem[] = [
  { label: 'Home', url: '/', order: 0 },
  { label: 'Blog', url: '/blog', order: 1 },
  { label: 'About', url: '/about', order: 2 },
  { label: 'Links', url: '/links', order: 3 },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideFolioKit({ firebaseConfig: environment.firebaseConfig, siteId: 'dougwilliamson' }),
    provideMarkdown({ markedOptions: { provide: MARKED_OPTIONS, useValue: { gfm: true } } }),
    {
      provide: SHELL_CONFIG,
      useValue: {
        appName: 'Doug Williamson',
        showAuth: false,
        nav,
      },
    },
  ],
};
