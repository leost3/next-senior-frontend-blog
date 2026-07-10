---
status: pending
title: Comments — Server Action + CommentForm + CommentList
type: frontend
complexity: high
dependencies:
  - task_02
  - task_07
---

# Task 11: Comments — Server Action + CommentForm + CommentList

## Overview

Implement the full anonymous comment system: `actions/comments.ts` (Server Action that verifies the Turnstile token and inserts a comment), `components/CommentForm.tsx` (Client Component with Turnstile widget + honeypot field), and `components/CommentList.tsx` (server-fetched comment list). This task requires Cloudflare Turnstile credentials to be configured before testing.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST install `@marsidev/react-turnstile` via pnpm
- `actions/comments.ts` MUST be a Server Action that accepts `(slug, body, authorName, turnstileToken)`
- MUST verify the Turnstile token against the Cloudflare API before inserting; silently return without error on failed verification (bot behavior)
- MUST reject submissions where the honeypot field is non-empty (return without error)
- MUST insert the comment into Turso `comments` table with `id`, `slug`, `author_name`, `body`, `created_at`
- `CommentForm` MUST include: author name field, body textarea, hidden honeypot field, `@marsidev/react-turnstile` widget
- `CommentList` MUST be a Server Component (or async RSC pattern) that fetches comments for the current slug from Turso and renders them in chronological order
- Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` to `.env.local` and Vercel env vars
- Replace comment stubs in `app/blog/[slug]/page.tsx` from task_07
</requirements>

## Subtasks

- [ ] 11.1 Install `@marsidev/react-turnstile` and configure Turnstile site + secret keys
- [ ] 11.2 Create `actions/comments.ts` with Turnstile verification + honeypot check + DB insert
- [ ] 11.3 Create `components/CommentForm.tsx` with Turnstile widget, honeypot, and form fields
- [ ] 11.4 Create `components/CommentList.tsx` fetching and rendering comments for a slug
- [ ] 11.5 Replace comment stubs in `app/blog/[slug]/page.tsx` with real components
- [ ] 11.6 Add both Turnstile env vars to `.env.local` and Vercel dashboard

## Implementation Details

See TechSpec "Integration Points — Cloudflare Turnstile" for the verification endpoint, env var names, and error handling strategy.

See TechSpec "Data Models" for the `comments` table schema.

Turnstile verification: POST to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `{ secret: TURNSTILE_SECRET_KEY, response: turnstileToken }`. Check `success` field in the response JSON.

`CommentList` uses `db.execute({ sql: 'SELECT * FROM comments WHERE slug = ? ORDER BY created_at ASC', args: [slug] })`. This is a Server Component — no client state.

### Relevant Files

- `actions/comments.ts` — create
- `components/CommentForm.tsx` — create
- `components/CommentList.tsx` — create
- `app/blog/[slug]/page.tsx` — modify to replace stubs (task_07)
- `lib/db.ts` — imported by Server Action (task_02)
- `package.json` — add `@marsidev/react-turnstile`

### Dependent Files

- None downstream in Phase 1

### Related ADRs

- [ADR-001: Content-First Blog](adrs/adr-001.md) — Anonymous comments are a Phase 1 engagement feature

## Deliverables

- `actions/comments.ts`
- `components/CommentForm.tsx`
- `components/CommentList.tsx`
- `@marsidev/react-turnstile` in `package.json`
- Both Turnstile env vars in `.env.local` and Vercel
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for comment submission and listing **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] Server Action does not insert when honeypot field is non-empty
  - [ ] Server Action does not insert when Turnstile verification returns `success: false`
  - [ ] Server Action inserts a row and returns when Turnstile verification returns `success: true`
  - [ ] `CommentForm` renders an author name input, a body textarea, and a hidden honeypot input
  - [ ] `CommentList` renders "No comments yet" when the DB returns an empty array for the slug
  - [ ] `CommentList` renders one list item per comment row returned
- Integration tests:
  - [ ] Submitting `CommentForm` with a valid Turnstile token (test key) inserts a row in the `comments` table
  - [ ] The inserted comment appears in `CommentList` after a page reload
  - [ ] Submitting with a non-empty honeypot field produces no DB insert
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Comment appears on the post page after successful submission
- Automated bot submission (non-empty honeypot) produces no DB insert
- Turnstile widget is invisible to human visitors (zero UX friction)
