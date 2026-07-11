---
status: resolved
file: actions/likes.ts
line: 5
severity: medium
author: claude-code
provider_ref:
---

# Issue 003: DB errors in Server Action propagate without logging

## Review Comment

The TechSpec "Integration Points — Turso" section explicitly states:

> "**Error handling:** DB errors in Server Actions surface as `Error` thrown — Next.js converts to a user-visible error boundary. **Log the error before re-throwing.**"

`incrementLike` makes two `db.execute` calls with no try-catch and no logging:

```ts
export async function incrementLike(slug: string): Promise<number> {
  await db.execute({ sql: `INSERT ...`, args: [slug] })  // throws on Turso failure
  const result = await db.execute({ sql: `SELECT ...`, args: [slug] })  // throws on Turso failure
  return result.rows[0].count as number  // throws if rows is empty
}
```

If Turso is unavailable (timeout, rate limit, regional outage), the thrown error surfaces to Next.js's error boundary with no server-side log entry. Production debugging requires correlating Vercel function logs, which contain no context about which slug triggered the failure or what query ran.

There is also an unguarded access: `result.rows[0].count` assumes the SELECT returns at least one row. In normal operation this is guaranteed (the upsert ensures a row exists), but if a concurrent DELETE runs between the INSERT and SELECT, `result.rows[0]` is `undefined` and `.count` throws a runtime `TypeError`.

**Suggested fix:**

```ts
export async function incrementLike(slug: string): Promise<number> {
  try {
    await db.execute({
      sql: `INSERT INTO likes (slug, count) VALUES (?, 1)
            ON CONFLICT(slug) DO UPDATE SET count = count + 1`,
      args: [slug],
    })
    const result = await db.execute({
      sql: `SELECT count FROM likes WHERE slug = ?`,
      args: [slug],
    })
    return (result.rows[0]?.count as number) ?? 0
  } catch (err) {
    console.error('[likes] incrementLike failed for slug:', slug, err)
    throw err
  }
}
```

The same pattern should be applied to `actions/comments.ts` when that file is created (Task_11).

## Triage

- Decision: `valid`
- Notes: Confirmed — `actions/likes.ts` has no try-catch around the two `db.execute` calls. Turso failures surface to Next.js error boundary with zero server-side context. Also `result.rows[0].count` is unguarded (though race condition is unlikely, the safe pattern is `result.rows[0]?.count ?? 0`). Fix: wrap both calls in try-catch with `console.error` + re-throw, and use optional chaining on the row access.
