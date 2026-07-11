'use server'

import { db } from '@/lib/db'

export async function incrementLike(slug: string): Promise<number> {
  try {
    await db.execute({
      sql: `INSERT INTO likes (slug, count) VALUES (?, 1)
            ON CONFLICT(slug) DO UPDATE SET count = count + 1`,
      args: [slug],
    })
    const result = await db.execute({
      sql: `SELECT count FROM likes WHERE slug = ?`,
      args: [slug],
    })
    return (result.rows[0]?.count as number) ?? 0
  } catch (err) {
    console.error('[likes] incrementLike failed for slug:', slug, err)
    throw err
  }
}
