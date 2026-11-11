# Learner Progress MVP

A thin "My progress" view for learners: in-progress courses with completion %, last activity and an estimated time left. Express + TypeScript API, Angular frontend.

**Frontend starter used: Angular.** The assignment brief is in [SPEC.md](./SPEC.md).

## Run it

Requires **Node.js 20+** and free ports **3001** (API) and **5173** (UI).

Terminal 1, API:

```bash
cd backend && npm install && npm test && npm run dev
```

Terminal 2, UI:

```bash
cd frontend && npm install && npm run dev
```

Open http://localhost:5173.

## What to try

Use the **Viewing as** dropdown (stub auth, no login):

| Learner | Shows |
|---------|-------|
| Learner 1 | Three in-progress courses, newest activity first, one flagged **Inactive** (30+ days) |
| Learner 2 | A single in-progress course |
| Learner 3 | The **empty** state (only a completed course) |
| Learner 999 | The **error** state (API returns 404 "Learner 999 not found") |

Tick **Under 30 min left** to hide courses that need more than half an hour (on learner 1 this hides Leadership Essentials).

Stop the backend and click **Try again** to see the unreachable-server error. **Refresh** re-fetches.

Analytics events (`course_progress_viewed`, `progress_refreshed`) are logged as JSON lines in the browser console.

## API

`GET /api/learners/:learnerId/progress` returns `{ learnerId, courses: [{ courseId, title, completionPercentage, lastActivityAt, status, isStale, estimatedMinutesRemaining }] }`. Errors: `400` invalid ID, `404` unknown learner, each as `{ "error": "..." }`. Details in [backend/README.md](./backend/README.md).

## Layout

```
backend/    Express + TypeScript API (in-memory seed data) and Jest tests
frontend/   Angular 19 standalone app (proxies /api to :3001)
PRODUCT.md  problem, scope, extra rule, cuts, metric, assumptions
AI_USAGE.md how AI was used
```

## Tests

```bash
cd backend && npm test
cd frontend && npm test    # Karma + Jasmine in headless Chrome (Chrome must be installed)
```

GitHub Actions (`.github/workflows/ci.yml`) runs the backend build and tests, and the frontend build and tests, on every push.

## Notes

- `frontend/angular.json` has one change to the provided starter: the `serve` target was missing `buildTarget`, so `ng serve` failed with a schema error.
- See [PRODUCT.md](./PRODUCT.md) for scope, cuts, assumptions and the trust-boundary note.
