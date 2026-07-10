import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostList from '@/components/PostList'
import type { PostMeta } from '@/lib/posts'

const mockPosts: PostMeta[] = [
  {
    slug: 'test-post-one',
    title: 'Test Post One',
    date: '2026-07-01',
    description: 'First test post.',
    tags: ['react', 'performance'],
    readingTime: 3,
  },
  {
    slug: 'test-post-two',
    title: 'Test Post Two',
    date: '2026-06-01',
    description: 'Second test post.',
    tags: ['typescript'],
    readingTime: 5,
  },
]

describe('PostList', () => {
  it('renders a post title as a link to /blog/[slug]', () => {
    render(<PostList posts={mockPosts} />)
    const link = screen.getByRole('link', { name: 'Test Post One' })
    expect(link).toHaveAttribute('href', '/blog/test-post-one')
  })

  it('renders all post titles', () => {
    render(<PostList posts={mockPosts} />)
    expect(screen.getByText('Test Post One')).toBeInTheDocument()
    expect(screen.getByText('Test Post Two')).toBeInTheDocument()
  })

  it('renders empty-state message when passed an empty array', () => {
    render(<PostList posts={[]} />)
    expect(screen.getByText(/no posts yet/i)).toBeInTheDocument()
  })

  it('renders reading time as "N min read"', () => {
    render(<PostList posts={mockPosts} />)
    expect(screen.getByText('3 min read')).toBeInTheDocument()
    expect(screen.getByText('5 min read')).toBeInTheDocument()
  })

  it('renders post tags', () => {
    render(<PostList posts={mockPosts} />)
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('performance')).toBeInTheDocument()
    expect(screen.getByText('typescript')).toBeInTheDocument()
  })
})
