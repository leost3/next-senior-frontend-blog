---
status: resolved
file: components/SearchInput.tsx
line: 31
severity: medium
author: claude-code
provider_ref:
---

# Issue 001: SearchInput has no AbortController — stale responses can overwrite fresh results

## Review Comment

The debounce timer is correctly cancelled on each new keystroke, but the **in-flight HTTP request is never cancelled**. When the user types slowly enough that the 300 ms window elapses between keystrokes, two (or more) fetch calls are alive simultaneously. If the later request resolves before the earlier one, the results flash correct — then the earlier, stale response arrives and `setResults(data)` overwrites the display with out-of-order data.

Reproduction path:
1. User types `"re"` → 300 ms elapses → fetch A fires for `?q=re`
2. User immediately types `"c"` → 300 ms elapses → fetch B fires for `?q=rec`
3. Fetch B resolves first (network jitter) → dropdown shows correct results for "rec"
4. Fetch A resolves → `setResults(staleData)` overwrites with results for "re"

**Suggested fix** — abort the previous request when a new debounce timer fires:

```ts
const abortRef = useRef<AbortController | null>(null)

// inside the debounce setTimeout:
abortRef.current?.abort()
abortRef.current = new AbortController()
const res = await fetch(url, { signal: abortRef.current.signal })
```

Catch `AbortError` separately so it doesn't clear the results that are already displayed:

```ts
} catch (err) {
  if (err instanceof DOMException && err.name === 'AbortError') return
  setResults(null)
  setOpen(false)
}
```

Also abort in the effect cleanup to cancel any pending request when the component unmounts:

```ts
return () => {
  if (timerRef.current) clearTimeout(timerRef.current)
  abortRef.current?.abort()
}
```

## Triage

- Decision: `valid`
- Notes: Root cause confirmed — `useEffect` starts a `setTimeout`, but when a new effect run cancels the timer it only calls `clearTimeout`. The in-flight `fetch` from a *previous* resolved timer is never cancelled. Fix: add `abortRef = useRef<AbortController | null>(null)`, abort the previous controller at the top of each new timer callback, pass the signal to `fetch`, skip state updates on AbortError, and also abort in effect cleanup to handle unmount.
