---
status: pending
title: Likes — Server Action + LikeButton
type: frontend
complexity: medium
dependencies:
  - task_02
  - task_07
---

# Task 10: Likes — Server Action + LikeButton

## Overview

Implement the like feature: `actions/likes.ts` (Server Action that upserts a like count in Turso) and `components/LikeButton.tsx` (Client Component using `useOptimistic` for instant feedback). This is an intentional showcase of Next.js App Router patterns — the optimistic update and Server Action wiring are the key technical signal for senior developer audiences.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- `actions/likes.ts` MUST be a Server Action (`'use server'` directive at file top)
- `incrementLike(slug: string)` MUST upsert the like count using `INSERT ... ON CONFLICT DO UPDATE` (see TechSpec "Core Interfaces")
- `incrementLike` MUST return the new count as a number
- `LikeButton` MUST use React's `useOptimistic` to show the incremented count immediately before the server responds
- `LikeButton` MUST accept `slug: string` and `initialCount: number` as props
- `LikeButton` MUST be disabled and show a spinner while the Server Action is pending
- The post page (`app/blog/[slug]/page.tsx`) MUST fetch the initial like count from Turso and pass it to `LikeButton` — replace the stub from task_07
- No rate limiting or duplicate-prevention in Phase 1 (one click = one like)
</requirements>

## Subtasks

- [ ] 10.1 Create `actions/likes.ts` with `incrementLike(slug)` Server Action
- [ ] 10.2 Create `components/LikeButton.tsx` with `useOptimistic` for instant count update
- [ ] 10.3 Add initial like count fetch to `app/blog/[slug]/page.tsx` (replace stub from task_07)
- [ ] 10.4 Verify optimistic update reverts correctly if the Server Action throws

## Implementation Details

See TechSpec "Core Interfaces — Server Action like" for the exact SQL upsert and return type.

See TechSpec "Implementation Design — Server Actions" for the `actions/` directory convention.

`useOptimistic` usage: `const [optimisticCount, addOptimistic] = useOptimistic(initialCount, (state) => state + 1)`. Call `addOptimistic()` immediately on click, then `await incrementLike(slug)`.

The initial count query in the post page: `db.execute({ sql: 'SELECT count FROM likes WHERE slug = ?', args: [slug] })` — returns 0 if no row exists yet.

### Relevant Files

- `actions/likes.ts` — create
- `components/LikeButton.tsx` — create
- `app/blog/[slug]/page.tsx` — modify to fetch initial count and replace like stub (task_07)
- `lib/db.ts` — imported by Server Action (task_02)

### Dependent Files

- None downstream in Phase 1

### Related ADRs

- [ADR-001: Content-First Blog](adrs/adr-001.md) — Likes are a Phase 1 engagement feature per the content-first approach

## Deliverables

- `actions/likes.ts` with `incrementLike` Server Action
- `components/LikeButton.tsx` with `useOptimistic`
- Updated `app/blog/[slug]/page.tsx` with real initial count
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for like persistence **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] `LikeButton` displays `initialCount` before any interaction
  - [ ] Clicking `LikeButton` immediately shows `initialCount + 1` (optimistic)
  - [ ] `LikeButton` is disabled while the Server Action is pending
  - [ ] Optimistic count reverts to `initialCount` if `incrementLike` throws
- Integration tests:
  - [ ] `incrementLike('test-slug')` with no prior row inserts a row with count 1
  - [ ] `incrementLike('test-slug')` with an existing count N returns N+1
  - [ ] Like count persists across page reloads (read from DB on next page load)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Optimistic UI updates count instantly on click with no perceptible delay
- Count persists in Turso after the Server Action completes
