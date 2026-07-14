'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'

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
    return <span aria-hidden="true" className="inline-block w-8 h-6" />
  }

  const isDark = theme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className="font-mono text-xs text-muted-foreground"
    >
      {isDark ? 'Light' : 'Dark'}
    </Button>
  )
}
