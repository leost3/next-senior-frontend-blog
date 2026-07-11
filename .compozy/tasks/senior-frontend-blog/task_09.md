---
status: completed
title: SearchInput client component
type: frontend
complexity: low
dependencies:
  - task_08
---

# Task 9: SearchInput client component

## Overview

Build `components/SearchInput.tsx`, a Client Component that accepts user input, debounces queries, calls the `/api/search` edge route, and displays results as a dropdown. The component is positioned on the home page near the post list and handles loading, empty, and error states.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST be a `'use client'` component
- MUST debounce input by 300ms before firing a search request
- MUST display a loading indicator while the request is in-flight
- MUST display the results dropdown with title and description per match
- MUST navigate to `/blog/[slug]` when a result is clicked
- MUST dismiss the results dropdown when focus leaves the component or Escape is pressed
- MUST show an empty state message when the query returns no results
- MUST NOT fire a request for queries shorter than 2 characters
</requirements>

## Subtasks

- [x] 9.1 Create `components/SearchInput.tsx` with controlled input and debounce
- [x] 9.2 Implement fetch to `/api/search?q=...` with loading and error states
- [x] 9.3 Render results dropdown with keyboard navigation (arrow keys + Enter)
- [x] 9.4 Handle Escape key dismissal and outside-click dismissal
- [x] 9.5 Add `SearchInput` to `app/page.tsx` (replacing or adding near tag filter)

## Implementation Details

See TechSpec "API Endpoints — GET /api/search" for the response shape.

See TechSpec "Directory Structure" for component file location.

Debounce via `setTimeout`/`clearTimeout` in a `useEffect` — no extra library needed. Use `useRef` for the debounce timer and the container element (for outside-click detection).

### Relevant Files

- `components/SearchInput.tsx` — create
- `app/page.tsx` — add SearchInput to home page (task_06)
- `app/api/search/route.ts` — called by this component (task_08)

### Dependent Files

- None downstream in Phase 1

## Deliverables

- `components/SearchInput.tsx`
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for search flow **(REQUIRED)**

## Tests

- Unit tests:
  - [x] No fetch is fired when the input value is fewer than 2 characters
  - [x] Fetch is fired 300ms after the last keystroke, not on every keystroke
  - [x] Results dropdown renders one item per search result returned
  - [x] Clicking a result navigates to `/blog/[slug]`
  - [x] Pressing Escape dismisses the dropdown
  - [x] Empty state message is shown when results array is empty
  - [x] Loading indicator is visible while fetch is in-flight
- Integration tests:
  - [x] Typing "perf" into the search input on the home page shows results from the real API within 500ms
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Search works on the home page without a full page reload
- Keyboard-navigable result list (arrow keys + Enter)
