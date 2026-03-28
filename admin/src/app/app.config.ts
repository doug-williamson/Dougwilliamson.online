import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideFolioKit } from '@foliokit/cms-core';
import { provideAdminKit, adminRoutes } from '@foliokit/cms-admin-ui';

import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(adminRoutes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideFolioKit({ firebaseConfig: environment.firebaseConfig, siteId: 'dougwilliamson' }),
    provideAdminKit({ adminEmail: environment.adminEmail }),
  ],
};
