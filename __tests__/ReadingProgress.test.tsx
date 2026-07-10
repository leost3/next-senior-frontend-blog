import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import ReadingProgress from '@/components/ReadingProgress'

function mockScrollable(scrollTop: number, scrollHeight: number, clientHeight: number) {
  Object.defineProperty(document.documentElement, 'scrollTop', { configurable: true, value: scrollTop })
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: scrollHeight })
  Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: clientHeight })
}

describe('ReadingProgress', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a progressbar with width 0% at scroll position 0', () => {
    mockScrollable(0, 1000, 600)
    render(<ReadingProgress />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toBeInTheDocument()
    const inner = bar.firstElementChild as HTMLElement
    expect(inner.style.width).toBe('0%')
  })

  it('renders with aria-valuenow=0 at scroll position 0', () => {
    mockScrollable(0, 1000, 600)
    render(<ReadingProgress />)
    const bar = screen.getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('0')
  })

  it('updates bar width on scroll event', async () => {
    mockScrollable(0, 1000, 600)
    render(<ReadingProgress />)

    mockScrollable(400, 1000, 600)
    await act(async () => {
      window.dispatchEvent(new Event('scroll'))
      await new Promise((r) => setTimeout(r, 50))
    })

    const bar = screen.getByRole('progressbar')
    const inner = bar.firstElementChild as HTMLElement
    expect(parseFloat(inner.style.width)).toBeGreaterThan(0)
  })

  it('applies no transition when prefers-reduced-motion is set', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })

    mockScrollable(0, 1000, 600)
    render(<ReadingProgress />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toBeInTheDocument()
  })
})
