declare const window: any;

const env = window.__env || {};

export const environment = {
  production: true,
  apiBaseUrl: env.apiBaseUrl || 'http://localhost:5000',
  secure_routes: env.apiBaseUrl || 'https://localhost:5000',
  auth: {
    authority: env.authAuthority || 'http://localhost:5000',
    clientId: env.authClientId || 'inventory-front',
    redirectUrl: env.authRedirectUrl || 'http://localhost:4200/auth-callback',
    postLogoutRedirectUri: env.authPostLogoutUri || 'http://localhost:4200',
    scope: env.authScope || 'openid profile email',
    responseType: 'code',
    silentRenew: env.silentRenew !== undefined ? env.silentRenew : true,
    useRefreshToken: env.useRefreshToken !== undefined ? env.useRefreshToken : true,
  },
};
