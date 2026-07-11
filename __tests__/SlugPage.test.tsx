import { describe, it, expect, vi, afterEach } from 'vitest'
import path from 'node:path'
import React from 'react'

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}))

vi.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: ({ source }: { source: string }) => React.createElement('div', null, source),
}))

vi.mock('rehype-pretty-code', () => ({
  default: () => {},
}))

vi.mock('@/lib/db', () => ({
  db: {
    execute: vi.fn().mockResolvedValue({ rows: [] }),
  },
}))

vi.mock('@/components/ReadingProgress', () => ({
  default: () => null,
}))

vi.mock('@/components/LikeButton', () => ({
  default: () => null,
}))

vi.mock('@/components/mdx/Callout', () => ({
  default: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}))

vi.mock('@/components/mdx/CodeDiff', () => ({
  default: () => null,
}))

const FIXTURE_DIR = path.join(__dirname, 'fixtures')

async function importPageWithCwd(cwd: string) {
  vi.spyOn(process, 'cwd').mockReturnValue(cwd)
  vi.resetModules()
  return import('../app/blog/[slug]/page')
}

describe('SlugPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('generateStaticParams returns one entry per fixture .mdx file', async () => {
    const { generateStaticParams } = await importPageWithCwd(FIXTURE_DIR)
    const params = await generateStaticParams()
    const slugs = params.map((p) => p.slug)
    expect(slugs).toContain('first-post')
    expect(slugs).toContain('second-post')
    expect(slugs).toHaveLength(2)
  })

  it('generateMetadata returns title and description for first-post', async () => {
    const { generateMetadata } = await importPageWithCwd(FIXTURE_DIR)
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'first-post' }) })
    expect(meta.title).toBe('First Post')
    expect(meta.description).toBe('This is the first fixture post.')
  })

  it('PostPage calls notFound() for unknown slug', async () => {
    const { notFound } = await import('next/navigation')
    vi.mocked(notFound).mockImplementation(() => { throw new Error('NEXT_NOT_FOUND') })
    const { default: PostPage } = await importPageWithCwd(FIXTURE_DIR)
    await expect(PostPage({ params: Promise.resolve({ slug: 'no-such-slug' }) })).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
