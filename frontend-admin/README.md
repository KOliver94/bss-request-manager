# Frontend — Admin Dashboard

Admin dashboard for staff to manage video requests, crew, comments and ratings.

**Stack:** React · PrimeReact · TanStack Query · TypeScript · Vite ·
React Router · Sentry

## Setup

Requires Node.js (version pinned in [`.nvmrc`](.nvmrc); run `nvm use` to switch),
pnpm (run `corepack enable` to activate the version pinned in `package.json`) and a
running [backend](../backend/README.md).

```bash
cd frontend-admin
pnpm install
cp .env.sample .env     # then edit it (see below)
pnpm start
```

The dev server runs at <http://localhost:5174>.

### Environment

Configuration is read from `frontend-admin/.env` at build time. Start from
[`.env.sample`](.env.sample). `VITE_API_URL` points at the backend API and
includes the version prefix (default `http://localhost:8000/api/v1/`).

## API client

The TypeScript API client in `src/api/` is **generated** from the backend's
OpenAPI schema (`../backend/schema.yaml`) with
[`openapi-generator`](https://openapi-generator.tech/) (`typescript-axios`).
Regenerate it whenever the schema changes:

```bash
pnpm generate-client
```

> Requires a Java runtime (used by openapi-generator) and an up-to-date
> `backend/schema.yaml` — see the [backend README](../backend/README.md#openapi-schema).

## Scripts

| Script                 | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `pnpm start`           | Start the Vite dev server (port 5174).               |
| `pnpm start:network`   | Same, exposed on the local network (`--host`).       |
| `pnpm build`           | Type-check (`tsc --noEmit`) and build into `build/`. |
| `pnpm preview`         | Serve the production build locally.                  |
| `pnpm lint`            | Run ESLint.                                          |
| `pnpm lint:fix`        | Run ESLint with autofix.                             |
| `pnpm format`          | Format sources with Prettier.                        |
| `pnpm generate-client` | Regenerate the API client from the backend schema.   |
| `pnpm analyze`         | Inspect the bundle with source-map-explorer.         |

## Note on `index.html`

`index.html` is a symbolic link to `admin.html`. On Windows, check it out with
symlink support enabled — see the
[Windows notes in the root README](../README.md#windows-enable-symbolic-links).

## Code style

Formatting and linting (Prettier + ESLint) are enforced by pre-commit. Install
the hooks once from the repository root with `pre-commit install`.
