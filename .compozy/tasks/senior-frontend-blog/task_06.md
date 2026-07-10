---
status: completed
title: Home page — PostList + TagFilter
type: frontend
complexity: medium
dependencies:
  - task_03
  - task_05
---

# Task 6: Home page — PostList + TagFilter

## Overview

Replace the scaffolded `app/page.tsx` with the real home page: a server-rendered post list with date, reading time, tags, and description per entry. `PostList` is a Server Component that receives post metadata. `TagFilter` is a Client Component that narrows the visible list by tag without a page load. A stub for the `VitalsWidget` is included here and replaced in task_13.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST replace scaffolded `app/page.tsx` content entirely
- `PostList` MUST be a Server Component receiving `PostMeta[]` as props
- Each post entry MUST display: title (linked to `/blog/[slug]`), date (formatted), reading time in minutes, description, and tag chips
- `TagFilter` MUST be a Client Component that filters the visible post list by a selected tag without re-fetching from the server
- `TagFilter` MUST show an "All" option that clears the tag filter
- Home page MUST call `getAllPosts()` from `lib/posts.ts` at the Server Component level (not in a `useEffect`)
- A `VitalsWidget` placeholder (e.g., `<div>Vitals coming soon</div>`) MUST be present in the layout to reserve space — replaced in task_13
- Post list MUST be empty-state safe: if no posts exist, show a message rather than an empty page
</requirements>

## Subtasks

- [x] 6.1 Rewrite `app/page.tsx` to call `getAllPosts()` and render `PostList` + `TagFilter`
- [x] 6.2 Create `components/PostList.tsx` (Server Component)
- [x] 6.3 Create `components/TagFilter.tsx` (Client Component) with tag filtering state
- [x] 6.4 Add empty-state message for when no posts exist
- [x] 6.5 Add `VitalsWidget` placeholder to home page layout

## Implementation Details

See TechSpec "Directory Structure" section for file locations.

See PRD "Core Feature 7 — Post List with Tags and Reading Time" for the required fields.

`TagFilter` maintains `selectedTag` in `useState`. It receives the full post list and renders only matching posts. Tags are derived from the union of all tags across all posts.

The home page is statically generated (`force-static` or no `revalidate`). `getAllPosts()` runs at build time.

### Relevant Files

- `app/page.tsx` — full rewrite (currently contains Next.js scaffold)
- `components/PostList.tsx` — create
- `components/TagFilter.tsx` — create
- `lib/posts.ts` — `getAllPosts()` called here (task_03)
- `app/layout.tsx` — wraps this page (task_05)

### Dependent Files

- `components/VitalsWidget.tsx` — stub replaced in task_13
- `components/SearchInput.tsx` — may be positioned near post list (task_09)

## Deliverables

- Rewritten `app/page.tsx`
- `components/PostList.tsx`
- `components/TagFilter.tsx`
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for post list rendering **(REQUIRED)**

## Tests

- Unit tests:
  - [x] `PostList` renders a post title as a link to `/blog/[slug]` for each item in the posts array
  - [x] `PostList` renders the empty-state message when passed an empty array
  - [x] `PostList` renders reading time as "N min read"
  - [x] `TagFilter` shows all posts when "All" is selected
  - [x] `TagFilter` shows only posts matching the selected tag when a tag is active
  - [x] `TagFilter` updates visible posts without a page load when tag is changed
- Integration tests:
  - [x] Home page renders without error when `content/posts/` is empty
  - [x] Home page renders post titles and links when at least one post exists
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Home page renders correctly with 0 posts and with ≥1 post
- Tag filtering works without a page reload
- All post links resolve to valid `/blog/[slug]` routes
