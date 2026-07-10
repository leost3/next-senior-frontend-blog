import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Callout from '@/components/mdx/Callout'

describe('Callout', () => {
  it('renders with data-variant="info" by default', () => {
    render(<Callout>Info message</Callout>)
    const el = screen.getByRole('note')
    expect(el).toHaveAttribute('data-variant', 'info')
    expect(el).toBeInTheDocument()
  })

  it('renders with correct variant for "info"', () => {
    render(<Callout variant="info">Info content</Callout>)
    expect(screen.getByRole('note')).toHaveAttribute('data-variant', 'info')
  })

  it('renders with correct variant for "warn"', () => {
    render(<Callout variant="warn">Warn content</Callout>)
    expect(screen.getByRole('note')).toHaveAttribute('data-variant', 'warn')
  })

  it('renders with correct variant for "danger"', () => {
    render(<Callout variant="danger">Danger content</Callout>)
    expect(screen.getByRole('note')).toHaveAttribute('data-variant', 'danger')
  })

  it('renders children content', () => {
    render(<Callout>My callout message</Callout>)
    expect(screen.getByText('My callout message')).toBeInTheDocument()
  })
})
