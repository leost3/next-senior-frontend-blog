import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '@/components/Header'

vi.mock('@/components/ThemeToggle', () => ({
  default: () => <button type="button">Toggle theme</button>,
}))

describe('Header', () => {
  it('renders the name "Leonardo Studart"', () => {
    render(<Header />)
    expect(screen.getByText('Leonardo Studart')).toBeInTheDocument()
  })

  it('renders the title "Senior Frontend Developer"', () => {
    render(<Header />)
    expect(screen.getByText('Senior Frontend Developer')).toBeInTheDocument()
  })

  it('contains an <a> pointing to the LinkedIn URL', () => {
    render(<Header />)
    const link = screen.getByRole('link', { name: /linkedin/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('linkedin.com'))
  })

  it('contains a mailto: link', () => {
    render(<Header />)
    const emailLink = screen.getByRole('link', { name: /email/i })
    expect(emailLink.getAttribute('href')).toMatch(/^mailto:/)
  })

  it('contains an <a> with href="/cv.pdf" and a download attribute', () => {
    render(<Header />)
    const cvLink = screen.getByRole('link', { name: /cv/i })
    expect(cvLink).toHaveAttribute('href', '/cv.pdf')
    expect(cvLink).toHaveAttribute('download')
  })
})
