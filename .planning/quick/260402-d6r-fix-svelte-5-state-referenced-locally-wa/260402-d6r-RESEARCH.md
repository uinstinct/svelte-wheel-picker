# Quick Task: Fix state_referenced_locally Warnings - Research

**Researched:** 2026-04-02
**Domain:** Svelte 5 reactivity / props pattern
**Confidence:** HIGH

## Summary

The `state_referenced_locally` warnings in WheelPicker.svelte occur because props destructured from `$props()` are passed by value to class constructors (`WheelPhysics`, `useControllableState`). When the parent re-renders with new prop values, the local variables hold stale initial values -- the classes never see the updates.

The fix is straightforward: add a `$effect` that calls `physics.update()` whenever the relevant props change. The `WheelPhysics` class already has an `update()` method (lines 118-134) designed exactly for this purpose -- it is simply never called.

The secondary issue -- "fatal: invalid object name 'releases'" -- comes from `src/routes/+page.server.ts` line 8 which runs `git show releases:package.json`. The `releases` branch does not exist locally. The error is caught and a fallback is used, but it produces noisy console output during dev/build. The fix is to use `git rev-parse --verify releases` first, or use `execSync` with `stdio: 'pipe'` to suppress stderr.

**Primary recommendation:** Add a `$effect` that syncs changed props to `physics.update()`, and silence the git stderr in the page server load.

## Architecture Patterns

### Pattern 1: Svelte 5 state_referenced_locally Warning

**What:** Svelte 5 warns when a reactive value (from `$props()` or `$state()`) is captured by value in a closure or passed to a constructor. The recipient gets the initial value but never sees updates.

**Source:** https://svelte.dev/e/state_referenced_locally

**When it triggers:** Destructured props passed to `new WheelPhysics({...})` on lines 59-92. The constructor captures `optionItemHeight`, `dragSensitivity`, `scrollSensitivity`, `visibleCount`, `infinite`, `options` as plain values in private fields.

**Fix pattern -- use $effect to push updates:**

```typescript
// After physics construction, sync prop changes:
$effect(() => {
  physics.update({
    itemHeight: optionItemHeight,
    visibleCount: visibleCount,
    dragSensitivity,
    scrollSensitivity,
    infinite,
    options,
  });
});
```

This works because:
1. `$effect` reads the destructured props reactively (they are reactive within the component scope)
2. When any prop changes, the effect re-runs and pushes the new value into the physics engine
3. `WheelPhysics.update()` already exists and handles partial updates

### Pattern 2: Controllable State Constructor

The `useControllableState` call on line 42-46 passes `value`, `defaultValue`, and `onValueChange` at construction. However, `value` updates are already handled by the `$effect` on line 106-108 (`state.updateControlledValue(value)`). The `defaultValue` and `onValueChange` are one-time configuration. So this constructor call is fine -- the warning may still fire but the behavior is correct since controlled value syncing happens via the explicit effect.

To suppress the warning cleanly, either:
- Pass the callbacks/values the same way (already done)
- Or restructure to pass getter functions (overkill for this case)

The pragmatic approach: the `useControllableState` warning is a false positive for this usage pattern. If it bothers, wrapping in `untrack()` would suppress it, but the real fix is ensuring the physics props are synced.

### Pattern 3: onSnap Closure Captures

The `onSnap` callback (lines 67-91) reads `infinite` and `options` from the closure. Since `onSnap` is passed to the constructor and stored as `#onSnap`, it captures the initial closure. However, `physics.update({ onSnap })` can refresh it. The `$effect` for `physics.update()` should include a fresh `onSnap` that reads the current `infinite` and `options` values.

**Better approach:** Have `onSnap` read `infinite` from `physics` internal state (which `update()` already syncs) rather than the closure. But since the closure re-creation in `$effect` would also work, the simpler path is to pass a new `onSnap` in the update call.

### Anti-Pattern: Wrapping Everything in Getter Functions

Some Svelte 5 guides suggest passing `() => propValue` to constructors. This would require rewriting `WheelPhysics` to call functions instead of reading values. Since `WheelPhysics.update()` already exists, using `$effect` + `update()` is less invasive and matches the existing architecture.

## Specific Fix Plan

### Fix 1: Add props-sync effect (HIGH confidence)

After the `physics` construction (after line 92), add:

```typescript
// Sync prop changes to physics engine
$effect(() => {
  physics.update({
    itemHeight: optionItemHeight,
    visibleCount: visibleCount,
    dragSensitivity,
    scrollSensitivity,
    infinite,
    options,
    onSnap: (index: number) => {
      // Re-create onSnap so it captures current `infinite` and `options`
      if (infinite) {
        const wrappedIndex = wrapIndex(index, options.length);
        physics.jumpTo(wrappedIndex);
        const opt = options[wrappedIndex];
        if (opt && !opt.disabled) {
          state.current = opt.value;
        }
      } else {
        const opt = options[index];
        if (opt && !opt.disabled) {
          state.current = opt.value;
        }
      }
    },
  });
});
```

**Gotcha:** This effect will run once on mount (unnecessary but harmless -- `update()` is a no-op when values match). On subsequent prop changes it pushes updates correctly.

**Gotcha 2:** The `onSnap` closure inside the effect captures reactive `infinite` and `options`. This is correct -- the effect re-runs when they change, creating a fresh closure each time.

### Fix 2: Silence git stderr in +page.server.ts (HIGH confidence)

Change line 8 from:
```typescript
const raw = execSync('git show releases:package.json', { encoding: 'utf-8' });
```
To:
```typescript
const raw = execSync('git show releases:package.json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
```

The `stdio: ['pipe', 'pipe', 'pipe']` pipes stderr instead of inheriting it, so the fatal error message doesn't appear in the console. The `catch` block still handles the failure gracefully.

### Fix 3: Remove console.log statements (LOW priority, but recommended)

Lines 68, 74-81 (onSnap), 199-206 (onPointerDown), 221-229 (onPointerUp) contain debug `console.log` calls that should be removed for a production library.

## Common Pitfalls

### Pitfall 1: Effect Running on Mount Causes Double-Init
**What goes wrong:** The `$effect` for `physics.update()` runs once immediately, potentially resetting state.
**How to avoid:** `WheelPhysics.update()` only sets fields when values differ from undefined -- it accepts partial objects. The initial run is harmless because it sets the same values the constructor already set.

### Pitfall 2: Infinite Loop in onSnap Effect
**What goes wrong:** If `onSnap` sets `state.current`, and an `$effect` reads `state.current`, you can get a reactive loop.
**How to avoid:** The existing `onSnap` only writes to `state.current`, it does not read any reactive state that would trigger itself. The `$effect` only reads props (not `state.current`), so no loop occurs.

### Pitfall 3: Duplicate onSnap Logic
**What goes wrong:** The onSnap callback body is duplicated between the constructor and the update effect.
**How to avoid:** Extract the onSnap body into a named function (`handleSnap`) defined in the component scope. Both the constructor and effect reference the same function. Since the function reads `infinite` and `options` from the component scope (which are reactive in `$effect` context), it always has current values when called from within an effect-refreshed closure.

## Sources

### Primary (HIGH confidence)
- https://svelte.dev/e/state_referenced_locally -- official Svelte 5 warning documentation
- Source code: `src/lib/use-wheel-physics.svelte.ts` lines 118-134 -- existing `update()` method
- Source code: `src/lib/WheelPicker.svelte` -- the affected file
- Source code: `src/routes/+page.server.ts` -- the git error source

## Metadata

**Confidence breakdown:**
- state_referenced_locally fix: HIGH -- verified against official Svelte 5 docs, existing update() method confirmed
- git error fix: HIGH -- root cause identified (missing local branch), solution is standard Node.js
- Console.log cleanup: HIGH -- straightforward removal

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (stable patterns, unlikely to change)
