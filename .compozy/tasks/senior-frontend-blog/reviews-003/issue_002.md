---
status: resolved
file: __tests__/LikeButton.test.tsx
line: 1
severity: high
author: claude-code
provider_ref:
---

# Issue 002: Missing required test — optimistic count reverts when incrementLike throws

## Review Comment

Task_10 lists four required unit tests for `LikeButton`. Three are implemented. The fourth is absent:

> "Optimistic count reverts to `initialCount` if `incrementLike` throws"

This is the most important behavioral guarantee of the `useOptimistic` pattern: if the server action fails, the UI must rollback to the pre-click count so the user is not misled into thinking their like was recorded. Without this test, the revert behavior is unverified in CI.

The test is straightforward to add using a rejected mock:

```tsx
it('reverts to initialCount when incrementLike throws', async () => {
  const LikeButton = await importLikeButton()
  mockIncrementLike.mockRejectedValue(new Error('Network error'))

  render(<LikeButton slug="test-post" initialCount={5} />)
  const button = screen.getByRole('button')

  // Click triggers optimistic update
  await userEvent.click(button)
  // Optimistic count shows 6 while action is pending
  expect(screen.getByText('6')).toBeInTheDocument()

  // Wait for transition to complete (action throws)
  await act(async () => {})

  // Count reverts to 5 after action failure
  expect(screen.getByText('5')).toBeInTheDocument()
})
```

Note: verifying the revert in `jsdom` with React 19's `useOptimistic` requires the action to actually reject AND for React to process the transition completion. Using `act(async () => {})` after the click gives React time to process the rejected promise and restore the original state.

If the revert does not work correctly in the current `LikeButton` implementation (e.g., because `startTransition` swallows the rejection), this test will catch that bug.

## Triage

- Decision: `valid`
- Notes: Confirmed — `__tests__/LikeButton.test.tsx` has 5 tests but the required "optimistic revert on throw" test is absent. The mock infrastructure (`mockIncrementLike`, `importLikeButton`) is already in place; only the test body is missing. Fix: add one test using `mockRejectedValue` + `act(async () => {})` to verify count reverts to `initialCount` after rejection.
