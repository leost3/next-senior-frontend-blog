---
status: resolved
file: lib/posts.ts
line: 93
severity: medium
author: claude-code
provider_ref:
---

# Issue 003: getPost() reads each file twice — once directly, once inside parsePost()

## Review Comment

`getPost()` reads the post file with `fs.readFileSync` (line ~97), then immediately calls `parsePost(filePath, slug)` which also calls `fs.readFileSync` internally (line ~29). The file is read from disk twice for every single post page render or search index build call.

```ts
// getPost():
fileContent = fs.readFileSync(filePath, 'utf-8')   // READ 1 — used for content body
const meta = parsePost(filePath, slug)              // parsePost does READ 2 — used for frontmatter
const { content } = matter(fileContent)             // parses READ 1 for body
return { ...meta, content }
```

`parsePost()` also runs `matter(fileContent)` internally. So `gray-matter` parses the same file twice — once for frontmatter (inside `parsePost`) and once for content (in `getPost`).

At small post counts the impact is negligible, but `getPost()` is called once per post during the search index build (`buildIndex()` in `scripts/build-search-index.ts` calls `getPost()` for every post), so at 50 posts this is 100 `readFileSync` calls where 50 would suffice.

**Suggested fix:** Pass the already-read `fileContent` into `parsePost` so it doesn't need to re-read:

```ts
function parsePost(filePath: string, slug: string, rawContent?: string): PostMeta | null {
  let fileContent: string
  try {
    fileContent = rawContent ?? fs.readFileSync(filePath, 'utf-8')
  } catch (err) { ... }
  // rest unchanged
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(getPostsDir(), `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  let fileContent: string
  try {
    fileContent = fs.readFileSync(filePath, 'utf-8')
  } catch (err) { ... }

  const meta = parsePost(filePath, slug, fileContent)  // reuse already-read content
  if (!meta) return null

  const { content } = matter(fileContent)
  return { ...meta, content }
}
```

## Triage

- Decision: `VALID`
- Notes: Confirmed double file read: `getPost()` calls `fs.readFileSync` then passes `filePath` to `parsePost()` which calls `fs.readFileSync` again internally, causing every post page render to read the file twice and run `gray-matter` twice. Fixed by adding an optional `rawContent?: string` parameter to `parsePost` — when provided, it skips the `readFileSync` call. `getPost` now passes its already-read content to `parsePost`. `getAllPosts` is unaffected and continues to let `parsePost` read files itself.
