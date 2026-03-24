# Phase 4: Infinite Loop Mode - Research

**Researched:** 2026-03-24
**Domain:** Infinite scroll wheel picker — ghost item duplication, modulo offset math, translateY coordinate system
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Use 3x duplication — render the options array 3 times in the DOM (one set of ghosts above, the real set, one set of ghosts below). This matches the React version's approach.
- **D-02:** For typical wheel pickers (5-20 items), the DOM cost of 3x duplication is negligible. No virtualization needed.
- **D-03:** Ghost items use the same `data-swp-option`, `data-swp-option-text` attributes as real items. `data-swp-selected` only appears on the real selected item (not ghost copies).
- **D-04:** Normalize (reset) the offset on snap settle — after inertia finishes and the wheel snaps to a position, silently jump the offset to the canonical range (equivalent position within the real items section). No visual glitch since it happens at rest.
- **D-05:** During drag, offset grows unbounded (no modulo in the hot RAF loop). Reset only happens when the animation completes and onSnap fires.
- **D-06:** ArrowDown on the last item animates forward 1 step to the ghost copy of the first item, then the offset silently resets. Same for ArrowUp on first item → animates backward 1 step to ghost of last item.
- **D-07:** Mouse wheel wrapping follows the same pattern — scroll past last item wraps to first via ghost, scroll past first wraps to last.
- **D-08:** Home/End keys behavior in infinite mode: same as finite (jump to first/last enabled option). These are absolute navigation, not relative.
- **D-09:** Add `infinite?: boolean` (default `false`) to `WheelPickerProps` interface in `types.ts`.
- **D-10:** Add `infinite` boolean to `WheelPhysics` constructor config and `update()` method. Physics methods branch internally: `moveDrag()` skips rubber-band resistance when infinite; `endDrag()` uses `wrapIndex()` instead of `clampIndex()` when infinite; `handleWheel()` uses `wrapIndex()` instead of `clampIndex()` when infinite.
- **D-11:** Add `wrapIndex()` utility to `wheel-physics-utils.ts` — modulo-based index wrapping that handles negative indices correctly.

### Claude's Discretion

- Exact implementation of the 3x duplication in the Svelte `{#each}` template (single array vs. three loops)
- How ghost items interact with `selectedIndex` derivation
- Whether `wrapIndex` is a standalone function or integrated into existing `clampIndex`
- Exact offset normalization math in the onSnap callback
- How typeahead search behaves in infinite mode (likely unchanged — search all options, wrap is just visual)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MODE-03 | Infinite loop scrolling mode | Ghost item 3x duplication + modulo offset normalization at rest; physics branches on `infinite` flag; keyboard/wheel wrap via `wrapIndex()` |

</phase_requirements>

---

## Summary

This phase adds a single boolean `infinite` prop to `WheelPicker`. When `true`, the wheel wraps seamlessly at both ends — scrolling or dragging past the last option leads directly to the first, with no visual jump or blank slot.

The implementation strategy is ghost-item duplication: the `{#each}` loop renders the options array three times (before-ghosts + real + after-ghosts), and the `translateY` offset coordinate system is unchanged. The physics engine only deals with indices and offsets; the extra DOM nodes are purely a visual concern. After each snap animation completes, the offset is silently normalized to the canonical "real items" range — the reset happens at rest so it is invisible to the user.

The React reference source (`@ncdai/react-wheel-picker` v1.2.2) uses a fundamentally different 3D cylinder model (`rotateX + translateZ`) rather than a flat `translateY` scroll, so its ghost-item and normalization logic cannot be copied directly. However, the CONTEXT.md decisions already account for this divergence and prescribe the correct translateY-compatible approach. The modulo normalization math from the React source (`((x % n) + n) % n`) is directly reusable for `wrapIndex()`.

**Primary recommendation:** Implement `wrapIndex()` using `((index % n) + n) % n`, add the `infinite` branch inside `WheelPhysics`, and render three `{#each options}` blocks in the template with the middle block marking selected state.

---

## Standard Stack

No new packages required for this phase. All implementation is pure TypeScript and Svelte 5 template changes within the existing stack.

### Supporting (existing, unchanged)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| Svelte 5 | 5.54.1 | Component runtime and runes | `$state`, `$derived` — no changes to usage |
| TypeScript | 5.9.3 | Static typing | `wrapIndex` is a pure function, fully typeable |
| Vitest (unit) | 4.1.0 | Pure logic tests | `wrapIndex` and physics branches are unit-testable in node environment |
| vitest-browser-svelte | 2.1.0 | Component tests | DOM count test for infinite=true (3x options) |

**Version verification:** All versions confirmed against installed `node_modules` and `package.json` — no new installs required.

---

## Architecture Patterns

### Recommended Project Structure (unchanged)

```
src/lib/
├── types.ts                         # Add: infinite?: boolean to WheelPickerProps
├── wheel-physics-utils.ts           # Add: wrapIndex() pure function
├── use-wheel-physics.svelte.ts      # Add: #infinite field, branch in moveDrag/endDrag/handleWheel/currentIndex
└── WheelPicker.svelte               # Add: infinite prop destructure, 3x {#each} blocks, keyboard wrap
```

### Pattern 1: wrapIndex() Modulo Utility

**What:** A pure function that wraps any integer index into `[0, length)` correctly, including negative inputs.

**When to use:** Replaces `clampIndex()` in every place where infinite mode is active: `endDrag()`, `handleWheel()`, `currentIndex` getter, keyboard ArrowUp/Down handlers.

**Math (HIGH confidence — extracted directly from React source v1.2.2):**

```typescript
// Source: @ncdai/react-wheel-picker v1.2.2 dist/index.mjs
// React equivalent: X = (scroll % options.length + options.length) % options.length
export function wrapIndex(index: number, optionsLength: number): number {
  return ((index % optionsLength) + optionsLength) % optionsLength;
}
```

**Why two-step modulo:** In JavaScript, `(-1 % 5)` is `-1` (not `4`). Adding `optionsLength` before the second modulo converts the negative remainder to a positive equivalent. This is the canonical JS modulo-wrap pattern.

**Unit test cases to write:**
- `wrapIndex(0, 5)` → 0
- `wrapIndex(4, 5)` → 4
- `wrapIndex(5, 5)` → 0 (wraps forward)
- `wrapIndex(-1, 5)` → 4 (wraps backward)
- `wrapIndex(-6, 5)` → 4 (wraps multiple times backward)
- `wrapIndex(10, 5)` → 0 (wraps multiple times forward)

### Pattern 2: 3x Ghost Item Rendering

**What:** Render the options array three times in the translateY coordinate space. The middle copy is the "real" section; the copies above and below are ghost copies that make the seam invisible.

**Layout in DOM (when `infinite=true`):**

```
index: -N ... -1       (before-ghosts: copies of options[N-1] down to options[0])
index:  0 ...  N-1     (real items: canonical section)
index:  N ... 2N-1     (after-ghosts: copies of options[0] up to options[N-1])
```

**Svelte 5 template pattern (three explicit `{#each}` blocks — Claude's discretion):**

```svelte
<!-- Source: Architecture decision from CONTEXT.md D-01, D-03 -->
<div style:transform="translateY({physics.offset}px)">
  {#if infinite}
    <!-- Before-ghosts: options rendered N positions above real section -->
    {#each options as option, i}
      <div
        data-swp-option
        data-swp-disabled={option.disabled ? 'true' : undefined}
        class={classNames?.option ?? undefined}
        style:height="{optionItemHeight}px"
        ...
      >
        <span data-swp-option-text ...>{option.label}</span>
      </div>
    {/each}
  {/if}

  <!-- Real items section -->
  {#each options as option, i}
    <div
      data-swp-option
      data-swp-selected={selectedIndex === i ? 'true' : undefined}
      data-swp-disabled={option.disabled ? 'true' : undefined}
      ...
    >
      <span data-swp-option-text ...>{option.label}</span>
    </div>
  {/each}

  {#if infinite}
    <!-- After-ghosts: options rendered N positions below real section -->
    {#each options as option, i}
      <div
        data-swp-option
        data-swp-disabled={option.disabled ? 'true' : undefined}
        class={classNames?.option ?? undefined}
        ...
      >
        <span data-swp-option-text ...>{option.label}</span>
      </div>
    {/each}
  {/if}
</div>
```

**Why three separate `{#each}` blocks instead of a flattened array:** Three explicit blocks keep ghost-item detection in the template rather than in data — the physics system sees only real indices 0..N-1. An alternative (single `{#each}` over a concatenated `[...options, ...options, ...options]`) would work but muddies `selectedIndex` comparison since all three copies share the same original `i` values.

### Pattern 3: Initial Offset for Infinite Mode

**What:** When `infinite=true`, the physics engine must initialize to the "middle section" of the 3x layout.

**Why:** If `initialIndex=0` maps to offset = `(visibleCount/2)*itemHeight` (the real section's position), the ghost section above is visible above the viewport on initialization. The offset for infinite mode must point to the real section's canonical position — which is exactly what `indexToOffset(initialIndex, ...)` already produces since ghost items simply extend the coordinate space.

**Conclusion (HIGH confidence):** `indexToOffset` is unchanged. The offset coordinate where `index=0` in the real section is `Math.floor(visibleCount/2)*itemHeight`. Ghost items at indices `-N` to `-1` sit at offsets greater than this value. Ghost items at indices `N` to `2N-1` sit at offsets less than `indexToOffset(N-1, ...)`. This is self-consistent with the existing coordinate system — no change needed to `indexToOffset`.

### Pattern 4: Offset Normalization on Snap Settle (D-04)

**What:** After `animateTo()` completes and `onSnap` fires, silently reset the offset to the canonical range (real items section). This prevents the internal offset accumulating unboundedly over many wrap cycles.

**Where it happens:** Inside the `onSnap` callback passed to `WheelPhysics` constructor in `WheelPicker.svelte`.

**Math:**

```typescript
// Inside the onSnap callback, when infinite=true:
const wrappedIndex = wrapIndex(index, options.length);
// wrappedIndex is always in [0, N-1]
// Silently snap physics offset to the canonical position for this wrapped index:
physics.jumpTo(wrappedIndex);
// Then update state with the wrapped value:
const opt = options[wrappedIndex];
if (opt && !opt.disabled) {
  state.current = opt.value;
}
```

**Why `jumpTo` not `animateTo`:** `jumpTo` sets `offset` imperatively without animation and cancels any running RAF. Since this runs exactly at animation end (when the wheel is already at rest at the snap point), the jump is from `indexToOffset(rawIndex)` to `indexToOffset(wrappedIndex % N)` — these are the same pixel position mod the full options height, so there is zero visible movement.

**Coordinate verification:** For N options each of height H:
- The real section spans offsets `[indexToOffset(N-1, H, V), indexToOffset(0, H, V)]`
- The after-ghost section starts at `indexToOffset(N, H, V)` = `indexToOffset(0, H, V) - H`
- Snapping to after-ghost index N then jumping back to index 0 moves offset by exactly `N * H` = one full "copy" height — invisible since it's outside the viewport at rest

### Pattern 5: Keyboard Wrap (D-06)

**What:** In `handleKeydown`, when `infinite=true`, ArrowDown on the last item wraps to index 0 (animates through the after-ghost copy of item 0). ArrowUp on index 0 wraps to index N-1 (animates through the before-ghost copy of item N-1).

**Key distinction from finite mode:** In finite mode, `if (next < options.length)` gates the setValue call. In infinite mode, this gate is removed and `wrapIndex()` is used instead.

```typescript
// CONTEXT.md D-06 — infinite keyboard ArrowDown:
case 'ArrowDown': {
  e.preventDefault();
  if (infinite) {
    let next = currentIdx + 1;
    while (options[wrapIndex(next, options.length)]?.disabled) next++;
    setValue(wrapIndex(next, options.length));
  } else {
    // existing finite logic unchanged
  }
  break;
}
```

**Note:** The `while` loop for skipping disabled options in infinite mode must also use `wrapIndex()` to avoid running past the array length. The loop condition needs a maximum iteration count guard (at most `options.length` iterations) to prevent infinite loop if all options are disabled.

### Pattern 6: moveDrag Rubber-Band Bypass (D-10)

**What:** In `WheelPhysics.moveDrag()`, the rubber-band resistance is applied when `newOffset > maxOffset || newOffset < minOffset`. In infinite mode, this resistance must be skipped — there are no boundaries.

**Implementation:**

```typescript
// In moveDrag(), change the boundary resistance block:
if (!this.#infinite) {
  if (newOffset > maxOffset) {
    newOffset = maxOffset + (newOffset - maxOffset) * RESISTANCE;
  } else if (newOffset < minOffset) {
    newOffset = minOffset + (newOffset - minOffset) * RESISTANCE;
  }
}
```

### Anti-Patterns to Avoid

- **Modulo in the RAF hot loop:** Do NOT call `wrapIndex()` on every RAF tick during animation. The offset is allowed to grow unbounded during animation (D-05). Normalization happens only at snap settle. Calling modulo per-tick would cause the visual position to jump on every frame.
- **Running `wrapIndex` on pixel offsets:** `wrapIndex` operates on indices (integers), not pixel offsets. Always convert offset to index first with `offsetToIndex()`, then wrap, then convert back if needed.
- **Three-way duplication for tiny option lists:** For a list with 1 option, the ghost copies still work fine (the single item appears 3 times). No special case needed — `wrapIndex(x, 1)` always returns 0.
- **data-swp-selected on ghost items:** Ghost copies must not carry `data-swp-selected="true"` — only the real center section item. Consumer CSS that targets `[data-swp-selected="true"]` would incorrectly highlight ghost items.
- **Forgetting to pass `infinite` to the physics constructor AND update():** If `update()` doesn't receive the `infinite` flag, hot-reloads during development that change the prop will leave the physics engine in the wrong mode.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Negative modulo | Custom sign-check branches | `((x % n) + n) % n` | Two-line formula handles all cases; custom branches are error-prone with edge cases like `x = -n` |
| Ghost item construction | Custom `virtualItems` array with metadata | Three plain `{#each options}` blocks | Metadata on ghost items couples rendering to physics; three pure render loops keep them decoupled |

---

## Common Pitfalls

### Pitfall 1: `currentIndex` getter uses `clampIndex` — must branch on `infinite`

**What goes wrong:** The `get currentIndex()` in `WheelPhysics` calls `clampIndex()`. In infinite mode with the offset at a ghost position (e.g., past the last real item), `offsetToIndex` returns an out-of-range value like `N` or `-1`. Clamping this to `[0, N-1]` gives the wrong real index; wrapping gives the correct one.

**Root cause:** `currentIndex` is read in `WheelPicker.svelte` in the `$effect` that responds to external `value` prop changes: `idx !== untrack(() => physics.currentIndex)`. If `currentIndex` returns a clamped value instead of a wrapped one during a wrap animation, the effect may trigger a redundant `animateTo`.

**How to avoid:** Add the `infinite` branch to the `get currentIndex()` getter:

```typescript
get currentIndex(): number {
  const raw = offsetToIndex(this.offset, this.#itemHeight, this.#visibleCount);
  return this.#infinite ? wrapIndex(raw, this.#options.length) : clampIndex(raw, this.#options.length);
}
```

**Warning signs:** In testing, navigating to the last item then pressing ArrowDown causes the wheel to animate backward (the wrong direction) instead of forward to the ghost.

### Pitfall 2: Offset normalization must fire AFTER the animation fully settles

**What goes wrong:** If `jumpTo(wrappedIndex)` is called while the RAF animation is still running, it cancels the in-flight animation mid-frame. The wheel appears to stutter or jump to the wrong position.

**Root cause:** The normalization path calls `physics.jumpTo()` which calls `#cancelRaf()` internally. This is safe only when called from inside the `onSnap` callback — which fires exactly at animation completion (after `this.#animating = false`).

**How to avoid:** Normalization must occur only in the `onSnap` callback, not in any `$effect` or event handler that might fire during animation.

### Pitfall 3: The before-ghost section must render options in reverse visual order

**What goes wrong:** If the before-ghost section renders options in the same order as the real section (`options[0]` at the top), dragging upward from the first real item reveals item 0 again instead of item N-1, creating a visible discontinuity.

**Root cause:** The before-ghost section occupies the space *above* the real section in the `translateY` coordinate system. As the user drags downward (increasing offset), higher offset values reveal earlier items in the DOM. So the before-ghost at position `-1` (just above real item 0) must visually show `options[N-1]`, and position `-N` must show `options[0]`.

**How to avoid:** The before-ghost `{#each}` renders options in reversed order:

```svelte
<!-- Before-ghosts: must be reversed so options[N-1] appears just above the real section -->
{#each [...options].reverse() as option}
  <div data-swp-option ...>
```

OR equivalently with index math: `options[options.length - 1 - i]` for index `i` in the loop.

**Verification:** With `options = ['A', 'B', 'C']` and the wheel at item 'A', dragging down should reveal 'C' above (not 'A' again).

### Pitfall 4: `endDrag` inertia `computeSnapTarget` may return out-of-range index

**What goes wrong:** `computeSnapTarget` computes an overshoot target that may be well beyond `[0, N-1]` (e.g., `N+5` or `-3`). In finite mode, `clampIndex` brings it back to the range. In infinite mode, `wrapIndex` should be applied instead — but `snapToNearestEnabled` still expects an index in `[0, N-1]`.

**How to avoid:** Apply `wrapIndex` before `snapToNearestEnabled`:

```typescript
// In endDrag(), infinite branch:
const rawTarget = computeSnapTarget(currentIndex, velocity, this.#dragSensitivity);
const wrapped = wrapIndex(rawTarget, this.#options.length);
const snapIndex = snapToNearestEnabled(wrapped, this.#options);
this.animateTo(snapIndex);
```

Note: `snapToNearestEnabled` remains unchanged — it only needs valid indices within `[0, N-1]`.

### Pitfall 5: `animateTo` distance calculation with ghost indices

**What goes wrong:** `animateTo(targetIndex)` computes `distance` as `Math.abs(targetIndex - offsetToIndex(startOffset, ...))`. When crossing the wrap boundary (e.g., animating from index 0 to ghost index N via the after-ghost section), the `targetIndex` passed is the real wrapped index (0 or N-1 after normalization), not the ghost index. This means the animation travels through the ghost region correctly, but if `animateTo` is called with the wrapped real index instead of the ghost index, the animation goes the wrong direction.

**Root cause:** The snap normalization (D-04) calls `jumpTo(wrappedIndex)` AFTER the animation completes. The animation itself must be called with the *ghost* index — e.g., index `N` when wrapping from item `N-1` forward to item `0`.

**How to avoid:** For keyboard and wheel wrapping (D-06, D-07), `animateTo` must receive the extended index (ghost position), not the canonical wrapped index. The normalization back to real-item index happens in `onSnap`, not before.

Example: ArrowDown from item `N-1`:
1. `next = currentIdx + 1` → `next = N` (this is the after-ghost copy of item 0)
2. Call `physics.animateTo(N)` — animates forward through the ghost section
3. `onSnap(N)` fires → `wrappedIndex = wrapIndex(N, N) = 0` → `physics.jumpTo(0)` → normalizes offset

This means `animateTo` must support indices beyond `[0, N-1]` — it currently does since it just uses `indexToOffset(targetIndex, ...)` with no clamping. **HIGH confidence: `animateTo` works correctly with extended indices as-is.**

---

## Code Examples

### wrapIndex() — the critical primitive

```typescript
// Source: Derived from @ncdai/react-wheel-picker v1.2.2 dist/index.mjs
// Original React: X = (scroll % options.length + options.length) % options.length
// Adapted to index-based form for wheel-physics-utils.ts

export function wrapIndex(index: number, optionsLength: number): number {
  return ((index % optionsLength) + optionsLength) % optionsLength;
}
```

### WheelPhysics constructor (diff summary)

```typescript
constructor(opts: {
  // ... existing fields ...
  infinite?: boolean;   // NEW
  onSnap: (index: number) => void;
}) {
  // ... existing assignments ...
  this.#infinite = opts.infinite ?? false;
  // ...
}
```

### moveDrag boundary check

```typescript
moveDrag(clientY: number): void {
  // ... existing delta calculation ...
  let newOffset = this.#dragStartOffset + delta;

  // Rubber-band resistance — only in finite mode (D-10)
  if (!this.#infinite) {
    if (newOffset > maxOffset) {
      newOffset = maxOffset + (newOffset - maxOffset) * RESISTANCE;
    } else if (newOffset < minOffset) {
      newOffset = minOffset + (newOffset - minOffset) * RESISTANCE;
    }
  }

  this.offset = newOffset;
  // ... yList tracking ...
}
```

### onSnap normalization in WheelPicker.svelte

```typescript
// Source: Architecture decision D-04 / CONTEXT.md
onSnap: (index: number) => {
  if (infinite) {
    const wrappedIndex = wrapIndex(index, options.length);
    physics.jumpTo(wrappedIndex);
    const opt = options[wrappedIndex];
    if (opt && !opt.disabled) {
      state.current = opt.value;
    }
  } else {
    // existing finite path unchanged
    const opt = options[index];
    if (opt && !opt.disabled) {
      state.current = opt.value;
    }
  }
}
```

### Before-ghost rendering (reversed order)

```svelte
<!-- Source: Pitfall 3 analysis — before-ghosts must reverse so options[N-1] is just above real section -->
{#if infinite}
  {#each [...options].reverse() as option}
    <div
      data-swp-option
      data-swp-disabled={option.disabled ? 'true' : undefined}
      class={classNames?.option ?? undefined}
      style:height="{optionItemHeight}px"
      style:display="flex"
      style:align-items="center"
      style:justify-content="center"
      role="option"
      aria-selected={false}
    >
      <span data-swp-option-text class={classNames?.optionText ?? undefined}>
        {option.label}
      </span>
    </div>
  {/each}
{/if}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| 3D rotating cylinder (CSS `rotateX + translateZ`) — React v1.2.2 uses this | Flat `translateY` with ghost-item duplication | Our approach is simpler to reason about and matches the existing coordinate system. The React approach requires CSS 3D perspective which we explicitly do not use. |
| Modulo on every animation tick | Modulo only at snap settle (D-05) | Avoids visual glitch; keeps the hot RAF path free of branching |

---

## Open Questions

1. **`snapToNearestEnabled` in infinite mode with all-disabled options**
   - What we know: If all options are disabled, `snapToNearestEnabled` returns `targetIndex` unchanged. In infinite mode, `targetIndex` after `wrapIndex` is always in `[0, N-1]`, so this is safe.
   - What's unclear: Whether `snapToNearestEnabled` should itself be made infinite-aware (wrap when searching for nearest enabled option, rather than stopping at array boundaries).
   - Recommendation: For phase 4, leave `snapToNearestEnabled` unchanged. The disabled-option walk in the function already handles all indices in `[0, N-1]` correctly. Only the *input* to the function needs to be wrapped.

2. **Demo page — should `infinite` be demonstrated?**
   - What we know: Phase 4 is UI-flagged (`ui_phase: true`), so the demo page at `src/routes/+page.svelte` should be updated.
   - Recommendation: Add a third wheel section with `infinite={true}` to `+page.svelte` to visually confirm the feature works.

---

## Environment Availability

Step 2.6: SKIPPED (no new external dependencies — phase is pure TypeScript/Svelte code changes with no new tools, runtimes, or services required)

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (dual-project: unit/node + browser/playwright) |
| Quick run command | `npx vitest run --project unit` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MODE-03 | `wrapIndex(5, 5) === 0`, `wrapIndex(-1, 5) === 4` | unit | `npx vitest run --project unit` | ❌ Wave 0 — add to `wheel-physics-utils.test.ts` |
| MODE-03 | `WheelPhysics` with `infinite=true` skips rubber-band in `moveDrag` | unit | `npx vitest run --project unit` | ❌ Wave 0 — add to new `use-wheel-physics.test.ts` or inline |
| MODE-03 | When `infinite={true}`, DOM contains 3x options.length `[data-swp-option]` elements | browser | `npx vitest run --project browser` | ❌ Wave 0 — add to `WheelPicker.test.ts` |
| MODE-03 | When `infinite={false}` (default), DOM contains exactly options.length `[data-swp-option]` elements | browser | `npx vitest run --project browser` | ✅ Existing test "renders option rows" implicitly covers this; explicit test preferred |
| MODE-03 | Ghost items do not carry `data-swp-selected` attribute | browser | `npx vitest run --project browser` | ❌ Wave 0 — add to `WheelPicker.test.ts` |

### Sampling Rate

- **Per task commit:** `npx vitest run --project unit`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/wheel-physics-utils.test.ts` — add `wrapIndex` test suite (covers MODE-03 pure math)
- [ ] `src/lib/WheelPicker.test.ts` — add: "renders 3x option count when infinite=true", "ghost items lack data-swp-selected"
- [ ] No new test file needed — `wrapIndex` slots into existing `wheel-physics-utils.test.ts`

---

## Sources

### Primary (HIGH confidence)

- `@ncdai/react-wheel-picker` v1.2.2 `dist/index.mjs` — direct inspection of minified source; identified `wrapIndex` equivalent formula, ghost item rendering logic, infinite mode physics branches
- `.planning/phases/04-infinite-loop-mode/04-CONTEXT.md` — locked implementation decisions D-01 through D-11
- `src/lib/use-wheel-physics.svelte.ts` — direct code read; identified all branch points for `infinite` flag
- `src/lib/wheel-physics-utils.ts` — direct code read; identified `clampIndex` as template for `wrapIndex`
- `src/lib/WheelPicker.svelte` — direct code read; identified keyboard handler, template structure, `{#each}` loop

### Secondary (MEDIUM confidence)

- Phase 3 accumulated decisions in `STATE.md` — confirms class-based physics pattern, `$state` offset field, RAF loop design

### Tertiary (LOW confidence — none)

N/A — all critical claims are grounded in direct source inspection.

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 4 |
|-----------|-------------------|
| Svelte 5 with runes only — no stores | `infinite` state in `WheelPhysics` is a plain private field, not `$state` (non-reactive config) |
| Zero runtime dependencies | No new packages; `wrapIndex` is a pure function |
| Headless — no CSS shipped | Ghost items use no inline styles beyond `height`/`display`/`align-items` (same as existing items) |
| Data attributes for CSS targeting | Ghost items carry `data-swp-option` and `data-swp-option-text`; no `data-swp-selected` on ghosts (D-03) |
| API parity with React version | `infinite?: boolean` prop name matches React's prop name |
| `sideEffects: false` | Phase 4 adds no new module-level side effects |

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — no new packages; all existing tools confirmed working
- Architecture (wrapIndex math): HIGH — formula extracted directly from React v1.2.2 source
- Architecture (ghost layout): HIGH — derived from first principles of the existing `translateY` coordinate system
- Architecture (offset normalization): HIGH — follows from coordinate math with no ambiguity
- Pitfall (before-ghost reverse order): HIGH — direct consequence of the coordinate system; verified by hand calculation
- Pitfall (extended index in animateTo): HIGH — existing code confirmed to have no clamping in `animateTo`

**Research date:** 2026-03-24
**Valid until:** 2026-05-24 (stable domain — math doesn't change; Svelte 5 API is stable)
