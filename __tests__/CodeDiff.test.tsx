import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CodeDiff from '@/components/mdx/CodeDiff'

describe('CodeDiff', () => {
  it('renders "Before" and "After" labels', () => {
    render(<CodeDiff before="const x = 1" after="const x = 2" />)
    expect(screen.getByText('Before')).toBeInTheDocument()
    expect(screen.getByText('After')).toBeInTheDocument()
  })

  it('renders before content in the first code block', () => {
    render(<CodeDiff before="old code" after="new code" />)
    expect(screen.getByText('old code')).toBeInTheDocument()
  })

  it('renders after content in the second code block', () => {
    render(<CodeDiff before="old code" after="new code" />)
    expect(screen.getByText('new code')).toBeInTheDocument()
  })

  it('sets data-language on both pre elements when language prop is provided', () => {
    render(<CodeDiff before="x" after="y" language="typescript" />)
    const pres = document.querySelectorAll('pre[data-language="typescript"]')
    expect(pres).toHaveLength(2)
  })

  it('defaults language to "text" when not provided', () => {
    render(<CodeDiff before="x" after="y" />)
    const pres = document.querySelectorAll('pre[data-language="text"]')
    expect(pres).toHaveLength(2)
  })
})
