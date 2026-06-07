# BoxScan Inventory

Inventory management application built with Angular 21.

## Prerequisites

- Node.js 22+
- npm 10+
- Docker (optional, for containerized deployment)

## Development

```sh
npm install
npm start
```

Opens at `http://localhost:4200`.

## Build

```sh
npm run build
```

Output goes to `dist/inventory-front/browser`.

## Docker

### Build and run standalone

```sh
docker build -t inventory-front .
docker run -p 80:80 inventory-front
```

### Deploy with backend

```sh
cp .env.example .env
# edit .env with your paths
docker compose -f docker-compose.deploy.yml --env-file .env up -d
```

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `API_IMAGE` | `inventory-api:latest` | Backend image tag |
| `API_CONTEXT` | `../inventory-api` | Path to backend project |
| `API_DOCKERFILE` | `Dockerfile` | Backend Dockerfile name |

Auth and API URL are configured in `src/environments/environment.ts` (dev) and `environment.prod.ts` (production).

## License

MIT — see [LICENSE](LICENSE).
