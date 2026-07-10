import fs from 'node:fs'
import path from 'node:path'
import { getAllPosts, getPost } from '../lib/posts'

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

function buildIndex(): SearchEntry[] {
  const posts = getAllPosts()
  const entries: SearchEntry[] = []

  for (const meta of posts) {
    const post = getPost(meta.slug)
    if (!post) {
      console.error(`[build-search-index] Could not load post: ${meta.slug}`)
      process.exit(1)
    }

    let excerpt: string
    try {
      excerpt = stripMdx(post.content).slice(0, 500)
    } catch (err) {
      console.error(`[build-search-index] Failed to parse content for: ${meta.slug}`, err)
      process.exit(1)
    }

    entries.push({
      slug: meta.slug,
      title: meta.title,
      description: meta.description,
      tags: meta.tags,
      excerpt,
    })
  }

  return entries
}

const postsDir = path.join(process.cwd(), 'content', 'posts')
if (!fs.existsSync(postsDir)) {
  console.error('[build-search-index] content/posts/ directory not found')
  process.exit(1)
}

const index = buildIndex()
const outPath = path.join(process.cwd(), 'public', 'search-index.json')

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(index, null, 2), 'utf-8')

console.log(`[build-search-index] Wrote ${index.length} entries to ${outPath}`)
