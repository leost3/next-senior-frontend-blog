---
status: completed
title: lib/posts.ts + lib/reading-time.ts
type: backend
complexity: medium
dependencies: []
---

# Task 3: lib/posts.ts + lib/reading-time.ts

## Overview

Create the two core content utilities that all post-rendering and listing surfaces depend on. `lib/posts.ts` reads `.mdx` files from `content/posts/`, parses frontmatter, and returns typed `PostMeta` and `Post` objects. `lib/reading-time.ts` calculates estimated reading time from word count. These are pure build-time Node.js utilities — no database, no HTTP.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST install `next-mdx-remote` and `gray-matter` via pnpm
- MUST export `getAllPosts(): PostMeta[]` returning posts sorted descending by date
- MUST export `getPost(slug: string): Post | null` returning null for unknown slugs
- MUST export `PostMeta` and `Post` types matching the TechSpec "Core Interfaces" section exactly
- MUST create the `content/posts/` directory structure
- `reading-time.ts` MUST export `calculateReadingTime(content: string): number` returning minutes as a whole number (minimum 1)
- Reading time MUST be calculated at parse time and stored in the `PostMeta.readingTime` field
- MUST handle missing or malformed frontmatter gracefully (skip the post with a console.warn, do not throw)
</requirements>

## Subtasks

- [x] 3.1 Install `next-mdx-remote` and `gray-matter` via `pnpm add`
- [x] 3.2 Create `lib/reading-time.ts` with word-count-based minute estimate
- [x] 3.3 Create `lib/posts.ts` with `getAllPosts()` and `getPost()` using `gray-matter`
- [x] 3.4 Create `content/posts/` directory with a `.gitkeep` so the directory is tracked
- [x] 3.5 Verify TypeScript types match the `PostMeta` and `Post` interfaces from TechSpec

## Implementation Details

See TechSpec "Core Interfaces — Post frontmatter type" for the exact `PostMeta` and `Post` type definitions.

`getAllPosts()` uses Node.js `fs.readdirSync` to list `.mdx` files, then `gray-matter` to parse each. Strip the `.mdx` extension to derive the slug. Sort by `date` descending before returning.

`getPost()` calls `getAllPosts()` internally to find the matching slug, then reads the raw file content for the MDX body.

`calculateReadingTime()`: assume 200 words per minute; strip MDX/JSX syntax before counting words; return `Math.max(1, Math.ceil(wordCount / 200))`.

### Relevant Files

- `lib/posts.ts` — create this file
- `lib/reading-time.ts` — create this file
- `content/posts/` — create directory
- `package.json` — add `next-mdx-remote` and `gray-matter`

### Dependent Files

- `scripts/build-search-index.ts` — imports `getAllPosts` (task_04)
- `app/page.tsx` — calls `getAllPosts` (task_06)
- `app/blog/[slug]/page.tsx` — calls `getPost` and `getAllPosts` (task_07)

### Related ADRs

- [ADR-002: next-mdx-remote for MDX Content Processing](adrs/adr-002.md) — This task installs next-mdx-remote and gray-matter per this decision

## Deliverables

- `lib/posts.ts` with `getAllPosts()` and `getPost()` functions
- `lib/reading-time.ts` with `calculateReadingTime()` function
- `content/posts/` directory created
- `next-mdx-remote` and `gray-matter` in `package.json`
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for file parsing **(REQUIRED)**

## Tests

- Unit tests:
  - [x] `calculateReadingTime('')` returns 1 (minimum)
  - [x] `calculateReadingTime` of a 400-word string returns 2
  - [x] `getAllPosts()` with an empty `content/posts/` directory returns `[]`
  - [x] `getAllPosts()` returns posts sorted by date descending (newest first)
  - [x] `getPost('unknown-slug')` returns `null`
  - [x] Post with missing `title` frontmatter is skipped with a console.warn (no throw)
  - [x] `PostMeta.readingTime` is populated from the content body
- Integration tests:
  - [x] `getAllPosts()` against a fixture directory with two valid `.mdx` files returns both posts with correct metadata
  - [x] `getPost('fixture-slug')` returns the raw MDX content of the matching file
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- `getAllPosts()` returns typed `PostMeta[]` with no TypeScript errors
- `getPost()` compiles and returns `Post | null`
