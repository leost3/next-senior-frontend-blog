---
status: in-progress
title: Turso DB setup — schema + env vars
type: infra
complexity: low
dependencies: []
---

# Task 1: Turso DB setup — schema + env vars

## Overview

Provision the Turso database that stores likes, comments, and vitals data. This task creates the database via the Vercel Marketplace, runs the SQL schema to create the three tables, and wires the required environment variables into the Vercel project. All subsequent tasks that touch the database depend on this being complete.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create a Turso database via Vercel Marketplace and link it to the project
- MUST run the SQL schema from TechSpec "Data Models" section to create `likes`, `comments`, and `vitals` tables with all specified indexes
- MUST add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to Vercel environment variables (all environments)
- MUST add both variables to `.env.local` for local development (file must be gitignored)
- MUST verify the tables exist and are queryable via the Turso shell or dashboard before marking complete
</requirements>

## Subtasks

- [ ] 1.1 Create Turso database via Vercel Marketplace integration — **MANUAL ACTION REQUIRED**: Go to Vercel dashboard > Integrations > Marketplace > Turso, install and link to this project
- [x] 1.2 Run the three-table SQL schema (likes, comments, vitals) including all indexes — `schema.sql` created; apply via `turso db shell <db-name> < schema.sql` after step 1.1
- [ ] 1.3 Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to Vercel env vars (production + preview + development) — **MANUAL ACTION REQUIRED**: Copy values from Vercel dashboard after step 1.1
- [x] 1.4 Create `.env.local` with both variables for local dev; verify `.gitignore` excludes it — `.env.local.example` created; `.gitignore` already covers `.env*`; copy example to `.env.local` and fill in credentials after step 1.1
- [ ] 1.5 Smoke-test connectivity by running a `SELECT 1` via the Turso shell — pending steps 1.1 + 1.3; integration tests in `__tests__/task_01.integration.test.ts` will validate automatically once env vars are set

## Implementation Details

See TechSpec "Data Models" section for the exact SQL schema DDL (three `CREATE TABLE` statements and two `CREATE INDEX` statements).

See TechSpec "Integration Points — Turso" section for the two required environment variable names.

### Relevant Files

- `.env.local` — create for local DB credentials (must not be committed)
- `.gitignore` — verify `.env.local` is excluded

### Dependent Files

- `lib/db.ts` — will be created in task_02 and depends on these env vars being present

### Related ADRs

- [ADR-002: next-mdx-remote for MDX Content Processing](adrs/adr-002.md) — N/A (infra task)

## Deliverables

- Turso database provisioned and linked to Vercel project
- All three tables created with correct schema and indexes
- Both env vars present in Vercel dashboard and `.env.local`
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for DB connectivity **(REQUIRED)**

## Tests

- Unit tests (`__tests__/task_01.unit.test.ts`):
  - [x] `schema.sql` exists and contains all three tables and both indexes
  - [x] `.env.local.example` exists and documents both required variables
  - [x] `.gitignore` excludes `.env.local` (via `.env*` pattern)
  - [x] `.env.local` env var tests are skipped gracefully when file is absent (pre-provisioning)
  - [x] `.env.local` contains both `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` (runs when `.env.local` exists)
  - [x] Both variables are non-empty strings (runs when `.env.local` exists)
- Integration tests (`__tests__/task_01.integration.test.ts` — skip until DB provisioned):
  - [ ] `SELECT count(*) FROM likes` returns 0 rows without error
  - [ ] `SELECT count(*) FROM comments` returns 0 rows without error
  - [ ] `SELECT count(*) FROM vitals` returns 0 rows without error
  - [ ] `INSERT INTO likes (slug, count) VALUES ('test', 1)` succeeds; follow-up `DELETE` cleans up
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Turso dashboard shows three tables with correct column names
- Vercel deployment succeeds with env vars configured
