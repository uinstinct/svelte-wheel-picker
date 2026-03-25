# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## dark-mode-white-on-white — Demo page text invisible in dark mode due to missing CSS custom properties and contrast oversight
- **Date:** 2026-03-23
- **Error patterns:** dark mode, white on white, invisible text, contrast, color-scheme, prefers-color-scheme, p color #666, demo page
- **Root cause:** Two issues combined: (1) `p { color: #666 }` had no dark mode override — that gray is near-invisible on the dark (#0f0f0f) background (contrast ~2.3:1, below WCAG AA 4.5:1). (2) No `color-scheme: light dark` on `:root`, missing the standard browser signal for dual-mode pages. Hardcoded color values required per-element dark mode overrides, making it easy to miss new elements.
- **Fix:** Restructured demo CSS to use CSS custom properties on `:root`. Light mode defaults on `:root` directly; dark mode block only overrides custom property values. Added `color-scheme: light dark` to `:root`. All color-bearing rules use `var(--color-bg)`, `var(--color-text)`, `var(--color-text-muted)`, `var(--color-surface)`.
- **Files changed:** src/routes/+page.svelte
---

## wheel-picker-snap-broken — Snap and selection update broken due to unintended $effect reactive subscription to physics.offset
- **Date:** 2026-03-23
- **Error patterns:** snap, does not snap, selection update, onSnap, onValueChange, drag, inertia, animateTo, physics, offset, $effect, $state, controlled, untrack
- **Root cause:** The `$effect` for external value changes in WheelPicker.svelte read `physics.currentIndex` (which reads `physics.offset`, a `$state`) without `untrack()`. Svelte tracked `physics.offset` as a dependency, so the effect re-ran on every pointer-move and animation frame. Each re-run called `physics.cancelAnimation()` + `physics.animateTo(controlledIndex)`, snapping the wheel back to the controlled value on every frame and preventing `onSnap` from ever firing. Secondary causes: `ControllableState.#controlledValue` was never updated from prop changes (controlled mode stuck at initial value), and `computeSnapTarget` had the inertia direction inverted.
- **Fix:** (1) Wrapped `physics.currentIndex` read in `untrack(() => physics.currentIndex)` inside the external value `$effect`. (2) Made `ControllableState.#controlledValue` reactive (`$state`) and added `updateControlledValue()` method called from the `$effect`. (3) Inverted velocity sign in `computeSnapTarget` so drag-down carries to lower indices.
- **Files changed:** src/lib/WheelPicker.svelte, src/lib/use-controllable-state.svelte.ts, src/lib/wheel-physics-utils.ts, src/lib/wheel-physics-utils.test.ts, src/lib/use-wheel-physics.svelte.ts
---

## drag-selection-mismatch — Dragging wheel selects wrong item due to ghost row offset not applied in physics calculations
- **Date:** 2026-03-25
- **Error patterns:** drag, selected option, wrong item, mismatch, cherry, elderberry, centered, visual center, offset, ghost, infinite, indexToOffset, offsetToIndex
- **Root cause:** In infinite mode, WheelPicker prepends N before-ghost rows to the options container DOM. The indexToOffset and offsetToIndex functions in wheel-physics-utils.ts do not account for this, computing offsets as if real items start at the container top. This shifts visual centering by N*itemHeight, causing a misalignment of N items between what's visually centered and what's selected.
- **Fix:** Added private #indexToOffset and #offsetToIndex wrapper methods in WheelPhysics that apply a ghost correction (N * itemHeight) when infinite=true, and replaced all 7 direct utility call sites in the class with these wrappers.
- **Files changed:** src/lib/use-wheel-physics.svelte.ts
---

