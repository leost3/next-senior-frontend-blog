---
status: resolved
file: components/mdx/CodeDiff.tsx
line: 1
severity: medium
author: claude-code
provider_ref:
---

# Issue 005: CodeDiff has no tests — task_07 requires tests for all MDX components

## Review Comment

Task_07 deliverables state "Unit tests with 80%+ coverage **(REQUIRED)**" and lists `components/mdx/CodeDiff.tsx` as an explicit deliverable alongside `components/mdx/Callout.tsx`. `Callout.tsx` has a test file (`__tests__/Callout.test.tsx`) with 5 tests. `CodeDiff.tsx` has zero tests.

The component accepts three props (`before`, `after`, `language`) and renders a two-column before/after layout with `data-language` on each `<pre>`. None of this is verified in CI.

**Suggested fix:** Create `__tests__/CodeDiff.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CodeDiff from '@/components/mdx/CodeDiff'

describe('CodeDiff', () => {
  it('renders "Before" and "After" labels', () => {
    render(<CodeDiff before="const x = 1" after="const x = 2" />)
    expect(screen.getByText('Before')).toBeInTheDocument()
    expect(screen.getByText('After')).toBeInTheDocument()
  })

  it('renders before content in the first code block', () => {
    render(<CodeDiff before="old code" after="new code" />)
    expect(screen.getByText('old code')).toBeInTheDocument()
  })

  it('renders after content in the second code block', () => {
    render(<CodeDiff before="old code" after="new code" />)
    expect(screen.getByText('new code')).toBeInTheDocument()
  })

  it('sets data-language on both pre elements when language prop is provided', () => {
    render(<CodeDiff before="x" after="y" language="typescript" />)
    const pres = document.querySelectorAll('pre[data-language="typescript"]')
    expect(pres).toHaveLength(2)
  })

  it('defaults language to "text" when not provided', () => {
    render(<CodeDiff before="x" after="y" />)
    const pres = document.querySelectorAll('pre[data-language="text"]')
    expect(pres).toHaveLength(2)
  })
})
```

## Triage

- Decision: `VALID`
- Notes: Issue is confirmed valid. The root cause is that `__tests__/CodeDiff.test.tsx` was never created, leaving `components/mdx/CodeDiff.tsx` with zero test coverage despite `Callout.tsx` having a full test suite. The fix is to create `__tests__/CodeDiff.test.tsx` with five tests covering: "Before"/"After" label rendering, before/after content rendering in their respective code blocks, `data-language` attribute presence on both `<pre>` elements when the language prop is provided, and defaulting `data-language` to "text" when the prop is omitted. The file has been created at `__tests__/CodeDiff.test.tsx`.
