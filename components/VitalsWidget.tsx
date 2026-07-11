'use client'

import { useEffect } from 'react'
import { onLCP, onCLS, onINP } from 'web-vitals'

export type VitalsSummary = {
  LCP: number
  CLS: number
  INP: number
}

type Props = {
  slug: string
  summary: VitalsSummary
}

type MetricKey = keyof VitalsSummary

function fmt(metric: MetricKey, value: number): string {
  if (value === 0) return '—'
  if (metric === 'CLS') return value.toFixed(3)
  return `${Math.round(value)} ms`
}

const METRIC_UNITS: Record<MetricKey, string> = {
  LCP: 'ms',
  CLS: 'score',
  INP: 'ms',
}

export default function VitalsWidget({ slug, summary }: Props) {
  useEffect(() => {
    let active = true

    function post(metric: string, value: number) {
      if (!active) return
      fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, metric, value }),
      }).catch(() => {})
    }

    try {
      onLCP((m) => post('LCP', m.value))
      onCLS((m) => post('CLS', m.value))
      onINP((m) => post('INP', m.value))
    } catch {
      // web-vitals not supported in this environment
    }

    return () => {
      active = false
    }
  }, [slug])

  return (
    <div
      style={{
        marginTop: '4rem',
        padding: '1.5rem 2rem',
        border: '1px solid var(--border)',
        borderRadius: '0.5rem',
        backgroundColor: 'var(--bg-subtle)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <h2
        style={{
          fontSize: 'var(--font-size-xs)',
          fontWeight: 600,
          margin: '0 0 1.25rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        Web Vitals — 30-day P75
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
        }}
      >
        {(['LCP', 'CLS', 'INP'] as MetricKey[]).map((metric) => (
          <div key={metric} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: '0.375rem',
                letterSpacing: '-0.02em',
              }}
            >
              {fmt(metric, summary[metric])}
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
              }}
            >
              <span style={{ fontWeight: 600 }}>{metric}</span>
              <span style={{ marginLeft: '0.25rem', opacity: 0.7 }}>
                ({METRIC_UNITS[metric]})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
