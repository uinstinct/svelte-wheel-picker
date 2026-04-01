---
phase: quick-260401-mv0
plan: "01"
subsystem: demo-site
tags: [demo, ui, icons, svg]
dependency_graph:
  requires: []
  provides: [svg-icon-links-in-hero]
  affects: [src/routes/+page.svelte]
tech_stack:
  added: []
  patterns: [inline-svg-icons, currentColor-theming]
key_files:
  created: []
  modified:
    - src/routes/+page.svelte
decisions:
  - Used inline SVG (no external icon library) per plan constraint of zero new dependencies
  - Version span uses monospace font with currentColor to match parent link color
  - Removed text-decoration from hover state (was underline) — icons look better without underline
metrics:
  duration: "3m"
  completed_date: "2026-04-01"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 260401-mv0: Replace text links with SVG icon links in hero section — Summary

**One-liner:** GitHub and npm text links in demo hero replaced with inline SVG icons; npm icon shows package version v0.1.7 next to it.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Replace text links with SVG icon links in hero section | faa8928 | src/routes/+page.svelte |

## What Was Done

Replaced the two plain text anchor links in `.hero-links` (lines 129-132 of the original file) with icon-based links:

- **GitHub link**: Inline 20x20 SVG octocat mark using `fill="currentColor"`, `viewBox="0 0 24 24"`. No text.
- **npm link**: Inline 20x20 SVG npm block-letter logo using `fill="currentColor"`, `viewBox="0 0 24 24"`. A `<span class="hero-links-version">v0.1.7</span>` follows the icon.

CSS changes:
- `.hero-links` gained `align-items: center` so icon and version span stay vertically centered.
- `.hero-links a` changed to `display: inline-flex; align-items: center; gap: 4px` to align icon and text within each link.
- Added `.hero-links-version` rule: `font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: currentColor`.
- Hover `text-decoration` changed from `underline` to `none` — underline under SVG icons looks incorrect.

Both links retain `target="_blank" rel="noopener noreferrer"` and correct hrefs.

## Deviations from Plan

**1. [Rule 1 - Cosmetic] Removed hover text-decoration: underline**
- **Found during:** Task 1
- **Issue:** The original `.hero-links a:hover` rule set `text-decoration: underline`, which renders an underline beneath an SVG icon — visually incorrect.
- **Fix:** Changed to `text-decoration: none` on hover.
- **Files modified:** src/routes/+page.svelte
- **Commit:** faa8928 (included in task commit)

## Known Stubs

None. The version number `v0.1.7` is hardcoded per plan specification. This will need to be updated manually when the package version changes, but this was the intended approach (plan explicitly stated `v0.1.7`).

## Self-Check: PASSED

- [x] src/routes/+page.svelte modified
- [x] Commit faa8928 exists
- [x] Build passes without errors
