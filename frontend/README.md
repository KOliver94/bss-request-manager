# Frontend

Public web application where users submit and follow up on their video requests.

**Stack:** React · Material UI · Vite · React Router · React Hook Form +
Yup · Progressive Web App · Sentry

## Setup

Requires Node.js (version pinned in [`.nvmrc`](.nvmrc); run `nvm use` to switch)
and a running [backend](../backend/README.md).

```bash
cd frontend
npm install
cp .env.sample .env     # then edit it (see below)
npm start
```

The dev server runs at <https://localhost:5173>. It uses a self-signed
certificate (via `@vitejs/plugin-basic-ssl`), so accept the browser warning on
first load.

### Environment

Configuration is read from `frontend/.env` at build time. Start from
[`.env.sample`](.env.sample); every variable is prefixed with `VITE_`. The most
important one is `VITE_API_URL`, which points at the backend (default
`http://localhost:8000`).

## Scripts

| Script                        | Description                                    |
| ----------------------------- | ---------------------------------------------- |
| `npm start`                   | Start the Vite dev server (HTTPS, port 5173).  |
| `npm run start:network`       | Same, exposed on the local network (`--host`). |
| `npm run build`               | Production build into `build/`.                |
| `npm run preview`             | Serve the production build locally.            |
| `npm run lint`                | Run ESLint.                                    |
| `npm run lint:fix`            | Run ESLint with autofix.                       |
| `npm run format`              | Format sources with Prettier.                  |
| `npm run analyze`             | Inspect the bundle with source-map-explorer.   |
| `npm run generate-pwa-assets` | Regenerate PWA icons from `public/logo.svg`.   |

## Code style

Formatting and linting (Prettier + ESLint) are enforced by pre-commit. Install
the hooks once from the repository root with `pre-commit install`.
