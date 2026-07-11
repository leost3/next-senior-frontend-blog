'use client'

import { useState } from 'react'
import PostList from '@/components/PostList'
import type { PostMeta } from '@/lib/posts'

type Props = {
  posts: PostMeta[]
}

export default function TagFilter({ posts }: Props) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort()
  const visible = selectedTag ? posts.filter((p) => p.tags.includes(selectedTag)) : posts

  const chipStyle = (active: boolean) => ({
    fontSize: 'var(--font-size-xs)' as const,
    fontFamily: 'var(--font-mono)' as const,
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    border: '1px solid var(--border)',
    cursor: 'pointer' as const,
    background: active ? 'var(--accent)' : 'var(--bg-subtle)',
    color: active ? '#fff' : 'var(--text-muted)',
    transition: 'background 0.1s, color 0.1s',
  })

  return (
    <div>
      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            style={chipStyle(selectedTag === null)}
            aria-pressed={selectedTag === null}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              style={chipStyle(selectedTag === tag)}
              aria-pressed={selectedTag === tag}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <PostList posts={visible} />
    </div>
  )
}
