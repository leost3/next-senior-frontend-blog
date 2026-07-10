---
status: pending
title: VitalsWidget client component
type: frontend
complexity: medium
dependencies:
  - task_12
  - task_06
---

# Task 13: VitalsWidget client component

## Overview

Build `components/VitalsWidget.tsx` — the blog's signature element. A Client Component that uses the `web-vitals` library to collect real user metrics from the current visitor and POSTs them to `/api/vitals`. A server-side fetch (via a parent Server Component wrapper) retrieves the 30-day P75 summary and displays LCP, CLS, and INP scores in the widget. Replace the stub in `app/page.tsx` with the real component.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST install `web-vitals` via `pnpm add web-vitals`
- MUST use `onLCP`, `onCLS`, `onINP` from `web-vitals` to collect current visitor metrics
- MUST POST each metric to `/api/vitals` as `{ slug, metric, value }` on callback
- The summary display (P75 values) MUST be fetched server-side in a Server Component wrapper, NOT by the client widget, to avoid a client-side fetch waterfall
- Widget MUST display "—" for each metric until data is available (zero-data safe)
- Widget MUST show the three metric names (LCP, CLS, INP) with their units (ms, score, ms)
- Widget MUST be visually distinct — this is the site's signature element per the PRD
- Replace `VitalsWidget` stub in `app/page.tsx` with the real Server Component wrapper
</requirements>

## Subtasks

- [ ] 13.1 Install `web-vitals` via `pnpm add web-vitals`
- [ ] 13.2 Create the `VitalsWidget` Client Component that collects and POSTs metrics
- [ ] 13.3 Create a `VitalsWidgetServer` Server Component that fetches the summary and passes it as props to `VitalsWidget`
- [ ] 13.4 Style the widget as the visual signature element (distinct but not noisy)
- [ ] 13.5 Replace stub in `app/page.tsx` with `VitalsWidgetServer`

## Implementation Details

See TechSpec "Component Overview — data flow" for the vitals collection path: `web-vitals` callback → `fetch POST /api/vitals` → Turso.

See PRD "Core Feature 5 — Live Web Vitals Widget" and "User Experience — Signature element" for design intent.

The split pattern: `VitalsWidgetServer` (Server Component) calls `fetch('/api/vitals/summary', { next: { revalidate: 3600 } })` and passes `VitalsSummary` as a prop to `VitalsWidget` (Client Component). The client component registers `web-vitals` callbacks via `useEffect` and also owns the local display of collected values.

### Relevant Files

- `components/VitalsWidget.tsx` — create (Client Component)
- `components/VitalsWidgetServer.tsx` — create (Server Component wrapper)
- `app/page.tsx` — replace stub with `VitalsWidgetServer` (task_06)
- `app/api/vitals/route.ts` — POST target (task_12)
- `app/api/vitals/summary/route.ts` — GET source (task_12)
- `package.json` — add `web-vitals`

### Dependent Files

- None downstream in Phase 1

### Related ADRs

- [ADR-001: Content-First Blog](adrs/adr-001.md) — Widget is the signature proof-of-craft element of the content-first approach

## Deliverables

- `components/VitalsWidget.tsx` (Client Component)
- `components/VitalsWidgetServer.tsx` (Server Component)
- `web-vitals` in `package.json`
- Updated `app/page.tsx` with real widget
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for metrics collection **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] Widget renders "—" for LCP, CLS, INP when `summary` prop contains zeros
  - [ ] Widget displays the P75 LCP value in milliseconds when `summary.LCP` is non-zero
  - [ ] `onLCP` callback fires a POST to `/api/vitals` with correct `{ metric: 'LCP', value }` body
  - [ ] `onCLS` callback fires a POST to `/api/vitals` with correct `{ metric: 'CLS', value }` body
  - [ ] `onINP` callback fires a POST to `/api/vitals` with correct `{ metric: 'INP', value }` body
- Integration tests:
  - [ ] Loading the home page causes at least one vitals POST to `/api/vitals` within 5s
  - [ ] Widget displays non-zero values after a real user metric has been inserted
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Widget is visible on the home page with metric labels and units
- Widget displays "—" on first load (no data) and updates after metrics are collected
- Real user LCP, CLS, INP values appear in the Turso `vitals` table after a page load
