import {
  ApplicationConfig,
  provideZoneChangeDetection,
  provideAppInitializer,
  inject,
} from '@angular/core';
import {
  provideRouter,
  withViewTransitions,
  withPreloading,
  PreloadAllModules,
  withInMemoryScrolling,
} from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { SeoService } from './core/services/seo.service';
import { responseInterceptor } from './core/interceptors/response.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { CustomerAuthService } from './features/auth/services/customer-auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withViewTransitions(),
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      })
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor, responseInterceptor])
    ),
    provideClientHydration(withEventReplay()),
    // Initialize SEO service on app startup
    provideAppInitializer(() => inject(SeoService).init()),
    // Initialize auth state on app startup - fetch user from server
    provideAppInitializer(() => inject(CustomerAuthService).initializeAuth()),
  ],
};
