import { ApplicationConfig, provideBrowserGlobalErrorListeners, signal, WritableSignal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { BLOG_SEO_SERVICE, type NavItem, provideFolioKit } from '@foliokit/cms-core';
import { SHELL_CONFIG, type ShellConfig, provideCmsUiMatIcons } from '@foliokit/cms-ui';
import { MARKED_OPTIONS, provideMarkdown } from 'ngx-markdown';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { SeoService } from './services/seo.service';

const DEFAULT_NAV: NavItem[] = [
  { label: 'Home', url: '/' },
  { label: 'Blog', url: '/posts' },
];

export const appConfig: ApplicationConfig = {
  providers: [
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
