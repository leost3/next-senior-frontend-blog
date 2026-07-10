import { describe, it, expect, vi, afterEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const FIXTURE_DIR = path.join(__dirname, 'fixtures')

async function importPostsWithCwd(cwd: string) {
  vi.spyOn(process, 'cwd').mockReturnValue(cwd)
  vi.resetModules()
  return import('../lib/posts')
}

describe('posts module (unit)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('getAllPosts() returns [] when content/posts/ does not exist', async () => {
    const { getAllPosts } = await importPostsWithCwd('/tmp/nonexistent-xyz-12345')
    expect(getAllPosts()).toEqual([])
  })

  it('getAllPosts() returns PostMeta objects with all required fields', async () => {
    const { getAllPosts } = await importPostsWithCwd(FIXTURE_DIR)
    const posts = getAllPosts()
    expect(posts.length).toBeGreaterThan(0)
    for (const post of posts) {
      expect(typeof post.slug).toBe('string')
      expect(typeof post.title).toBe('string')
      expect(typeof post.date).toBe('string')
      expect(typeof post.description).toBe('string')
      expect(Array.isArray(post.tags)).toBe(true)
      expect(typeof post.readingTime).toBe('number')
      expect(post.readingTime).toBeGreaterThanOrEqual(1)
    }
  })

  it('getAllPosts() returns posts sorted by date descending', async () => {
    const { getAllPosts } = await importPostsWithCwd(FIXTURE_DIR)
    const posts = getAllPosts()
    expect(posts.length).toBeGreaterThanOrEqual(2)
    for (let i = 0; i < posts.length - 1; i++) {
      expect(posts[i].date >= posts[i + 1].date).toBe(true)
    }
  })

  it('getAllPosts() populates readingTime from content body', async () => {
    const { getAllPosts } = await importPostsWithCwd(FIXTURE_DIR)
    const posts = getAllPosts()
    for (const post of posts) {
      expect(post.readingTime).toBeGreaterThanOrEqual(1)
      expect(Number.isInteger(post.readingTime)).toBe(true)
    }
  })

  it('skips post with missing title (no throw, console.warn)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const tmpDir = path.join(FIXTURE_DIR, 'tmp-no-title')
    const postsDir = path.join(tmpDir, 'content', 'posts')
    fs.mkdirSync(postsDir, { recursive: true })
    fs.writeFileSync(path.join(postsDir, 'bad.mdx'), '---\ndate: "2026-01-01"\ndescription: "desc"\n---\nContent')
    try {
      const { getAllPosts } = await importPostsWithCwd(tmpDir)
      let posts: import('../lib/posts').PostMeta[]
      expect(() => { posts = getAllPosts() }).not.toThrow()
      expect(posts!).toEqual([])
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('title'))
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
      warnSpy.mockRestore()
    }
  })

  it('getPost() returns null for unknown slug', async () => {
    const { getPost } = await importPostsWithCwd(FIXTURE_DIR)
    expect(getPost('nonexistent-slug-xyz')).toBeNull()
  })

  it('getPost() returns post with content for known slug', async () => {
    const { getAllPosts, getPost } = await importPostsWithCwd(FIXTURE_DIR)
    const posts = getAllPosts()
    const post = getPost(posts[0].slug)
    expect(post).not.toBeNull()
    expect(typeof post!.content).toBe('string')
    expect(post!.content.length).toBeGreaterThan(0)
  })
})

describe('posts module (integration — fixture files)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('returns both fixture posts with correct metadata', async () => {
    const { getAllPosts } = await importPostsWithCwd(FIXTURE_DIR)
    const posts = getAllPosts()
    expect(posts).toHaveLength(2)
    const slugs = posts.map((p) => p.slug)
    expect(slugs).toContain('first-post')
    expect(slugs).toContain('second-post')
  })

  it('returns posts sorted by date descending (second-post first)', async () => {
    const { getAllPosts } = await importPostsWithCwd(FIXTURE_DIR)
    const posts = getAllPosts()
    expect(posts[0].slug).toBe('second-post')
    expect(posts[1].slug).toBe('first-post')
  })

  it('getPost("second-post") returns raw MDX content', async () => {
    const { getPost } = await importPostsWithCwd(FIXTURE_DIR)
    const post = getPost('second-post')
    expect(post).not.toBeNull()
    expect(post!.content).toContain('second post')
  })
})
