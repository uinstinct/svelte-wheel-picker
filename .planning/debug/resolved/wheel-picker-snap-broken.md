---
status: resolved
trigger: "wheel-picker-snap-broken — snap behavior is fully broken, wheel does not snap to options on release, switching does not work"
created: 2026-03-23T00:00:00Z
updated: 2026-03-23T02:00:00Z
---

## Current Focus

hypothesis: CONFIRMED — $effect tracking physics.offset via physics.currentIndex caused the effect to re-run on every pointer-move/animation-tick, canceling any in-progress animation and snapping back to the controlled value before onSnap could fire.
test: untrack() wrapper applied around physics.currentIndex read inside external value $effect
expecting: human verification that snap and selection update work in browser
next_action: await human verification

## Symptoms

expected: On drag release, the wheel should coast with inertia and snap precisely to the nearest option. The selected value should update when the user lands on a different option.
actual: Snap behavior is fully buggy — wheel does not snap correctly. Switching (value change / selection update) does not work.
errors: none reported
reproduction: Run `pnpm dev`, open http://localhost:5173, drag the wheel and release — it does not snap to an option. Selected value does not change.
started: First observed during Wave 3 checkpoint after plan 03-02 built the component

## Eliminated

- hypothesis: animateTo never completes (durationMs is 0)
  evidence: computeAnimationDuration clamps to minimum 0.1s; RAF loop logic is correct
  timestamp: 2026-03-23

- hypothesis: physics.offset $state not reactive (DOM not updating)
  evidence: offset is $state, transform binding is direct; DOM updates correctly
  timestamp: 2026-03-23

- hypothesis: pointer capture preventing pointerup from firing
  evidence: setPointerCapture/releasePointerCapture are called correctly on the same element
  timestamp: 2026-03-23

- hypothesis: ControllableState.#controlledValue not reactive / onSnap not calling onValueChange
  evidence: Session 1 fixes (#controlledValue made $state, updateControlledValue method added, velocity direction fixed) did not resolve the bug — user confirmed selection still does not update on drag/flick
  timestamp: 2026-03-23

## Evidence

- timestamp: 2026-03-23
  checked: use-controllable-state.svelte.ts ControllableState constructor and get current()
  found: #controlledValue is set once in constructor from opts.value and never updated again. In controlled mode, get current() returns #controlledValue forever.
  implication: When value prop changes in parent (e.g. user snaps to new option, onValueChange fires, parent updates state, value prop changes), state.current still returns the original initial value. selectedIndex derived from state.current never changes. data-swp-selected never moves to new option.

- timestamp: 2026-03-23
  checked: wheel-physics-utils.ts computeSnapTarget direction
  found: positive velocity (drag down = clientY increases = offset increases = lower index in view) causes overshoot in +index direction via `currentIndex + sign(velocity) * overshoot`. But dragging down means momentum should carry to LOWER indices, not higher.
  implication: Inertia snapping overshoots in the wrong direction — fast downward swipe snaps upward in the list instead of continuing downward.

- timestamp: 2026-03-23
  checked: WheelPicker.svelte $effect for external value changes (lines 81-89)
  found: $effect calls physics.animateTo(idx) every time value prop changes, including after every snap completion. This causes a redundant second animation (distance=0, 100ms, same position) that fires onSnap again, but stabilizes since value doesn't change on second fire.
  implication: Minor: every snap triggers two animations instead of one. Not "fully broken" but wastes 100ms per snap. Fixable by guarding against animating to the already-snapped position.

- timestamp: 2026-03-23
  checked: WheelPicker.svelte external value $effect — what reactive signals it subscribes to
  found: |
    The $effect body reads `value` (intended) AND calls `physics.currentIndex` which reads `physics.offset` (a $state field). Svelte tracks ALL $state reads inside $effect as dependencies. Therefore this $effect also subscribes to physics.offset.

    Consequence: every time the user drags (physics.moveDrag sets physics.offset) OR during an animation (RAF loop sets physics.offset), this $effect re-runs. On each re-run:
    - v = value (current controlled value, e.g. 'cherry')
    - idx = findIndex for 'cherry' = 2
    - physics.currentIndex = offsetToIndex(dragged offset) = e.g. 1 (mid-drag)
    - guard: 2 !== 1 → TRUE → physics.cancelAnimation() + physics.animateTo(2)

    This cancels every in-progress snap animation and snaps back to the controlled value before onSnap can complete. The wheel snaps back on every frame during drag.
  implication: CONFIRMED ROOT CAUSE. The entire controlled-mode interaction is broken by this unintended reactive subscription. Fix: wrap physics.currentIndex read in untrack().

## Resolution

root_cause: |
  The $effect for external value changes in WheelPicker.svelte inadvertently subscribed to physics.offset ($state) via physics.currentIndex. On every pointer-move event during drag AND every animation frame, Svelte re-ran this effect. The effect saw value='cherry' (current controlled value), found physics.currentIndex had moved away from cherry's index, satisfied the guard condition, and called physics.cancelAnimation() + physics.animateTo(cherryIndex) — snapping the wheel back to cherry on every frame. onSnap never fired because every animation was immediately canceled by the next effect re-run.

fix: |
  Wrapped the physics.currentIndex read inside untrack(() => physics.currentIndex) in the external value $effect. This prevents Svelte from tracking physics.offset as a dependency of the effect. The effect now correctly subscribes only to `value` and `options`, and only re-runs when the controlled value prop changes — not during drag or animation.

  File changed: src/lib/WheelPicker.svelte
  - Added `import { untrack } from 'svelte'`
  - Changed `idx !== physics.currentIndex` to `idx !== untrack(() => physics.currentIndex)`

  Previous session fixes (still applied, all correct):
  1. ControllableState.#controlledValue made $state + updateControlledValue method added
  2. computeSnapTarget velocity direction inverted (drag down → lower index)
  3. WheelPhysics.currentIndex getter added

verification: TypeScript check clean (tsc --noEmit); 40/40 unit tests pass; human confirmed fixed in browser
files_changed:
  - src/lib/WheelPicker.svelte
  - src/lib/use-controllable-state.svelte.ts
  - src/lib/wheel-physics-utils.ts
  - src/lib/wheel-physics-utils.test.ts
  - src/lib/use-wheel-physics.svelte.ts
