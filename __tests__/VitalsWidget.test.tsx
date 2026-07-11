import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import VitalsWidget from '@/components/VitalsWidget'

// Capture web-vitals callbacks so tests can trigger them manually
let lcpCallback: ((m: { value: number }) => void) | null = null
let clsCallback: ((m: { value: number }) => void) | null = null
let inpCallback: ((m: { value: number }) => void) | null = null

vi.mock('web-vitals', () => ({
  onLCP: (cb: (m: { value: number }) => void) => { lcpCallback = cb },
  onCLS: (cb: (m: { value: number }) => void) => { clsCallback = cb },
  onINP: (cb: (m: { value: number }) => void) => { inpCallback = cb },
}))

const mockFetch = vi.fn().mockResolvedValue({ ok: true })

describe('VitalsWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    lcpCallback = null
    clsCallback = null
    inpCallback = null
    vi.stubGlobal('fetch', mockFetch)
  })

  const zeroSummary = { LCP: 0, CLS: 0, INP: 0 }

  it('renders "—" for LCP, CLS, INP when summary contains all zeros', () => {
    render(<VitalsWidget slug="home" summary={zeroSummary} />)
    const dashes = screen.getAllByText('—')
    expect(dashes).toHaveLength(3)
  })

  it('displays LCP value in ms when summary.LCP is non-zero', () => {
    render(<VitalsWidget slug="home" summary={{ LCP: 2500, CLS: 0, INP: 0 }} />)
    expect(screen.getByText('2500 ms')).toBeInTheDocument()
  })

  it('fires POST to /api/vitals with correct LCP body when onLCP callback fires', () => {
    render(<VitalsWidget slug="test-post" summary={zeroSummary} />)
    lcpCallback?.({ value: 1200 })
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/vitals',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post', metric: 'LCP', value: 1200 }),
      })
    )
  })

  it('fires POST to /api/vitals with correct CLS body when onCLS callback fires', () => {
    render(<VitalsWidget slug="test-post" summary={zeroSummary} />)
    clsCallback?.({ value: 0.12 })
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/vitals',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post', metric: 'CLS', value: 0.12 }),
      })
    )
  })

  it('fires POST to /api/vitals with correct INP body when onINP callback fires', () => {
    render(<VitalsWidget slug="test-post" summary={zeroSummary} />)
    inpCallback?.({ value: 200 })
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/vitals',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post', metric: 'INP', value: 200 }),
      })
    )
  })

  it('integration: all three metric callbacks POST to /api/vitals within one render', () => {
    render(<VitalsWidget slug="home" summary={zeroSummary} />)

    lcpCallback?.({ value: 1800 })
    clsCallback?.({ value: 0.05 })
    inpCallback?.({ value: 150 })

    const bodies = mockFetch.mock.calls.map((call) => JSON.parse(call[1].body as string))
    expect(bodies).toContainEqual({ slug: 'home', metric: 'LCP', value: 1800 })
    expect(bodies).toContainEqual({ slug: 'home', metric: 'CLS', value: 0.05 })
    expect(bodies).toContainEqual({ slug: 'home', metric: 'INP', value: 150 })
  })

  it('integration: widget displays correct formatted values when summary has non-zero data', () => {
    render(<VitalsWidget slug="home" summary={{ LCP: 2500, CLS: 0.1, INP: 200 }} />)
    expect(screen.getByText('2500 ms')).toBeInTheDocument()
    expect(screen.getByText('0.100')).toBeInTheDocument()
    expect(screen.getByText('200 ms')).toBeInTheDocument()
  })
})
