# AI Usage

## Tools used

Claude Code (Claude desktop app, Code tab), working in this repository: planning, code edits, running tests and the dev servers, and checking the UI in a browser.

## What AI helped with

| Area | How AI was used | My involvement |
|------|-----------------|----------------|
| Planning | Read the spec and starter, proposed an ordered plan with time budgets. | I chose the extra rule (estimated time remaining), the Angular frontend and GitHub submission. I restructured the repo (baseline kept separate, git initialised first, `backend/` + `frontend/` layout) and asked for the baseline starter to be its own first commit. |
| Backend service | Implemented `getInProgressCourses` (status filter, stale flag, sort) using the starter's existing helpers. | I reviewed the diff, had the reformatting of the filter and sort chains reverted, and had the commit amended so history stays clean. |
| Extra rule | Wrote `estimateMinutesRemaining`, seed durations and tests. | I picked the rule and the 10-minute default. I can explain why the default is not zero and why it is a pure function. |
| Angular UI | Wrote the component (signals for loading/error/ready), template, styles, format helpers, the filter and the analytics stub. | I reviewed behaviour in the browser across learners 1, 2, 3, 999 and with the backend stopped. |
| Frontend tests and CI | Set up Karma + Jasmine, wrote the formatter and component tests, and the GitHub Actions workflow. | I raised Vitest as the current Angular default. Claude checked and found Angular 19.2 only ships the Karma builder, so we kept the starter's version instead of upgrading the stack on deadline day. |
| Starter bug | Found that `npm run dev` for Angular failed (`serve` target missing `buildTarget`) and fixed it. | Verified the quick start works after the fix. |
| Docs | Drafted README, PRODUCT.md and this file. | I edited them for accuracy and wrote the statements below in my own voice. |

## What I rejected or rewrote

- **Multi-line wrapping of the filter/sort chains** in the first backend commit. It was pure formatting noise in the diff, so I had it reverted and the commit amended.
- **A `course_selected` analytics event.** It was in the first plan, but with no detail page a click would measure nothing, so it was cut.
- **A dropdown without an unknown learner.** The first UI plan omitted learner 999. After reading `backend/README.md` (which suggests 999 for the error state) the plan changed, and a seeded learner 3 was added for the empty state, since no starter learner had zero in-progress courses.
- **A `Co-Authored-By` trailer on commits.** I do not want AI attribution in git history. AI use is disclosed here instead.
- **Upgrading Angular to get Vitest.** Rejected as an unrequested change to the provided stack.

## What I'd do differently without AI

The design calls would have been the same, but the boilerplate (tests, CI, docs) would have taken most of the two hours so I'd have cut the filter and CI, and I'd still have had to run the app myself to catch the starter's broken `ng serve` config and the proxy's bare 500s.

## Ownership statement

I can explain and change live, without AI: the `getInProgressCourses` pipeline in `progressService.ts` (filter, map, sort, and why `now` is injectable for testing); `estimateMinutesRemaining` and the tradeoff behind the 10-minute default; the signal-based loading/error/ready states in `app.ts`, including cancelling the in-flight request when the learner changes; the `AnalyticsService` seam and how I'd swap in a real client; the frontend tests and the CI workflow; and where the 403 trust-boundary check belongs in `progressRoutes.ts`. Angular is my strongest area, but the signals and `@if`/`@for` syntax used here is newer than the Angular 13 codebase I upgraded, so I'd check the docs for API details. My backend background is mainly .NET, so I leaned on AI more for the Express/TypeScript wiring. I reviewed all of it, reverted formatting I didn't want, and rejected suggestions that didn't earn their scope, such as the `course_selected` event.
