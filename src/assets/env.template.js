(function (window) {
  window.__env = window.__env || {};
  window.__env.apiBaseUrl = '${API_BASE_URL}';
  window.__env.authAuthority = '${AUTH_AUTHORITY}';
  window.__env.authClientId = '${AUTH_CLIENT_ID}';
  window.__env.authRedirectUrl = '${AUTH_REDIRECT_URL}';
  window.__env.authPostLogoutUri = '${AUTH_POST_LOGOUT_URI}';
  window.__env.authScope = '${AUTH_SCOPE}';
  window.__env.silentRenew = ${SILENT_RENEW};
  window.__env.useRefreshToken = ${USE_REFRESH_TOKEN};
})(this);
