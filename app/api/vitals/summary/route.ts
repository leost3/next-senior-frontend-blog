import { unstable_cache } from 'next/cache'
import { db } from '@/lib/db'

type VitalsSummary = {
  LCP: number
  CLS: number
  INP: number
}

const getVitalsSummary = unstable_cache(
  async (): Promise<VitalsSummary> => {
    const result = await db.execute({
      sql: `SELECT metric, value FROM vitals
            WHERE created_at > datetime('now', '-30 days')
            ORDER BY metric, value ASC`,
      args: [],
    })

    const grouped: Record<string, number[]> = { LCP: [], CLS: [], INP: [] }
    for (const row of result.rows) {
      const metric = row.metric as string
      if (metric in grouped) {
        grouped[metric].push(row.value as number)
      }
    }

    const p75 = (values: number[]): number => {
      if (values.length === 0) return 0
      return values[Math.floor(values.length * 0.75)]
    }

    return {
      LCP: p75(grouped.LCP),
      CLS: p75(grouped.CLS),
      INP: p75(grouped.INP),
    }
  },
  ['vitals-summary'],
  { revalidate: 3600 }
)

export async function GET() {
  const summary = await getVitalsSummary()
  return Response.json(summary)
}
