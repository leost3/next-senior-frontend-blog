# TechSpec: Senior Frontend Developer Blog — Leonardo Studart

## Executive Summary

The blog is a Next.js 16 App Router application deployed on Vercel, statically generated at build time with targeted dynamic islands for engagement features. Posts are MDX files compiled by `next-mdx-remote` and rendered as React Server Components; all post-reading is zero-JS on the client. Three interactive features — likes, comments, and the Web Vitals widget — are isolated Client Components that communicate via Server Actions or API routes. Turso (libSQL over HTTP) stores all mutable state: likes, comments, and vitals samples. Search runs as a Vercel Edge Function querying a CDN-cached JSON index generated at build time.

**Primary trade-off:** Choosing static generation with edge mutations (Server Actions → Turso HTTP) over full SSR means post rendering is always fast and cheap, but likes and comments require a round-trip to Turso on every mutation. For a personal blog with low write volume this is the correct trade-off.

---

## System Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│                       Vercel Edge                        │
│  ┌─────────────────┐    ┌──────────────────────────┐   │
│  │  /api/search    │    │  /api/vitals (POST)       │   │
│  │  edge runtime   │    │  edge runtime             │   │
│  │  reads CDN JSON │    │  writes to Turso          │   │
│  └────────┬────────┘    └──────────────────────────┘   │
└───────────│──────────────────────────────────────────────┘
            │fetch
┌───────────▼──────────────────────────────────────────────┐
│  Vercel CDN                                              │
│  public/search-index.json   (generated at build)        │
│  public/cv.pdf              (static asset)              │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Next.js App Router (Node.js, Vercel Functions)         │
│                                                         │
│  Server Components (static)                            │
│  ├── app/layout.tsx          root layout + ThemeProvider│
│  ├── app/page.tsx            post list + vitals widget  │
│  └── app/blog/[slug]/page.tsx  post page               │
│                                                         │
│  Client Components                                      │
│  ├── LikeButton             useOptimistic + SA         │
│  ├── CommentForm            Turnstile + honeypot + SA  │
│  ├── CommentList            hydrated from server       │
│  ├── VitalsWidget           web-vitals + fetch POST    │
│  ├── SearchInput            controlled input + fetch   │
│  ├── TagFilter              client-side filter         │
│  └── ThemeToggle            next-themes               │
│                                                         │
│  Server Actions                                        │
│  ├── actions/likes.ts       increment like count       │
│  └── actions/comments.ts    validate + insert comment  │
└──────────────────────────┬──────────────────────────────┘
                           │ @libsql/client HTTP
┌──────────────────────────▼──────────────────────────────┐
│  Turso (libSQL)                                         │
│  ├── likes(slug TEXT, count INTEGER)                    │
│  ├── comments(id, slug, body, author_name, created_at)  │
│  └── vitals(id, slug, metric, value, created_at)        │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

- **Post reads:** `fs.readFileSync` at build → `gray-matter` → `next-mdx-remote/rsc` → static HTML. Zero runtime DB reads.
- **Search:** User types → `fetch('/api/search?q=...')` → edge function fetches `search-index.json` from CDN → filters in memory → returns results.
- **Likes:** Click → `useOptimistic` increments local count → Server Action `incrementLike(slug)` → Turso upsert.
- **Comments:** Submit → Turnstile token verified server-side → Server Action `addComment(slug, body, name, token)` → Turso insert.
- **Vitals:** Page loads → `web-vitals` fires callbacks → `fetch('/api/vitals', { method: 'POST' })` → edge function inserts row to Turso → widget fetches aggregated P75 via Server Component revalidation.

---

## Implementation Design

### Core Interfaces

**Post frontmatter type:**
```ts
// lib/posts.ts
export type PostMeta = {
  slug: string
  title: string
  date: string          // ISO 8601
  description: string
  tags: string[]
  readingTime: number   // minutes, calculated at parse time
}

export type Post = PostMeta & {
  content: string       // raw MDX string
}
```

**Search index entry:**
```ts
// scripts/build-search-index.ts
export type SearchEntry = {
  slug: string
  title: string
  description: string
  tags: string[]
  excerpt: string       // first 500 chars of content, stripped of MDX syntax
}
```

**Turso DB client (shared singleton):**
```ts
// lib/db.ts
import { createClient } from '@libsql/client/http'

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})
```

**Server Action — like:**
```ts
// actions/likes.ts
'use server'
export async function incrementLike(slug: string): Promise<number> {
  await db.execute({
    sql: `INSERT INTO likes (slug, count) VALUES (?, 1)
          ON CONFLICT(slug) DO UPDATE SET count = count + 1`,
    args: [slug],
  })
  const result = await db.execute({
    sql: `SELECT count FROM likes WHERE slug = ?`,
    args: [slug],
  })
  return result.rows[0].count as number
}
```

### Data Models

**SQL schema (run once via Turso shell or migration script):**

```sql
CREATE TABLE IF NOT EXISTS likes (
  slug    TEXT PRIMARY KEY,
  count   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS comments (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  slug        TEXT NOT NULL,
  author_name TEXT NOT NULL,
  body        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_comments_slug ON comments(slug);

CREATE TABLE IF NOT EXISTS vitals (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  slug       TEXT NOT NULL,
  metric     TEXT NOT NULL,   -- 'LCP' | 'CLS' | 'INP'
  value      REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_vitals_metric_date ON vitals(metric, created_at);
```

**Search index shape (`public/search-index.json`):**
```json
[
  {
    "slug": "optimizing-re-renders",
    "title": "Optimizing Re-renders in Large React Trees",
    "description": "...",
    "tags": ["performance", "react"],
    "excerpt": "First 500 chars of plain text..."
  }
]
```

### API Endpoints

| Method | Path | Runtime | Description |
|---|---|---|---|
| `GET` | `/api/search?q={query}` | Edge | Fetches `search-index.json`, filters by query across title + description + excerpt + tags, returns top 10 matches |
| `POST` | `/api/vitals` | Edge | Inserts a single vitals sample. Body: `{ slug, metric, value }` |
| `GET` | `/api/vitals/summary` | Node | Returns P75 per metric for the last 30 days. Called by `VitalsWidget` via `fetch` with `revalidate: 3600` |

**Server Actions (not HTTP endpoints):**

| Action | File | Description |
|---|---|---|
| `incrementLike(slug)` | `actions/likes.ts` | Upserts like count, returns new count |
| `addComment(slug, body, name, token)` | `actions/comments.ts` | Verifies Turnstile token, inserts comment |

**Search response shape:**
```ts
type SearchResult = {
  slug: string
  title: string
  description: string
  tags: string[]
}[]
```

**Vitals summary response:**
```ts
type VitalsSummary = {
  LCP: number   // P75 milliseconds
  CLS: number   // P75 score
  INP: number   // P75 milliseconds
}
```

---

## Integration Points

### Turso (libSQL)

- **Purpose:** Persistent storage for likes, comments, and vitals samples
- **Client:** `@libsql/client/http` — HTTP transport required for edge compatibility
- **Auth:** `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` environment variables
- **Error handling:** DB errors in Server Actions surface as `Error` thrown — Next.js converts to a user-visible error boundary. Log the error before re-throwing.

### Cloudflare Turnstile

- **Purpose:** Invisible bot challenge on the comment form
- **Client:** `@marsidev/react-turnstile` renders the widget
- **Server verification:** `addComment` Server Action POSTs the token to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `TURNSTILE_SECRET_KEY`
- **Error handling:** Failed verification returns early without inserting — no error shown to user (bot behavior)
- **Env vars:** `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (client), `TURNSTILE_SECRET_KEY` (server)

### Vercel Deployment

- **Build command:** `pnpm run build` (which includes the search index generation script)
- **Environment:** Node.js 24 (Vercel default)
- **Edge routes:** `/api/search` and `/api/vitals` declare `export const runtime = 'edge'`
- **Static assets:** `public/cv.pdf` and `public/search-index.json` served from CDN

---

## Directory Structure

```
├── app/
│   ├── layout.tsx                  # root layout, ThemeProvider, header
│   ├── page.tsx                    # post list (Server Component)
│   ├── globals.css                 # Tailwind v4 @theme tokens, base styles
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx            # post page (Server Component)
│   └── api/
│       ├── search/route.ts         # edge search
│       ├── vitals/route.ts         # vitals ingest (POST)
│       └── vitals/summary/route.ts # vitals aggregate (GET)
├── actions/
│   ├── likes.ts                    # Server Action
│   └── comments.ts                 # Server Action
├── components/
│   ├── Header.tsx                  # server, name + contact links
│   ├── ThemeToggle.tsx             # client
│   ├── PostList.tsx                # server
│   ├── TagFilter.tsx               # client
│   ├── ReadingProgress.tsx         # client
│   ├── LikeButton.tsx              # client, useOptimistic
│   ├── CommentForm.tsx             # client, Turnstile
│   ├── CommentList.tsx             # server + client boundary
│   ├── SearchInput.tsx             # client
│   ├── VitalsWidget.tsx            # client (web-vitals) + server (summary fetch)
│   └── mdx/
│       ├── Callout.tsx             # custom MDX component
│       └── CodeDiff.tsx            # custom MDX component
├── content/
│   └── posts/
│       └── *.mdx                   # authored posts
├── lib/
│   ├── posts.ts                    # getAllPosts(), getPost(slug)
│   ├── db.ts                       # Turso singleton
│   └── reading-time.ts             # word count → minutes
├── scripts/
│   └── build-search-index.ts       # generates public/search-index.json
└── public/
    ├── cv.pdf                      # static CV asset
    └── search-index.json           # generated at build (gitignored)
```

---

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|---|---|---|---|
| `app/layout.tsx` | Modified | Add `ThemeProvider`, `Header`, font tokens | Wrap children, update metadata |
| `app/page.tsx` | Modified | Replace scaffolding with `PostList` + `VitalsWidget` | Full rewrite of scaffold |
| `app/blog/[slug]/page.tsx` | New | Static post renderer with `generateStaticParams` | Create route |
| `app/api/*` | New | 3 edge/node API routes | Create files |
| `actions/*` | New | 2 Server Actions | Create files |
| `next.config.ts` | Modified | Add MDX plugin config, build script hook | Update config |
| `package.json` | Modified | Add ~8 new dependencies | `pnpm add` |
| `public/search-index.json` | Generated | Built by script; must be in `.gitignore` | Add to `.gitignore` |
| `lib/db.ts` | New | Turso singleton — shared across all server code | Create file |

---

## Testing Approach

### Unit Tests

- `lib/posts.ts`: `getAllPosts()` returns correct shape, sorted descending by date; `getPost()` returns null for unknown slug
- `lib/reading-time.ts`: correct minute estimates for known word counts
- `scripts/build-search-index.ts`: output JSON matches `SearchEntry[]` shape; excerpt strips MDX syntax
- `actions/comments.ts`: Turnstile token rejection returns without DB insert (mock the Turnstile HTTP call)

### Integration Tests

- `actions/likes.ts`: incrementing a new slug initializes count at 1; incrementing existing slug increments correctly (requires real Turso dev database or local libSQL)
- `/api/search`: edge route returns correct filtered results for a known query against a fixture index
- `/api/vitals`: POST inserts a row; GET summary returns correct P75 for seeded data

---

## Development Sequencing

### Build Order

1. **DB schema + Turso setup** — no dependencies. Create Turso database, run schema SQL, add env vars to Vercel.
2. **`lib/db.ts`** — depends on step 1. Turso client singleton.
3. **`lib/posts.ts` + `lib/reading-time.ts`** — no DB dependency. File system utilities for reading and parsing MDX.
4. **`scripts/build-search-index.ts`** — depends on step 3. Reads all posts, writes `public/search-index.json`. Hook into `next build` via `package.json` prebuild script.
5. **`next.config.ts` updates** — depends on step 3. Add MDX/remark/rehype pipeline (next-mdx-remote does not require next.config changes, but rehype-pretty-code options go in the compile step in `lib/posts.ts`).
6. **`app/layout.tsx`** — depends on nothing functional yet. Add `ThemeProvider`, `Header`, Tailwind v4 design tokens, Geist font variables.
7. **`app/page.tsx` (post list)** — depends on steps 3 and 6. Render `PostList` (server) and stub `VitalsWidget`.
8. **`app/blog/[slug]/page.tsx`** — depends on steps 3 and 6. MDX render with `generateStaticParams`.
9. **`components/TagFilter.tsx`** — depends on step 7. Client component, no DB.
10. **`components/ReadingProgress.tsx`** — depends on step 8. Client component, no DB.
11. **`/api/search` edge route** — depends on step 4. Edge function, fetches static JSON.
12. **`components/SearchInput.tsx`** — depends on step 11.
13. **`actions/likes.ts` + `components/LikeButton.tsx`** — depends on step 2. Server Action + `useOptimistic` client component.
14. **`actions/comments.ts` + `components/CommentForm.tsx`** — depends on step 2. Requires Turnstile env vars.
15. **`/api/vitals` + `/api/vitals/summary`** — depends on step 2.
16. **`components/VitalsWidget.tsx`** — depends on step 15. Replace stub from step 7.

### Technical Dependencies

- Turso database provisioned (Vercel Marketplace → Turso) before steps 2, 13, 14, 15
- Cloudflare Turnstile site key + secret key created before step 14
- CV PDF at `public/cv.pdf` before first deploy
- `public/search-index.json` added to `.gitignore` before first commit of build artifacts

---

## Package Dependencies

```jsonc
// New additions to package.json
{
  "dependencies": {
    "next-mdx-remote": "^5",         // MDX processing
    "gray-matter": "^4",             // frontmatter parsing
    "next-themes": "^0.4",           // dark/light mode
    "@libsql/client": "^0.14",       // Turso HTTP client
    "@marsidev/react-turnstile": "^1", // Cloudflare Turnstile widget
    "web-vitals": "^4"               // RUM collection
  },
  "devDependencies": {
    "rehype-pretty-code": "^0.14",   // syntax highlighting (build time)
    "shiki": "^1"                    // grammar + themes for rehype-pretty-code
  }
}
```

---

## Monitoring and Observability

- **Web Vitals widget:** LCP, CLS, INP P75 displayed live on the site — primary performance signal
- **Turso dashboard:** row counts for likes, comments, vitals provide engagement signal
- **Vercel deployment logs:** build failures (missing posts, search index errors) surface here
- **Search index build:** script exits non-zero on any parse error — fails the build before a broken index ships

---

## Technical Considerations

### Key Decisions

| Decision | Choice | Trade-off |
|---|---|---|
| MDX processing | `next-mdx-remote` | Flexible `content/` dir vs zero-dependency `@next/mdx` |
| Search index delivery | Public static file | CDN-fast with zero DB reads vs bundled (bundle bloat) |
| Dark mode | `next-themes` | Flash-free with localStorage vs custom (boilerplate) |
| Syntax highlighting | `rehype-pretty-code` + Shiki | Zero client JS, best output vs Prism (fewer grammars) |
| Likes mutation | Server Action + `useOptimistic` | Canonical App Router pattern — intentional showcase |
| Comments bot defense | Turnstile (invisible) + honeypot | Zero UX friction vs visible CAPTCHA |
| Vitals aggregation | 30-day rolling P75 | Recent accuracy vs all-time (polluted by old deploys) |

### Known Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| `next-mdx-remote` API change on upgrade | Low | Pin to minor version; test in CI before merging upgrades |
| Turso HTTP latency from Vercel region | Low | Turso replica in same region as Vercel function deployment |
| Search index stale after content edit without deploy | N/A | Index only changes on deploy — acceptable by design |
| Turnstile token replay attack | Low | Token is single-use; Cloudflare rejects replays automatically |
| VitalsWidget shows blank until first real visitor | Expected | Show "—" placeholder until data available |

---

## Architecture Decision Records

- [ADR-001: Content-First Blog Over Portfolio Hybrid or Interactive Playground](adrs/adr-001.md) — Writing-led structure chosen; portfolio showcase and interactive demos deferred
- [ADR-002: next-mdx-remote for MDX Content Processing](adrs/adr-002.md) — `next-mdx-remote` + `gray-matter` chosen over `@next/mdx` for clean `content/` directory separation
- [ADR-003: Search Index as Public Static File](adrs/adr-003.md) — Build-time JSON in `public/` chosen over bundled or DB-stored index for CDN caching and zero DB reads
