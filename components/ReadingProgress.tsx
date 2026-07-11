'use client'

import { useEffect, useState, useRef } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const [prefersReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  )
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    function update() {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0)
    }

    if (prefersReduced) {
      update()
      return
    }

    function onScroll() {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [prefersReduced])

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 50,
        backgroundColor: 'var(--border)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: 'var(--accent)',
          transition: prefersReduced ? 'none' : 'width 0.1s linear',
        }}
      />
    </div>
  )
}
