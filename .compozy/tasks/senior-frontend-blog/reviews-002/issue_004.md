---
status: resolved
file: __tests__/build-search-index.test.ts
line: 52
severity: medium
author: claude-code
provider_ref:
---

# Issue 004: Integration test re-implements script logic inline — actual script entry point is never executed

## Review Comment

The integration test in `describe('search index builder (integration)')` does not execute `scripts/build-search-index.ts`. Instead it re-implements the index-building logic inline by importing `getAllPosts`/`getPost` directly and calling `stripMdx` (a local copy of the function) itself:

```ts
// test re-implements buildIndex() manually:
const { getAllPosts, getPost } = await import('../lib/posts')
const posts = getAllPosts()
const entries = posts.map(meta => {
  const post = getPost(meta.slug)!
  return { ..., excerpt: stripMdx(post.content).slice(0, 500) }
})
```

The actual script has two behaviours that these tests never exercise:

1. **Top-level `postsDir` guard** — if `content/posts/` does not exist, the script calls `process.exit(1)`. Task_04 requires this: "MUST exit with code 1 when `content/posts/` is missing". There is a unit test with a description matching this requirement but it doesn't appear in the test file — it was likely planned but omitted.

2. **`process.exit(1)` on a bad post** — if `getPost()` returns null mid-build, the script calls `process.exit(1)`. This path is never hit by the tests.

The integration test essentially tests `getAllPosts()` and `getPost()` again (already covered in `posts.test.ts`), not the script itself.

**Suggested fix:** Export `buildIndex` and `stripMdx` from the script so they can be imported in tests:

```ts
// scripts/build-search-index.ts
export function stripMdx(content: string): string { ... }
export function buildIndex(): SearchEntry[] { ... }

// Only run as a script when executed directly:
if (import.meta.url === `file://${process.argv[1]}`) {
  // top-level guard + write
}
```

Then the integration test can call `buildIndex()` directly against the fixture dir, and a separate unit test can assert `process.exit(1)` is called when `postsDir` is missing.

## Triage

- Decision: `VALID`
- Notes: Confirmed the integration test re-implements `buildIndex` manually by importing `getAllPosts`/`getPost` directly and calling a local copy of `stripMdx`, meaning the actual script logic (including the `postsDir` existence guard and `process.exit(1)` on missing directory) was never exercised. Fixed by: (1) exporting `stripMdx` and `buildIndex` from the script, (2) guarding all top-level side-effect code behind `if (import.meta.url === \`file://${process.argv[1]}\`)` so the script is safe to import, and (3) replacing the integration tests to call `buildIndex()` directly from the script and adding a test that verifies `process.exit(1)` is called when `content/posts/` is missing.
