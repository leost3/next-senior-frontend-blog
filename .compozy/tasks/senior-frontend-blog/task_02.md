---
status: completed
title: lib/db.ts — Turso singleton
type: backend
complexity: low
dependencies:
  - task_01
---

# Task 2: lib/db.ts — Turso singleton

## Overview

Create `lib/db.ts`, the shared Turso client singleton used by all Server Actions and API routes that write to or read from the database. This is the only place in the codebase that instantiates the `@libsql/client` — every other module imports `db` from here.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST use `@libsql/client/http` transport (required for edge runtime compatibility)
- MUST read `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` from environment — no hardcoded values
- MUST throw at module load time if either env var is missing, so misconfiguration is caught early
- MUST export the client as a named `db` export
- MUST add `@libsql/client` to `package.json` dependencies via `pnpm add`
</requirements>

## Subtasks

- [x] 2.1 Install `@libsql/client` via `pnpm add @libsql/client`
- [x] 2.2 Create `lib/db.ts` with the singleton client using HTTP transport
- [x] 2.3 Add environment variable validation that throws a clear error on missing vars
- [x] 2.4 Verify the import resolves correctly in a Server Component context

## Implementation Details

See TechSpec "Core Interfaces — Turso DB client" section for the exact interface and import path.

Use `@libsql/client/http` specifically (not the default export) so the client works in both Node.js serverless functions and Vercel Edge Functions.

### Relevant Files

- `lib/db.ts` — create this file
- `package.json` — add `@libsql/client` dependency
- `.env.local` — env vars consumed here (created in task_01)

### Dependent Files

- `actions/likes.ts` — imports `db` (task_10)
- `actions/comments.ts` — imports `db` (task_11)
- `app/api/vitals/route.ts` — imports `db` (task_12)
- `app/api/vitals/summary/route.ts` — imports `db` (task_12)

## Deliverables

- `lib/db.ts` with singleton Turso HTTP client
- `@libsql/client` added to `package.json`
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for live DB connectivity **(REQUIRED)**

## Tests

- Unit tests:
  - [x] `createClient` is called with the correct `url` and `authToken` from env
  - [x] Module throws `Error` when `TURSO_DATABASE_URL` is undefined
  - [x] Module throws `Error` when `TURSO_AUTH_TOKEN` is undefined
  - [x] `db` export is defined and has an `execute` method
- Integration tests:
  - [ ] `db.execute({ sql: 'SELECT 1' })` resolves without error against the real dev database (skipped — requires live Turso credentials)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- `import { db } from '@/lib/db'` resolves in any Server Component or API route
- Missing env var produces a readable error at startup, not a cryptic runtime crash
