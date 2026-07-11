---
status: resolved
file: components/mdx/Callout.tsx
line: 10
severity: low
author: claude-code
provider_ref:
---

# Issue 007: Callout variant colors are hardcoded light-mode hex values — dark mode renders incorrectly

## Review Comment

`Callout.tsx` uses hardcoded hex values for border and background colors:

```ts
const variantStyles: Record<Variant, { ... }> = {
  info:   { border: '#0891b2', background: '#ecfeff', icon: 'ℹ' },
  warn:   { border: '#d97706', background: '#fffbeb', icon: '⚠' },
  danger: { border: '#dc2626', background: '#fef2f2', icon: '✕' },
}
```

`#ecfeff` (light cyan), `#fffbeb` (light amber), and `#fef2f2` (light red) are light-mode backgrounds. In dark mode these render as bright patches against the dark page surface, breaking the dark mode visual design.

Every other component in the codebase uses CSS custom properties from `globals.css` for theming (e.g., `var(--bg-subtle)`, `var(--border)`, `var(--accent)`). `Callout` is the only component that hardcodes colours.

**Suggested fix:** Define semantic CSS custom properties for each variant in `globals.css`:

```css
:root {
  --callout-info-border: #0891b2;
  --callout-info-bg: #ecfeff;
  --callout-warn-border: #d97706;
  --callout-warn-bg: #fffbeb;
  --callout-danger-border: #dc2626;
  --callout-danger-bg: #fef2f2;
}
:root.dark {
  --callout-info-bg: #0c2931;
  --callout-warn-bg: #2c1f04;
  --callout-danger-bg: #2c0b0b;
}
```

Then reference them in `Callout.tsx`:

```ts
const variantStyles: Record<Variant, { borderVar: string; bgVar: string; icon: string }> = {
  info:   { borderVar: 'var(--callout-info-border)',   bgVar: 'var(--callout-info-bg)',   icon: 'ℹ' },
  warn:   { borderVar: 'var(--callout-warn-border)',   bgVar: 'var(--callout-warn-bg)',   icon: '⚠' },
  danger: { borderVar: 'var(--callout-danger-border)', bgVar: 'var(--callout-danger-bg)', icon: '✕' },
}
```

## Triage

- Decision: `VALID`
- Notes: Confirmed valid. `Callout.tsx` hardcoded light-mode hex values (`#ecfeff`, `#fffbeb`, `#fef2f2`) for variant backgrounds, causing bright patches in dark mode. Fixed by defining six CSS custom properties in the `:root` block of `globals.css` (`--callout-info-border/bg`, `--callout-warn-border/bg`, `--callout-danger-border/bg`) and adding dark-mode overrides for the three background vars in the `:root.dark, [data-theme="dark"]` block. `Callout.tsx` `variantStyles` now references `var(--callout-*)` properties instead of hex literals, aligning with the theming pattern used by all other components.
