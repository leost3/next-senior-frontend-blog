'use client'

import { useOptimistic, useTransition } from 'react'
import { incrementLike } from '@/actions/likes'
import { Button } from '@/components/ui/button'

type Props = {
  slug: string
  initialCount: number
}

export default function LikeButton({ slug, initialCount }: Props) {
  const [optimisticCount, addOptimistic] = useOptimistic(
    initialCount,
    (state: number) => state + 1
  )
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      addOptimistic(0)
      try {
        await incrementLike(slug)
      } catch {
        // useOptimistic reverts to initialCount automatically when the transition ends
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Like this post. ${optimisticCount} likes`}
      className="font-mono"
    >
      <span aria-hidden="true">{isPending ? '⋯' : '♥'}</span>
      <span>{optimisticCount}</span>
    </Button>
  )
}
