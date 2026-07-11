import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { calculateReadingTime } from './reading-time'

export type PostMeta = {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  readingTime: number
}

export type Post = PostMeta & {
  content: string
}

function getPostsDir(): string {
  return path.join(process.cwd(), 'content', 'posts')
}

function parsePost(filePath: string, slug: string, rawContent?: string): PostMeta | null {
  let fileContent: string
  try {
    fileContent = rawContent ?? fs.readFileSync(filePath, 'utf-8')
  } catch (err) {
    console.warn(`[posts] Could not read file "${filePath}":`, err)
    return null
  }

  const { data, content } = matter(fileContent)

  if (typeof data.title !== 'string' || !data.title) {
    console.warn(
      `[posts] Skipping "${slug}": missing or invalid "title" in frontmatter`
    )
    return null
  }

  if (typeof data.date !== 'string' && !(data.date instanceof Date)) {
    console.warn(
      `[posts] Skipping "${slug}": missing or invalid "date" in frontmatter`
    )
    return null
  }

  if (typeof data.description !== 'string' || !data.description) {
    console.warn(
      `[posts] Skipping "${slug}": missing or invalid "description" in frontmatter`
    )
    return null
  }

  const date =
    data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : String(data.date)

  const tags: string[] = Array.isArray(data.tags)
    ? data.tags.filter((t): t is string => typeof t === 'string')
    : []

  const readingTime = calculateReadingTime(content)

  return { slug, title: data.title, date, description: data.description, tags, readingTime }
}

export function getAllPosts(): PostMeta[] {
  const POSTS_DIR = getPostsDir()

  if (!fs.existsSync(POSTS_DIR)) {
    return []
  }

  let files: string[]
  try {
    files = fs.readdirSync(POSTS_DIR)
  } catch (err) {
    console.warn('[posts] Could not read posts directory:', err)
    return []
  }

  const posts: PostMeta[] = []
  for (const file of files.filter((f) => f.endsWith('.mdx'))) {
    const slug = file.replace(/\.mdx$/, '')
    const post = parsePost(path.join(POSTS_DIR, file), slug)
    if (post !== null) posts.push(post)
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  return posts
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(getPostsDir(), `${slug}.mdx`)

  if (!fs.existsSync(filePath)) return null

  let fileContent: string
  try {
    fileContent = fs.readFileSync(filePath, 'utf-8')
  } catch (err) {
    console.warn(`[posts] Could not read file for slug "${slug}":`, err)
    return null
  }

  const meta = parsePost(filePath, slug, fileContent)
  if (!meta) return null

  const { content } = matter(fileContent)
  return { ...meta, content }
}
