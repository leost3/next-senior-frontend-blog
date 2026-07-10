---
status: resolved
file: lib/posts.ts
line: 115
severity: medium
author: claude-code
provider_ref:
---

# Issue 003: getPost() duplicates all frontmatter validation from parsePost()

## Review Comment

`getPost()` re-implements the entire frontmatter validation sequence that already exists in `parsePost()`: title check, date check, description check, date normalisation, tags defaulting, and reading-time calculation. Any future change to validation rules must be applied in two places, and implementations can drift.

The task spec describes the intended design:

> `getPost()` calls `getAllPosts()` internally to find the matching slug, then reads the raw file content for the MDX body.

**Suggested fix:** Reuse `parsePost()` directly in `getPost()`:

```ts
export function getPost(slug: string): Post | null {
  const filePath = path.join(getPostsDir(), `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  let fileContent: string
  try {
    fileContent = fs.readFileSync(filePath, 'utf-8')
  } catch (err) {
    console.warn(`[posts] Could not read file for slug "${slug}":`, err)
    return null
  }

  const meta = parsePost(filePath, slug)
  if (!meta) return null

  const { content } = matter(fileContent)
  return { ...meta, content }
}
```

This eliminates ~40 lines of duplicate logic and keeps validation in one place.

## Triage

- Decision: `VALID`
- Notes: Refactored `getPost()` to call `parsePost()` internally. Reads file once for content, delegates all validation/normalisation to `parsePost()`. Removed ~40-line duplicate block. 30/30 tests pass.
