---
phase: quick-260401-mog
plan: 01
subsystem: infra
tags: [playwright, pnpm, ci, testing, devDependencies]

requires: []
provides:
  - playwright 1.58.2 as direct devDependency so pnpm exec playwright resolves in CI
affects: [ci, testing]

tech-stack:
  added: [playwright@1.58.2 as direct devDependency]
  patterns: []

key-files:
  created: []
  modified:
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "playwright added as direct devDependency at 1.58.2 — pnpm exec cannot resolve binaries from transitive peer deps in CI"

requirements-completed: [CI-FIX-01]

duration: 3min
completed: 2026-04-01
---

# Quick Task 260401-mog: Fix CI Failure — Add Playwright as Direct devDependency Summary

**playwright 1.58.2 added as direct devDependency so pnpm exec playwright resolves in CI without relying on transitive peer dep auto-install**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-01T10:40:00Z
- **Completed:** 2026-04-01T10:43:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Added `playwright: 1.58.2` to devDependencies in package.json
- Updated pnpm-lock.yaml to resolve playwright as a direct dependency
- Verified `pnpm exec playwright --version` returns `Version 1.58.2` without error

## Task Commits

1. **Task 1: Verify and commit playwright direct devDependency fix** - `a6f294a` (fix)

## Files Created/Modified

- `package.json` - Added `"playwright": "1.58.2"` to devDependencies
- `pnpm-lock.yaml` - Updated lockfile to include playwright as direct dependency

## Decisions Made

- playwright 1.58.2 chosen to match the version already used transitively via @vitest/browser-playwright — no version bump needed, just direct declaration

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

CI workflow's `pnpm exec playwright install chromium` step will now resolve the binary correctly since playwright is a direct devDependency. No further changes needed.

---
*Phase: quick-260401-mog*
*Completed: 2026-04-01*
