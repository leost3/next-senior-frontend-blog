import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'
import { getAllPosts, getPost } from '@/lib/posts'
import ReadingProgress from '@/components/ReadingProgress'
import LikeButton from '@/components/LikeButton'
import Callout from '@/components/mdx/Callout'
import CodeDiff from '@/components/mdx/CodeDiff'

const mdxComponents = { Callout, CodeDiff }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rehypePlugins: any[] = [
  [rehypePrettyCode, { theme: { dark: 'github-dark', light: 'github-light' } }],
]

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return { title: post.title, description: post.description }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)

  if (!post) notFound()

  let initialLikeCount = 0
  try {
    const { db } = await import('@/lib/db')
    const result = await db.execute({
      sql: 'SELECT count FROM likes WHERE slug = ?',
      args: [slug],
    })
    if (result.rows.length > 0) {
      initialLikeCount = result.rows[0].count as number
    }
  } catch {
    // Non-fatal: show 0 if DB is unavailable
  }

  return (
    <>
      <ReadingProgress />

      <article style={{ maxWidth: '48rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-4xl)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 1rem', color: 'var(--foreground)', letterSpacing: '-0.03em' }}>
            {post.title}
          </h1>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <time dateTime={post.date} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>
              {new Date(post.date).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
            </time>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>
              {post.readingTime} min read
            </span>
          </div>

          {post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {post.tags.map((tag) => (
                <span key={tag} style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose">
          <MDXRemote
            source={post.content}
            options={{ mdxOptions: { rehypePlugins } } as Parameters<typeof MDXRemote>[0]['options']}
            components={mdxComponents}
          />
        </div>

        <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <LikeButton slug={slug} initialCount={initialLikeCount} />
          </div>
          <div aria-label="Comments placeholder" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
            Comments coming soon
          </div>
        </footer>
      </article>
    </>
  )
}
