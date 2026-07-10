import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockSetTheme = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({ theme: 'light', setTheme: mockSetTheme })),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { useTheme } from 'next-themes'
import ThemeToggle from '@/components/ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls setTheme("dark") when clicked in light mode', async () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
      forcedTheme: undefined,
    })
    render(<ThemeToggle />)
    const button = await screen.findByRole('button', { name: /switch to dark mode/i })
    await userEvent.click(button)
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('calls setTheme("light") when clicked in dark mode', async () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      themes: ['light', 'dark'],
      systemTheme: 'dark',
      forcedTheme: undefined,
    })
    render(<ThemeToggle />)
    const button = await screen.findByRole('button', { name: /switch to light mode/i })
    await userEvent.click(button)
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})
