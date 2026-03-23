---
phase: 03-wheelpicker-core
plan: 01
subsystem: ui
tags: [svelte5, runes, physics, animation, raf, wheel-picker, typescript]

# Dependency graph
requires:
  - phase: 02-types-and-utility-hooks
    provides: WheelPickerProps, WheelPickerOption, WheelPickerClassNames types
provides:
  - Pure physics utility functions for WheelPicker (easeOutCubic, indexToOffset, offsetToIndex, snapToNearestEnabled, calculateVelocity, computeSnapTarget, computeAnimationDuration)
  - WheelPhysics reactive class with RAF inertia loop and snap animation
  - Extended WheelPickerProps with visibleCount, optionItemHeight, dragSensitivity, scrollSensitivity
  - Physics constants matching React v1.2.2 (RESISTANCE=0.3, MAX_VELOCITY=30, etc.)
  - 40 unit tests for all pure physics functions
  - Split vitest workspace: node (unit) + browser (component) projects
affects:
  - 03-02 (WheelPicker component wires WheelPhysics)
  - 03-03 (keyboard navigation integrates with WheelPhysics)
  - 04-infinite-scroll (will extend WheelPhysics for loop offsets)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Class-based Svelte 5 rune hook with single $state field (offset) and non-reactive private fields for animation state"
    - "vitest projects config: unit (node environment) for pure logic, browser (Playwright) for component tests"
    - "Pure physics functions in separate .ts file for node-environment unit testability without DOM"

key-files:
  created:
    - src/lib/wheel-physics-utils.ts
    - src/lib/wheel-physics-utils.test.ts
    - src/lib/use-wheel-physics.svelte.ts
  modified:
    - src/lib/types.ts
    - vitest.config.ts

key-decisions:
  - "vitest config split into unit (node) + browser (Playwright) projects to work around sandbox Playwright segfault for pure logic tests"
  - "WheelPhysics uses single $state offset field — all animation/drag tracking is non-reactive plain class fields to prevent reactive cycles"
  - "Physics constants copied verbatim from React v1.2.2 source for UX parity (RESISTANCE=0.3, MAX_VELOCITY=30)"
  - "computeAnimationDuration clamped to [0.1, 0.6] seconds to prevent too-fast or too-slow snaps"
  - "endDrag() accepts no parameters — all configuration accessed via captured class fields"

patterns-established:
  - "Pattern: WheelPhysics.destroy() called from $effect cleanup in parent component"
  - "Pattern: jumpTo() for immediate offset (initial render + controlled value), animateTo() for smooth snap"
  - "Pattern: only $state offset drives DOM; non-reactive #isDragging/#animating/#rafId prevent reactive cycles"

requirements-completed: [STYL-04, INTR-01, INTR-02, INTR-04, MODE-04]

# Metrics
duration: 22min
completed: 2026-03-23
---

# Phase 03 Plan 01: Physics Foundation Summary

**RAF-driven inertia physics layer with easeOutCubic snap animation, boundary resistance, and 40 unit-tested pure functions matching React v1.2.2 UX constants**

## Performance

- **Duration:** 22 min
- **Started:** 2026-03-23T19:02:43Z
- **Completed:** 2026-03-23T19:24:00Z
- **Tasks:** 2 (1 TDD, 1 auto)
- **Files modified:** 5

## Accomplishments

- Created `wheel-physics-utils.ts` with 8 pure functions and 7 physics constants — zero DOM dependencies, fully testable in node
- Created `use-wheel-physics.svelte.ts` exporting `WheelPhysics` class with RAF inertia loop, snap animation, boundary resistance, and wheel event debounce
- Extended `WheelPickerProps` with 4 new optional layout/sensitivity props (visibleCount, optionItemHeight, dragSensitivity, scrollSensitivity)
- 40 unit tests covering all physics functions with edge cases (empty yList, all-disabled options, boundary clamping)
- Split vitest config into separate unit (node) and browser (Playwright) projects

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend WheelPickerProps and create pure physics utility functions** - `7adcf87` (feat)
2. **Task 2: Create WheelPhysics reactive class with RAF inertia and snap animation** - `87778c3` (feat)

_Note: Task 1 used TDD (RED commit → GREEN commit merged into single feat commit)_

## Files Created/Modified

- `src/lib/types.ts` - Added visibleCount, optionItemHeight, dragSensitivity, scrollSensitivity optional props to WheelPickerProps
- `src/lib/wheel-physics-utils.ts` - Pure physics functions: easeOutCubic, indexToOffset, offsetToIndex, clampIndex, snapToNearestEnabled, calculateVelocity, computeSnapTarget, computeAnimationDuration + 7 constants
- `src/lib/wheel-physics-utils.test.ts` - 40 unit tests for all pure functions with edge cases
- `src/lib/use-wheel-physics.svelte.ts` - WheelPhysics class: $state offset, RAF inertia loop, startDrag/moveDrag/endDrag, handleWheel, animateTo, jumpTo, destroy
- `vitest.config.ts` - Split into unit (node) + browser (Playwright) project environments

## Decisions Made

- **vitest split config:** Browser mode Playwright crashes with SEGV_ACCERR in this sandbox environment (documented in STATE.md). Split vitest into two projects: `unit` runs in node (for pure logic tests), `browser` runs in Playwright (for component tests). Allows physics tests to run while preserving browser mode for future component tests.
- **Single $state field:** Only `offset` is `$state`. All animation tracking (isDragging, rafId, yList, animating) is plain class fields. This prevents reactive cycles per RESEARCH.md Pitfall 2.
- **endDrag() without parameters:** All config accessed via class fields. The plan showed parameters but internal access is cleaner and avoids passing duplicated config on every event.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Split vitest config into unit+browser projects**
- **Found during:** Task 1 (TDD RED phase — test execution)
- **Issue:** Vitest browser mode (Playwright) segfaults in this sandbox environment (SEGV_ACCERR). Pure logic tests cannot run at all in browser mode here. This is a pre-existing documented limitation.
- **Fix:** Updated `vitest.config.ts` to use `defineProject()` for two environments: `unit` (node, includes `wheel-physics-utils.test.ts` and `types.test.ts`) and `browser` (Playwright, includes component tests). The `defineWorkspace` API is not available in vitest@4.1.0 — used `projects` array in `defineConfig` instead.
- **Files modified:** `vitest.config.ts`
- **Verification:** `npx vitest run --project unit src/lib/wheel-physics-utils.test.ts` — 40 tests pass
- **Committed in:** `7adcf87` (Task 1 commit)

**2. [Rule 1 - Bug] Simplified endDrag() signature to use captured class fields**
- **Found during:** Task 2 (implementation)
- **Issue:** Plan specified `endDrag(options, itemHeight, visibleCount, dragSensitivity, scrollSensitivity)` parameters but these are already stored as class fields set in constructor/update(). Passing them again would create a divergence risk.
- **Fix:** `endDrag()` takes no parameters; reads all config from `this.#options`, `this.#itemHeight`, etc.
- **Files modified:** `src/lib/use-wheel-physics.svelte.ts`
- **Verification:** TypeScript compiles cleanly, all tests pass
- **Committed in:** `87778c3` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking env issue, 1 bug/design correction)
**Impact on plan:** Both fixes improve correctness. The vitest split enables test execution in this environment. Simplified endDrag is more maintainable and avoids config divergence.

## Issues Encountered

- `defineWorkspace` not exported by vitest@4.1.0 `dist/config.js` — used `projects` array in `defineConfig` instead (same result, different API)

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `WheelPhysics` class is ready to be instantiated in `WheelPicker.svelte` (Plan 03-02)
- `WheelPickerProps` interface is complete with all layout/sensitivity props
- Physics constants match React v1.2.2 exactly — UX parity foundation is in place
- No blockers for Plan 03-02

---
*Phase: 03-wheelpicker-core*
*Completed: 2026-03-23*
