---
phase: quick-260402-ccj
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/wheel-physics-utils.ts
  - src/lib/wheel-physics-utils.test.ts
  - src/lib/use-wheel-physics.svelte.ts
autonomous: true
requirements: [fix-ease-out-scrolling]
must_haves:
  truths:
    - "Fast flicks produce proportionally longer animation durations (not clamped at 0.6s)"
    - "Slow releases and keyboard/wheel navigation still use distance-based duration (unchanged behavior)"
    - "Animation duration is capped at 1.2s to prevent sluggish feel on extreme flicks"
  artifacts:
    - path: "src/lib/wheel-physics-utils.ts"
      provides: "Velocity-aware computeAnimationDuration"
      contains: "velocity"
    - path: "src/lib/use-wheel-physics.svelte.ts"
      provides: "endDrag passes velocity to animateTo"
      contains: "animateTo"
    - path: "src/lib/wheel-physics-utils.test.ts"
      provides: "Tests for velocity-aware duration computation"
      contains: "velocity-aware"
  key_links:
    - from: "src/lib/use-wheel-physics.svelte.ts"
      to: "src/lib/wheel-physics-utils.ts"
      via: "computeAnimationDuration with velocity parameter"
      pattern: "computeAnimationDuration.*velocity"
---

<objective>
Fix the wheel picker's ease-out scrolling physics so fast flicks decelerate smoothly instead of slamming to a stop.

Purpose: The current implementation clamps animation duration to 0.6s regardless of velocity, causing an abrupt "wall slam" effect on fast flicks. The React reference uses velocity-based duration (duration = |velocity| / deceleration) which produces natural deceleration proportional to flick speed.

Output: Updated physics utilities with velocity-aware duration, updated WheelPhysics class passing velocity through the animation pipeline, and comprehensive tests.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/260402-ccj-fix-ease-out-scrolling-physics-wheel-pic/260402-ccj-RESEARCH.md
@src/lib/wheel-physics-utils.ts
@src/lib/use-wheel-physics.svelte.ts
@src/lib/wheel-physics-utils.test.ts

<interfaces>
<!-- Current signatures that will be modified -->

From src/lib/wheel-physics-utils.ts:
```typescript
export function computeAnimationDuration(distance: number, scrollSensitivity: number): number;
```

From src/lib/use-wheel-physics.svelte.ts:
```typescript
// WheelPhysics class methods affected:
animateTo(targetIndex: number): void;
endDrag(): void;
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add velocity-aware duration computation with tests</name>
  <files>src/lib/wheel-physics-utils.ts, src/lib/wheel-physics-utils.test.ts</files>
  <behavior>
    - Test: velocity-aware mode (velocity >= 0.5) produces longer duration for faster flicks
    - Test: computeAnimationDuration(3, 5, 3) < computeAnimationDuration(10, 5, 15) (faster flick = longer duration)
    - Test: velocity-aware duration is capped at 1.2s max
    - Test: velocity-aware duration has minimum 0.1s
    - Test: when velocity is undefined, behavior is identical to current implementation (distance-based, max 0.6s)
    - Test: when velocity < 0.5, falls through to distance-based path
    - Test: at typical velocities (5, 10, 20 items/sec with scrollSensitivity=5), durations are in reasonable range (0.1-1.2s)
  </behavior>
  <action>
    1. Write tests FIRST in `wheel-physics-utils.test.ts` — add a new describe block "computeAnimationDuration (velocity-aware)" with tests matching the behavior spec above. Also update the existing "computeAnimationDuration" test for the max ceiling (old test checks 0.6 max — the distance-only path still caps at 0.6, so keep that test but ensure the new velocity path tests the 1.2 ceiling).

    2. Run tests — they MUST fail (RED phase).

    3. Modify `computeAnimationDuration` in `wheel-physics-utils.ts` to accept an optional third parameter `velocity?: number`:
       - When `velocity !== undefined && Math.abs(velocity) >= 0.5`: use kinematic formula `Math.abs(velocity) / (scrollSensitivity * 6)`, clamped to [0.1, 1.2]
       - Otherwise: use existing `Math.sqrt(Math.abs(distance) / scrollSensitivity)` clamped to [0.1, 0.6] (UNCHANGED)
       - The deceleration multiplier `scrollSensitivity * 6` is tunable — the value 6 produces duration=1.0s at velocity=30 with scrollSensitivity=5, which is a reasonable maximum for the fastest possible flick

    4. Run tests — they MUST pass (GREEN phase).
  </action>
  <verify>
    <automated>cd /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker && npx vitest run src/lib/wheel-physics-utils.test.ts</automated>
  </verify>
  <done>computeAnimationDuration accepts optional velocity parameter; velocity-based path produces proportional durations capped at 1.2s; distance-only path unchanged at 0.6s max; all tests pass</done>
</task>

<task type="auto">
  <name>Task 2: Wire velocity through endDrag and animateTo, remove console.log statements</name>
  <files>src/lib/use-wheel-physics.svelte.ts</files>
  <action>
    1. Modify `animateTo` signature to accept optional velocity: `animateTo(targetIndex: number, velocity?: number): void`
       - Pass velocity through to `computeAnimationDuration(distance, this.#scrollSensitivity, velocity)` on line 315
       - No other changes to animateTo logic — easing, RAF loop, onSnap all stay the same

    2. Modify `endDrag()` to pass velocity to `animateTo`:
       - In the inertia path (Math.abs(velocity) >= 0.5), pass `velocity` as second arg to `animateTo`:
         - Line ~253: `this.animateTo(snapIndex + loopOffset, velocity);` (infinite mode)
         - Line ~257: `this.animateTo(snapIndex, velocity);` (finite mode)
       - In the slow-release path (Math.abs(velocity) < 0.5), do NOT pass velocity — let animateTo use distance-based duration

    3. Do NOT modify `handleWheel()` — it already works correctly with distance-based duration (single-item steps)

    4. Remove ALL `console.log` statements from the file (lines 209, 220, 225, 252, 308). These are debug logging left from development. Search for `console.log` and remove every occurrence.

    5. Verify no TypeScript errors: run `npx tsc --noEmit` (or `npx svelte-check`).
  </action>
  <verify>
    <automated>cd /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker && npx vitest run src/lib/wheel-physics-utils.test.ts && npx svelte-check --tsconfig ./tsconfig.json</automated>
  </verify>
  <done>endDrag passes velocity to animateTo for inertia flicks; animateTo passes velocity to computeAnimationDuration; handleWheel and keyboard paths unchanged; all console.log statements removed; TypeScript compiles cleanly; all existing tests still pass</done>
</task>

</tasks>

<verification>
1. `npx vitest run src/lib/wheel-physics-utils.test.ts` — all unit tests pass including new velocity-aware tests
2. `npx svelte-check --tsconfig ./tsconfig.json` — no type errors
3. `grep -r "console.log" src/lib/use-wheel-physics.svelte.ts` — returns no results (debug logging removed)
4. `npx vitest run` — full test suite passes (no regressions)
</verification>

<success_criteria>
- Fast flicks (velocity >= 0.5) produce animation durations proportional to velocity, up to 1.2s
- Slow releases, keyboard nav, and wheel scroll use unchanged distance-based duration (max 0.6s)
- All existing tests pass without modification (backward compatible)
- New tests cover velocity-aware duration: scaling, min, max, fallback
- No console.log debug statements remain in use-wheel-physics.svelte.ts
- TypeScript compiles cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/260402-ccj-fix-ease-out-scrolling-physics-wheel-pic/260402-ccj-SUMMARY.md`
</output>
