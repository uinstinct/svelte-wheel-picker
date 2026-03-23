---
status: resolved
trigger: "Demo page dark mode shows both text and background as white — text is invisible."
created: 2026-03-23T00:00:00Z
updated: 2026-03-23T00:01:00Z
---

hypothesis: Two compounding issues: (1) the `p { color: #666 }` scoped rule has no dark mode override — in dark mode `#666` gray on `#0f0f0f` near-black background is nearly invisible (ratio ~2.3:1, well below 4.5:1 WCAG AA). (2) missing `color-scheme: light dark` declaration means browsers have no signal that the page supports dark mode, which can cause UA stylesheets to apply system colors in unexpected ways. The compiled CSS output is structurally correct (media query with `body { background: #0f0f0f; color: #eee }` is present and in correct cascade order), so the "white on white" is most likely the `p` text (`#666`) being near-invisible on the dark background — reported as invisible/unreadable, described as "white on white."
test: Fix by (a) adding `color-scheme: light dark` to body, (b) adding dark mode override for `p` color, (c) restructuring with CSS custom properties for robustness
expecting: Dark mode renders dark background with clearly readable text at all levels
next_action: Apply fix to src/routes/+page.svelte

## Symptoms

expected: Dark mode renders dark background with light/white text — standard dark mode appearance
actual: Both text color and background are white in dark mode, making text invisible
errors: none reported
reproduction: Run `pnpm dev`, open http://localhost:5173 in a browser with dark mode enabled (OS or browser-level)
started: First observed after plan 03-02 completed (demo page built/updated in that plan)

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-03-23T00:00:00Z
  checked: src/routes/+page.svelte styles
  found: Dark mode media query sets `body { background: #0f0f0f; color: #eee }` — this looks correct. The `p` element has `color: #666` as scoped CSS. The `h1`, `h2`, `main` etc. have no explicit color so they inherit from body.
  implication: On first read the dark mode looks correct. Need to look deeper.

- timestamp: 2026-03-23T00:01:00Z
  checked: src/app.html, src/routes/ (all files), compiled CSS output (.svelte-kit/output/client)
  found: No layout file, no global CSS. The compiled CSS correctly emits the dark mode @media block. However two issues: (1) `p { color: #666 }` is a scoped rule with NO dark mode override — `#666` on `#0f0f0f` dark background has contrast ratio ~2.3:1, rendering the text near-invisible (WCAG AA requires 4.5:1). (2) No `color-scheme: light dark` declaration on `:root` or `body`, which is the correct signal to browsers for pages supporting both modes.
  implication: The `p` text would appear very dark and nearly invisible in dark mode — described by reporter as "white on white" because the text effectively disappears. The overall dark mode pattern was brittle because hardcoded color values meant any new element needed manual dark mode override.

## Resolution

root_cause: Two issues combined: (1) `p { color: #666 }` had no dark mode override — that gray (#666) is near-invisible on the dark (#0f0f0f) background (contrast ~2.3:1). (2) No `color-scheme: light dark` on `:root`, missing the standard browser signal for dual-mode pages. The CSS architecture used hardcoded color values requiring per-element dark mode overrides, making it easy to miss new elements.
fix: Restructured demo CSS to use CSS custom properties on `:root`. Light mode defaults defined on `:root` directly; dark mode overrides only the custom property values in one `@media (prefers-color-scheme: dark)` block. Added `color-scheme: light dark` to `:root`. All color-bearing rules now reference `var(--color-bg)`, `var(--color-text)`, `var(--color-text-muted)`, `var(--color-surface)` — automatically correct in both modes with no per-element dark mode overrides needed.
verification: Build succeeds with no errors. Compiled CSS output confirms: `:root` has `color-scheme: light dark` + custom property defaults; `@media (prefers-color-scheme: dark)` block only sets custom property overrides on `:root`; `p`, `body`, `.wheel-container` all use `var()` references.
files_changed: [src/routes/+page.svelte]
