import Link from 'next/link'
import type { PostMeta } from '@/lib/posts'

type Props = {
  posts: PostMeta[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export default function PostList({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
        No posts yet. Check back soon.
      </p>
    )
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {posts.map((post) => (
        <li key={post.slug} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
          <Link
            href={`/blog/${post.slug}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text)' }}>
              {post.title}
            </h2>
          </Link>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <time dateTime={post.date} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {formatDate(post.date)}
            </time>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {post.readingTime} min read
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)', margin: '0 0 0.75rem', lineHeight: 1.6 }}>
            {post.description}
          </p>

          {post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-muted)',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem',
                    border: '1px solid var(--border)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
