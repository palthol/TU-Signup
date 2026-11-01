# Temple Underground — Waiver Signup

Participant-facing digital waiver wizard (Vite + React). Submits signed waivers to the Temple Underground API.

**Moved from** `temple underground signup/apps/waiver-v2/` into this standalone repo.

## Run locally

```bash
npm install
npm run dev
```

Opens at **http://localhost:5174**. `/api` and `/health` proxy to `http://localhost:3001` when the signup API is running.

## Build + preview

```bash
npm run build
npm test
npm run preview
```

`npm test` fails the build if source or compiled assets reference a client-bundled admin credential.

## Environment

Copy `.env.example` to `.env.local` for local overrides.

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API origin in production (e.g. Render). Omit locally to use the dev proxy. |

Only public values may use the `VITE_` prefix. Server secrets must never be compiled into the client.

## Deploy (Vercel)

| Setting | Value |
|---------|--------|
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

Set `VITE_API_BASE_URL` in Vercel to your deployed API URL. Update the API's `ALLOWED_ORIGIN` to include this site's domain.

## API contract

See [`docs/frontend-backend-payload.md`](docs/frontend-backend-payload.md) for the submit payload shape.
