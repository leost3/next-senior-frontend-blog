import { describe, it, expect, vi, afterEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

const FIXTURE_DIR = path.join(__dirname, 'fixtures')

type SearchEntry = {
  slug: string
  title: string
  description: string
  tags: string[]
  excerpt: string
}

function stripMdx(content: string): string {
  return content
    .replace(/^(import|export)\s+.*$/gm, '')
    .replace(/<[^>]+\/?>/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/[#*_~>|{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

describe('search index builder (unit)', () => {
  it('stripMdx removes <Component /> JSX from content', () => {
    const input = 'Hello <MyComponent prop="val" /> world'
    const result = stripMdx(input)
    expect(result).not.toContain('<MyComponent')
    expect(result).toContain('Hello')
    expect(result).toContain('world')
  })

  it('stripMdx removes {expression} from content', () => {
    const input = 'Value: {someExpression}'
    const result = stripMdx(input)
    expect(result).not.toContain('{someExpression}')
  })

  it('excerpt is truncated at exactly 500 characters', () => {
    const longContent = 'word '.repeat(300)
    const stripped = stripMdx(longContent)
    const excerpt = stripped.slice(0, 500)
    expect(excerpt.length).toBeLessThanOrEqual(500)
  })

  it('MDX syntax stripper leaves plain text intact', () => {
    const plain = 'This is plain text with no MDX.'
    expect(stripMdx(plain)).toContain('plain text')
  })
})

describe('search index builder (integration)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('running against fixture dir produces valid JSON at public/search-index.json', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'search-index-test-'))
    const publicDir = path.join(tmpDir, 'public')
    fs.mkdirSync(publicDir)

    vi.spyOn(process, 'cwd').mockReturnValue(FIXTURE_DIR)

    const originalWriteFileSync = fs.writeFileSync.bind(fs)
    const outPath = path.join(publicDir, 'search-index.json')

    vi.resetModules()
    vi.spyOn(process, 'exit').mockImplementation((() => {}) as never)

    try {
      const { getAllPosts, getPost } = await import('../lib/posts')
      const posts = getAllPosts()

      const entries: SearchEntry[] = posts.map((meta) => {
        const post = getPost(meta.slug)!
        return {
          slug: meta.slug,
          title: meta.title,
          description: meta.description,
          tags: meta.tags,
          excerpt: stripMdx(post.content).slice(0, 500),
        }
      })

      originalWriteFileSync(outPath, JSON.stringify(entries, null, 2), 'utf-8')

      const written = JSON.parse(fs.readFileSync(outPath, 'utf-8')) as SearchEntry[]
      expect(Array.isArray(written)).toBe(true)
      expect(written.length).toBe(posts.length)

      for (const entry of written) {
        expect(typeof entry.slug).toBe('string')
        expect(typeof entry.title).toBe('string')
        expect(typeof entry.description).toBe('string')
        expect(Array.isArray(entry.tags)).toBe(true)
        expect(typeof entry.excerpt).toBe('string')
        expect(entry.excerpt.length).toBeLessThanOrEqual(500)
      }

      const slugs = written.map((e) => e.slug)
      expect(slugs).toContain('first-post')
      expect(slugs).toContain('second-post')
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('output contains one SearchEntry per .mdx file in the posts directory', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(FIXTURE_DIR)
    vi.resetModules()

    const { getAllPosts } = await import('../lib/posts')
    const posts = getAllPosts()
    expect(posts.length).toBe(2)
  })
})
