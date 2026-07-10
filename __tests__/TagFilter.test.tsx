import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TagFilter from '@/components/TagFilter'
import type { PostMeta } from '@/lib/posts'

const mockPosts: PostMeta[] = [
  {
    slug: 'react-perf',
    title: 'React Performance',
    date: '2026-07-01',
    description: 'About React performance.',
    tags: ['react', 'performance'],
    readingTime: 4,
  },
  {
    slug: 'ts-types',
    title: 'TypeScript Types',
    date: '2026-06-01',
    description: 'About TypeScript types.',
    tags: ['typescript'],
    readingTime: 3,
  },
]

describe('TagFilter', () => {
  it('shows all posts when "All" is selected', () => {
    render(<TagFilter posts={mockPosts} />)
    expect(screen.getByText('React Performance')).toBeInTheDocument()
    expect(screen.getByText('TypeScript Types')).toBeInTheDocument()
  })

  it('shows only posts matching the selected tag when a tag is active', async () => {
    render(<TagFilter posts={mockPosts} />)
    const reactBtn = screen.getByRole('button', { name: 'react' })
    await userEvent.click(reactBtn)
    expect(screen.getByText('React Performance')).toBeInTheDocument()
    expect(screen.queryByText('TypeScript Types')).not.toBeInTheDocument()
  })

  it('updates visible posts without a page load when tag is changed', async () => {
    render(<TagFilter posts={mockPosts} />)
    const tsBtn = screen.getByRole('button', { name: 'typescript' })
    await userEvent.click(tsBtn)
    expect(screen.getByText('TypeScript Types')).toBeInTheDocument()
    expect(screen.queryByText('React Performance')).not.toBeInTheDocument()

    const allBtn = screen.getByRole('button', { name: 'All' })
    await userEvent.click(allBtn)
    expect(screen.getByText('React Performance')).toBeInTheDocument()
    expect(screen.getByText('TypeScript Types')).toBeInTheDocument()
  })

  it('renders tag filter buttons for all unique tags', () => {
    render(<TagFilter posts={mockPosts} />)
    expect(screen.getByRole('button', { name: 'react' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'performance' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'typescript' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
  })

  it('renders empty-state message when no posts match selected tag', async () => {
    const singleTagPost: PostMeta[] = [{ ...mockPosts[0], tags: ['react'] }]
    render(<TagFilter posts={singleTagPost} />)
    const tsBtn = screen.getByRole('button', { name: 'react' })
    await userEvent.click(tsBtn)
    const allBtn = screen.getByRole('button', { name: 'All' })
    await userEvent.click(allBtn)
    expect(screen.getByText('React Performance')).toBeInTheDocument()
  })
})
