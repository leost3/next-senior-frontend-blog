# AGENT.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev          # start dev server
pnpm build        # prebuild (search index) + next build
pnpm lint         # eslint
pnpm test         # vitest run (single pass)
pnpm test:watch   # vitest watch
pnpm test:coverage

# run a single test file
pnpm test __tests__/PostList.test.tsx
```

## Environment variables

Copy `.env.local` and set:
- `TURSO_DATABASE_URL` — Turso database HTTP URL
- `TURSO_AUTH_TOKEN` — Turso auth token

`lib/db.ts` throws at module load if either is missing, so the dev server and build will fail without them.

## Architecture

**Content layer** (`lib/posts.ts`): reads `.mdx` files from `content/posts/`, parses frontmatter with `gray-matter`. Required frontmatter fields: `title`, `date`, `description`. Optional: `tags[]`.

**Search index** (`scripts/build-search-index.ts`): runs as `prebuild`, strips MDX syntax from post content and writes `public/search-index.json`. `app/api/search/route.ts` serves client-side fuzzy search against this static file.

**Database** (`lib/db.ts`): singleton Turso (libsql over HTTP) client. Used for:
- `likes` table — post like counts, incremented via Server Action (`actions/likes.ts`)
- `vitals` table — Web Vitals (LCP, CLS, INP) collected by `VitalsWidget` and stored via `POST /api/vitals`; aggregated by `GET /api/vitals/summary`

**Rendering split**: `VitalsWidgetServer.tsx` is a Server Component that fetches vitals summary and passes data to the client `VitalsWidget.tsx`. This pattern keeps DB calls server-side while the chart/display is client-interactive.

**MDX rendering**: `next-mdx-remote` with `rehype-pretty-code` + `shiki` for syntax highlighting. Custom MDX components live in `components/mdx/` (Callout, CodeDiff).

**Theme**: `next-themes` via `Providers.tsx` wrapping the root layout.

## Testing notes

Tests run in jsdom via Vitest. `lib/db.ts` is excluded from coverage because it requires real env vars. Tests that touch DB-dependent code mock the module directly. Fixtures live in `__tests__/fixtures/`.
