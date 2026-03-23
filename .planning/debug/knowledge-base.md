# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## dark-mode-white-on-white — Demo page text invisible in dark mode due to missing CSS custom properties and contrast oversight
- **Date:** 2026-03-23
- **Error patterns:** dark mode, white on white, invisible text, contrast, color-scheme, prefers-color-scheme, p color #666, demo page
- **Root cause:** Two issues combined: (1) `p { color: #666 }` had no dark mode override — that gray is near-invisible on the dark (#0f0f0f) background (contrast ~2.3:1, below WCAG AA 4.5:1). (2) No `color-scheme: light dark` on `:root`, missing the standard browser signal for dual-mode pages. Hardcoded color values required per-element dark mode overrides, making it easy to miss new elements.
- **Fix:** Restructured demo CSS to use CSS custom properties on `:root`. Light mode defaults on `:root` directly; dark mode block only overrides custom property values. Added `color-scheme: light dark` to `:root`. All color-bearing rules use `var(--color-bg)`, `var(--color-text)`, `var(--color-text-muted)`, `var(--color-surface)`.
- **Files changed:** src/routes/+page.svelte
---

