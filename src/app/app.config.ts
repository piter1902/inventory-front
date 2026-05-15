import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth, authInterceptor } from 'angular-auth-oidc-client';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor()])),
    provideAuth({
      config: {
        authority: environment.auth.authority,
        redirectUrl: environment.auth.redirectUrl,
        postLogoutRedirectUri: environment.auth.postLogoutRedirectUri,
        clientId: environment.auth.clientId,
        scope: environment.auth.scope,
        responseType: environment.auth.responseType,
        silentRenew: environment.auth.silentRenew,
        useRefreshToken: environment.auth.useRefreshToken,
        secureRoutes: [environment.secure_routes],
        unauthorizedRoute: '/unauthorized',
      },
    }),
  ],
};
