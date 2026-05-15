export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5000',
  secure_routes: 'http://localhost:5000',
  auth: {
    authority: 'https://sso.allue.eu/realms/master',
    clientId: 'inventory-dev',
    redirectUrl: 'http://localhost:4200/auth/callback',
    postLogoutRedirectUri: 'http://localhost:4200',
    scope: 'openid profile email',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
  },
};
