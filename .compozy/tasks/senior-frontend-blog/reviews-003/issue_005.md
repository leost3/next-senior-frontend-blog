---
status: resolved
file: app/blog/[slug]/page.tsx
line: 6
severity: medium
author: claude-code
provider_ref:
---

# Issue 005: Module-level db import breaks builds when Turso env vars are absent

## Review Comment

`lib/db.ts` throws at module evaluation time if `TURSO_DATABASE_URL` or `TURSO_AUTH_TOKEN` are unset:

```ts
// lib/db.ts
if (!url) {
  throw new Error('Missing environment variable: TURSO_DATABASE_URL. ...')
}
```

Before Task_10, the post page imported nothing from `lib/db`, so `pnpm build` succeeded without Turso credentials — developers could build locally to test MDX rendering, syntax highlighting, and static generation without a live Turso instance.

The Task_10 change adds a top-level import:

```ts
import { db } from '@/lib/db'  // line 6
```

This import is evaluated when Next.js processes `app/blog/[slug]/page.tsx` during `generateStaticParams`. Now `pnpm build` fails immediately with `Error: Missing environment variable: TURSO_DATABASE_URL` even if the developer only wants to verify that MDX posts render correctly. The seed posts (Task_14) are also affected: `pnpm build` is listed as a success criterion for Task_14, but the build now unconditionally requires Turso credentials.

Note: the `db.execute` call itself is safely wrapped in try-catch (lines 45–55), but that try-catch is unreachable because the module fails to load before any function body executes.

**Suggested fix — lazy import inside the page function:**

Move the DB call to a standalone async helper so the `db` module is only imported when the page function actually runs (not at module load time). Alternatively, restructure `lib/db.ts` to export a lazy getter rather than a module-level singleton that throws on import:

```ts
// Option A: lazy import in page function
async function getLikeCount(slug: string): Promise<number> {
  try {
    const { db } = await import('@/lib/db')
    const result = await db.execute({ sql: 'SELECT count FROM likes WHERE slug = ?', args: [slug] })
    return (result.rows[0]?.count as number) ?? 0
  } catch {
    return 0
  }
}
```

Dynamic import inside an `async` function is safe in Next.js App Router Server Components and does not affect the static params generation path.

**Alternatively (Option B):** modify `lib/db.ts` to throw lazily (on first `execute` call) rather than at import time, which is a broader fix benefiting all routes that import it but is a more invasive change.

## Triage

- Decision: `valid`
- Notes: Confirmed — `app/blog/[slug]/page.tsx` line 6 has `import { db } from '@/lib/db'` at module level. `lib/db.ts` throws synchronously at evaluation time if `TURSO_DATABASE_URL` is unset, so `pnpm build` fails even without Turso credentials. Fix: remove the top-level import and use `const { db } = await import('@/lib/db')` inside the try-catch in `PostPage`, so the module is only loaded when the function actually runs during SSR — not during `generateStaticParams`.
