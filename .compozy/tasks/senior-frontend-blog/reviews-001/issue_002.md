---
status: resolved
file: __tests__/task_01.integration.test.ts
line: 52
severity: high
author: claude-code
provider_ref:
---

# Issue 002: @libsql/client missing from package.json; import uses unsafe cast

## Review Comment

The integration test dynamically imports `@libsql/client/http`:

```ts
const { createClient } = await import('@libsql/client/http' as string)
```

The `as string` cast suppresses TypeScript's module-resolution error but does nothing at runtime. `@libsql/client` is not present in `package.json` (only `next`, `react`, `react-dom` are listed). When a developer runs `pnpm install && pnpm test`, the dynamic import throws `ERR_MODULE_NOT_FOUND` at runtime, causing the suite to error rather than skip gracefully.

The TechSpec lists `@libsql/client` as a production dependency. It must be added so the integration tests can actually run once the DB is provisioned.

**Suggested fix:**
1. Add `"@libsql/client": "^0.14"` to `dependencies` in `package.json`.
2. Remove the `as string` cast: `await import('@libsql/client/http')`.

## Triage

- Decision: `VALID`
- Notes: Installed `@libsql/client@0.17.4` via `pnpm add -w`. Removed `as string` cast from dynamic import. Tests pass (10 passed, 9 skipped pending DB provisioning).
