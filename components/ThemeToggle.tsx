'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useHydrated()

  if (!mounted) {
    return <span aria-hidden="true" style={{ display: 'inline-block', width: '2rem', height: '1.5rem' }} />
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: '0.375rem',
        padding: '0.25rem 0.5rem',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--font-size-xs)',
        lineHeight: 1.5,
        transition: 'color 0.15s ease, border-color 0.15s ease',
      }}
    >
      {isDark ? 'Light' : 'Dark'}
    </button>
  )
}
