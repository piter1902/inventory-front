#!/bin/sh
set -e

ENV_JS=/usr/share/nginx/html/assets/env.js

if [ -f /usr/share/nginx/html/assets/env.template.js ]; then
  envsubst '${API_BASE_URL} ${AUTH_AUTHORITY} ${AUTH_CLIENT_ID} ${AUTH_REDIRECT_URL} ${AUTH_POST_LOGOUT_URI} ${AUTH_SCOPE} ${SILENT_RENEW} ${USE_REFRESH_TOKEN}' \
    < /usr/share/nginx/html/assets/env.template.js > "$ENV_JS"
fi

exec nginx -g 'daemon off;'
