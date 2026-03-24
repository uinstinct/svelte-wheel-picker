---
phase: 05-wheelpickerwrapper-and-package
plan: 03
subsystem: testing
tags: [vitest, playwright, npm, tarball, focus-routing, browser-test]

# Dependency graph
requires:
  - phase: 05-01
    provides: WheelPickerWrapper component with data-swp-group
  - phase: 05-02
    provides: SSR safety test, .npmignore for test exclusion

provides:
  - npm tarball with zero compiled test files (clean for consumers)
  - Browser test verifying Tab/Shift+Tab focus routing between WheelPicker wheels in WheelPickerWrapper
  - FocusRoutingFixture.svelte test helper with two WheelPickers inside WheelPickerWrapper

affects: [06-registry-and-demo, phase-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Post-build cleanup: svelte-package && rm -rf dist/__tests__ && rm -f dist/*.test.js dist/*.test.d.ts before publint"
    - "Fixture .svelte files for browser tests requiring multi-component composition"

key-files:
  created:
    - src/lib/__tests__/focus-routing.test.ts
    - src/lib/__tests__/FocusRoutingFixture.svelte
  modified:
    - package.json
    - vitest.config.ts

key-decisions:
  - "Post-compile cleanup in package script (not .npmignore) is the authoritative mechanism for excluding test artifacts from tarball — files: [dist] allowlist overrides .npmignore"
  - "Use @vitest/browser-playwright/context for userEvent import (direct dep); @vitest/browser/context is only a transitive dep and not resolved by tsc"

patterns-established:
  - "Pattern: Test fixture .svelte components live in src/lib/__tests__/ alongside test files"

requirements-completed: [COMP-02, DIST-03]

# Metrics
duration: 10min
completed: 2026-03-24
---

# Phase 05 Plan 03: Gap Closure (Tarball Cleanliness + Focus Routing Test) Summary

**Post-compile cleanup strips 14 test artifacts from npm tarball; browser test proves native Tab order between WheelPickers inside WheelPickerWrapper**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-24T15:12:00Z
- **Completed:** 2026-03-24T15:22:39Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Fixed DIST-03: npm tarball is now clean — zero test files (was 14 compiled test files from `dist/__tests__/`)
- Fixed COMP-02: Focus routing browser test verifies native Tab and Shift+Tab moves focus between WheelPicker wheels
- publint still reports "All good!" after cleanup step — no regressions
- TypeScript compilation passes cleanly for all new files

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix npm tarball to exclude compiled test files** - `669adf3` (fix)
2. **Task 2: Add browser test for Tab focus routing between wheels** - `28b02e3` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `package.json` - Added `rm -rf dist/__tests__ && rm -f dist/*.test.js dist/*.test.d.ts` between svelte-package and publint
- `src/lib/__tests__/focus-routing.test.ts` - Browser test: Tab/Shift+Tab focus routing between two WheelPickers
- `src/lib/__tests__/FocusRoutingFixture.svelte` - Test fixture rendering two WheelPickers inside WheelPickerWrapper
- `vitest.config.ts` - Registered focus-routing.test.ts in browser project include array

## Decisions Made
- Post-compile cleanup in `package` script is the correct mechanism — `"files": ["dist"]` in package.json is a positive allowlist that includes all of `dist/` regardless of `.npmignore`. The `.npmignore` remains as belt-and-suspenders but is not the primary mechanism.
- `@vitest/browser-playwright/context` used for userEvent import instead of `@vitest/browser/context` — the latter is only a transitive dependency and tsc cannot resolve it directly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Changed userEvent import from @vitest/browser/context to @vitest/browser-playwright/context**
- **Found during:** Task 2 (focus-routing.test.ts creation)
- **Issue:** Plan specified `import { userEvent } from '@vitest/browser/context'` but `@vitest/browser` is not a direct devDependency — only `@vitest/browser-playwright` is. TypeScript could not resolve the module, causing `tsc --noEmit` to fail with TS2307.
- **Fix:** Changed import to `@vitest/browser-playwright/context` which re-exports from `@vitest/browser/context` and is the direct installed package. TypeScript resolves this correctly.
- **Files modified:** src/lib/__tests__/focus-routing.test.ts
- **Verification:** `pnpm exec tsc --noEmit` exits 0
- **Committed in:** 28b02e3 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Fix necessary for TypeScript compilation correctness. Runtime behavior identical — same userEvent API.

## Issues Encountered
None beyond the import path deviation above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 05 verification gaps are now closed: tarball is clean (DIST-03), focus routing is tested (COMP-02)
- Phase 06 (registry and demo) can proceed
- Known limitation: browser tests (Playwright) cannot execute in sandboxed CI environment — documented since Phase 1, not a code defect

---
*Phase: 05-wheelpickerwrapper-and-package*
*Completed: 2026-03-24*
