---
status: resolved
file: .gitignore
line: 1
severity: high
author: claude-code
provider_ref:
---

# Issue 001: public/search-index.json not excluded from git

## Review Comment

The TechSpec Impact Analysis section explicitly states:

> `public/search-index.json` | Generated | Built by script; must be in `.gitignore`

And the directory structure notes:

> `public/search-index.json` — generated at build (gitignored)

The current `.gitignore` does not include an entry for `public/search-index.json`. If a developer runs `pnpm build` locally, the generated file will appear as untracked and risk being accidentally committed. A committed stale index can diverge from actual post content between deploys.

**Suggested fix:** Add to `.gitignore`:

```
# generated at build time
/public/search-index.json
```

## Triage

- Decision: `VALID`
- Notes: Added `/public/search-index.json` to `.gitignore` in worktree A (agent-a846450ef47f13afb). Tests pass.
