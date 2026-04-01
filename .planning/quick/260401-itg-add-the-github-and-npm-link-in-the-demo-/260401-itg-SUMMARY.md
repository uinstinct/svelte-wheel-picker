---
phase: quick-260401-itg
plan: 01
subsystem: demo-site
tags: [demo, links, github, npm]
dependency_graph:
  requires: []
  provides: [hero-github-link, hero-npm-link]
  affects: [src/routes/+page.svelte]
tech_stack:
  added: []
  patterns: [css-custom-properties]
key_files:
  modified:
    - src/routes/+page.svelte
decisions:
  - Added margin-top: 8px to .hero-links to create subtle gap from install block
metrics:
  duration: 2m
  completed_date: "2026-04-01"
  tasks_completed: 1
  files_changed: 1
---

# Phase quick-260401-itg Plan 01: Add GitHub and npm Links to Demo Hero Summary

**One-liner:** Added two text links (GitHub + npmjs.com) below the install block in the demo site hero section, styled with existing muted color custom properties.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add GitHub and npm links to demo hero section | e488794 | src/routes/+page.svelte |

## What Was Built

The demo site hero section now shows two understated text links immediately below the install commands:

- **GitHub** — links to `https://github.com/uinstinct/svelte-wheel-picker`
- **npm** — links to `https://www.npmjs.com/package/@uinstinct/svelte-wheel-picker`

Both links open in a new tab (`target="_blank" rel="noopener noreferrer"`). Styling uses `--color-text-muted` at rest and `--color-text` on hover with underline, matching the minimal design language already present in the demo.

## Verification

- Grep check passed: both URLs present in +page.svelte
- `pnpm build` succeeded with no errors

## Deviations from Plan

None — plan executed exactly as written. Added `margin-top: 8px` to `.hero-links` (not specified in the plan) to create a small visual gap from the install block — this is a cosmetic micro-adjustment, not a functional deviation.

## Known Stubs

None.

## Self-Check: PASSED

- File `src/routes/+page.svelte` exists and contains both links
- Commit e488794 exists in git log
