---
status: pending
title: Vitals API — /api/vitals + /api/vitals/summary
type: backend
complexity: medium
dependencies:
  - task_02
---

# Task 12: Vitals API — /api/vitals + /api/vitals/summary

## Overview

Implement two API routes that power the Web Vitals widget. `POST /api/vitals` is an Edge Function that receives a single real-user metric sample and writes it to Turso. `GET /api/vitals/summary` is a Node.js route that queries the last 30 days of samples and returns the P75 value for each of LCP, CLS, and INP. The summary route uses `next/cache` revalidation (1 hour) to avoid a DB read on every page load.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- `POST /api/vitals` MUST declare `export const runtime = 'edge'`
- `POST /api/vitals` MUST accept body `{ slug: string, metric: 'LCP' | 'CLS' | 'INP', value: number }`
- `POST /api/vitals` MUST reject malformed bodies with 400 and reject unknown metric names with 400
- `POST /api/vitals` MUST insert one row into the `vitals` table and return 204
- `GET /api/vitals/summary` MUST query the last 30 days of rows, compute P75 per metric, and return `VitalsSummary`
- `GET /api/vitals/summary` MUST use `next/cache` with `revalidate: 3600` (1-hour cache)
- P75 calculation: sort values ascending, take the value at index `Math.floor(values.length * 0.75)`
- MUST return `{ LCP: 0, CLS: 0, INP: 0 }` (not an error) when no vitals data exists yet
</requirements>

## Subtasks

- [ ] 12.1 Create `app/api/vitals/route.ts` (POST, edge runtime) for single metric ingest
- [ ] 12.2 Create `app/api/vitals/summary/route.ts` (GET, Node.js) with 30-day P75 query
- [ ] 12.3 Implement P75 calculation for each of the three metric types
- [ ] 12.4 Add 1-hour `revalidate` cache to the summary route
- [ ] 12.5 Return zeroed summary when no data exists

## Implementation Details

See TechSpec "API Endpoints" table for method, path, runtime, and response types.

See TechSpec "Data Models — vitals table" for the DB schema.

P75 query approach: `SELECT metric, value FROM vitals WHERE created_at > datetime('now', '-30 days') ORDER BY metric, value ASC`. Group results by metric in JS, then index into each sorted array at `Math.floor(arr.length * 0.75)`.

The summary route should call `cache` or use Next.js `unstable_cache` / `revalidate` export to avoid hammering Turso on every widget render.

### Relevant Files

- `app/api/vitals/route.ts` — create (POST, edge)
- `app/api/vitals/summary/route.ts` — create (GET, Node.js)
- `lib/db.ts` — imported by summary route (task_02)

### Dependent Files

- `components/VitalsWidget.tsx` — calls both routes (task_13)

## Deliverables

- `app/api/vitals/route.ts` (POST, edge)
- `app/api/vitals/summary/route.ts` (GET, cached)
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests against real DB **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] POST `/api/vitals` with `{ slug: 'test', metric: 'LCP', value: 1200 }` returns 204
  - [ ] POST `/api/vitals` with missing `metric` field returns 400
  - [ ] POST `/api/vitals` with `metric: 'FID'` (not in allowed set) returns 400
  - [ ] P75 of `[100, 200, 300, 400]` returns 300 (index 3 = `Math.floor(4 * 0.75)`)
  - [ ] Summary returns `{ LCP: 0, CLS: 0, INP: 0 }` when no rows exist
- Integration tests:
  - [ ] Inserting 4 LCP samples via POST and then calling GET `/api/vitals/summary` returns the correct P75
  - [ ] Only rows within the last 30 days are included in the P75 calculation
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- POST ingest returns 204 and inserts a DB row
- GET summary returns correct P75 values from real data
- Summary response is cached and does not trigger a Turso read on every request
