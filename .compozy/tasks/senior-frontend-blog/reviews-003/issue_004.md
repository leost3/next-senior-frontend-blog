---
status: resolved
file: app/api/vitals/route.ts
line: 38
severity: medium
author: claude-code
provider_ref:
---

# Issue 004: db.execute call has no error handling — Turso failures return unstructured 500

## Review Comment

After all input validation passes, the `db.execute` call on line 38 is bare:

```ts
await db.execute({
  sql: `INSERT INTO vitals (slug, metric, value) VALUES (?, ?, ?)`,
  args: [b.slug, b.metric, b.value],
})

return new Response(null, { status: 204 })
```

If Turso is unavailable (connection refused, auth token expired, write timeout), `db.execute` throws. The edge function terminates with an unhandled exception and the caller receives a generic 500 with no body, no `Content-Type`, and no diagnostic information. The `VitalsWidget` client component (Task_13) cannot distinguish a 500 from a network failure.

Additionally, unlike the post page's db call (which wraps with try-catch and degrades gracefully), this route has no graceful degradation at all — a single Turso hiccup drops the vitals sample silently from the caller's perspective (the 500 is likely swallowed by the client's `fetch` call).

**Suggested fix:**

```ts
try {
  await db.execute({
    sql: `INSERT INTO vitals (slug, metric, value) VALUES (?, ?, ?)`,
    args: [b.slug, b.metric, b.value],
  })
} catch (err) {
  console.error('[vitals] db insert failed:', err)
  return new Response(JSON.stringify({ error: 'Failed to record vitals' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  })
}

return new Response(null, { status: 204 })
```

Returning 503 (not 500) signals to the caller that this is a temporary unavailability rather than a client error, allowing retry logic if added later.

## Triage

- Decision: `valid`
- Notes: Confirmed — `app/api/vitals/route.ts` line 38 calls `db.execute` with no try-catch. A Turso failure produces an unhandled 500 with no body. Fix: wrap in try-catch, log the error, return 503 JSON response.
