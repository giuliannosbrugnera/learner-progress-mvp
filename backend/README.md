# Backend — TypeScript starter

Express + TypeScript API scaffold for the Learner Progress take-home. **Implement the business logic** in `src/services/progressService.ts` until tests pass, consumed by the Angular app in [`frontend/`](../frontend/README.md).

## Quick start

```bash
cd backend
npm install
npm test
npm run dev       # http://localhost:3001
```

## API

### `GET /health`

Returns `{ "status": "ok" }`.

### `GET /api/learners/:learnerId/progress`

Returns in-progress courses for a learner.

**Success (200):**

```json
{
  "learnerId": 1,
  "courses": [
    {
      "courseId": "course-leadership",
      "title": "Leadership Essentials",
      "completionPercentage": 33,
      "lastActivityAt": "2026-08-22T09:15:00.000Z",
      "status": "in_progress",
      "isStale": false,
      "estimatedMinutesRemaining": 35
    }
  ]
}
```

**Errors:**

| Status | When |
|--------|------|
| 400 | Invalid learner ID (non-integer or ≤ 0) |
| 404 | Unknown learner (not in seed data) |

## Where things live

- `src/services/progressService.ts` — business logic: in-progress filter, completion %, stale flag, sort, and the extra rule `estimateMinutesRemaining`.
- `src/routes/progressRoutes.ts` — HTTP layer and learner-ID validation.
- `tests/` — API contract tests and unit tests for the extra rule. Run `npm test`.

Choices and assumptions are documented in the repo-root `PRODUCT.md`.

## Seed data

`src/data/seed.ts` includes:

- **Learner 1** — 3 in-progress, 1 completed, 1 not started (API should return 3)
- **Learner 2** — 1 in-progress, 1 completed (API should return 1)
- **Learner 3** — only a completed course (API returns an empty list)
- **Learner 999** — does not exist (404)

## CORS

Enabled for all origins so any local frontend dev server can call the API during development.

## Suggested repo layout

```
your-submission/
├── backend/          ← this starter (TypeScript)
├── frontend/         ← Angular app
├── README.md         ← how to run both
├── PRODUCT.md
└── AI_USAGE.md
```

## Frontend integration hint

The Angular and React starters proxy `/api` to `http://localhost:3001`. Fetch:

```
GET /api/learners/1/progress
```

Learner 1 is a good default for demos; learner 2 shows a single-course case; learner 999 triggers an error state in your UI.
