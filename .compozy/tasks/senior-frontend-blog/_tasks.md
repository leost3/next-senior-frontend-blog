# Senior Frontend Blog — Task List

## Tasks

| # | Title | Status | Complexity | Dependencies |
|---|-------|--------|------------|--------------|
| 01 | Turso DB setup — schema + env vars | in-progress | low | — |
| 02 | lib/db.ts — Turso singleton | completed | low | task_01 |
| 03 | lib/posts.ts + lib/reading-time.ts | completed | medium | — |
| 04 | Search index build script + next.config.ts | completed | medium | task_03 |
| 05 | Layout foundation — design tokens + Header + ThemeToggle | completed | medium | — |
| 06 | Home page — PostList + TagFilter | completed | medium | task_03, task_05 |
| 07 | Post page — [slug]/page.tsx + ReadingProgress + MDX components | completed | high | task_03, task_05 |
| 08 | Edge search API route /api/search | completed | medium | task_04 |
| 09 | SearchInput client component | completed | low | task_08 |
| 10 | Likes — Server Action + LikeButton | completed | medium | task_02, task_07 |
| 11 | Comments — Server Action + CommentForm + CommentList | pending | high | task_02, task_07 |
| 12 | Vitals API — /api/vitals + /api/vitals/summary | completed | medium | task_02 |
| 13 | VitalsWidget client component | completed | medium | task_12, task_06 |
| 14 | 3 seed MDX posts | completed | low | task_07 |
