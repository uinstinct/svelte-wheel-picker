# Phase 3: WheelPicker Core — Research

**Researched:** 2026-03-23
**Domain:** Svelte 5 component, pointer/touch/wheel events, RAF-based inertia physics, snap animation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01: Scrolling Mechanism** — JS-driven translateY + requestAnimationFrame (RAF) for all scrolling. No CSS scroll snap. Pointer/touch events track delta → update a JS offset → CSS transform applied each frame. On release: inertia decay loop (friction applied per RAF frame until velocity < threshold). Then snap: animate to nearest item index.

**D-02: Physics Constants** — Copy React source physics constants exactly from `@ncdai/react-wheel-picker` v1.2.2. Do not invent our own. Goal is UX parity.

**D-03: Data Attribute Prefix** — `data-swp-*` (Svelte Wheel Picker). Structural attributes:
```
data-swp-wrapper     → outer container div
data-swp-option      → each option row
data-swp-option-text → text span inside each option
data-swp-selection   → center selection highlight overlay
```

**D-04: State Data Attributes** — Applied only when true (never emit `="false"`):
```
data-swp-selected="true"  → currently selected option
data-swp-disabled="true"  → disabled option
```

**D-05: Mid-Flight Value Update** — When external `value` prop changes while inertia is animating, cancel inertia immediately and animate the wheel quickly to the new value's position. External value always wins.

**D-06: visibleCount Default** — `5` (matching the React version's UX, not its code default of 20).

**D-07: visibleCount Constraint** — Must be an odd number. If even is passed, emit `console.warn` and round up to the nearest odd.

**D-08: Props Extension** — Add `visibleCount`, `dragSensitivity`, `scrollSensitivity`, `optionItemHeight` to `WheelPickerProps` in `src/lib/types.ts`. Optional with documented defaults. `infinite` prop is NOT added (Phase 4).

**D-09: DOM Structure Contract** — Carries forward Phase 2 D-01. `WheelPickerClassNames` element names (`wrapper`, `option`, `optionText`, `selection`) map exactly to DOM elements with their `data-swp-*` attributes.

### Claude's Discretion

- Exact RAF loop implementation and how `$state` integrates with animation frame callbacks
- How to cancel an in-progress RAF loop (cancel token / boolean flag)
- Whether `useControllableState` is called directly inside WheelPicker.svelte or wrapped in a thin adapter
- Selection overlay DOM placement (before/after options list, or absolutely positioned within wrapper)
- Exact snap animation curve (linear vs. ease-out) — use React source as reference
- Test strategy for inertia (unit test physics in isolation vs. integration test in browser)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMP-01 | WheelPicker single-wheel scrollable component | DOM structure, RAF loop, event handling patterns below |
| INTR-01 | Touch drag scrolling with inertia (exponential decay) | React physics constants extracted; pointer event pattern documented |
| INTR-02 | Mouse drag scrolling with inertia | Same pointer event path as touch (unified pointerdown/move/up) |
| INTR-03 | Mouse wheel/trackpad scroll with sensitivity control | Wheel event handler pattern + 100ms debounce documented |
| INTR-04 | Snap-to-item on release | Snap index calculation from React source: `Math.round(offset / itemHeight)` |
| INTR-05 | Keyboard navigation (Arrow Up/Down, Home, End) | Keydown handler, disabled skip logic, `useTypeaheadSearch` integration |
| MODE-04 | Disabled option support (skip in keyboard/drag) | Skip logic in snap + keyboard handlers; `data-swp-disabled` attribute |
| STYL-01 | Selection highlight overlay | Absolutely positioned `data-swp-selection` div, height = `optionItemHeight` |
| STYL-02 | classNames prop for per-element class injection | Merge consumer class onto element alongside `data-swp-*` attribute |
| STYL-03 | Data attributes (`data-swp-*`) for CSS targeting | Full attribute map defined in D-03, D-04 |
| STYL-04 | Configurable visibleCount, dragSensitivity, scrollSensitivity, optionItemHeight | Props added to `WheelPickerProps`; defaults from React source |
</phase_requirements>

---

## Summary

Phase 3 is the highest-risk phase in the project. It replaces a placeholder `<div>` with a fully interactive iOS-style wheel picker. The core challenge is a custom physics engine: pointer events feed a velocity vector, a RAF loop decays that velocity with friction, then a snap animation settles the wheel to the nearest item. All of this is pure JavaScript operating CSS transforms — no browser scroll APIs, no CSS scroll snap.

The React source (`@ncdai/react-wheel-picker` v1.2.2) has been analyzed. Its implementation uses a 3D cylinder rendering model (`rotateX` + `translateZ`) which is architecturally different from our flat `translateY` approach. However, its **physics constants** (friction coefficient, max velocity, easing function, scroll event debounce) are universal and directly portable. The key constants have been extracted and are documented below.

Svelte 5 provides a clean model for this: `$state` holds the animated offset value, a `$effect` managing the RAF loop reads/writes it, and `$effect` cleanup (`return () => cancelAnimationFrame(id)`) handles teardown. The class-based rune hook pattern (established in Phase 2) is the right home for the inertia state machine.

**Primary recommendation:** Build the inertia and snap logic as a standalone class (`WheelPhysics` or similar) with `.svelte.ts` extension so it holds `$state` privately and can be unit-tested in isolation. `WheelPicker.svelte` instantiates it and wires DOM events.

---

## Standard Stack

### Core (no new dependencies — zero runtime deps constraint)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Svelte 5 | 5.54.1 | `$state`, `$effect`, `$props`, `$derived` | Project requirement; runes are the reactive model |
| TypeScript | 5.9.3 | Prop types, internal types | Project requirement |
| Browser APIs | native | `requestAnimationFrame`, `PointerEvent`, `WheelEvent`, `KeyboardEvent` | No library needed; these are stable APIs |

No new npm packages are added in Phase 3. The zero-runtime-dependencies constraint from CLAUDE.md is maintained.

### Supporting (existing, already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useControllableState` | Phase 2 | Controlled/uncontrolled value state | Wire to `value`/`defaultValue`/`onValueChange` props |
| `useTypeaheadSearch` | Phase 2 | Keystroke accumulation, option matching | Wire to `keydown` handler |
| `WheelPickerProps` | Phase 2 | Base prop interface to extend | Add new props in `src/lib/types.ts` |

**No installation needed.**

---

## Architecture Patterns

### Recommended Project Structure (no changes to layout)

```
src/lib/
├── WheelPicker.svelte           # Main component (replace placeholder)
├── use-wheel-physics.svelte.ts  # RAF loop, inertia, snap (new — Claude's discretion)
├── use-controllable-state.svelte.ts  # Phase 2 (reuse)
├── use-typeahead-search.svelte.ts    # Phase 2 (reuse)
├── types.ts                          # Phase 2 (extend with new props)
└── index.ts                          # Phase 2 (add exports if new hook added)
```

The `use-wheel-physics.svelte.ts` file is the key architectural addition. It encapsulates the physics state machine so it can be tested without a DOM.

### Pattern 1: RAF Loop with $effect Cleanup

The Svelte 5 pattern for a long-running animation loop that must be cancellable:

```typescript
// Source: https://svelte.dev/docs/svelte/$effect
// In a .svelte.ts class or inside a component $effect:

class WheelPhysics {
  #rafId: number | null = null;
  offset = $state(0); // the translateY value

  startInertia(initialVelocity: number, itemHeight: number) {
    this.#cancelRaf();
    // ... set up inertia state
    const tick = () => {
      // apply friction per frame, update this.offset
      if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
        this.#rafId = requestAnimationFrame(tick);
      } else {
        this.#snapToNearest(itemHeight);
      }
    };
    this.#rafId = requestAnimationFrame(tick);
  }

  #cancelRaf() {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  destroy() {
    this.#cancelRaf();
  }
}
```

In `WheelPicker.svelte`, the `$effect` cleanup calls `destroy()`:
```svelte
<script lang="ts">
  const physics = new WheelPhysics();

  $effect(() => {
    return () => physics.destroy();
  });
</script>
```

### Pattern 2: Unified Pointer Event Handler (touch + mouse)

Use `PointerEvent` API — a single unified handler covers both touch and mouse drag. This is the standard approach for modern gesture handling:

```typescript
// Source: MDN PointerEvent API, HIGH confidence
function onPointerDown(e: PointerEvent) {
  e.currentTarget.setPointerCapture(e.pointerId);
  // record start Y, timestamp
}

function onPointerMove(e: PointerEvent) {
  // track delta, push to yList for velocity calculation
}

function onPointerUp(e: PointerEvent) {
  e.currentTarget.releasePointerCapture(e.pointerId);
  // calculate velocity from yList, kick off inertia
}
```

`setPointerCapture` ensures `pointermove` events continue even if the pointer leaves the element boundary — critical for smooth drag feel.

### Pattern 3: CSS Transform-Based Rendering

The wheel scroll position is purely a CSS transform. No DOM reordering, no scroll container. The options list is a single `div` with `transform: translateY(${offset}px)`:

```svelte
<div
  data-swp-wrapper
  class={classNames?.wrapper}
  style:height="{visibleCount * optionItemHeight}px"
  style:overflow="hidden"
  style:position="relative"
>
  <!-- Selection overlay (absolutely positioned) -->
  <div
    data-swp-selection
    class={classNames?.selection}
    style:position="absolute"
    style:top="{Math.floor(visibleCount / 2) * optionItemHeight}px"
    style:height="{optionItemHeight}px"
    style:pointer-events="none"
    style:width="100%"
  ></div>

  <!-- Options list — translated by physics offset -->
  <div style:transform="translateY({physics.offset}px)">
    {#each options as option, i}
      <div
        data-swp-option
        data-swp-selected={selectedIndex === i ? 'true' : undefined}
        data-swp-disabled={option.disabled ? 'true' : undefined}
        class={classNames?.option}
        style:height="{optionItemHeight}px"
      >
        <span data-swp-option-text class={classNames?.optionText}>
          {option.label}
        </span>
      </div>
    {/each}
  </div>
</div>
```

**Key:** `data-swp-selected={undefined}` — when the attribute value is `undefined`, Svelte omits the attribute entirely. This satisfies the "absent = false" rule from D-04/UI-SPEC.

### Pattern 4: Offset ↔ Index Mapping

The wheel offset is the `translateY` value applied to the options list. The coordinate origin is at the TOP of the wrapper. Index 0 is at the top.

```
offset = -(selectedIndex * optionItemHeight) + (Math.floor(visibleCount / 2) * optionItemHeight)
```

The center visual slot is at `y = Math.floor(visibleCount / 2) * optionItemHeight` from the top of the wrapper. So the initial offset to show index 0 centered is `+centerSlotY` (positive), and dragging up (scrolling down) increases the negative component.

Snap target index from current offset:
```typescript
function offsetToIndex(offset: number, itemHeight: number): number {
  const centerSlotY = Math.floor(visibleCount / 2) * itemHeight;
  return Math.round((centerSlotY - offset) / itemHeight);
}
```

Clamp to `[0, options.length - 1]` for finite mode.

### Pattern 5: Keyboard Navigation with Disabled Skip

```typescript
function handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault();
      const next = findNextEnabled(selectedIndex, +1);
      if (next !== -1) setValue(next);
      break;
    }
    case 'ArrowUp': {
      e.preventDefault();
      const next = findNextEnabled(selectedIndex, -1);
      if (next !== -1) setValue(next);
      break;
    }
    case 'Home': {
      e.preventDefault();
      const first = options.findIndex(o => !o.disabled);
      if (first !== -1) setValue(first);
      break;
    }
    case 'End': {
      e.preventDefault();
      const last = [...options].reverse().findIndex(o => !o.disabled);
      if (last !== -1) setValue(options.length - 1 - last);
      break;
    }
    default: {
      // Delegate to typeahead
      const result = typeahead.search(e.key, options, selectedIndex);
      if (result !== -1) setValue(result);
    }
  }
}

function findNextEnabled(from: number, direction: 1 | -1): number {
  let i = from + direction;
  while (i >= 0 && i < options.length) {
    if (!options[i].disabled) return i;
    i += direction;
  }
  return -1;
}
```

### Pattern 6: Snap in Disabled-Option-Aware Mode

When inertia ends, snap to the nearest ENABLED option — not just the nearest by index distance. If the nearest index is disabled, walk outward in both directions to find the nearest enabled one:

```typescript
function snapToNearestEnabled(targetIndex: number): number {
  if (!options[targetIndex]?.disabled) return targetIndex;
  // walk outward
  for (let delta = 1; delta < options.length; delta++) {
    const lower = targetIndex - delta;
    const upper = targetIndex + delta;
    if (lower >= 0 && !options[lower].disabled) return lower;
    if (upper < options.length && !options[upper].disabled) return upper;
  }
  return targetIndex; // all disabled (edge case)
}
```

### Anti-Patterns to Avoid

- **Using CSS overflow scroll + scroll-snap:** Cannot tune inertia feel, cannot observe the scroll position reactively in the same way. Locked decision D-01 prohibits this.
- **Mutating offset from inside `$effect` reactively:** If `offset` is a `$state` and the RAF loop both reads and sets it, avoid creating a reactive cycle. The RAF loop should run imperatively (setting `offset` in the tick function without reading it as a reactive dependency).
- **Re-rendering the options list on every frame:** The `translateY` is applied to a wrapper `div`, not to individual option elements. Svelte's reactivity is sufficient — `style:transform={...}` binds to a `$state` value, Svelte diffs it, no loop needed inside the template.
- **Using `$effect` for the inertia loop itself:** The RAF loop runs imperatively, not as a reactive `$effect`. `$effect` is only used for lifecycle hooks (mount setup, unmount cleanup). This avoids accidental re-triggering of the loop on state changes.
- **Forgetting `tabIndex` on the wrapper:** The wheel must be focusable for keyboard navigation to work. Add `tabindex="0"` to `data-swp-wrapper`.
- **Not calling `setPointerCapture`:** Without pointer capture, `pointermove` events stop when the cursor leaves the element. This causes the drag to "drop" mid-gesture.

---

## Physics Constants (from React Source v1.2.2)

These constants were extracted from the compiled `@ncdai/react-wheel-picker@1.2.2` bundle (HIGH confidence — directly from source).

| Constant | Value | Purpose |
|----------|-------|---------|
| `RESISTANCE` | `0.3` | Multiplier applied when dragging beyond list bounds (top/bottom) |
| `MAX_VELOCITY` | `30` | Velocity ceiling (items/second) — clamps inertia speed |
| `dragSensitivity` default | `3` | Default multiplier for pointer delta |
| `scrollSensitivity` default | `5` | Default multiplier for wheel event delta |
| `optionItemHeight` default | `30` (px) | Default option row height |
| `visibleCount` default | `5` (our version — see D-06) | React uses 20 for a 3D cylinder; our flat layout uses 5 |
| Easing function | `(p) => Math.pow(p - 1, 3) + 1` | Cubic ease-out applied to animation progress (0→1) |
| `baseDeceleration` | `dragSensitivity * 10` | = `30` with default dragSensitivity |
| `snapBackDeceleration` | `10` | Fixed — used when snapping back from out-of-bounds position |

**Velocity calculation (from pointer events):**
```typescript
// From last 5 pointer positions (yList = [[y, timestamp], ...])
const [y1, t1] = yList.at(-2);
const [y2, t2] = yList.at(-1);
const velocityPerSecond = ((y2 - y1) / itemHeight) * 1000 / (t2 - t1);
const velocity = Math.sign(velocityPerSecond) * Math.min(Math.abs(velocityPerSecond), MAX_VELOCITY);
```

**Duration calculation (distance-based, not time-based):**
```typescript
// React uses sqrt(distance / sensitivity) for duration
// This means longer throws produce longer (but not proportionally longer) animations
const duration = Math.sqrt(Math.abs(distance) / scrollSensitivity);
```

**Snap target from velocity (with overshoot):**
```typescript
// React: n = Math.round(currentIndex + overshootFraction)
// where overshootFraction = 0.5 * velocity * velocity / deceleration
// Then clamped to [0, options.length - 1]
const overshoot = 0.5 * velocity * velocity / baseDeceleration;
const rawTarget = currentIndexFromOffset + Math.sign(velocity) * overshoot;
const snapTarget = Math.round(rawTarget);
```

**Important discrepancy — visibleCount default:**
The React source uses `visibleCount: 20` as its default because it renders a 3D cylinder where 20 items are distributed across 360° of rotation (using `>> 2` bitwise for quarter-count geometry). Our flat `translateY` layout has no such constraint. Decision D-06 locks our default to `5` to match the React *UX* (5 visible items) not its *implementation detail*.

**Note on the 3D approach:** The React component renders items with `rotateX(${angle}deg) translateZ(${radius}px)` CSS 3D transforms to create a physical cylinder illusion. Our implementation uses a simpler flat `translateY` approach. This is an intentional architecture difference. The physics constants (friction, easing, velocity math) are portable; the rendering math (angles, radius) is not relevant to us.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cubic ease-out function | Custom polynomial | `(p) => Math.pow(p - 1, 3) + 1` | Already verified from React source; this exact formula is standard |
| Controlled/uncontrolled state | Custom `$state` + props dance | `useControllableState` from Phase 2 | Handles edge cases (undefined controlled value, callback timing) |
| Type-ahead search | Custom keystroke buffer | `useTypeaheadSearch` from Phase 2 | Already implemented with same-key cycling |
| Pointer unification | Separate touch/mouse handlers | `PointerEvent` API | Browser-native, single code path for both input methods |
| CSS Scroll behavior | `overflow: scroll` + snap | RAF + `translateY` | Required by D-01 — custom inertia feel is the product requirement |

**Key insight:** The inertia physics is genuinely custom work — no library provides the exact tunable feel required. But the math is straightforward: cubic easing + distance/velocity integration. The danger is in the event handling plumbing; `PointerEvent` eliminates the need to write separate touch/mouse branches.

---

## Common Pitfalls

### Pitfall 1: Forgetting setPointerCapture
**What goes wrong:** Drag gesture "drops" when pointer leaves the component bounds mid-drag. The cursor slides off the edge, `pointermove` stops firing, and the wheel snaps to an unexpected position.
**Why it happens:** Without capture, pointer events are only dispatched to the element under the pointer.
**How to avoid:** Call `e.currentTarget.setPointerCapture(e.pointerId)` in `pointerdown`, and `releasePointerCapture(e.pointerId)` in `pointerup`/`pointercancel`.
**Warning signs:** Drag works perfectly when moving slowly but breaks on fast gestures.

### Pitfall 2: Reactive Cycle in RAF Loop
**What goes wrong:** If `offset` is a `$state` and the `$effect` that starts the RAF loop depends on `offset`, the effect re-runs every frame, spawning a new RAF loop each time.
**Why it happens:** `$effect` re-runs when any `$state` it reads changes. An RAF loop that reads and writes `offset` is a reactive cycle.
**How to avoid:** Run the RAF loop imperatively (called from event handlers, not from `$effect`). Use `$effect` only for lifecycle (mount/unmount). The RAFid and velocity are private state inside the physics class — not `$state`, just regular class fields.
**Warning signs:** Exponentially increasing CPU usage during scroll; multiple simultaneous animations.

### Pitfall 3: visibleCount Even-Number Silent Failure
**What goes wrong:** Consumer passes `visibleCount={4}`. The component renders with 4 visible rows, no center row exists, the selection overlay aligns to a gap between two rows.
**Why it happens:** `Math.floor(visibleCount / 2)` with an even `visibleCount` points between items.
**How to avoid:** Implement D-07: validate in component init, `console.warn`, round up to 5. This is a `$derived` calculation that fires immediately on prop receipt.
**Warning signs:** Selection highlight visually misaligned with center option.

### Pitfall 4: Mid-Flight Value Change Not Cancelling RAF
**What goes wrong:** Parent updates `value` prop while inertia is still running. The RAF loop continues to update `offset`, fighting against the `$effect` that should be animating to the new value. The wheel jitters or lands on the wrong item.
**Why it happens:** Two animation loops operating the same `offset` variable simultaneously.
**How to avoid:** Implement D-05: a `$effect` watches the `value` prop. When it changes, call `physics.cancelRaf()` then start a new quick snap animation to the new value's offset.
**Warning signs:** Wheel lands on wrong option when parent updates value during a throw.

### Pitfall 5: Snap Targeting a Disabled Option
**What goes wrong:** User throws the wheel and it decelerates, landing on a disabled option that cannot be selected. `onValueChange` is called with a disabled option's value.
**Why it happens:** Raw `Math.round(offset / itemHeight)` snap math ignores `disabled` flags.
**How to avoid:** After computing the raw snap index, run `snapToNearestEnabled(rawIndex, options)` to walk to the nearest enabled neighbor. Apply this in all snap paths: post-inertia, post-drag-release, and post-boundary-bounce.
**Warning signs:** `onValueChange` fires with disabled option values; disabled items appear selected.

### Pitfall 6: Wheel Event Rapid Firing
**What goes wrong:** A single scroll wheel tick fires `wheel` event 5-10 times per physical notch on some mice/trackpads. Without debouncing, each event starts a new animation, causing rapid stutter.
**Why it happens:** OS-level wheel event multiplexing varies by device.
**How to avoid:** Implement the React pattern: 100ms debounce on wheel events (track last event timestamp; ignore events within 100ms of the previous one). Each wheel event animates by exactly 1 item.
**Warning signs:** Scroll wheel skips multiple options per notch on trackpad or scrolling mouse.

### Pitfall 7: WheelPicker.svelte `$props()` vs WheelPickerProps type mismatch
**What goes wrong:** The component's `$props()` destructure does not match the extended `WheelPickerProps` interface because `WheelPickerProps` in `types.ts` hasn't been updated with the new props yet.
**Why it happens:** The props extension (D-08) must happen in `types.ts` before `WheelPicker.svelte` can use them.
**How to avoid:** Plan order: update `types.ts` (Task 1) → build WheelPicker.svelte (Task 2+). Always verify TypeScript passes after types update before proceeding.
**Warning signs:** `tsc` errors about unknown props or missing properties on `WheelPickerProps`.

---

## Code Examples

Verified patterns from official sources and React source analysis:

### $effect Lifecycle Binding (Svelte 5 official)
```typescript
// Source: https://svelte.dev/docs/svelte/$effect
// In WheelPicker.svelte — wire physics class lifecycle to component lifecycle:
$effect(() => {
  return () => physics.destroy();
});
```

### Conditional Attribute in Svelte 5 (attribute omission when undefined)
```svelte
<!-- Source: Svelte 5 docs — undefined attribute value = attribute omitted -->
<div
  data-swp-selected={isSelected ? 'true' : undefined}
  data-swp-disabled={option.disabled ? 'true' : undefined}
>
```
This satisfies the UI-SPEC rule: "Absent attribute = false state. Never emit `data-swp-selected='false'`."

### inline style:* bindings
```svelte
<!-- Source: Svelte 5 docs — style directive -->
<div
  style:height="{visibleCount * optionItemHeight}px"
  style:transform="translateY({physics.offset}px)"
>
```

### Easing Function (from React source)
```typescript
// Source: @ncdai/react-wheel-picker@1.2.2 dist bundle — cubic ease-out
const easeOutCubic = (p: number): number => Math.pow(p - 1, 3) + 1;
// p ∈ [0, 1]; returns 0 at p=0, 1 at p=1, with fast start and slow end
```

### visibleCount Validation (D-07)
```typescript
// In WheelPicker.svelte $derived or at prop reading time
const resolvedVisibleCount = $derived(() => {
  if (visibleCount % 2 === 0) {
    console.warn(
      `[WheelPicker] visibleCount must be an odd number. Received ${visibleCount}, rounding up to ${visibleCount + 1}.`
    );
    return visibleCount + 1;
  }
  return visibleCount;
});
```

### Pointer Capture Pattern
```typescript
// Standard PointerEvent capture — covers both touch and mouse
function onPointerDown(e: PointerEvent) {
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  startY = e.clientY;
  startTime = performance.now();
  yList = [[e.clientY, performance.now()]];
  isDragging = true;
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging) return;
  const delta = e.clientY - startY;
  physics.setDragOffset(delta);
  yList.push([e.clientY, performance.now()]);
  if (yList.length > 5) yList.shift(); // keep last 5 for velocity
}

function onPointerUp(e: PointerEvent) {
  (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  isDragging = false;
  const velocity = calculateVelocity(yList, optionItemHeight);
  physics.release(velocity, options, selectedIndex);
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate `touchstart`/`touchmove`/`touchend` + `mousedown`/`mousemove`/`mouseup` | Unified `PointerEvent` (`pointerdown`/`pointermove`/`pointerup`) | ~2019 (PointerEvents Level 2 widely supported) | Single code path; `setPointerCapture` replaces touchmove window listener |
| jsdom-based component tests | Vitest browser mode with Playwright | Phase 1 decision | Real browser; pointer events and RAF work correctly |
| `@testing-library/svelte` | `vitest-browser-svelte` | Phase 1 decision | Native Svelte 5 rune support |
| Svelte 4 stores | Svelte 5 `$state` in class | Phase 1 decision | Works in `.svelte.ts` files outside components |

**Deprecated/outdated:**
- `TouchEvent`/`MouseEvent` split approach: Works but requires double the event handler code and separate `mousemove` listener on `window` for mouse capture. Use `PointerEvent` instead.
- `CSS scroll-snap`: Cannot tune inertia feel. Decision D-01 prohibits it.

---

## Open Questions

1. **Whether `use-wheel-physics.svelte.ts` should be a class or a function factory**
   - What we know: Phase 2 established class-based rune hooks as the pattern for encapsulating private `$state`
   - What's unclear: The physics state doesn't need reactive `$state` internally (only `offset` needs to be reactive) — a function factory could also work
   - Recommendation: Use a class for consistency with Phase 2 pattern. Only `offset` needs to be `$state`; velocity/rafId/isDragging are plain class fields.

2. **Whether `onValueChange` fires during inertia (every frame) or only on snap completion**
   - What we know: React source calls value update callback only on snap completion (after animation finishes)
   - What's unclear: The `useControllableState` hook calls `#onChange` on every `.current` assignment — Phase 3 must only set `.current` at snap completion, not per frame
   - Recommendation: Only update `controllableState.current` when the snap animation completes. During inertia, only `physics.offset` changes; `controllableState.current` remains at the last confirmed value.

3. **Test strategy for inertia physics in sandbox environment**
   - What we know: Playwright tests in the CI sandbox environment crash with SIGSEGV (documented in STATE.md as known limitation). The existing tests use browser mode.
   - What's unclear: Whether unit tests for the physics class alone (no DOM) can run without a browser, or whether they need browser mode because the class imports `requestAnimationFrame`
   - Recommendation: Extract physics calculations (velocity, easing, snap index math) into pure functions in a separate module that can be unit-tested without DOM. Test the pure functions with Vitest in node mode (add `environment: 'node'` for that test file). Test the integrated component behavior (drag → snap → value change) with browser mode tests, but keep them simple and non-timing-dependent.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Playwright (chromium) | Browser tests | Yes | 1.58.2 | — |
| Vitest | Test runner | Yes | 4.1.0 | — |
| vitest-browser-svelte | Component rendering in tests | Yes | 2.1.0 | — |
| Node.js | Build + tests | Yes | (system) | — |
| pnpm | Package management | Yes | (system) | npm |

**Known limitation:** Browser tests crash with SIGSEGV in the sandbox environment (Playwright process isolation). Documented in STATE.md. Not a blocker — the test infrastructure exists and the known failure mode is understood. Physics unit tests can be written as node-mode tests to avoid this.

**Missing dependencies with no fallback:** None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + vitest-browser-svelte 2.1.0 |
| Config file | `vitest.config.ts` (exists) |
| Quick run command | `npm run test` (= `PLAYWRIGHT_BROWSERS_PATH=.playwright vitest run`) |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-01 | WheelPicker renders with correct DOM structure and data attributes | Browser | `npm run test` (WheelPicker.test.ts) | Exists (needs rewrite) |
| INTR-01 | Touch drag produces inertia scrolling | Browser (pointer simulation) | `npm run test` | Wave 0 |
| INTR-02 | Mouse drag produces inertia scrolling | Browser (pointer simulation) | `npm run test` | Wave 0 |
| INTR-03 | Wheel event scrolls with sensitivity | Browser (wheel event simulation) | `npm run test` | Wave 0 |
| INTR-04 | Snap to nearest item on release | Unit (pure fn) + Browser | `npm run test` | Wave 0 |
| INTR-05 | Keyboard Arrow/Home/End navigation | Browser (keyboard simulation) | `npm run test` | Wave 0 |
| MODE-04 | Disabled options skipped in all navigation | Browser | `npm run test` | Wave 0 |
| STYL-01 | Selection overlay renders in center position | Browser | `npm run test` | Wave 0 |
| STYL-02 | classNames prop injects classes on correct elements | Browser | `npm run test` | Wave 0 |
| STYL-03 | data-swp-* attributes present on all structural elements | Browser | `npm run test` | Wave 0 |
| STYL-04 | visibleCount/optionItemHeight/sensitivity props affect layout | Browser | `npm run test` | Wave 0 |

**Note on browser test reliability in sandbox:** STYL-01 through STYL-04 (DOM structure + attribute checks) are reliable even in the sandbox — they do not require RAF timing. INTR-01 through INTR-05 require pointer event simulation and RAF timing and may be less stable in the sandbox environment. Recommend keeping interaction tests simple (synchronous DOM state checks after simulated events) rather than timing-dependent async assertions.

### Sampling Rate
- **Per task commit:** `npm run test` (full suite, short test set)
- **Per wave merge:** `npm run test` + TypeScript check (`npx tsc --noEmit`)
- **Phase gate:** Full suite green + TypeScript clean before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/WheelPicker.test.ts` — existing file covers only placeholder; needs full rewrite for Phase 3 scenarios
- [ ] Pure physics function tests (optional but recommended for INTR-04 snap math, in node mode)

*(No new config or fixtures needed — existing `vitest.config.ts` and `vitest-browser-svelte` setup from Phase 1 covers all new tests.)*

---

## Project Constraints (from CLAUDE.md)

| Directive | Implication for Phase 3 |
|-----------|------------------------|
| Svelte 5 runes only — no Svelte 4 stores | All reactive state via `$state`, `$derived`, `$effect`. No `writable()`. |
| Zero runtime dependencies | No animation libraries (GSAP, motion, etc.). All physics is hand-written. |
| TypeScript throughout | `WheelPicker.svelte` uses `lang="ts"`. All new files are `.ts` or `.svelte.ts`. |
| Headless — no CSS shipped | No `<style>` block in `WheelPicker.svelte`. No CSS files. |
| Data attributes for CSS targeting | All structural elements get `data-swp-*` attributes per D-03/D-04. |
| `sideEffects: false` in package.json | Already set; no CSS side effects introduced in this phase. |
| `verbatimModuleSyntax: true` | Use `import type` for type-only imports. |
| Flat `src/lib/` layout | WheelPicker.svelte and any new `.svelte.ts` files stay at root of `src/lib/`. |
| `.svelte.ts` extension for reactive hooks | `use-wheel-physics.svelte.ts` (if created) uses this extension. |
| ESLint flat config | No special concern — existing config works for `.svelte` files. |
| pnpm conventions | Use `pnpm` for any package operations. |

---

## Sources

### Primary (HIGH confidence)
- `@ncdai/react-wheel-picker@1.2.2` bundle via unpkg.com — physics constants, easing function, velocity calculation, DOM structure
- `https://svelte.dev/docs/svelte/$effect` — `$effect` cleanup pattern for RAF lifecycle
- `https://svelte.dev/docs/svelte/svelte-action` — Action API vs. attachments in Svelte 5
- MDN PointerEvent API — `setPointerCapture`, unified touch/mouse events
- `.planning/phases/03-wheelpicker-core/03-CONTEXT.md` — all locked decisions
- `.planning/phases/03-wheelpicker-core/03-UI-SPEC.md` — DOM structure contract
- `src/lib/types.ts`, `use-controllable-state.svelte.ts`, `use-typeahead-search.svelte.ts` — Phase 2 deliverables (verified by reading files)
- `vitest.config.ts`, `package.json` — test infrastructure (verified by reading files)

### Secondary (MEDIUM confidence)
- GitHub: `https://github.com/ncdai/react-wheel-picker` — DOM structure overview (confirmed against bundle analysis)
- Svelte 5 attachments vs. actions note — confirmed `svelte/action` still valid but `@attach` is preferred modern pattern

### Tertiary (LOW confidence)
- React source `visibleCount: 20` default — confirmed via bundle; our D-06 overrides this for a different rendering model (no geometry concern for flat layout)

---

## Metadata

**Confidence breakdown:**
- Physics constants: HIGH — extracted from compiled v1.2.2 bundle via unpkg.com
- Standard stack: HIGH — no new dependencies; verified against existing package.json
- Architecture patterns: HIGH — Svelte 5 docs + Phase 2 established patterns + standard browser APIs
- Pitfalls: HIGH — derived from direct source analysis and known Svelte 5 reactivity semantics
- Test infrastructure: HIGH — config files and installed versions verified by reading files

**Research date:** 2026-03-23
**Valid until:** 2026-06-23 (stable — Svelte 5 and browser PointerEvent APIs are not fast-moving)
