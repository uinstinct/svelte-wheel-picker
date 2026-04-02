---
phase: quick-260402-d8h
plan: 01
subsystem: WheelPicker
tags: [reactivity, physics, svelte5, runes, bugfix]
dependency_graph:
  requires: []
  provides: [reactive-physics-prop-sync]
  affects: [WheelPicker.svelte]
tech_stack:
  added: []
  patterns: [$effect prop sync, extracted snap handler]
key_files:
  modified:
    - src/lib/WheelPicker.svelte
decisions:
  - "Extract handleSnap to named function so both constructor and $effect share a single closure that always reads current reactive prop values"
  - "physics.update() called in $effect so all config props (scrollSensitivity, dragSensitivity, itemHeight, visibleCount, infinite, options) are synced on every change"
  - "Pre-existing WheelPickerOption<T> type error in $effect is same issue as constructor — out of scope for this plan"
metrics:
  duration: "5m"
  completed: "2026-04-02"
  tasks_completed: 1
  files_modified: 1
---

# Phase quick-260402-d8h Plan 01: Fix Scroll Sensitivity Not Changing Summary

**One-liner:** Added reactive `$effect` + extracted `handleSnap` to sync all physics config props (scrollSensitivity, dragSensitivity, itemHeight, visibleCount, infinite, options) to WheelPhysics.update() on every prop change.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add $effect to sync props to WheelPhysics.update() | 343644b | src/lib/WheelPicker.svelte |

## What Was Done

### Task 1: Add $effect to sync props to WheelPhysics.update()

The `WheelPhysics` constructor was being called once at component creation, storing stale prop values. When a consumer changed `scrollSensitivity`, `dragSensitivity`, `itemHeight`, `visibleCount`, `infinite`, or `options` at runtime, the physics engine continued using the original construction-time values.

**Changes made:**

1. **Extracted `handleSnap` function** — the inline `onSnap` callback was moved into a standalone `handleSnap(index: number)` function. This function reads `infinite` and `options` directly via `$props()`, so it always captures current values. Both the constructor's `onSnap` and the new `$effect`'s `onSnap` reference this single function.

2. **Added `$effect` calling `physics.update()`** — a new `$effect` block reads all physics-related props (`optionItemHeight`, `visibleCount`, `dragSensitivity`, `scrollSensitivity`, `infinite`, `options`) so Svelte tracks them as reactive dependencies. When any of these props change, the effect re-runs and pushes new values to `physics.update()`.

3. **Removed debug `console.log` calls** — removed all debug logging from `onSnap`, `onPointerDown`, and `onPointerUp` that were left over from Phase 03 development.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- svelte-check: 0 warnings (down from 10 state_referenced_locally warnings before this fix)
- Pre-existing errors unchanged: 4 WheelPickerOption<T> type incompatibility errors (not introduced by this fix) + 2 page.server.ts node type errors

## Known Stubs

None.

## Self-Check: PASSED

- `src/lib/WheelPicker.svelte` — FOUND
- Commit `343644b` — FOUND
