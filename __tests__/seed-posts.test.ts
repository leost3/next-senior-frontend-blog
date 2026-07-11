import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')
const SEED_SLUGS = [
  'understanding-react-render-batching',
  'zustand-vs-server-state',
  'migrating-data-fetching-to-react-query',
]

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

describe('seed MDX posts (unit)', () => {
  for (const slug of SEED_SLUGS) {
    describe(`${slug}.mdx`, () => {
      const filePath = path.join(POSTS_DIR, `${slug}.mdx`)

      it('file exists', () => {
        expect(fs.existsSync(filePath)).toBe(true)
      })

      it('has valid frontmatter with non-empty title, date, description, and tags', () => {
        const raw = fs.readFileSync(filePath, 'utf-8')
        const { data } = matter(raw)
        expect(typeof data.title).toBe('string')
        expect(data.title.length).toBeGreaterThan(0)
        expect(typeof data.date).toBe('string')
        expect(data.date.length).toBeGreaterThan(0)
        expect(typeof data.description).toBe('string')
        expect(data.description.length).toBeGreaterThan(0)
        expect(Array.isArray(data.tags)).toBe(true)
        expect(data.tags.length).toBeGreaterThan(0)
      })

      it('has at least 400 words of content', () => {
        const raw = fs.readFileSync(filePath, 'utf-8')
        const { content } = matter(raw)
        expect(wordCount(content)).toBeGreaterThanOrEqual(400)
      })

      it('contains at least one fenced code block', () => {
        const raw = fs.readFileSync(filePath, 'utf-8')
        expect(raw).toMatch(/```/)
      })
    })
  }

  it('all three posts exist in the posts directory', () => {
    const files = fs.readdirSync(POSTS_DIR)
    const slugs = files.map((f) => f.replace(/\.mdx$/, ''))
    for (const slug of SEED_SLUGS) {
      expect(slugs).toContain(slug)
    }
  })

  it('at least one post uses <Callout>', () => {
    const hasCallout = SEED_SLUGS.some((slug) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.mdx`), 'utf-8')
      return raw.includes('<Callout')
    })
    expect(hasCallout).toBe(true)
  })

  it('at least one post uses <CodeDiff>', () => {
    const hasCodeDiff = SEED_SLUGS.some((slug) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.mdx`), 'utf-8')
      return raw.includes('<CodeDiff')
    })
    expect(hasCodeDiff).toBe(true)
  })

  it('tags field in each post is an array with at least one element', () => {
    for (const slug of SEED_SLUGS) {
      const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.mdx`), 'utf-8')
      const { data } = matter(raw)
      expect(Array.isArray(data.tags)).toBe(true)
      expect((data.tags as string[]).length).toBeGreaterThan(0)
    }
  })
})
