---
status: completed
title: Post page — [slug]/page.tsx + ReadingProgress + MDX components
type: frontend
complexity: high
dependencies:
  - task_03
  - task_05
---

# Task 7: Post page — [slug]/page.tsx + ReadingProgress + MDX components

## Overview

Build the individual post page route at `app/blog/[slug]/page.tsx`. This renders MDX content via `next-mdx-remote/rsc` as a React Server Component with syntax-highlighted code blocks (rehype-pretty-code + Shiki). Two custom MDX components (`Callout` and `CodeDiff`) are registered here. A `ReadingProgress` Client Component shows a scroll progress bar at the top of post pages. This is the most complex frontend task — it introduces the MDX compilation pipeline, `generateStaticParams`, and the reading progress interaction.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST install `rehype-pretty-code` and `shiki` as dev dependencies
- MUST use `next-mdx-remote/rsc` to compile and render MDX server-side (zero client JS for post content)
- MUST use `generateStaticParams` to enumerate all post slugs for static generation
- `generateMetadata` MUST return title and description from post frontmatter
- MUST pass `rehypePrettyCode` as a rehype plugin with a Shiki theme consistent with the dark/light design tokens
- MUST register custom MDX components: `Callout` and `CodeDiff`
- MUST return a Next.js 404 response when a slug has no matching post file
- `ReadingProgress` MUST be a Client Component using scroll position to drive a CSS width value; MUST respect `prefers-reduced-motion`
- Post layout MUST include: title, date, reading time, tag chips, article body, and placeholders for `LikeButton` and `CommentList` (filled in tasks 10 and 11)
</requirements>

## Subtasks

- [x] 7.1 Install `rehype-pretty-code` and `shiki` via `pnpm add -D`
- [x] 7.2 Create `app/blog/[slug]/page.tsx` with `generateStaticParams`, `generateMetadata`, and MDX render
- [x] 7.3 Create `components/ReadingProgress.tsx` (Client Component, scroll-driven progress bar)
- [x] 7.4 Create `components/mdx/Callout.tsx` (informational callout box with variant prop: info/warn/danger)
- [x] 7.5 Create `components/mdx/CodeDiff.tsx` (side-by-side or before/after code comparison)
- [x] 7.6 Wire `rehypePrettyCode` into the `next-mdx-remote` compile options
- [x] 7.7 Add `LikeButton` and `CommentList` stubs to post layout (replaced in tasks 10 and 11)

## Implementation Details

See TechSpec "Core Interfaces — Post frontmatter type" for the `Post` and `PostMeta` shapes.

See TechSpec "Directory Structure" for file locations.

The `next-mdx-remote/rsc` `MDXRemote` component accepts `options.mdxOptions.rehypePlugins`. Pass `[rehypePrettyCode, { theme: { dark: 'github-dark', light: 'github-light' } }]` or a theme consistent with the design token palette.

For the 404 case, use Next.js `notFound()` from `next/navigation`.

`ReadingProgress` listens to `window.scroll` via `useEffect`, computes `(scrollTop / (scrollHeight - clientHeight)) * 100`, and sets a CSS custom property or inline style on a fixed-position thin bar.

### Relevant Files

- `app/blog/[slug]/page.tsx` — create
- `components/ReadingProgress.tsx` — create
- `components/mdx/Callout.tsx` — create
- `components/mdx/CodeDiff.tsx` — create
- `lib/posts.ts` — `getPost()` and `getAllPosts()` called here (task_03)
- `package.json` — add rehype-pretty-code + shiki devDependencies

### Dependent Files

- `components/LikeButton.tsx` — stub replaced in task_10
- `components/CommentForm.tsx` + `components/CommentList.tsx` — stub replaced in task_11
- `content/posts/*.mdx` — seed posts added in task_14

### Related ADRs

- [ADR-002: next-mdx-remote for MDX Content Processing](adrs/adr-002.md) — This task is the primary implementation of this ADR

## Deliverables

- `app/blog/[slug]/page.tsx` with static generation and MDX rendering
- `components/ReadingProgress.tsx`
- `components/mdx/Callout.tsx`
- `components/mdx/CodeDiff.tsx`
- `rehype-pretty-code` and `shiki` in devDependencies
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for post rendering **(REQUIRED)**

## Tests

- Unit tests:
  - [x] `generateStaticParams` returns one entry per `.mdx` file in `content/posts/`
  - [x] `generateMetadata` returns the correct title and description for a known slug
  - [x] Page calls `notFound()` when `getPost()` returns null
  - [x] `ReadingProgress` bar width is 0% at scroll position 0
  - [x] `ReadingProgress` bar width is 100% at maximum scroll position
  - [x] `ReadingProgress` applies no transition when `prefers-reduced-motion: reduce` is set
  - [x] `Callout` renders with correct variant class for "info", "warn", and "danger"
- Integration tests:
  - [x] Post page renders MDX content for a fixture post slug without hydration errors
  - [x] Code blocks in MDX render with syntax highlighting HTML (no raw backtick blocks)
  - [ ] Navigating to `/blog/unknown-slug` returns a 404 status code (requires running Next.js server)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Post page renders MDX with highlighted code blocks in both light and dark modes
- Unknown slug returns 404
- `pnpm build` succeeds with at least one post in `content/posts/`
