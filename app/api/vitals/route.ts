export const runtime = 'edge'

import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'

const ALLOWED_METRICS = new Set(['LCP', 'CLS', 'INP'])

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const b = body as Record<string, unknown>
  if (
    typeof b?.slug !== 'string' ||
    typeof b?.metric !== 'string' ||
    typeof b?.value !== 'number'
  ) {
    return new Response(JSON.stringify({ error: 'Missing required fields: slug, metric, value' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!ALLOWED_METRICS.has(b.metric)) {
    return new Response(JSON.stringify({ error: `Invalid metric. Allowed: LCP, CLS, INP` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    await db.execute({
      sql: `INSERT INTO vitals (slug, metric, value) VALUES (?, ?, ?)`,
      args: [b.slug, b.metric, b.value],
    })
  } catch (err) {
    console.error('[vitals] db insert failed:', err)
    return new Response(JSON.stringify({ error: 'Failed to record vitals' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(null, { status: 204 })
}
