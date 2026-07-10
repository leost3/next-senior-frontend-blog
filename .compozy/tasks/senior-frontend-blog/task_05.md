---
status: completed
title: Layout foundation — design tokens + Header + ThemeToggle
type: frontend
complexity: medium
dependencies: []
---

# Task 5: Layout foundation — design tokens + Header + ThemeToggle

## Overview

Establish the visual foundation of the entire site: update `app/layout.tsx` with `ThemeProvider`, define the complete Tailwind v4 design token system in `globals.css`, and build the persistent `Header` and `ThemeToggle` components. Every other page inherits from this layout. The visual identity is sharp and precise — monospace accents, high-contrast neutrals, a single accent color, with the site name + contact links (LinkedIn, email, CV download) always visible.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST install `next-themes` via `pnpm add next-themes`
- MUST wrap the layout with `ThemeProvider attribute="class"` from `next-themes`
- MUST define a complete Tailwind v4 `@theme` token set: neutral palette (6 steps light + 6 dark), one accent color, monospace + sans font variables, and type scale variables
- `Header` MUST be a Server Component displaying: name ("Leonardo Studart"), title ("Senior Frontend Developer"), LinkedIn link, email mailto link, and CV PDF download link
- `ThemeToggle` MUST be a Client Component using `useTheme()` from `next-themes`; preference persists via localStorage
- MUST respect `prefers-reduced-motion` for all transitions defined in this task
- MUST pass WCAG AA contrast on both light and dark modes
- CV PDF download link MUST point to `/cv.pdf` (static asset — file created separately)
</requirements>

## Subtasks

- [x] 5.1 Install `next-themes` and add to layout
- [x] 5.2 Define Tailwind v4 design tokens in `globals.css` (palette, type scale, font variables)
- [x] 5.3 Build `components/Header.tsx` (Server Component) with name, title, and three contact actions
- [x] 5.4 Build `components/ThemeToggle.tsx` (Client Component) with `useTheme()` toggle
- [x] 5.5 Update `app/layout.tsx` to include `ThemeProvider`, `Header`, font variables, and correct metadata
- [x] 5.6 Verify dark/light appearance and font rendering in both modes

## Implementation Details

See TechSpec "User Experience — Visual Identity" for the design decisions: monospace display face, variable sans body, single accent, reduced motion.

See PRD "User Experience" section for accessibility requirements (WCAG AA, keyboard nav, visible focus).

`app/layout.tsx` already imports Geist and Geist Mono fonts. Wire these into the `@theme` token system as `--font-sans` and `--font-mono`. The `ThemeProvider` must be a Client Component wrapper — keep layout itself as a Server Component by extracting `ThemeProvider` into a thin `'use client'` wrapper.

### Relevant Files

- `app/layout.tsx` — modify: add ThemeProvider, Header, updated metadata
- `app/globals.css` — modify: add complete @theme design tokens, dark mode variants
- `components/Header.tsx` — create
- `components/ThemeToggle.tsx` — create
- `package.json` — add `next-themes`

### Dependent Files

- `app/page.tsx` — rendered inside this layout (task_06)
- `app/blog/[slug]/page.tsx` — rendered inside this layout (task_07)

## Deliverables

- Updated `app/layout.tsx` with ThemeProvider and Header
- Updated `app/globals.css` with complete design token system
- `components/Header.tsx` with three contact links
- `components/ThemeToggle.tsx` with theme persistence
- `next-themes` in `package.json`
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for theme switching **(REQUIRED)**

## Tests

- Unit tests:
  - [x] `Header` renders name "Leonardo Studart" and title "Senior Frontend Developer"
  - [x] `Header` contains an `<a>` pointing to LinkedIn URL
  - [x] `Header` contains a `mailto:` link
  - [x] `Header` contains an `<a>` with `href="/cv.pdf"` and `download` attribute
  - [x] `ThemeToggle` calls `setTheme('dark')` when clicked while in light mode
  - [x] `ThemeToggle` calls `setTheme('light')` when clicked while in dark mode
- Integration tests:
  - [x] Layout renders without hydration mismatch in both light and dark modes
  - [x] Theme preference is stored in localStorage under next-themes' key after toggle
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- WCAG AA contrast ratio met on all text in both modes (verified with a contrast checker)
- Geist Sans and Geist Mono fonts render correctly
- Dark mode toggle persists across page reloads
