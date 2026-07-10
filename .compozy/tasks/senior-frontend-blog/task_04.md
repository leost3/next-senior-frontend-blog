---
status: completed
title: Search index build script + next.config.ts
type: chore
complexity: medium
dependencies:
  - task_03
---

# Task 4: Search index build script + next.config.ts

## Overview

Create `scripts/build-search-index.ts` which reads all posts at build time and writes `public/search-index.json`. Hook this script into `package.json` as a prebuild step so the index is always current before `next build` runs. Also update `next.config.ts` with any required configuration. Add `public/search-index.json` to `.gitignore`.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST produce `public/search-index.json` matching the `SearchEntry[]` shape from TechSpec "Core Interfaces"
- MUST cap the `excerpt` field at 500 characters of plain text (strip MDX/JSX syntax before truncating)
- MUST exit with code 1 on any parse error so a broken index never ships
- MUST be executable via `npx tsx scripts/build-search-index.ts` (install `tsx` as a dev dependency)
- MUST be wired as `"prebuild": "tsx scripts/build-search-index.ts"` in `package.json`
- `public/search-index.json` MUST be added to `.gitignore`
- `next.config.ts` MUST remain valid TypeScript after any modifications
</requirements>

## Subtasks

- [x] 4.1 Install `tsx` as a dev dependency via `pnpm add -D tsx`
- [x] 4.2 Create `scripts/build-search-index.ts` that reads all posts and writes the JSON index
- [x] 4.3 Add `"prebuild": "tsx scripts/build-search-index.ts"` to `package.json` scripts
- [x] 4.4 Add `public/search-index.json` to `.gitignore`
- [x] 4.5 Verify `pnpm build` generates the index file before Next.js compilation starts

## Implementation Details

See TechSpec "Core Interfaces — Search index entry" for the `SearchEntry` type shape.

See TechSpec "ADR-003" and the "Search index delivery" section for why this file lives in `public/`.

The script imports `getAllPosts` from `lib/posts.ts`. For each post, strip MDX syntax from the content body using a regex before slicing the excerpt. Write the array as pretty-printed JSON to `public/search-index.json`.

`next.config.ts` currently has no configuration. No changes required unless the MDX pipeline needs to be hooked here — `next-mdx-remote` does not require `next.config.ts` changes, so this subtask may be a no-op.

### Relevant Files

- `scripts/build-search-index.ts` — create this file
- `package.json` — add prebuild script + tsx dev dependency
- `.gitignore` — add `public/search-index.json`
- `next.config.ts` — verify/update
- `public/` — output directory for generated index

### Dependent Files

- `app/api/search/route.ts` — fetches the generated index file (task_08)

### Related ADRs

- [ADR-003: Search Index as Public Static File](adrs/adr-003.md) — This task implements the chosen delivery strategy

## Deliverables

- `scripts/build-search-index.ts` generating valid `SearchEntry[]` JSON
- `prebuild` script in `package.json`
- `public/search-index.json` excluded from git
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for build output **(REQUIRED)**

## Tests

- Unit tests:
  - [x] MDX syntax stripper removes `<Component />` and `{expression}` from content before excerpt is taken
  - [x] Excerpt is truncated at exactly 500 characters
  - [x] Script exits with code 1 when `content/posts/` is missing
  - [x] Output array contains one `SearchEntry` per `.mdx` file in the posts directory
- Integration tests:
  - [x] Running `tsx scripts/build-search-index.ts` against a fixture posts directory produces valid JSON at `public/search-index.json`
  - [ ] `pnpm build` completes successfully and `public/search-index.json` exists after the build (skipped — requires full build run)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- `pnpm build` generates `public/search-index.json` before Next.js compiles
- `public/search-index.json` is listed in `.gitignore`
