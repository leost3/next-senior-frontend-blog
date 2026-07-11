export const runtime = 'edge'

import type { NextRequest } from 'next/server'

type SearchEntry = {
  slug: string
  title: string
  description: string
  tags: string[]
  excerpt: string
}

type SearchResult = {
  slug: string
  title: string
  description: string
  tags: string[]
}

function scoreEntry(entry: SearchEntry, q: string): number {
  const lq = q.toLowerCase()
  let s = 0
  if (entry.title.toLowerCase().includes(lq)) s += 3
  if (entry.description.toLowerCase().includes(lq)) s += 2
  if (entry.tags.join(' ').toLowerCase().includes(lq)) s += 2
  if (entry.excerpt.toLowerCase().includes(lq)) s += 1
  return s
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q || q.trim() === '') {
    return new Response(JSON.stringify({ error: 'q parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let entries: SearchEntry[]
  try {
    const res = await fetch(`${origin}/search-index.json`)
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Search index unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      })
    }
    entries = await res.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Search index unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  }

  const query = q.trim()
  const results: SearchResult[] = entries
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ entry: { slug, title, description, tags } }) => ({ slug, title, description, tags }))

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}
