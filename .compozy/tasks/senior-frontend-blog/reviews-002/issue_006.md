---
status: resolved
file: components/ReadingProgress.tsx
line: 25
severity: medium
author: claude-code
provider_ref:
---

# Issue 006: prefers-reduced-motion compliance is incomplete — transition style is always applied

## Review Comment

Task_07 requires: "`ReadingProgress` MUST respect `prefers-reduced-motion`".

When `prefersReduced` is `true`, `useEffect` calls `update()` once and returns early — no scroll listener is attached. This prevents the progress bar from changing after mount. However, the inner `<div>` that represents the filled bar **always** has `transition: 'width 0.1s linear'`:

```tsx
// ReadingProgress.tsx — always applied regardless of motion preference:
<div style={{ ..., transition: 'width 0.1s linear' }} />
```

If the scroll state changes by any other means (programmatic `window.scrollTo`, browser restore-scroll-position on back-navigation, etc.), the CSS transition will fire. More importantly, the `prefers-reduced-motion` requirement at this level means: users who prefer no animation must see no animated width change. The transition CSS property should be absent when the preference is active.

The test for this case (`'applies no transition when prefers-reduced-motion is set'`) only checks that the component renders — it does not assert `transition` is `'none'` or absent:

```ts
// __tests__/ReadingProgress.test.tsx ~line 56:
render(<ReadingProgress />)
const bar = screen.getByRole('progressbar')
expect(bar).toBeInTheDocument()  // too weak — doesn't verify transition style
```

**Suggested fix:** Thread the `prefersReduced` flag into the rendered style:

```tsx
const [prefersReduced] = useState(() =>
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
)

// In the inner div:
style={{
  height: '100%',
  width: `${progress}%`,
  backgroundColor: 'var(--accent)',
  transition: prefersReduced ? 'none' : 'width 0.1s linear',
}}
```

Update the test to assert `transition` style:

```ts
it('applies no transition when prefers-reduced-motion is set', () => {
  // ... matchMedia mock returning matches: true ...
  render(<ReadingProgress />)
  const inner = screen.getByRole('progressbar').firstElementChild as HTMLElement
  expect(inner.style.transition).toBe('none')
})
```

## Triage

- Decision: `VALID`
- Notes: The transition style `'width 0.1s linear'` was always applied to the inner progress bar div regardless of motion preference. While the scroll listener was correctly skipped when `prefersReduced` is true, the CSS transition remained active, meaning any programmatic scroll or browser scroll-restore would still animate the bar. Fix adds a `prefersReduced` state initialized lazily via `useState` (reading `window.matchMedia` at mount time), then conditionally applies `transition: prefersReduced ? 'none' : 'width 0.1s linear'` in the inner div. The `useEffect` dependency array was also updated to include `prefersReduced` (replacing the inline `window.matchMedia` read inside the effect). The test was strengthened to assert `inner.style.transition` is `'none'` rather than only checking the component renders.
