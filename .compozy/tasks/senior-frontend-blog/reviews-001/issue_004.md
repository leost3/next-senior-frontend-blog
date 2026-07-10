---
status: resolved
file: lib/posts.ts
line: 55
severity: medium
author: claude-code
provider_ref:
---

# Issue 004: Mixed date formats break sort ordering for unquoted YAML dates

## Review Comment

`parsePost()` normalises the `date` field as:

```ts
const date =
  data.date instanceof Date ? data.date.toISOString() : String(data.date)
```

`gray-matter` uses `js-yaml`, which parses unquoted YAML dates (`date: 2026-06-01`) as JS `Date` objects, producing ISO strings like `2026-06-01T00:00:00.000Z`. Quoted dates (`date: "2026-06-01"`) stay as strings like `2026-06-01`.

The sort uses lexicographic string comparison. Comparing `2026-07-01T00:00:00.000Z` (unquoted) against `2026-07-01` (quoted, same day): the ISO string is lexicographically greater because it is longer, so unquoted-date posts from the same day always sort before quoted-date posts — silently producing wrong ordering when frontmatter style is inconsistent.

The same code is duplicated in `getPost()` (see issue_003).

**Suggested fix:** Always normalise to `YYYY-MM-DD`:

```ts
const date =
  data.date instanceof Date
    ? data.date.toISOString().slice(0, 10)
    : String(data.date)
```

## Triage

- Decision: `VALID`
- Notes: Fixed `parsePost()` to use `.toISOString().slice(0, 10)` — always produces `YYYY-MM-DD` regardless of YAML quoting style. Duplicate in `getPost()` eliminated by the issue_003 refactor. 30/30 tests pass.
