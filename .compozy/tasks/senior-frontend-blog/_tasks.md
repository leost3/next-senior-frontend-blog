# Senior Frontend Blog — Task List

## Tasks

| # | Title | Status | Complexity | Dependencies |
|---|-------|--------|------------|--------------|
| 01 | Turso DB setup — schema + env vars | in-progress | low | — |
| 02 | lib/db.ts — Turso singleton | pending | low | task_01 |
| 03 | lib/posts.ts + lib/reading-time.ts | completed | medium | — |
| 04 | Search index build script + next.config.ts | pending | medium | task_03 |
| 05 | Layout foundation — design tokens + Header + ThemeToggle | completed | medium | — |
| 06 | Home page — PostList + TagFilter | pending | medium | task_03, task_05 |
| 07 | Post page — [slug]/page.tsx + ReadingProgress + MDX components | pending | high | task_03, task_05 |
| 08 | Edge search API route /api/search | pending | medium | task_04 |
| 09 | SearchInput client component | pending | low | task_08 |
| 10 | Likes — Server Action + LikeButton | pending | medium | task_02, task_07 |
| 11 | Comments — Server Action + CommentForm + CommentList | pending | high | task_02, task_07 |
| 12 | Vitals API — /api/vitals + /api/vitals/summary | pending | medium | task_02 |
| 13 | VitalsWidget client component | pending | medium | task_12, task_06 |
| 14 | 3 seed MDX posts | pending | low | task_07 |
