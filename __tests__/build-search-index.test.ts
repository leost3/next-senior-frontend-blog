import { describe, it, expect, vi, afterEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

const FIXTURE_DIR = path.join(__dirname, 'fixtures')

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

  it('buildIndex returns one SearchEntry per .mdx fixture file', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(FIXTURE_DIR)
    vi.resetModules()
    const { buildIndex } = await import('../scripts/build-search-index')
    const entries = buildIndex()
    expect(Array.isArray(entries)).toBe(true)
    expect(entries.length).toBe(2)
    const slugs = entries.map((e) => e.slug)
    expect(slugs).toContain('first-post')
    expect(slugs).toContain('second-post')
  })

  it('each SearchEntry has the required fields', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(FIXTURE_DIR)
    vi.resetModules()
    const { buildIndex } = await import('../scripts/build-search-index')
    const entries = buildIndex()
    for (const entry of entries) {
      expect(typeof entry.slug).toBe('string')
      expect(typeof entry.title).toBe('string')
      expect(typeof entry.description).toBe('string')
      expect(Array.isArray(entry.tags)).toBe(true)
      expect(typeof entry.excerpt).toBe('string')
      expect(entry.excerpt.length).toBeLessThanOrEqual(500)
    }
  })

  it('exits with code 1 when content/posts/ directory is missing', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'build-index-test-'))
    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir)
    vi.resetModules()
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('PROCESS_EXIT_1')
    }) as never)
    try {
      const { run } = await import('../scripts/build-search-index')
      expect(() => run()).toThrow('PROCESS_EXIT_1')
      expect(exitSpy).toHaveBeenCalledWith(1)
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})
