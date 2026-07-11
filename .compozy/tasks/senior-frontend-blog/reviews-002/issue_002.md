---
status: resolved
file: components/TagFilter.tsx
line: 1
severity: high
author: claude-code
provider_ref:
---

# Issue 002: PostList is a dead component — TagFilter duplicates all its rendering logic

## Review Comment

Task_06 describes a clear Server/Client Component split:

> `PostList` MUST be a Server Component receiving `PostMeta[]` as props
> `TagFilter` MUST be a Client Component that **filters** the visible post list by a selected tag

The intended architecture is: `TagFilter` owns the selected-tag state and hands the filtered slice to `PostList` for rendering — or the server page renders both. Instead, `TagFilter` re-implements the entire post list rendering inline (~90 lines of JSX duplicated from `PostList.tsx`), and `app/page.tsx` imports only `TagFilter`, never `PostList`.

Consequences:
- `PostList.tsx` is dead code — it is never rendered anywhere in the application
- Any UI change to how posts look (e.g., adding an author avatar, changing date format) must be made in two places or the components will diverge
- The `PostList` Server Component tests (`PostList.test.tsx`) test a component that no visitor ever sees, giving false confidence
- The Server Component boundary intended by the spec is collapsed — the entire post list UI runs in a client bundle

**Suggested fix:** Refactor so `TagFilter` manages only state and delegates rendering to `PostList`:

```tsx
// TagFilter.tsx — client component, state only
export default function TagFilter({ posts }: Props) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags))).sort()
  const visible = selectedTag ? posts.filter(p => p.tags.includes(selectedTag)) : posts

  return (
    <div>
      {allTags.length > 0 && (
        <div ...>
          {/* tag buttons */}
        </div>
      )}
      <PostList posts={visible} />
    </div>
  )
}
```

`PostList` already handles the empty-state message, so no duplication is needed.

Note: Importing a Server Component into a Client Component requires the Server Component to be a pure data-rendering leaf (no `async`, no `fetch`) — `PostList.tsx` as written satisfies this constraint.

## Triage

- Decision: `VALID`
- Notes: PostList is dead code — it is never imported or rendered anywhere in the application. TagFilter duplicates all post list rendering logic (~90 lines of JSX) inline, violating the Server/Client Component split specified in Task_06. Fix delegates rendering to PostList by importing it into TagFilter and replacing the inline ul/li rendering and empty-state paragraph with `<PostList posts={visible} />`. The Link import and formatDate function were also removed from TagFilter as they are no longer needed.
