# Architecture Research

**Domain:** Svelte 5 iOS-style wheel picker component library
**Researched:** 2026-03-23
**Confidence:** HIGH (based on direct analysis of reference implementation source + verified physics algorithms)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Consumer Application                       │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐    │
│  │              WheelPickerWrapper                       │    │
│  │  (group context: active focus tracking, DOM refs)    │    │
│  │                                                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │    │
│  │  │  WheelPicker │  │  WheelPicker │  │WheelPicker │  │    │
│  │  │  (hour)      │  │  (minute)    │  │  (period)  │  │    │
│  │  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │    │
│  └─────────┼─────────────────┼────────────────┼──────────┘    │
│            │                 │                │               │
├────────────┴─────────────────┴────────────────┴───────────────┤
│                    Internal WheelPicker State                  │
│  ┌───────────────┐  ┌──────────────────┐  ┌───────────────┐   │
│  │ scrollOffset  │  │  inertiaEngine   │  │selectedIndex  │   │
│  │  ($state)     │  │  (rAF loop)      │  │  ($derived)   │   │
│  └───────────────┘  └──────────────────┘  └───────────────┘   │
├────────────────────────────────────────────────────────────────┤
│                    Logic Utilities (pure .ts)                  │
│  ┌───────────────────┐  ┌──────────────────┐                  │
│  │ useControllable   │  │ useTypeahead     │                  │
│  │ State (rune-based)│  │ Search (rune)    │                  │
│  └───────────────────┘  └──────────────────┘                  │
└────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Svelte 5 Implementation |
|-----------|----------------|-------------------------|
| `WheelPickerWrapper` | Group context: registers child pickers, tracks which picker has active focus, exposes arrow-key tab between pickers | Thin wrapper; provides context via `setContext()` with `$state` for `activeIndex` and a `Map<number, HTMLElement>` for picker DOM refs |
| `WheelPicker` | Renders a single scrollable column; owns all scroll/inertia/snap/loop logic | Single `.svelte` file; all interaction handlers are local; exposes `value`/`onValueChange` props |
| `WheelPickerGroupContext` | Shared state: which picker index is active, ref registry | Svelte `setContext`/`getContext` with a plain `$state` object — no stores |
| `useControllableState` | Bridges controlled (`value` prop) and uncontrolled (`defaultValue`) modes | `.svelte.ts` rune-based hook; identical pattern to Radix's `useControllableState` |
| `useTypeaheadSearch` | Accumulates keypresses within 500ms window; cycles through matching option labels | `.svelte.ts` hook using `$state` for the search buffer ref + timeout |

## Recommended Project Structure

```
src/
├── lib/
│   ├── wheel-picker/
│   │   ├── WheelPickerWrapper.svelte   # Group context provider
│   │   ├── WheelPicker.svelte          # Core scrollable wheel
│   │   ├── use-controllable-state.svelte.ts  # Controlled/uncontrolled bridge
│   │   ├── use-typeahead-search.svelte.ts    # Keyboard type-ahead
│   │   └── types.ts                    # WheelPickerOption, WheelPickerProps, etc.
│   └── index.ts                        # Re-exports: WheelPicker, WheelPickerWrapper, types
├── routes/
│   └── +page.svelte                    # Demo site
registry/
└── wheel-picker/
    ├── WheelPicker.svelte              # Registry copy (identical to src/lib)
    ├── WheelPickerWrapper.svelte
    ├── use-controllable-state.svelte.ts
    ├── use-typeahead-search.svelte.ts
    └── types.ts
registry.json                           # shadcn-svelte registry manifest
package.json                            # svelte-package build + npm publish config
```

### Structure Rationale

- **`src/lib/wheel-picker/`**: All library code lives here; `svelte-package` turns this into the `dist/` for npm. Self-contained folder makes shadcn-svelte registry extraction trivial.
- **`.svelte.ts` extension**: Rune-based hooks (logic files that use `$state`, `$derived`) must use the `.svelte.ts` extension so the Svelte compiler processes them. Pure utilities without runes use `.ts`.
- **`registry/`**: Mirrors `src/lib/wheel-picker/` exactly. shadcn-svelte registry build reads from here, not from `dist/`. Keeping them in sync is a build-time check, not a manual process.
- **`registry.json` at root**: Required by shadcn-svelte CLI tooling; references the files in `registry/`.

## Architectural Patterns

### Pattern 1: Inertia (Kinetic) Scrolling with Exponential Decay

**What:** During a drag, track the last 5 pointer positions + timestamps to compute velocity. On pointer release, launch a `requestAnimationFrame` loop that applies exponential decay to the velocity until it falls below a threshold, then snaps to the nearest item.

**When to use:** Always — this is the core feel of the component. Without it, scroll stops abruptly on pointer-up.

**Trade-offs:** rAF loop must be cancelled on new pointer-down or programmatic value change to prevent conflicts. The velocity cap (e.g., 30 px/frame) prevents flick-to-arbitrary-position.

**Algorithm:**

```typescript
// Velocity tracking during drag (sample last 5 positions)
const VELOCITY_HISTORY = 5;
let positions: { y: number; t: number }[] = [];

function onPointerMove(y: number) {
  const now = performance.now();
  positions.push({ y, t: now });
  if (positions.length > VELOCITY_HISTORY) positions.shift();
}

// On pointer up: compute velocity then launch decay loop
function onPointerUp() {
  if (positions.length < 2) { snapToNearest(); return; }
  const first = positions[0];
  const last = positions[positions.length - 1];
  const elapsed = last.t - first.t;
  let velocity = elapsed > 0
    ? (1000 * (last.y - first.y)) / elapsed
    : 0;
  velocity = Math.max(-30, Math.min(30, velocity)); // cap
  decelerateAndAnimate(velocity);
}

// Exponential decay loop (timeConstant ~325ms matches iOS feel)
function decelerateAndAnimate(velocity: number) {
  const timeConstant = 325;
  const startTime = performance.now();
  const amplitude = 0.8 * velocity;

  function tick() {
    const elapsed = performance.now() - startTime;
    const delta = -amplitude * Math.exp(-elapsed / timeConstant);
    scrollOffset += delta;     // apply frame delta
    if (Math.abs(delta) > 0.5) {
      rafId = requestAnimationFrame(tick);
    } else {
      snapToNearest();          // decay complete → snap
    }
  }
  rafId = requestAnimationFrame(tick);
}
```

### Pattern 2: Snap-to-Item

**What:** After inertia decays (or on direct mousewheel/keyboard), round `scrollOffset` to the nearest `optionItemHeight` multiple, find the corresponding index, skip disabled items by searching outward in both directions, then animate to the snapped position with `easeOutCubic`.

**When to use:** Always — snapping is what makes a wheel picker distinct from a plain scroll list.

**Trade-offs:** Must handle the infinite-loop offset normalization before the snap calculation. Snap animation duration (~150–200ms) must be short enough to feel responsive but long enough to be visible.

**Algorithm:**

```typescript
function snapToNearest() {
  // Normalize for infinite mode
  const normalizedOffset = infinite
    ? ((scrollOffset % totalHeight) + totalHeight) % totalHeight
    : scrollOffset;

  const rawIndex = Math.round(normalizedOffset / optionItemHeight);
  const clampedIndex = clamp(rawIndex, 0, options.length - 1);
  const targetIndex = findNearestEnabled(clampedIndex); // skip disabled

  const targetOffset = targetIndex * optionItemHeight;
  animateTo(targetOffset, 160, easeOutCubic);
  setValue(options[targetIndex].value);
}

function findNearestEnabled(startIndex: number): number {
  for (let d = 0; d < options.length; d++) {
    const forward = (startIndex + d) % options.length;
    if (!options[forward].disabled) return forward;
    const backward = ((startIndex - d) + options.length) % options.length;
    if (!options[backward].disabled) return backward;
  }
  return startIndex; // all disabled — shouldn't happen
}
```

### Pattern 3: Infinite Loop via Item Duplication + Modulo Wrapping

**What:** When `infinite` prop is true, render the options list with ghost items prepended and appended. A `quarterCount` (= `Math.ceil(options.length / 4)`) of ghost items is added on each side. Scroll position uses modulo arithmetic so it wraps seamlessly. Items outside the visible window are hidden with `visibility: hidden` (not `display: none`, to maintain layout).

**When to use:** Only when `infinite` prop is `true`. Finite mode uses simple clamped scrolling.

**Trade-offs:** The rendered DOM is larger (original + 2 * quarterCount items). For very large option sets this is negligible. `visibility: hidden` rather than conditional rendering avoids layout thrashing.

**Algorithm:**

```typescript
// Build the full padded items array
const quarterCount = Math.ceil(options.length / 4);
const paddedOptions = [
  ...options.slice(-quarterCount),   // ghost prefix
  ...options,                        // real items
  ...options.slice(0, quarterCount), // ghost suffix
];
const offsetAdjust = quarterCount * optionItemHeight; // initial scroll offset

// Wrap offset when approaching edges
$effect(() => {
  const maxOffset = options.length * optionItemHeight;
  if (scrollOffset < 0) scrollOffset += maxOffset;
  if (scrollOffset >= maxOffset) scrollOffset -= maxOffset;
});
```

### Pattern 4: Controlled / Uncontrolled State Bridge

**What:** If the `value` prop is defined, the component is in controlled mode — internal scroll state drives only display; value changes are emitted via `onValueChange` and the parent must update `value`. If only `defaultValue` is given, the component owns its state internally.

**When to use:** Every interactive component with both usage modes. This is the standard headless component pattern from Radix/shadcn.

**Trade-offs:** In Svelte 5, this maps cleanly to a `.svelte.ts` hook that holds a `$state` for uncontrolled mode and reads the prop directly for controlled mode. The hook must not call `$effect` reactively on the prop or it causes infinite loops.

```typescript
// use-controllable-state.svelte.ts
export function useControllableState<T>(opts: {
  prop: T | undefined;
  defaultProp: T | undefined;
  onChange: (v: T) => void;
}) {
  let internal = $state<T | undefined>(opts.defaultProp);
  const isControlled = () => opts.prop !== undefined;
  const value = $derived(isControlled() ? opts.prop! : internal);

  function setValue(next: T) {
    if (!isControlled()) internal = next;
    opts.onChange(next);
  }

  return { get value() { return value; }, setValue };
}
```

## Data Flow

### Scroll Interaction Flow

```
User drags / scrollwheel / keyboard
    ↓
Event handler (pointermove / wheel / keydown)
    ↓
scrollOffset ($state) updated
    ↓
$derived: selectedIndex = round(scrollOffset / itemHeight)
    ↓
render: transform: translateY(-scrollOffset) on ul
    ↓
[on pointer up / key press completes]
    ↓
snapToNearest() → animateTo(targetOffset)
    ↓
setValue(options[targetIndex].value)
    ↓
onValueChange callback (controlled) OR internal $state update (uncontrolled)
```

### Keyboard / Group Navigation Flow

```
keydown on WheelPickerWrapper
    ↓
Tab / Shift+Tab → setActiveIndex() in group context
    ↓
WheelPicker reads activeIndex from context
    ↓
Focus styles applied (data-active attribute)
    ↓
ArrowUp / ArrowDown → selectByOffset(±1) on active picker
    ↓
same snap path as above
```

### Controlled Mode Data Flow

```
Parent sets value prop
    ↓
WheelPicker useControllableState reads prop
    ↓
scrollOffset set to index * itemHeight via $effect
    ↓
User interaction triggers onValueChange(newValue)
    ↓
Parent updates value prop
    ↓
cycle repeats
```

### Key Data Flows

1. **scrollOffset is the single source of truth**: All visual state (translateY, selected item highlight, aria-selected) derives from `scrollOffset`. Never track "current index" independently.
2. **Value propagates upward, never down**: `onValueChange` fires after every snap. The parent may or may not respond. The component never waits for the parent.
3. **Group context is shallow**: `WheelPickerWrapper` only manages keyboard focus between pickers. Each `WheelPicker` manages its own scroll state completely independently.

## Build Order (Phase Dependencies)

The component has clear internal dependencies that dictate build order:

```
1. Types + interfaces (WheelPickerOption, WheelPickerProps, WheelPickerClassNames)
   ↓
2. useControllableState hook  (no UI dependencies)
   ↓
3. useTypeaheadSearch hook    (no UI dependencies)
   ↓
4. WheelPicker core           (depends on 1, 2, 3)
   — finite scroll only first (simpler)
   — add inertia next
   — add snap-to-item
   — add keyboard / typeahead
   — add infinite loop mode last (most complex)
   ↓
5. WheelPickerGroupContext + WheelPickerWrapper  (depends on 4 to test)
   ↓
6. Package config (npm + shadcn-svelte registry)
   ↓
7. Demo site
```

Infinite loop is intentionally last: it requires the snap and offset-normalization code to be solid first. Implementing it on top of a working finite picker prevents introducing logic errors into the base physics.

## Anti-Patterns

### Anti-Pattern 1: Tracking selectedIndex as Primary State

**What people do:** Store `selectedIndex` as the main reactive variable and derive `scrollOffset` from it.

**Why it's wrong:** Scroll is continuous, not discrete. During inertia animation the picker is between items. If `selectedIndex` is primary, you need a separate "animation offset" variable and they drift out of sync. Snap logic becomes a two-step write that can cause double-renders.

**Do this instead:** `scrollOffset` (a continuous float, in pixels) is primary state. `selectedIndex` is `$derived` as `Math.round(scrollOffset / itemHeight)`. The snap function writes `scrollOffset` to a quantized value — one write, consistent state.

### Anti-Pattern 2: Using CSS `scroll-snap` or the Browser's Native Scroll Container

**What people do:** Render a `<div style="overflow-y: scroll">` with CSS `scroll-snap-type` to get free inertia and snapping.

**Why it's wrong:** Browser scroll snap has no iOS-equivalent inertia feel on desktop. Mouse wheel events fire in large discrete steps (120px default) that feel broken. You lose control over the exact physics, can't implement infinite loop (requires DOM manipulation the browser scroll container won't tolerate), and can't differentiate between user drag and programmatic scroll. Cross-browser scroll behavior is inconsistent.

**Do this instead:** Manage a `scrollOffset` `$state` manually. Bind `onpointerdown`/`onpointermove`/`onpointerup` for drag. Bind `onwheel` for desktop scroll. Use `requestAnimationFrame` for inertia animation. `transform: translateY()` for rendering. This is more code but total control.

### Anti-Pattern 3: Re-creating Options Array on Every Render in Infinite Mode

**What people do:** Build the padded options array (with ghost prefix/suffix) inside the component template or a reactive expression that runs on every scroll update.

**Why it's wrong:** `scrollOffset` changes on every animation frame during inertia. Rebuilding a potentially large array every frame causes GC pressure and defeats memoization.

**Do this instead:** Build `paddedOptions` in a `$derived` that only depends on `options` and `infinite`. Since these props rarely change, the array is only rebuilt when the option set changes — not on scroll.

### Anti-Pattern 4: Svelte Stores Instead of Runes for Internal State

**What people do:** Use `writable()` stores for `scrollOffset` and other internal state, because that is the Svelte 4 pattern.

**Why it's wrong:** Svelte 5 runes (`$state`, `$derived`) provide fine-grained reactivity without subscription boilerplate. Stores inside `.svelte` files force `.subscribe()` / `.set()` calls that are verbose and require cleanup. More critically, stores cannot be used in `.svelte.ts` hooks without importing from `svelte/store`, which adds an indirect dependency and is considered a legacy pattern in Svelte 5.

**Do this instead:** `let scrollOffset = $state(0)` inside the component. For shared state across WheelPicker instances (active focus), use `setContext`/`getContext` with a plain object that holds `$state` fields.

### Anti-Pattern 5: Separate Velocity and Position rAF Loops

**What people do:** Run one rAF loop to update velocity and a second to read velocity and update position, thinking this separates concerns.

**Why it's wrong:** Two rAF loops per frame double the work. The loops can get out of phase, producing one-frame position lag. More critically, cancelling animation on pointer-down requires cancelling two different IDs.

**Do this instead:** Single rAF loop that reads `amplitude`, computes `delta = -amplitude * exp(-elapsed / τ)`, and writes `scrollOffset += delta` in one step. One `rafId` to cancel.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `WheelPickerWrapper` ↔ `WheelPicker` | Svelte `setContext` / `getContext` | Context holds `$state` for `activeIndex` and a `Map` of picker refs. WheelPicker calls `register()` in `onMount` and reads `activeIndex` reactively. |
| `WheelPicker` ↔ consumer | Props in, `onValueChange` callback out | Controlled mode: consumer owns value. Uncontrolled: component owns value. No event bus or stores cross this boundary. |
| `useControllableState` ↔ `WheelPicker` | Direct call (hook returns `{ value, setValue }`) | Hook is co-located; not shared across pickers. Each WheelPicker instantiates its own hook. |
| npm package ↔ shadcn-svelte registry | Identical source files copied to `registry/` folder | The registry is not a build artifact — it's source. The `registry.json` manifest lists every file. Users get source, not compiled output. |

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| npm registry | `@sveltejs/package` builds `dist/`; `npm publish` from repo root | `package.json` exports both `svelte` and `types` fields |
| shadcn-svelte CLI | `registry.json` + `static/r/*.json` built by `shadcn-svelte build` command | Users run `npx shadcn-svelte@latest add [URL]/r/wheel-picker.json`; they receive source files, not compiled code |

## Scaling Considerations

This is a UI component library, not a server-side application. "Scaling" means performance with large option sets and multiple simultaneous wheel instances.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1–20 options per wheel | No optimization needed. Render all items. |
| 20–200 options | Consider hiding items outside `visibleCount + 2` buffer via `visibility: hidden` (maintains layout). Infinite mode ghost items keep DOM count bounded. |
| 200+ options | Virtual rendering: only render `visibleCount + 2 * quarterCount` DOM nodes; update item content as scroll position changes. Not needed for MVP — most real-world pickers (hours, minutes, months) have ≤60 options. |
| Multiple wheels on one page | Each WheelPicker is fully independent. No shared global state except the group context (which is per-WheelPickerWrapper). Performance is linear in number of wheels. |

## Sources

- React reference implementation source: https://github.com/ncdai/react-wheel-picker/tree/main/packages/react-wheel-picker/src (HIGH confidence — direct source analysis)
- Kinetic scrolling deceleration algorithm: https://ariya.io/2013/11/javascript-kinetic-scrolling-part-2 (HIGH confidence — foundational algorithm article)
- Controllable state pattern origin: https://github.com/radix-ui/primitives (HIGH confidence — reference implementation credits Radix)
- shadcn-svelte registry publishing: https://www.shadcn-svelte.com/docs/registry/getting-started (HIGH confidence — official docs)
- SvelteKit package structure: https://svelte.dev/docs/kit/packaging (HIGH confidence — official Svelte docs)
- Svelte 5 runes overview: https://svelte.dev/blog/runes (HIGH confidence — official Svelte blog)

---
*Architecture research for: Svelte 5 iOS-style wheel picker component library*
*Researched: 2026-03-23*
