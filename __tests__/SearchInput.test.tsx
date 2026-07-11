import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import React from 'react'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockResults = [
  {
    slug: 'react-perf',
    title: 'React Performance Guide',
    description: 'Deep dive into React performance',
    tags: ['react', 'performance'],
  },
  {
    slug: 'nextjs-routing',
    title: 'Next.js App Router Explained',
    description: 'Understanding file conventions',
    tags: ['nextjs'],
  },
]

async function importSearchInput() {
  vi.resetModules()
  const mod = await import('@/components/SearchInput')
  return mod.default
}

describe('SearchInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetModules()
  })

  it('does not fire fetch when query is fewer than 2 characters', async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)

    const SearchInput = await importSearchInput()
    render(<SearchInput />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'r' } })
    await act(async () => { vi.advanceTimersByTime(400) })

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fires fetch 300ms after last keystroke, not on every keystroke', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] })
    vi.stubGlobal('fetch', mockFetch)

    const SearchInput = await importSearchInput()
    render(<SearchInput />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 're' } })
    await act(async () => { vi.advanceTimersByTime(100) })
    fireEvent.change(input, { target: { value: 'rea' } })
    await act(async () => { vi.advanceTimersByTime(100) })
    fireEvent.change(input, { target: { value: 'reac' } })

    expect(mockFetch).not.toHaveBeenCalled()

    await act(async () => { vi.advanceTimersByTime(300) })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/search?q=reac',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('renders one dropdown item per search result returned', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResults })
    vi.stubGlobal('fetch', mockFetch)

    const SearchInput = await importSearchInput()
    render(<SearchInput />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'react' } })
    await act(async () => { vi.advanceTimersByTime(300) })

    expect(screen.getByText('React Performance Guide')).toBeInTheDocument()
    expect(screen.getByText('Next.js App Router Explained')).toBeInTheDocument()
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)
  })

  it('navigates to /blog/[slug] when a result is clicked', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResults })
    vi.stubGlobal('fetch', mockFetch)

    const SearchInput = await importSearchInput()
    render(<SearchInput />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'react' } })
    await act(async () => { vi.advanceTimersByTime(300) })

    const option = screen.getByText('React Performance Guide').closest('li')!
    fireEvent.click(option)

    expect(mockPush).toHaveBeenCalledWith('/blog/react-perf')
  })

  it('dismisses dropdown when Escape is pressed', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResults })
    vi.stubGlobal('fetch', mockFetch)

    const SearchInput = await importSearchInput()
    render(<SearchInput />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'react' } })
    await act(async () => { vi.advanceTimersByTime(300) })

    expect(screen.getByText('React Performance Guide')).toBeInTheDocument()

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.queryByText('React Performance Guide')).not.toBeInTheDocument()
  })

  it('shows empty state message when results array is empty', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] })
    vi.stubGlobal('fetch', mockFetch)

    const SearchInput = await importSearchInput()
    render(<SearchInput />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'xyznonexistent' } })
    await act(async () => { vi.advanceTimersByTime(300) })

    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('shows loading indicator while fetch is in-flight', async () => {
    let resolveSearch: (v: unknown) => void = () => {}
    const mockFetch = vi.fn().mockReturnValue(
      new Promise((res) => { resolveSearch = res })
    )
    vi.stubGlobal('fetch', mockFetch)

    const SearchInput = await importSearchInput()
    render(<SearchInput />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'react' } })
    await act(async () => { vi.advanceTimersByTime(300) })

    expect(screen.getByRole('status')).toBeInTheDocument()

    await act(async () => { resolveSearch({ ok: true, json: async () => [] }) })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('integration: shows results within 500ms of typing "perf"', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          slug: 'react-perf',
          title: 'React Performance Guide',
          description: 'Deep dive into React performance',
          tags: ['react', 'performance'],
        },
      ],
    })
    vi.stubGlobal('fetch', mockFetch)

    const SearchInput = await importSearchInput()
    render(<SearchInput />)
    const input = screen.getByRole('combobox')

    const start = Date.now()
    fireEvent.change(input, { target: { value: 'perf' } })
    await act(async () => { vi.advanceTimersByTime(300) })
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(500)
    expect(screen.getByText('React Performance Guide')).toBeInTheDocument()
  })

  it('ArrowDown highlights first result; Enter navigates to it', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResults })
    vi.stubGlobal('fetch', mockFetch)

    const SearchInput = await importSearchInput()
    render(<SearchInput />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'react' } })
    await act(async () => { vi.advanceTimersByTime(300) })

    const optionsBefore = screen.getAllByRole('option')
    expect(optionsBefore[0]).toHaveAttribute('aria-selected', 'false')

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    const optionsAfter = screen.getAllByRole('option')
    expect(optionsAfter[0]).toHaveAttribute('aria-selected', 'true')
    expect(optionsAfter[1]).toHaveAttribute('aria-selected', 'false')

    fireEvent.keyDown(input, { key: 'Enter' })
    expect(mockPush).toHaveBeenCalledWith('/blog/react-perf')
  })

  it('ArrowDown clamps at last result; ArrowUp retreats', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResults })
    vi.stubGlobal('fetch', mockFetch)

    const SearchInput = await importSearchInput()
    render(<SearchInput />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'react' } })
    await act(async () => { vi.advanceTimersByTime(300) })

    // Move past the end — should clamp at index 1 (last of 2 results)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'false')
    expect(options[1]).toHaveAttribute('aria-selected', 'true')

    // Move back up — first result should be selected
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    const optionsAfter = screen.getAllByRole('option')
    expect(optionsAfter[0]).toHaveAttribute('aria-selected', 'true')
    expect(optionsAfter[1]).toHaveAttribute('aria-selected', 'false')
  })
})
