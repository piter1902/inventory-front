export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:5000',
  secure_routes: 'https://localhost:5000',
  auth: {
    authority: 'http://localhost:5000',
    clientId: 'inventory-front',
    redirectUrl: 'http://localhost:4200/auth-callback',
    postLogoutRedirectUri: 'http://localhost:4200',
    scope: 'openid profile email',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
  },
};
