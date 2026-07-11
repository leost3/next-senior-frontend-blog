import VitalsWidget from './VitalsWidget'
import type { VitalsSummary } from './VitalsWidget'

type Props = {
  slug: string
}

export default async function VitalsWidgetServer({ slug }: Props) {
  let summary: VitalsSummary = { LCP: 0, CLS: 0, INP: 0 }

  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT ?? 3000}`

    const res = await fetch(`${baseUrl}/api/vitals/summary`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      summary = await res.json()
    }
  } catch {
    // Non-fatal: show "—" placeholders until data is available
  }

  return <VitalsWidget slug={slug} summary={summary} />
}
