import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideFirebase, type NavItem } from '@foliokit/cms-core';
import { SHELL_CONFIG } from '@foliokit/cms-ui';
import { MARKED_OPTIONS, provideMarkdown } from 'ngx-markdown';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

const nav: NavItem[] = [
  { label: 'Dashboard', url: '/dashboard', order: 0 },
  { label: 'Pages', url: '/pages', order: 1 },
  { label: 'Config', url: '/config', order: 2 },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideFirebase(environment.firebaseConfig),
    provideMarkdown({ markedOptions: { provide: MARKED_OPTIONS, useValue: { gfm: true } } }),
    {
      provide: SHELL_CONFIG,
      useValue: {
        appName: 'Doug Williamson Admin',
        showAuth: true,
        nav,
      },
    },
  ],
};
