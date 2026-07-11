import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockExecute = vi.fn()

vi.mock('@/lib/db', () => ({
  db: { execute: (...args: unknown[]) => mockExecute(...args) },
}))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}))

async function importVitalsRoute() {
  vi.resetModules()
  return import('../app/api/vitals/route')
}

async function importSummaryRoute() {
  vi.resetModules()
  return import('../app/api/vitals/summary/route')
}

describe('POST /api/vitals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 204 for valid LCP payload', async () => {
    mockExecute.mockResolvedValue({})
    const { POST } = await importVitalsRoute()
    const req = new NextRequest('http://localhost/api/vitals', {
      method: 'POST',
      body: JSON.stringify({ slug: 'test', metric: 'LCP', value: 1200 }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(204)
  })

  it('returns 400 when metric field is missing', async () => {
    const { POST } = await importVitalsRoute()
    const req = new NextRequest('http://localhost/api/vitals', {
      method: 'POST',
      body: JSON.stringify({ slug: 'test', value: 1200 }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for metric FID (not in allowed set)', async () => {
    const { POST } = await importVitalsRoute()
    const req = new NextRequest('http://localhost/api/vitals', {
      method: 'POST',
      body: JSON.stringify({ slug: 'test', metric: 'FID', value: 100 }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when value is not a number', async () => {
    const { POST } = await importVitalsRoute()
    const req = new NextRequest('http://localhost/api/vitals', {
      method: 'POST',
      body: JSON.stringify({ slug: 'test', metric: 'LCP', value: 'fast' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid JSON body', async () => {
    const { POST } = await importVitalsRoute()
    const req = new NextRequest('http://localhost/api/vitals', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('accepts CLS and INP metrics', async () => {
    mockExecute.mockResolvedValue({})
    const { POST } = await importVitalsRoute()

    for (const metric of ['CLS', 'INP']) {
      const req = new NextRequest('http://localhost/api/vitals', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test', metric, value: 0.1 }),
        headers: { 'Content-Type': 'application/json' },
      })
      const res = await POST(req)
      expect(res.status).toBe(204)
    }
  })

  it('returns 503 when db.execute throws', async () => {
    mockExecute.mockRejectedValue(new Error('Turso unavailable'))
    const { POST } = await importVitalsRoute()
    const req = new NextRequest('http://localhost/api/vitals', {
      method: 'POST',
      body: JSON.stringify({ slug: 'test', metric: 'LCP', value: 1200 }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })
})

describe('GET /api/vitals/summary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns { LCP: 0, CLS: 0, INP: 0 } when no rows exist', async () => {
    mockExecute.mockResolvedValue({ rows: [] })
    const { GET } = await importSummaryRoute()
    const res = await GET()
    const body = await res.json()
    expect(body).toEqual({ LCP: 0, CLS: 0, INP: 0 })
  })

  it('computes P75: index floor(length * 0.75) of sorted array', async () => {
    // 4 LCP values [100, 200, 300, 400]: P75 = values[floor(4*0.75)] = values[3] = 400
    // But wait: they arrive already sorted ASC from the DB query
    mockExecute.mockResolvedValue({
      rows: [
        { metric: 'LCP', value: 100 },
        { metric: 'LCP', value: 200 },
        { metric: 'LCP', value: 300 },
        { metric: 'LCP', value: 400 },
      ],
    })
    const { GET } = await importSummaryRoute()
    const res = await GET()
    const body = await res.json()
    // floor(4 * 0.75) = 3 → value at index 3 = 400
    expect(body.LCP).toBe(400)
    expect(body.CLS).toBe(0)
    expect(body.INP).toBe(0)
  })

  it('P75 of [100, 200, 300, 400] returns 400 (index 3)', async () => {
    mockExecute.mockResolvedValue({
      rows: [
        { metric: 'LCP', value: 100 },
        { metric: 'LCP', value: 200 },
        { metric: 'LCP', value: 300 },
        { metric: 'LCP', value: 400 },
      ],
    })
    const { GET } = await importSummaryRoute()
    const res = await GET()
    const body = await res.json()
    expect(body.LCP).toBe(400)
  })

  it('handles mixed metrics correctly', async () => {
    mockExecute.mockResolvedValue({
      rows: [
        { metric: 'CLS', value: 0.05 },
        { metric: 'INP', value: 200 },
        { metric: 'LCP', value: 2500 },
      ],
    })
    const { GET } = await importSummaryRoute()
    const res = await GET()
    const body = await res.json()
    // Each metric has 1 value, floor(1 * 0.75) = 0 → value at index 0
    expect(body.CLS).toBe(0.05)
    expect(body.INP).toBe(200)
    expect(body.LCP).toBe(2500)
  })
})
