import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideFolioKit } from '@foliokit/cms-core';
import { provideAdminKit } from '@foliokit/cms-admin-ui';

import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideFolioKit({ firebaseConfig: environment.firebaseConfig, siteId: 'dougwilliamson', useEmulator: environment.useEmulator }),
    provideAdminKit({ adminEmail: environment.adminEmail }),
  ],
};
