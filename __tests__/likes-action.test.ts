import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockExecute = vi.fn()

vi.mock('@/lib/db', () => ({
  db: { execute: (...args: unknown[]) => mockExecute(...args) },
}))

async function importIncrementLike() {
  vi.resetModules()
  const mod = await import('@/actions/likes')
  return mod.incrementLike
}

describe('incrementLike (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('calls db.execute twice (upsert then select)', async () => {
    mockExecute
      .mockResolvedValueOnce({}) // upsert
      .mockResolvedValueOnce({ rows: [{ count: 1 }] }) // select

    const incrementLike = await importIncrementLike()
    const count = await incrementLike('my-slug')

    expect(mockExecute).toHaveBeenCalledTimes(2)
    expect(count).toBe(1)
  })

  it('passes the slug as a bind argument to both queries', async () => {
    mockExecute
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ count: 3 }] })

    const incrementLike = await importIncrementLike()
    await incrementLike('specific-slug')

    expect(mockExecute.mock.calls[0][0].args).toContain('specific-slug')
    expect(mockExecute.mock.calls[1][0].args).toContain('specific-slug')
  })

  it('returns the count value from the select result', async () => {
    mockExecute
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ count: 42 }] })

    const incrementLike = await importIncrementLike()
    const count = await incrementLike('any-slug')
    expect(count).toBe(42)
  })

  it('upsert SQL uses ON CONFLICT DO UPDATE', async () => {
    mockExecute
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ count: 1 }] })

    const incrementLike = await importIncrementLike()
    await incrementLike('slug')

    const upsertSql: string = mockExecute.mock.calls[0][0].sql
    expect(upsertSql.toLowerCase()).toContain('on conflict')
    expect(upsertSql.toLowerCase()).toContain('do update')
  })
})
