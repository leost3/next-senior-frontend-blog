import { getAllPosts } from '@/lib/posts'
import TagFilter from '@/components/TagFilter'

export const dynamic = 'force-static'

export default function Home() {
  const posts = getAllPosts()

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <section aria-label="Post list">
        <TagFilter posts={posts} />
      </section>

      <div
        aria-label="Web Vitals"
        style={{
          marginTop: '4rem',
          padding: '1.5rem',
          border: '1px solid var(--border)',
          borderRadius: '0.5rem',
          backgroundColor: 'var(--bg-subtle)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-muted)',
        }}
      >
        Vitals coming soon
      </div>
    </div>
  )
}
