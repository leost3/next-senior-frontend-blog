# PRD: Senior Frontend Developer Blog — Leonardo Studart

## Overview

This is a personal blog for Leonardo Studart, a senior frontend developer, built to establish technical credibility with recruiters, hiring managers, and peer developers. Posts focus on decisions and tradeoffs — performance optimization, architecture patterns, codebase improvements, and state management — rather than tutorials. The blog's own infrastructure demonstrates the craft it writes about: real user performance metrics are displayed live, search runs at the edge, and engagement features use modern React patterns.

The blog is content-first. Written posts are the primary product. The platform exists to present those posts at the highest technical quality, surface them to visitors quickly, and give the author a low-friction way to publish when ready.

## Goals

- Posts become conversation starters in technical interviews within 6 months of launch
- Every visitor can reach Leonardo's LinkedIn profile, email, and downloadable CV from any page
- The blog's own Core Web Vitals scores are visible and excellent — LCP under 2.5s, CLS under 0.1
- Search finds relevant posts in under 300ms
- Anonymous readers can engage (likes, comments) without friction
- Spam rate on comments stays below 5% without manual moderation overhead

## User Stories

### Recruiter / Hiring Manager

- As a recruiter, I want to find Leonardo's contact information immediately so I can reach out without hunting
- As a hiring manager, I want to download Leonardo's CV so I can share it with my team
- As a hiring manager preparing an interview, I want to read a post and understand how Leonardo approaches ambiguous technical problems — not just what he built

### Peer Developer

- As a frontend developer, I want to search for posts on a specific topic (e.g., "state management") so I find relevant content without scrolling through everything
- As a developer reading a post, I want to like it and leave a comment without creating an account
- As a developer, I want to see the site's own performance metrics so I can evaluate the credibility of performance-related posts

### Author (Leonardo)

- As the author, I want to write posts in MDX inside my git repository so publishing is a git push
- As the author, I want new posts to appear on the site as soon as the deploy completes, without manual CMS steps
- As the author, I want the site to be live and never feel empty — even with a small post count

## Core Features

### 1. Post Publishing via MDX in Git

Posts are `.mdx` files in the repository. Frontmatter carries title, date, description, and tags. A new post is published by merging a file — no CMS dashboard, no separate deploy step. Code blocks have syntax highlighting. Custom MDX components allow rich content (callouts, code diffs, inline comparisons) without leaving Markdown.

### 2. Edge-Powered Full-Text Search

At build time, all post content and frontmatter is serialized into a JSON index. A search API route running at the edge queries this index and returns results. No external search service. Search feels instant because the index is served from the nearest edge region to the visitor.

### 3. Optimistic Likes via Server Actions

Each post displays a like count. Clicking the like button updates the count immediately in the UI (optimistic update) before the server confirms. Likes persist in the database. No account required. The implementation visibly demonstrates `useOptimistic` and Server Actions — a deliberate showcase of Next.js App Router patterns.

### 4. Anonymous Comments with Bot Defense

Readers can leave comments on posts without signing in. Comments are stored and displayed per post. Cloudflare Turnstile (invisible challenge) and a honeypot field block automated submissions. Comments are stored for display immediately on submit; no moderation queue in Phase 1.

### 5. Live Web Vitals Widget

The site collects real user metrics (LCP, CLS, FID/INP) via the `web-vitals` library and sends them to a database. A widget — visible on the home page and post pages — displays the aggregated live scores for this site. This is the blog's signature element: the site makes its own performance a transparent, auditable claim.

### 6. Contact & Identity Header

Every page shows Leonardo's name, title, and three contact actions: LinkedIn (external link), email (mailto), CV download (PDF served as a static asset). These are persistent — reachable from the post list and every individual post.

### 7. Post List with Tags and Reading Time

The home page lists all posts in reverse-chronological order. Each entry shows title, date, estimated reading time, and tags. Tag filtering narrows the list without a page load. Reading time is calculated at build time from word count.

### 8. Dark / Light Mode

The site respects the visitor's system preference by default. A manual toggle allows override. Preference persists across sessions. The sharp, precise visual identity works in both modes — no mode feels like an afterthought.

## User Experience

### Visual Identity

**Sharp & precise.** The blog signals engineer brain: clean grid, strong typographic hierarchy, monospace accents for technical labels and metadata, high contrast. No decorative chrome. The site's own performance scores, displayed as the live metrics widget, are the single expressive moment — everything else stays disciplined and quiet around them.

**Typography:** A characterful monospace or technical display face for headings and the site name. A high-legibility variable sans-serif for body copy. Code blocks use a distinct monospace. Type scale is intentional: post titles are large and unambiguous, body is comfortable at long reading length, metadata (dates, tags, reading time) is small and recessive.

**Color:** High-contrast neutral palette with a single accent used sparingly — appearing on active states, the like button, and the live metrics widget. Dark mode inverts the neutrals, accent stays consistent.

**Motion:** Minimal and purposeful. A reading progress indicator on post pages. Subtle fade-in on page navigation. No decorative animations. Reduced motion preference respected unconditionally.

**Signature element:** The live Web Vitals widget on the home page. It shows the site's own measured performance — LCP, CLS, INP — in real time from real users. For a blog about frontend performance, this is the most honest possible proof of craft.

### Primary User Flows

**Recruiter flow:**
1. Lands on home page
2. Sees name, title, and three contact links immediately (header, above the fold)
3. Skims post titles — one catches interest
4. Reads the post, shares with the team, or saves for interview prep

**Developer flow:**
1. Arrives via search or shared link
2. Reads a post
3. Likes the post or leaves a comment
4. Uses search to find related posts

**Author flow:**
1. Writes a `.mdx` file locally
2. Commits and pushes to main
3. Vercel deploys; post appears on the site
4. No dashboard, no CMS login

### Accessibility

- Keyboard navigable throughout
- Visible focus indicators on all interactive elements
- Color contrast meets WCAG AA minimum; aim for AAA on body text
- All images have descriptive alt text
- `prefers-reduced-motion` honored: all transitions and animations disabled

### Design Guidance (applied from frontend-design skill)

- The hero is a thesis: the home page opens with name, title, and the metrics widget — the most characteristic thing about this blog
- Structural devices encode information: dates are dates, tags are tags — no numbered markers unless content is a true sequence
- Spend boldness in one place: the metrics widget is the one memorable element; everything else is quiet

### React Best Practices (applied from vercel:react-best-practices)

- Server Components by default throughout; Client Components only where interactivity requires it (like button, search input, metrics widget, comment form)
- Streaming for the post list and comments sections to unblock Time to First Byte
- `useOptimistic` for likes — the canonical App Router pattern, visible in the codebase as an intentional showcase
- Server Actions for all mutations (likes, comments, vitals reporting)

## High-Level Technical Constraints

- Hosted on Vercel; all features must work within Vercel's platform capabilities
- Content lives in the git repository as MDX files — no external CMS
- Database is Turso (libSQL/SQLite over HTTP) for likes, comments, and vitals data
- Search runs at the edge; no third-party search service
- CV is a static PDF asset — no dynamic generation required
- No authentication layer in any phase; all features are public

## Non-Goals (Out of Scope)

**Phase 1 out of scope:**
- Project / portfolio showcase section (deferred to Phase 2)
- Comment moderation queue or admin dashboard
- Email notifications for new comments or replies
- Post series or multi-part article linking
- Newsletter / email subscription
- Analytics dashboard (beyond the Web Vitals widget)
- Internationalization

**Never in scope:**
- User accounts or login of any kind
- Paid content or paywalls
- Multi-author support

## Phased Rollout Plan

### MVP (Phase 1) — Current scope

**Core features:**
- Post publishing via MDX in git (with syntax highlighting and custom components)
- Contact header (LinkedIn, email, CV download)
- Post list with tags, dates, and reading time
- Tag filtering
- Dark / light mode
- Reading progress indicator on post pages
- Edge-powered full-text search
- Optimistic likes with Server Actions
- Anonymous comments with Turnstile + honeypot
- Live Web Vitals widget

**Success criteria to proceed:**
- At least 3 seed posts published at launch
- LCP < 2.5s and CLS < 0.1 confirmed via Web Vitals widget with real traffic
- Search returns correct results in < 300ms on the production edge
- Zero spam comments in the first 30 days

### Phase 2 — Portfolio expansion

- Project showcase section on the home page (case studies with outcomes, technology used, and context)
- Comment threading (replies to comments)
- Related posts section at the bottom of each post (by tag overlap)

### Phase 3 — Engagement and discovery

- RSS feed
- Auto-generated Open Graph images per post
- Post series / multi-part navigation
- Comment moderation interface (if spam rate rises above 5%)

## Success Metrics

- **Primary:** Posts referenced by interviewers in technical screens within 6 months
- **Proxy signal:** Recruiter or developer contact via email or LinkedIn citing a specific post
- **Performance:** LCP < 2.5s (P75 real users), CLS < 0.1 — measured live on the site itself
- **Search:** Query response < 300ms at the edge (P95)
- **Engagement:** Like and comment presence on posts signals the content is reaching readers
- **Spam:** < 5% of submitted comments are spam

## Risks and Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Blog stays empty — posts never written | Medium | Launch with 3 seed posts; low-friction MDX authoring lowers the publishing bar |
| Irregular publishing weakens credibility signal | Medium | Quality over frequency — one strong decision/tradeoff post outperforms ten tutorials |
| Anonymous comments attract spam | Low-Medium | Cloudflare Turnstile (invisible) + honeypot catches >95% of automated submissions |
| Live metrics widget shows poor scores | Low | Performance is a design constraint, not an afterthought — Lighthouse gates the deploy |
| Turso free tier limits exceeded | Low | Free tier supports tens of thousands of reads/month; upgrade path is straightforward |

## Architecture Decision Records

- [ADR-001: Content-First Blog Over Portfolio Hybrid or Interactive Playground](adrs/adr-001.md) — Chose writing-led structure; portfolio showcase and interactive demos deferred to preserve authoring simplicity and focus the interview-readiness signal on post quality

## Open Questions

- What name should appear as the blog's title / domain label? ("Leonardo Studart", "leos.dev", or a separate brand name?)
- Should the CV PDF be versioned (e.g., `cv-2026.pdf`) or always served at a stable URL (`/cv.pdf`)?
- Should the live Web Vitals widget display all-time aggregated scores or a rolling 30-day window?
- What is the preferred accent color for the sharp & precise palette — cool (blue/cyan) or neutral-warm (amber/sand)?
