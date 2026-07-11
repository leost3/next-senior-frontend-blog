import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

const mockIncrementLike = vi.fn()

vi.mock('@/actions/likes', () => ({
  incrementLike: (...args: unknown[]) => mockIncrementLike(...args),
}))

async function importLikeButton() {
  vi.resetModules()
  const mod = await import('@/components/LikeButton')
  return mod.default
}

describe('LikeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('displays initialCount before any interaction', async () => {
    const LikeButton = await importLikeButton()
    mockIncrementLike.mockResolvedValue(6)
    render(<LikeButton slug="test-post" initialCount={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows optimisticCount + 1 immediately after click', async () => {
    const LikeButton = await importLikeButton()
    let resolveAction: (v: number) => void = () => {}
    mockIncrementLike.mockReturnValue(new Promise((res) => { resolveAction = res }))

    render(<LikeButton slug="test-post" initialCount={5} />)
    const button = screen.getByRole('button')

    await userEvent.click(button)

    expect(screen.getByText('6')).toBeInTheDocument()

    await act(async () => { resolveAction(6) })
  })

  it('button is disabled while server action is pending', async () => {
    const LikeButton = await importLikeButton()
    let resolveAction: (v: number) => void = () => {}
    mockIncrementLike.mockReturnValue(new Promise((res) => { resolveAction = res }))

    render(<LikeButton slug="test-post" initialCount={5} />)
    const button = screen.getByRole('button')

    await userEvent.click(button)

    expect(button).toBeDisabled()

    await act(async () => { resolveAction(6) })
  })

  it('renders aria-label with current count', async () => {
    const LikeButton = await importLikeButton()
    mockIncrementLike.mockResolvedValue(1)
    render(<LikeButton slug="test-post" initialCount={0} />)
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-label')).toContain('0')
  })

  it('shows spinner indicator while pending', async () => {
    const LikeButton = await importLikeButton()
    let resolveAction: (v: number) => void = () => {}
    mockIncrementLike.mockReturnValue(new Promise((res) => { resolveAction = res }))

    render(<LikeButton slug="test-post" initialCount={3} />)
    const button = screen.getByRole('button')

    await userEvent.click(button)

    // spinner char appears while pending
    expect(button.textContent).toContain('⋯')

    await act(async () => { resolveAction(4) })
  })

  it('reverts to initialCount when incrementLike throws', async () => {
    const LikeButton = await importLikeButton()
    let rejectAction: (err: Error) => void = () => {}
    mockIncrementLike.mockReturnValue(new Promise((_, rej) => { rejectAction = rej }))

    render(<LikeButton slug="test-post" initialCount={5} />)
    const button = screen.getByRole('button')

    await userEvent.click(button)
    // optimistic update shows 6 while action is still pending
    expect(screen.getByText('6')).toBeInTheDocument()

    // trigger rejection and let React finish the transition
    await act(async () => { rejectAction(new Error('Network error')) })

    // count reverts to 5 after action failure
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
