"use client"

import { useState } from "react"
import PostList from "@/components/PostList"
import { Button } from "@/components/ui/button"
import type { PostMeta } from "@/lib/posts"

type Props = {
  posts: PostMeta[]
}

export default function TagFilter({ posts }: Props) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)))
  const visible = selectedTag
    ? posts.filter((p) => p.tags.includes(selectedTag))
    : posts

  return (
    <div>
      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          <Button
            type="button"
            variant={selectedTag === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTag(null)}
            aria-pressed={selectedTag === null}
            className="font-mono text-xs"
          >
            All
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={selectedTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              aria-pressed={selectedTag === tag}
              className="font-mono text-xs"
            >
              {tag}
            </Button>
          ))}
        </div>
      )}

      <PostList posts={visible} />
    </div>
  )
}
