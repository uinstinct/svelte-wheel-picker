---
phase: 07-rotating-drum-cylinder-list-style-picker-with-3d-perspective-items-farther-from-center-appear-smaller-and-compressed-vertically
plan: 01
subsystem: ui
tags: [cylindrical, drum-picker, 3d-perspective, cosine-projection, pure-function, tdd]

# Dependency graph
requires:
  - phase: 02-types-and-utility-hooks
    provides: WheelPickerProps interface and wheel-physics-utils.ts module structure
provides:
  - cylindricalScaleY pure function in wheel-physics-utils.ts
  - MIN_CYLINDRICAL_SCALE constant (0.1)
  - cylindrical?: boolean prop on WheelPickerProps
affects:
  - 07-02 (component rendering will consume cylindricalScaleY and cylindrical prop)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Cosine projection formula for faux-3D cylindrical scale: dist = slotIndex + offset/itemHeight - floor(visibleCount/2); angle = dist*PI/visibleCount; scaleY = max(MIN_SCALE, cos(angle))"
    - "TDD: RED (failing tests) committed separately from GREEN (implementation)"

key-files:
  created: []
  modified:
    - src/lib/wheel-physics-utils.ts
    - src/lib/wheel-physics-utils.test.ts
    - src/lib/types.ts

key-decisions:
  - "cylindricalScaleY uses cosine projection: items map to cylinder surface where floor(visibleCount/2) slots span PI/2 radians"
  - "MIN_CYLINDRICAL_SCALE=0.1 clamps cosine when negative (dist > floor(vc/2) slots off-center), preventing zero/negative height"
  - "Test case for clamping uses slotIndex=5 (dist=3, cos(3*PI/5)<0) not slotIndex=100 (plan error: high slot indexes oscillate, don't monotonically decrease)"
  - "cylindrical prop added to WheelPickerProps as optional boolean with JSDoc per D-01"

patterns-established:
  - "Cylindrical scale math: dist = slotIndex + offset/itemHeight - floor(visibleCount/2)"

requirements-completed: [DRUM-01, DRUM-02]

# Metrics
duration: 3min
completed: 2026-03-25
---

# Phase 07 Plan 01: cylindricalScaleY Math and Type Contract Summary

**cosine-projection cylindricalScaleY function and MIN_CYLINDRICAL_SCALE constant added to wheel-physics-utils, plus cylindrical prop on WheelPickerProps — 6 unit tests passing**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-25T17:52:00Z
- **Completed:** 2026-03-25T17:55:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `cylindricalScaleY(slotIndex, offset, itemHeight, visibleCount)` pure function using cosine projection math
- Added `MIN_CYLINDRICAL_SCALE = 0.1` constant preventing items from collapsing to zero height
- Added `cylindrical?: boolean` prop to `WheelPickerProps` with JSDoc
- 6 TDD unit tests cover center=1.0, adjacent=cos(PI/vc), symmetry, clamping, multi-visibleCount, and constant value

## Task Commits

Each task was committed atomically:

1. **RED: add failing tests for cylindricalScaleY** - `a5ec7b5` (test)
2. **GREEN: implement cylindricalScaleY pure function** - `04b7cfb` (feat)
3. **Task 2: add cylindrical prop to WheelPickerProps** - `1956f07` (feat)

_Note: TDD tasks have multiple commits (test → feat)_

## Files Created/Modified
- `src/lib/wheel-physics-utils.ts` - Added MIN_CYLINDRICAL_SCALE constant and cylindricalScaleY function
- `src/lib/wheel-physics-utils.test.ts` - Added describe('cylindricalScaleY') with 6 tests
- `src/lib/types.ts` - Added cylindrical?: boolean to WheelPickerProps

## Decisions Made
- Used cosine projection formula: `dist = slotIndex + offset/itemHeight - floor(visibleCount/2)`, then `angle = dist*PI/visibleCount`, then `scaleY = max(MIN_CYLINDRICAL_SCALE, cos(angle))`. This auto-scales with visibleCount so the same visual "curve steepness" applies regardless of how many rows are visible.
- MIN_CYLINDRICAL_SCALE=0.1 chosen per plan spec to ensure items are always at least 10% height — prevents DOM collapse and provides a visible "receding" effect.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect test case for clamping behavior**
- **Found during:** Task 1 (GREEN phase — tests didn't pass)
- **Issue:** Plan specified `cylindricalScaleY(100, 0, 30, 5)` should return MIN_CYLINDRICAL_SCALE (0.1). But `slotIndex=100` gives `dist=98`, `angle=98*PI/5`, and `cos(98*PI/5) ≈ 0.309` (cosine oscillates — does not monotonically decrease for large inputs). The clamp to 0.1 never activates for that input.
- **Fix:** Changed test input to `cylindricalScaleY(5, 0, 30, 5)` which gives `dist=3`, `angle=3*PI/5 ≈ 1.885 rad`, `cos(1.885) ≈ -0.309` — clamped to MIN_CYLINDRICAL_SCALE=0.1. This correctly tests the clamping path.
- **Files modified:** src/lib/wheel-physics-utils.test.ts
- **Verification:** Test passes with `toBe(MIN_CYLINDRICAL_SCALE)`
- **Committed in:** `04b7cfb` (GREEN phase commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in plan's test case)
**Impact on plan:** Necessary correction — the plan's test case did not exercise the stated behavior. The fix tests the correct clamping path. No scope creep.

## Issues Encountered
- Pre-existing `src/lib/types.test.ts` failure ("No test suite found") — this file contains compile-time type-level tests only, no runtime describes/its. Pre-dates this plan. Out of scope.

## Known Stubs
None — this plan adds pure math functions and types only. No UI rendering involved.

## Next Phase Readiness
- `cylindricalScaleY` and `MIN_CYLINDRICAL_SCALE` are exported and tested — ready for Plan 07-02 to consume in WheelPicker.svelte template
- `cylindrical` prop is typed on `WheelPickerProps` — ready for component to read

---
*Phase: 07-rotating-drum-cylinder-list-style-picker-with-3d-perspective-items-farther-from-center-appear-smaller-and-compressed-vertically*
*Completed: 2026-03-25*
