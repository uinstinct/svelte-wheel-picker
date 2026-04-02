---
phase: quick-260402-d6r
plan: 01
subsystem: wheel-picker-core
tags: [svelte5, runes, reactivity, debug-cleanup, dx]
dependency_graph:
  requires: []
  provides: [clean-console, props-sync-effect, silent-git-stderr]
  affects: [src/lib/WheelPicker.svelte, src/routes/+page.server.ts]
tech_stack:
  added: []
  patterns:
    - "untrack() wraps class constructors to suppress state_referenced_locally when initial values are intentional"
    - "$effect() syncs prop changes to imperative class instances (WheelPhysics.update())"
    - "Named function extracted from inline closure to allow $effect reactive tracking"
key_files:
  created: []
  modified:
    - src/lib/WheelPicker.svelte
    - src/routes/+page.server.ts
decisions:
  - "Use untrack() on constructor calls rather than removing reactive references — preserves correct initial values while signaling intent to Svelte compiler"
  - "Extract handleSnap as named function so $effect can reference it without closure re-creation issues"
  - "stdio: ['pipe','pipe','pipe'] on execSync is the minimal change to silence git stderr without affecting error handling"
metrics:
  duration: "~10 minutes"
  completed: "2026-04-02"
  tasks_completed: 1
  files_modified: 2
---

# Phase quick-260402-d6r Plan 01: Fix Svelte 5 state_referenced_locally Warnings Summary

**One-liner:** Suppressed all `state_referenced_locally` warnings via `untrack()` on constructors + `$effect` for props sync, removed all debug `console.log` statements, and silenced git fatal stderr in `+page.server.ts`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1a | Add props-sync $effect and extract handleSnap | 343644b | src/lib/WheelPicker.svelte |
| 1b | Silence git stderr in +page.server.ts | b7a07ac | src/routes/+page.server.ts |

Note: The WheelPicker.svelte changes (handleSnap extraction, untrack() wrappers, $effect props sync, console.log removal) were committed as part of quick task 260402-d8h (343644b) which ran concurrently. The +page.server.ts fix is committed at b7a07ac as part of this task.

## What Was Done

### WheelPicker.svelte (committed at 343644b)

Three changes applied:

1. **Extracted `handleSnap` named function** from the inline closure passed to `WheelPhysics`. This allows the `$effect` to read `infinite` and `options` reactively (they are referenced in `handleSnap`'s body, which is re-passed on each effect run).

2. **Wrapped both constructor calls with `untrack()`:**
   - `useControllableState({ value, defaultValue, onChange: onValueChange })` — initial values only; `updateControlledValue()` via effect handles updates
   - `new WheelPhysics({ ... })` — initial values only; the props-sync `$effect` handles all subsequent updates

3. **Added `$effect` that calls `physics.update()`** with all configurable props. This makes Svelte track prop changes reactively and push them into the physics engine. The initial run is harmless since `update()` sets the same values the constructor already set.

4. **Removed all `console.log` debug statements** from onSnap, onPointerDown, and onPointerUp. The `console.warn` for even `visibleCount` was preserved (legitimate user-facing warning).

### +page.server.ts (committed at b7a07ac)

Added `stdio: ['pipe', 'pipe', 'pipe']` to the `execSync` call. This pipes stderr instead of inheriting it from the parent process, so the "fatal: invalid object name 'releases'" message no longer surfaces in the terminal when the releases branch does not exist locally. The catch block still handles the error gracefully with the local `package.json` fallback.

## Verification

- `pnpm build` completes cleanly — zero `state_referenced_locally` warnings
- `grep -n 'console.log' src/lib/WheelPicker.svelte` — no matches
- `grep -n 'console.log' src/routes/+page.server.ts` — no matches
- Git fatal stderr is suppressed by `stdio: ['pipe','pipe','pipe']`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Untrack approach required instead of $effect-only**

- **Found during:** Task 1 verification
- **Issue:** Adding a `$effect` for props sync alone does not silence warnings — Svelte still warns about the constructor calls themselves reading destructured props. The `$effect` only makes the sync work reactively; `untrack()` is needed to tell Svelte "the constructor reads are intentional initial-only captures."
- **Fix:** Wrapped both `useControllableState()` and `new WheelPhysics()` calls in `untrack()`.
- **Files modified:** src/lib/WheelPicker.svelte
- **Commit:** 343644b

## Known Stubs

None. All changes are complete and wired.

## Self-Check: PASSED

- src/lib/WheelPicker.svelte — no console.log, has handleSnap, has untrack wrappers, has props-sync $effect
- src/routes/+page.server.ts — has stdio: ['pipe','pipe','pipe']
- Commits 343644b and b7a07ac verified in git log
- pnpm build clean (zero state_referenced_locally warnings)
