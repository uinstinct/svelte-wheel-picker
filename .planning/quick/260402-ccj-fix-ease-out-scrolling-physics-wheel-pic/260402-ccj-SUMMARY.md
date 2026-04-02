---
phase: quick-260402-ccj
plan: "01"
subsystem: physics
tags: [physics, animation, inertia, scroll, fix]
dependency_graph:
  requires: []
  provides: [velocity-aware-animation-duration]
  affects: [wheel-physics-utils, use-wheel-physics]
tech_stack:
  added: []
  patterns: [velocity-based duration, kinematic deceleration]
key_files:
  created: []
  modified:
    - src/lib/wheel-physics-utils.ts
    - src/lib/wheel-physics-utils.test.ts
    - src/lib/use-wheel-physics.svelte.ts
decisions:
  - "Velocity-based path uses deceleration constant scrollSensitivity*6, producing duration=1.0s at MAX_VELOCITY=30 with default scrollSensitivity=5"
  - "Distance-only path (keyboard/wheel/slow release) unchanged — [0.1, 0.6] ceiling preserved"
  - "Velocity ceiling raised to 1.2s for inertia path only — allows proportional deceleration for fast flicks without sluggish feel"
metrics:
  duration: "3 minutes"
  completed: "2026-04-02"
  tasks: 2
  files: 3
---

# Quick Task 260402-ccj: Fix Ease-Out Scrolling Physics — Summary

**One-liner:** Velocity-based animation duration for inertia flicks using kinematic formula abs(v)/(sensitivity*6), capped at 1.2s, replacing 0.6s distance-only ceiling.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add velocity-aware duration computation with tests | f363d45 | wheel-physics-utils.ts, wheel-physics-utils.test.ts |
| 2 | Wire velocity through endDrag and animateTo, remove console.log | a88d8c1 | use-wheel-physics.svelte.ts |

## What Was Built

### Task 1: Velocity-aware `computeAnimationDuration`

Modified `computeAnimationDuration` in `src/lib/wheel-physics-utils.ts` to accept an optional third parameter `velocity?: number`:

- When `|velocity| >= 0.5`: kinematic formula `|v| / (scrollSensitivity * 6)` clamped to `[0.1, 1.2]`
- Otherwise: existing distance formula `sqrt(|distance| / scrollSensitivity)` clamped to `[0.1, 0.6]` — unchanged

The deceleration constant `scrollSensitivity * 6` produces natural results: at default `scrollSensitivity=5`, MAX_VELOCITY=30 gives `30/30 = 1.0s`, velocity=5 gives `5/30 ≈ 0.17s`.

Added 6 new tests in a "computeAnimationDuration (velocity-aware)" describe block covering: scaling, max cap, minimum, fallback behavior, typical velocity ranges, and exceeding the old 0.6s ceiling.

### Task 2: Wire velocity through animation pipeline

- `animateTo(targetIndex, velocity?)` — added optional velocity parameter, passes it to `computeAnimationDuration`
- `endDrag()` — passes velocity to `animateTo` on the inertia path (`|velocity| >= 0.5`); slow-release path unchanged (no velocity passed)
- `handleWheel()` and keyboard paths — unchanged (no velocity parameter needed)
- Removed all 5 `console.log` debug statements from `use-wheel-physics.svelte.ts` (lines 209, 220, 225, 252, 308)

## Success Criteria Verification

- [x] Fast flicks (velocity >= 0.5) produce animation durations proportional to velocity, up to 1.2s
- [x] Slow releases, keyboard nav, and wheel scroll use unchanged distance-based duration (max 0.6s)
- [x] All existing 59 tests pass without modification (backward compatible)
- [x] New 6 tests cover velocity-aware duration: scaling, min, max, fallback
- [x] No console.log debug statements remain in use-wheel-physics.svelte.ts
- [x] TypeScript compiles cleanly for modified files (pre-existing errors in WheelPicker.svelte and routes are out of scope)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `src/lib/wheel-physics-utils.ts` — FOUND (modified)
- `src/lib/use-wheel-physics.svelte.ts` — FOUND (modified)
- `src/lib/wheel-physics-utils.test.ts` — FOUND (modified)
- commit f363d45 — FOUND (Task 1)
- commit a88d8c1 — FOUND (Task 2)
- All 62 unit tests pass
- 0 console.log statements in use-wheel-physics.svelte.ts
