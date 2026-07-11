'use client'

import { useOptimistic, useTransition } from 'react'
import { incrementLike } from '@/actions/likes'

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
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Like this post. ${optimisticCount} likes`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-subtle)',
        color: 'var(--text)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--font-size-sm)',
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.7 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {isPending ? (
        <span aria-hidden="true" role="status">⋯</span>
      ) : (
        <span aria-hidden="true">♥</span>
      )}
      <span>{optimisticCount}</span>
    </button>
  )
}
