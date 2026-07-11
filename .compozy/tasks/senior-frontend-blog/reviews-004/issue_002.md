---
status: resolved
file: __tests__/SearchInput.test.tsx
line: 1
severity: medium
author: claude-code
provider_ref:
---

# Issue 002: Arrow-key and Enter keyboard navigation has no tests

## Review Comment

`components/SearchInput.tsx` implements full keyboard navigation — ArrowDown/ArrowUp cycle `activeIndex` and Enter navigates to the active result (lines 69–80). The implementation is correct, but **zero tests cover this code path**.

The task success criteria explicitly states:
> Keyboard-navigable result list (arrow keys + Enter)

And subtask 9.3 requires:
> Render results dropdown with keyboard navigation (arrow keys + Enter)

The existing test suite covers clicks, Escape, debounce, loading state, and empty state — but the entire ArrowDown/ArrowUp/Enter branch is untested. A regression here (e.g., off-by-one in `Math.min`/`Math.max`, wrong key name) would go undetected.

**Suggested tests to add:**

```ts
it('ArrowDown highlights the first result, Enter navigates to it', async () => {
  const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResults })
  vi.stubGlobal('fetch', mockFetch)

  const SearchInput = await importSearchInput()
  render(<SearchInput />)
  const input = screen.getByRole('combobox')

  fireEvent.change(input, { target: { value: 'react' } })
  await act(async () => { vi.advanceTimersByTime(300) })

  fireEvent.keyDown(input, { key: 'ArrowDown' })
  // first option should now be aria-selected
  const options = screen.getAllByRole('option')
  expect(options[0]).toHaveAttribute('aria-selected', 'true')

  fireEvent.keyDown(input, { key: 'Enter' })
  expect(mockPush).toHaveBeenCalledWith('/blog/react-perf')
})

it('ArrowDown then ArrowUp returns to no selection', async () => {
  // ...
  fireEvent.keyDown(input, { key: 'ArrowDown' })
  fireEvent.keyDown(input, { key: 'ArrowUp' })
  const options = screen.getAllByRole('option')
  options.forEach(opt => expect(opt).toHaveAttribute('aria-selected', 'false'))
})
```

## Triage

- Decision: `valid`
- Notes: The `handleKeyDown` path for ArrowDown/ArrowUp/Enter (lines 69–80 of SearchInput.tsx) is exercised only by keyboard events, not by any test. Adding two tests: (1) ArrowDown highlights the first option and Enter navigates to it, (2) multiple ArrowDown presses clamp at last result and ArrowUp retreats. These cover the `Math.min`/`Math.max` boundary logic and the `router.push` call path.
