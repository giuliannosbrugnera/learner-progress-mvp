# Frontend — Angular starter (primary)

Angular 19 standalone app. Already calls `GET /api/learners/:id/progress` through the `ng serve` proxy.

The page shows loading, error and empty states, the estimated-time-remaining rule, and logs analytics events to the console. See the root README for what to try.

**Requires Node.js 20+.**

## Quick start

Run the backend first (`cd ../backend && npm run dev`), then from this folder:

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Proxy

`proxy.conf.json` forwards `/api` and `/health` to `http://localhost:3001`. Keep using relative `/api/...` URLs so the interviewer can run both processes locally.
