import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

async function importDb(env: Record<string, string | undefined>) {
  const original = { ...process.env }
  Object.assign(process.env, env)
  vi.resetModules()
  try {
    const mod = await import('../lib/db')
    return mod
  } finally {
    process.env = { ...original }
  }
}

describe('lib/db.ts (unit)', () => {
  const validEnv = {
    TURSO_DATABASE_URL: 'libsql://test.turso.io',
    TURSO_AUTH_TOKEN: 'test-token',
  }

  afterEach(() => {
    vi.resetModules()
  })

  it('exports a db object with an execute method when env vars are set', async () => {
    const { db } = await importDb(validEnv)
    expect(db).toBeDefined()
    expect(typeof db.execute).toBe('function')
  })

  it('throws when TURSO_DATABASE_URL is missing', async () => {
    await expect(
      importDb({ TURSO_DATABASE_URL: undefined, TURSO_AUTH_TOKEN: 'token' })
    ).rejects.toThrow(/TURSO_DATABASE_URL/)
  })

  it('throws when TURSO_AUTH_TOKEN is missing', async () => {
    await expect(
      importDb({ TURSO_DATABASE_URL: 'libsql://test.turso.io', TURSO_AUTH_TOKEN: undefined })
    ).rejects.toThrow(/TURSO_AUTH_TOKEN/)
  })

  it('createClient is called with the correct url and authToken from env', async () => {
    const mockCreate = vi.fn().mockReturnValue({ execute: vi.fn() })
    vi.doMock('@libsql/client/http', () => ({ createClient: mockCreate }))

    const url = 'libsql://my-db.turso.io'
    const authToken = 'my-secret-token'

    const originalEnv = { ...process.env }
    process.env.TURSO_DATABASE_URL = url
    process.env.TURSO_AUTH_TOKEN = authToken
    vi.resetModules()

    try {
      await import('../lib/db')
      expect(mockCreate).toHaveBeenCalledWith({ url, authToken })
    } finally {
      process.env = { ...originalEnv }
      vi.doUnmock('@libsql/client/http')
    }
  })
})
