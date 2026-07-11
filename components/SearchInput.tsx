'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type SearchResult = {
  slug: string
  title: string
  description: string
  tags: string[]
}

export default function SearchInput() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const router = useRouter()

  // Derived: query must be at least 2 non-whitespace characters
  const queryValid = query.trim().length >= 2

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!queryValid) return

    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      setLoading(true)
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
          { signal: abortRef.current.signal },
        )
        if (!res.ok) throw new Error('Search failed')
        const data: SearchResult[] = await res.json()
        setResults(data)
        setOpen(true)
        setActiveIndex(-1)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setResults(null)
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      abortRef.current?.abort()
    }
  }, [query, queryValid])

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!open || !results?.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      router.push(`/blog/${results[activeIndex].slug}`)
      setOpen(false)
      setQuery('')
    }
  }

  function handleResultClick(slug: string) {
    router.push(`/blog/${slug}`)
    setOpen(false)
    setQuery('')
  }

  // Gate loading indicator and dropdown on query validity
  // so they disappear when the query drops below 2 chars without a setState call in useEffect
  const showLoading = queryValid && loading
  const showDropdown = queryValid && open && results !== null

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%' }}
    >
      <input
        type="search"
        role="combobox"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search posts…"
        aria-label="Search posts"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-controls={showDropdown ? 'search-results' : undefined}
        aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          fontSize: 'var(--font-size-sm)',
          fontFamily: 'var(--font-mono)',
          border: '1px solid var(--border)',
          borderRadius: '0.375rem',
          backgroundColor: 'var(--bg)',
          color: 'var(--text)',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {showLoading && (
        <span
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            pointerEvents: 'none',
          }}
        >
          Loading…
        </span>
      )}
      {showDropdown && (
        <ul
          id="search-results"
          role="listbox"
          aria-label="Search results"
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.25rem)',
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '0.375rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            listStyle: 'none',
            margin: 0,
            padding: '0.25rem 0',
            maxHeight: '20rem',
            overflowY: 'auto',
          }}
        >
          {results.length === 0 ? (
            <li
              style={{
                padding: '0.75rem 1rem',
                color: 'var(--text-muted)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              No results found
            </li>
          ) : (
            results.map((result, i) => (
              <li
                key={result.slug}
                id={`search-result-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onClick={() => handleResultClick(result.slug)}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  backgroundColor: i === activeIndex ? 'var(--bg-subtle)' : 'transparent',
                  borderBottom:
                    i < results.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text)',
                    marginBottom: '0.2rem',
                  }}
                >
                  {result.title}
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {result.description}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
