import { getAllPosts } from '@/lib/posts'
import TagFilter from '@/components/TagFilter'
import SearchInput from '@/components/SearchInput'
import VitalsWidgetServer from '@/components/VitalsWidgetServer'

export const revalidate = 3600

export default function Home() {
  const posts = getAllPosts()

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <SearchInput />
      </div>

      <section aria-label="Post list">
        <TagFilter posts={posts} />
      </section>

      <VitalsWidgetServer slug="home" />
    </div>
  )
}
