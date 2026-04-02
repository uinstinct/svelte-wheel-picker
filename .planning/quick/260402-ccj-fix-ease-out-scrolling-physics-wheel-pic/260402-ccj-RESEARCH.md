# Quick Task: Fix Ease-Out Scrolling Physics - Research

**Researched:** 2026-04-02
**Domain:** Scroll physics / inertia deceleration
**Confidence:** HIGH

## Summary

The wheel picker's momentum scrolling feels abrupt because the animation duration after a fast flick is too short. The current implementation computes a snap target via kinematic overshoot (`computeSnapTarget`) and then animates to it using `animateTo()` with a duration computed by `computeAnimationDuration()`. The problem is that `computeAnimationDuration` clamps to a maximum of **0.6 seconds** regardless of how fast the user flicked. A fast flick at velocity 20+ items/sec computes a large snap distance, but the animation covers it in only 0.6s -- creating an abrupt start-fast-then-slam-stop effect.

The React reference implementation (`@ncdai/react-wheel-picker` v1.2.2) uses a different approach: it calculates duration directly from velocity and deceleration (`duration = |velocity| / deceleration`), which means faster flicks get proportionally longer animations. The Svelte version uses `sqrt(distance / sensitivity)` clamped to [0.1, 0.6], which does not scale properly with velocity.

**Primary recommendation:** Fix `computeAnimationDuration` to derive duration from velocity (matching React's kinematic model), or raise/remove the 0.6s ceiling. Also consider passing velocity to `animateTo` so the animation starts at the flick speed rather than a constant pace.

## Root Cause Analysis

### File: `src/lib/wheel-physics-utils.ts`

**`computeAnimationDuration(distance, scrollSensitivity)`** (line 204-207):
```typescript
const raw = Math.sqrt(Math.abs(distance) / scrollSensitivity);
return Math.max(0.1, Math.min(0.6, raw));
```

Problem: The 0.6s ceiling is too aggressive. With `scrollSensitivity=5`:
- distance=1 item: `sqrt(1/5) = 0.45s` -- fine
- distance=5 items: `sqrt(5/5) = 1.0s` -- clamped to 0.6s (losing 40% of natural duration)
- distance=10 items: `sqrt(10/5) = 1.41s` -- clamped to 0.6s (losing 57%)

Covering 10 items in 0.6s with easeOutCubic means the start is extremely fast and the tail decelerates over too few frames, producing a visible "slam into wall" feel.

### File: `src/lib/use-wheel-physics.svelte.ts`

**`endDrag()`** (line 208-260): Computes snap target correctly using kinematic overshoot, but passes only the index to `animateTo()`. The velocity information is lost -- `animateTo` does not know how fast the user was flicking.

**`animateTo(targetIndex)`** (line 307-341): Uses `easeOutCubic` which IS the correct easing function (matches React). The easing itself is fine. The problem is the duration computation feeding into it.

## React Reference Implementation (v1.2.2)

The React version's `decelerateAndAnimateScroll()` uses:
```typescript
duration = Math.abs(initialVelocity / deceleration);
// scrollDistance computed from kinematics
const scrollDistance = initialVelocity * duration + 0.5 * deceleration * duration * duration;
```

Key difference: duration scales linearly with velocity. A flick at 20 items/sec with deceleration=30 gets `20/30 = 0.67s`. A flick at 5 items/sec gets `5/30 = 0.17s`. This feels natural because faster flicks take proportionally longer to decelerate.

## Recommended Fix

### Option A: Velocity-aware duration (recommended, matches React)

Modify `endDrag()` to pass velocity to `animateTo()`, and compute duration from velocity:

```typescript
// In computeAnimationDuration, add velocity-based mode:
export function computeAnimationDuration(
  distance: number,
  scrollSensitivity: number,
  velocity?: number
): number {
  if (velocity !== undefined && Math.abs(velocity) >= 0.5) {
    // Kinematic duration: time to decelerate from velocity to 0
    const deceleration = scrollSensitivity * 6; // tunable
    const raw = Math.abs(velocity) / deceleration;
    return Math.max(0.1, Math.min(1.2, raw));
  }
  // Fallback for non-inertia animations (keyboard, wheel, programmatic)
  const raw = Math.sqrt(Math.abs(distance) / scrollSensitivity);
  return Math.max(0.1, Math.min(0.6, raw));
}
```

Then in `endDrag()`, pass velocity through to `animateTo`:

```typescript
// Add velocity parameter to animateTo signature
animateTo(targetIndex: number, velocity?: number): void {
  // ... existing code ...
  const durationSec = computeAnimationDuration(distance, this.#scrollSensitivity, velocity);
  // ... rest unchanged ...
}
```

### Option B: Simply raise the duration ceiling

Minimal change -- raise the 0.6s max to 1.0-1.2s:

```typescript
return Math.max(0.1, Math.min(1.0, raw));
```

This is simpler but less physically accurate. distance=10 would get `1.0s` instead of `0.6s`.

**Recommendation: Option A** -- it matches the React reference behavior and produces the most natural feel.

## Files to Modify

1. **`src/lib/wheel-physics-utils.ts`** -- `computeAnimationDuration()` signature and logic
2. **`src/lib/use-wheel-physics.svelte.ts`** -- `endDrag()` to pass velocity, `animateTo()` to accept velocity param
3. **`src/lib/wheel-physics-utils.test.ts`** -- update/add tests for new duration behavior

## Existing Tests

### Unit tests (node environment): `src/lib/wheel-physics-utils.test.ts`
- `easeOutCubic` -- 4 tests (boundaries + midpoint)
- `computeAnimationDuration` -- 3 tests (min, max, monotonicity)
- `computeSnapTarget` -- 3 tests (zero velocity, positive, negative)
- `calculateVelocity` -- 5 tests

**No existing tests for the full inertia flow** (startDrag -> moveDrag -> endDrag -> animation). The `WheelPicker.test.ts` tests DOM structure only, not scroll behavior.

### Tests to Add

Add to `wheel-physics-utils.test.ts`:

1. **Velocity-aware duration scales with velocity**: Higher velocity produces longer duration
2. **Velocity-aware duration is capped**: Does not exceed max (e.g., 1.2s)
3. **Non-velocity path unchanged**: Keyboard/wheel animations still use distance-based formula
4. **Deceleration feels natural**: At common velocities (5, 10, 20 items/sec), durations are in reasonable ranges

Example test:
```typescript
it('velocity-aware: faster flick gets longer duration', () => {
  const slow = computeAnimationDuration(3, 5, 3);   // slow flick
  const fast = computeAnimationDuration(10, 5, 15);  // fast flick
  expect(fast).toBeGreaterThan(slow);
});

it('velocity-aware: duration capped at max', () => {
  const result = computeAnimationDuration(100, 5, 100);
  expect(result).toBeLessThanOrEqual(1.2);
});
```

## Common Pitfalls

### Pitfall 1: Breaking keyboard/wheel animations
The keyboard handler and `handleWheel` also call `animateTo()` without velocity. The fix MUST keep the non-velocity path working identically. Use optional parameter with fallback.

### Pitfall 2: Duration too long on fast flicks
If the deceleration constant is too small, fast flicks will produce 2-3 second animations that feel sluggish. Keep the ceiling at 1.0-1.2s max.

### Pitfall 3: Velocity sign confusion
`calculateVelocity` returns positive for downward drag. `computeAnimationDuration` should use `Math.abs(velocity)` since duration is always positive.

### Pitfall 4: Console.log statements in production code
There are numerous `console.log` statements throughout `use-wheel-physics.svelte.ts` and `WheelPicker.svelte` (debug logging from development). Consider removing these in the same PR.

## Sources

### Primary (HIGH confidence)
- `src/lib/wheel-physics-utils.ts` -- current easing and duration functions (read directly)
- `src/lib/use-wheel-physics.svelte.ts` -- current animation loop (read directly)
- React reference: `packages/react-wheel-picker/src/index.tsx` on [GitHub](https://github.com/ncdai/react-wheel-picker) -- velocity-based duration model

### Secondary (MEDIUM confidence)
- easeOutCubic `Math.pow(p - 1, 3) + 1` -- standard easing, used identically in both React and Svelte versions
