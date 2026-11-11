# Product Notes

## User problem

Learners with several courses in flight lose track of where they left off, and so are less likely to come back and finish. They need one place that answers "what am I in the middle of, how far along am I, and how long will it take to finish?" This MVP tests whether a dedicated progress view improves re-engagement before we invest in a full platform feature.

## MVP scope

- API: `GET /api/learners/:learnerId/progress` returns only `in_progress` courses with completion %, last activity timestamp, a stale flag and estimated minutes remaining, sorted by most recent activity.
- Validation: `400` for a non-integer or non-positive learner ID, `404` for an unknown learner, both as `{ "error": "<readable message>" }`.
- UI (Angular): course list with a progress bar, relative last activity (full timestamp on hover), an **Inactive** badge, and time left. Explicit **loading**, **error** (with retry) and **empty** states, plus a Refresh button.
- Filter: an "Under 30 min left" toggle that makes the extra rule usable ("what can I finish now?"). It is client-side, since the API already returns the minutes.
- CI: GitHub Actions runs the backend build and tests, and the frontend build and tests, on every push.
- Analytics: `course_progress_viewed` on load and `progress_refreshed` on refresh/retry.
- Tests: Jest + supertest for the API contract, plus unit tests for the extra rule. On the frontend, Karma + Jasmine unit tests for the time formatters and component tests (mocked HTTP) for the loading, error, empty and filtered states, analytics calls and request cancellation. CI runs all of it.

## Extra business rule: estimated time remaining

**What it does.** Each course reports `estimatedMinutesRemaining`: the sum of `durationMinutes` over lessons that are not yet completed. A lesson with no duration counts as **10 minutes** (`DEFAULT_LESSON_MINUTES`). The UI shows it as "~25 min left" or "~1 h 30 min left".

**Why it matters.** A learner with 20 minutes to spare can pick a course they can actually finish, which is the moment drop-off happens. Admins and managers can see how much work is left on assigned training. The default avoids showing 0 minutes for lessons we have no data on, so the estimate is never silently understated.

**How it is tested.** `backend/tests/estimateMinutesRemaining.test.ts` covers summing incomplete lessons only, the default fallback, all lessons complete (0) and a course with no lessons (0). `backend/tests/progress.api.test.ts` checks the field end to end using seed data where some lessons have durations and some deliberately do not.

## What I intentionally cut

| Cut | Why |
|-----|-----|
| Course detail page / "Continue" action | The goal is to validate the list view first. Detail is v2 if list engagement is strong. |
| Real auth | Out of scope. Learner is chosen from a dropdown (stub). See trust boundary below. |
| Persistence | In-memory seed is enough to prove the slice. Data resets on restart. |
| `course_selected` event | There is nowhere to go on click, so the event would measure nothing. |
| Other filters and sort controls | Server sort by recency is the right default. The one filter shipped is for the extra rule. More come once we see how learners use the list. |
| Feature-flag gating | Nothing experimental to gate in a single-view MVP. |
| Upgrading Angular to 20+ (Vitest) | The provided starter is Angular 19, which only ships the Karma builder. I kept the starter's version rather than upgrade the stack on deadline day. |
| End-to-end browser tests | Component tests with mocked HTTP cover the states. A Cypress/Playwright run against the real API is a follow-up. |

## Success metric

- **Metric name:** 7-day return-to-course rate.
- **How I'd measure it:** Of learners who fire `course_progress_viewed` with at least one in-progress course, the share who record activity on any of those courses within 7 days of the view. Compare against learners who did not get the view (holdout or pre-launch baseline).
- **What "good" looks like in the first 30 days:** A clear lift over the baseline, with a directional target of +10 percentage points. The 7-day window is short enough to be a re-engagement signal and long enough to cover weekly work rhythms.

## Assumptions

- **Persistence:** in-memory seed data from the starter, extended with learner 3 (empty-state demo) and lesson durations.
- **Auth:** none. The UI hardcodes a learner list in a dropdown (1, 2, 3 and 999). The API still receives the fictional `x-authenticated-learner-id` header from the starter but does not enforce it.
- **Completion %:** completed lessons / total lessons, rounded, 0 when a course has no lessons (the starter's helper, unchanged).
- **Stale:** no activity for more than 30 days (starter's `isEnrollmentStale`).
- **Lesson duration:** optional per lesson, 10 minutes assumed when missing. Remaining time is not weighted by partial progress inside a lesson.
- **Time zones:** timestamps are UTC ISO strings end to end. The UI displays relative time in the browser's locale and shows the raw timestamp on hover.
- **Analytics:** a stub client that writes one structured JSON line per event to the console, with the learner ID, trigger, course count and stale count. The call sites would not change when swapped for Segment or Amplitude.
- **API extras:** each course also returns `estimatedMinutesRemaining` (the extra rule), alongside the required fields and the starter's `isStale`. Lessons gain an optional `durationMinutes` in the seed data. No query filters, since the one UI filter works on data already returned.
- **Stale responses:** switching learner cancels the in-flight request so a slow earlier response cannot overwrite a newer one.
- **Starter fix:** `frontend/angular.json` `serve` needed a `buildTarget` for `ng serve` to run at all.

### Trust boundary (not built, by design)

The route trusts `:learnerId`. With real auth, the check goes in `progressRoutes.ts` right after parsing the ID: if `req.authenticatedLearnerId` is set and differs from `learnerId`, throw the existing `ForbiddenError` (HTTP 403) before any data is read. A missing identity should be 401, handled by auth middleware before the router. Admin or manager access would be an explicit role check, not an ID match.

## What I'd build next

- Real auth and the 403/401 enforcement above, with tests for the mismatch case.
- A "Continue" action that links to the next incomplete lesson, since the list answers "where am I" but not yet "take me there".
- Persistent store (SQLite or Postgres) and real per-lesson durations from the course catalog.
- Upgrade Angular to 20+ and move the frontend tests to the Vitest runner (jsdom, no browser needed in CI).
- Instrument return visits and course resumption so the 7-day metric can be computed, not just inferred.
