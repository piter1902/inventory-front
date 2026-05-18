FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runtime
RUN apk add --no-cache gettext
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
COPY --from=build /app/dist/inventory-front/browser /usr/share/nginx/html
COPY src/assets/env.template.js /usr/share/nginx/html/assets/env.template.js
EXPOSE 80
CMD ["/entrypoint.sh"]
