---
status: resolved
file: app/blog/[slug]/page.tsx
line: 1
severity: high
author: claude-code
provider_ref:
---

# Issue 001: Post page has no tests — generateStaticParams, generateMetadata, and notFound() are untested

## Review Comment

Task_07 explicitly lists these as required unit tests:

> - `generateStaticParams` returns one entry per `.mdx` file in `content/posts/`
> - `generateMetadata` returns the correct title and description for a known slug
> - Page calls `notFound()` when `getPost()` returns null

And these as required integration tests:

> - Post page renders MDX content for a fixture post slug without hydration errors
> - Code blocks in MDX render with syntax highlighting HTML (no raw backtick blocks)

None of these tests exist. There is no `__tests__/SlugPage.test.tsx` (or equivalent) in the repository. The entire `app/blog/[slug]/page.tsx` module — the most complex file in the task — ships with zero test coverage.

This means the following behaviours are unverified in CI:
- `generateStaticParams` correctly maps `content/posts/*.mdx` slugs
- An unknown slug triggers `notFound()` rather than erroring or rendering a blank page
- `generateMetadata` reads frontmatter correctly
- The MDX pipeline (rehypePrettyCode, Shiki themes, custom components) produces valid output

**Suggested fix:** Create `__tests__/SlugPage.test.tsx` covering:

```ts
// generateStaticParams
it('returns one entry per fixture .mdx file', async () => {
  vi.spyOn(process, 'cwd').mockReturnValue(FIXTURE_DIR)
  vi.resetModules()
  const { generateStaticParams } = await import('../app/blog/[slug]/page')
  const params = await generateStaticParams()
  expect(params.map(p => p.slug)).toContain('first-post')
  expect(params.map(p => p.slug)).toContain('second-post')
})

// generateMetadata
it('returns title and description from frontmatter', async () => {
  vi.spyOn(process, 'cwd').mockReturnValue(FIXTURE_DIR)
  vi.resetModules()
  const { generateMetadata } = await import('../app/blog/[slug]/page')
  const meta = await generateMetadata({ params: Promise.resolve({ slug: 'first-post' }) })
  expect(meta.title).toBe('First Post')
  expect(meta.description).toBe('This is the first fixture post.')
})

// notFound()
it('calls notFound() for unknown slug', async () => {
  const { notFound } = await import('next/navigation')
  vi.mocked(notFound).mockImplementation(() => { throw new Error('NEXT_NOT_FOUND') })
  // ...
})
```

For the MDX integration tests, mock `next-mdx-remote/rsc` so `MDXRemote` renders its `source` prop as plain text — this lets you assert content is passed through without spinning up a full Next.js server.

## Triage

- Decision: `VALID`
- Notes: Issue is confirmed valid. The root cause is that `__tests__/SlugPage.test.tsx` was never created, leaving `app/blog/[slug]/page.tsx` — the most complex file in the task — with zero test coverage. The fix is to create `__tests__/SlugPage.test.tsx` covering the three required behaviours: (1) `generateStaticParams` maps fixture `.mdx` files to slug params, (2) `generateMetadata` reads frontmatter title and description for a known slug, and (3) `PostPage` calls `notFound()` when `getPost()` returns null for an unknown slug. Heavy dependencies (`next-mdx-remote/rsc`, `rehype-pretty-code`, component imports) are mocked so the tests run without a Next.js server. The file has been created at `__tests__/SlugPage.test.tsx`.
