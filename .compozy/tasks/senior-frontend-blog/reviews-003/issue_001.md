---
status: resolved
file: app/api/search/route.ts
line: 41
severity: high
author: claude-code
provider_ref:
---

# Issue 001: Search index fetch has no error handling — CDN failures return unhandled 500

## Review Comment

Lines 41–42 fetch the search index from the CDN and immediately parse the body as JSON with no error handling:

```ts
const res = await fetch(`${origin}/search-index.json`)
const entries: SearchEntry[] = await res.json()
```

Two failure modes are unhandled:

1. **Network/CDN failure** — `fetch()` rejects (e.g., DNS failure, timeout). The `await` throws, the edge function terminates with an uncaught exception, and Vercel returns a generic 500 with no diagnostic in the response body.

2. **Non-200 CDN response** — if the index does not yet exist (first deploy before `prebuild` runs, or a misconfigured CDN rule), `res.ok` is `false` but the code proceeds to `res.json()`. If the body is not JSON, `res.json()` throws. If the body happens to be valid JSON but not a `SearchEntry[]`, `entries.map(...)` produces runtime errors or silently returns no results without indicating the source of the problem.

Both cases mean a search query returns 500 instead of a meaningful error, and the caller (`SearchInput` component) has no way to distinguish "no results" from "service unavailable."

**Suggested fix:** Wrap the fetch in try-catch and check `res.ok`:

```ts
let entries: SearchEntry[]
try {
  const res = await fetch(`${origin}/search-index.json`)
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Search index unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  }
  entries = await res.json()
} catch {
  return new Response(JSON.stringify({ error: 'Search index unavailable' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
```

This also makes the 503 response testable in `__tests__/search-route.test.ts` by having `fetch` reject.

## Triage

- Decision: `valid`
- Notes: Confirmed — `app/api/search/route.ts` lines 41-42 fetch and parse JSON with no `res.ok` check and no try-catch. A CDN failure or non-200 response causes an unhandled 500. Fix: wrap in try-catch + check `res.ok`, return 503 JSON in both failure paths.
