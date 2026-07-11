import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const fixture = [
  {
    slug: 'react-perf',
    title: 'React Performance Guide',
    description: 'Deep dive into React performance optimizations',
    tags: ['react', 'performance'],
    excerpt: 'This post covers memoization, batching, and profiling.',
  },
  {
    slug: 'nextjs-routing',
    title: 'Next.js App Router Explained',
    description: 'Understanding the App Router file conventions',
    tags: ['nextjs', 'routing'],
    excerpt: 'The App Router uses a folder-based routing system.',
  },
  {
    slug: 'typescript-tips',
    title: 'TypeScript Tips',
    description: 'Practical TypeScript patterns for large codebases',
    tags: ['typescript'],
    excerpt: 'Discriminated unions, template literals, and conditional types.',
  },
]

function makeManyEntries(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    slug: `react-post-${i}`,
    title: `React Post ${i}`,
    description: 'About react',
    tags: ['react'],
    excerpt: 'Content about react performance.',
  }))
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => fixture,
  }))
})

async function callRoute(url: string) {
  const { GET } = await import('../app/api/search/route')
  const req = new NextRequest(url)
  return GET(req)
}

describe('GET /api/search', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns 400 when q is missing', async () => {
    const res = await callRoute('http://localhost/api/search')
    expect(res.status).toBe(400)
  })

  it('returns 400 when q is an empty string', async () => {
    const res = await callRoute('http://localhost/api/search?q=')
    expect(res.status).toBe(400)
  })

  it('returns 400 when q is only whitespace', async () => {
    const res = await callRoute('http://localhost/api/search?q=   ')
    expect(res.status).toBe(400)
  })

  it('returns matching entries for q=react', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => fixture }))
    const res = await callRoute('http://localhost/api/search?q=react')
    const body = await res.json()
    const slugs = body.map((r: { slug: string }) => r.slug)
    expect(slugs).toContain('react-perf')
    expect(slugs).not.toContain('typescript-tips')
  })

  it('returns 200 with empty array when no matches', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => fixture }))
    const res = await callRoute('http://localhost/api/search?q=xyznonexistent')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual([])
  })

  it('caps results at 10 even when more than 10 match', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => makeManyEntries(25) }))
    const res = await callRoute('http://localhost/api/search?q=react')
    const body = await res.json()
    expect(body.length).toBeLessThanOrEqual(10)
  })

  it('title match ranks above excerpt-only match', async () => {
    const entries = [
      { slug: 'excerpt-only', title: 'Unrelated Post', description: 'Not about it', tags: [], excerpt: 'mentions typescript here' },
      { slug: 'title-match', title: 'TypeScript Patterns', description: 'About something', tags: [], excerpt: 'no mention of the keyword' },
    ]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => entries }))
    const res = await callRoute('http://localhost/api/search?q=typescript')
    const body = await res.json()
    expect(body[0].slug).toBe('title-match')
  })

  it('response includes Cache-Control: no-store header', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => fixture }))
    const res = await callRoute('http://localhost/api/search?q=react')
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('result objects do not include excerpt or score fields', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => fixture }))
    const res = await callRoute('http://localhost/api/search?q=react')
    const body = await res.json()
    for (const item of body) {
      expect(item).not.toHaveProperty('excerpt')
      expect(item).not.toHaveProperty('score')
      expect(item).not.toHaveProperty('_score')
    }
  })

  it('returns 503 when fetch rejects (network failure)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    const res = await callRoute('http://localhost/api/search?q=react')
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 503 when fetch returns non-ok status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
    const res = await callRoute('http://localhost/api/search?q=react')
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })
})
