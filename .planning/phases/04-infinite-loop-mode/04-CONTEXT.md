# Phase 4: Infinite Loop Mode - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

WheelPicker wraps seamlessly at both ends when `infinite` is true, with no visible jump or stutter at boundaries. Ghost-item duplication and modulo offset for seamless wrap-around. When `infinite` is false (default), existing finite behavior is unchanged.

Requirements in scope: MODE-03

</domain>

<decisions>
## Implementation Decisions

### Ghost Item Strategy
- **D-01:** Use 3x duplication — render the options array 3 times in the DOM (one set of ghosts above, the real set, one set of ghosts below). This matches the React version's approach.
- **D-02:** For typical wheel pickers (5-20 items), the DOM cost of 3x duplication is negligible. No virtualization needed.
- **D-03:** Ghost items use the same `data-swp-option`, `data-swp-option-text` attributes as real items. `data-swp-selected` only appears on the real selected item (not ghost copies).

### Offset Wrapping Behavior
- **D-04:** Normalize (reset) the offset on snap settle — after inertia finishes and the wheel snaps to a position, silently jump the offset to the canonical range (equivalent position within the real items section). No visual glitch since it happens at rest.
- **D-05:** During drag, offset grows unbounded (no modulo in the hot RAF loop). Reset only happens when the animation completes and onSnap fires.

### Keyboard & Wheel Wrapping
- **D-06:** ArrowDown on the last item animates forward 1 step to the ghost copy of the first item, then the offset silently resets. Same for ArrowUp on first item → animates backward 1 step to ghost of last item. Maintains the illusion of continuous scrolling.
- **D-07:** Mouse wheel wrapping follows the same pattern — scroll past last item wraps to first via ghost, scroll past first wraps to last.
- **D-08:** Home/End keys behavior in infinite mode: same as finite (jump to first/last enabled option) — these are absolute navigation, not relative.

### Prop Integration
- **D-09:** Add `infinite?: boolean` (default `false`) to `WheelPickerProps` interface in `types.ts`.
- **D-10:** Add `infinite` boolean to `WheelPhysics` constructor config and `update()` method. Physics methods branch internally:
  - `moveDrag()`: skip rubber-band resistance when infinite
  - `endDrag()`: use `wrapIndex()` instead of `clampIndex()` when infinite
  - `handleWheel()`: use `wrapIndex()` instead of `clampIndex()` when infinite
- **D-11:** Add `wrapIndex()` utility to `wheel-physics-utils.ts` — modulo-based index wrapping that handles negative indices correctly.

### Claude's Discretion
- Exact implementation of the 3x duplication in the Svelte `{#each}` template (single array vs. three loops)
- How ghost items interact with `selectedIndex` derivation
- Whether `wrapIndex` is a standalone function or integrated into existing `clampIndex`
- Exact offset normalization math in the onSnap callback
- How typeahead search behaves in infinite mode (likely unchanged — search all options, wrap is just visual)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### React source (infinite loop implementation)
- React version npm package: `@ncdai/react-wheel-picker` v1.2.2 — researcher must examine infinite loop implementation: ghost item count, offset wrapping logic, DOM structure changes
- GitHub: https://github.com/ncdai/react-wheel-picker (MIT license)

### Requirements and scope
- `.planning/REQUIREMENTS.md` — MODE-03 definition (infinite loop scrolling mode)
- `.planning/ROADMAP.md` — Phase 4 success criteria (3 criteria that must be TRUE)

### Prior phase contracts
- `.planning/phases/03-wheelpicker-core/03-CONTEXT.md` — Physics decisions (D-01 through D-09), DOM structure, data attribute conventions
- `src/lib/wheel-physics-utils.ts` — Pure physics functions: `clampIndex`, `indexToOffset`, `offsetToIndex`, `snapToNearestEnabled` — all need infinite-aware alternatives or branches
- `src/lib/use-wheel-physics.svelte.ts` — `WheelPhysics` class: `moveDrag`, `endDrag`, `handleWheel`, `animateTo` — core methods that need infinite mode branches
- `src/lib/WheelPicker.svelte` — Component template (DOM structure, keyboard handler, pointer handlers) — needs ghost items and keyboard wrapping
- `src/lib/types.ts` — `WheelPickerProps` interface — needs `infinite` prop added

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `WheelPhysics` class (`use-wheel-physics.svelte.ts`): already has `update()` for prop changes — `infinite` flag slots in naturally
- `clampIndex()` (`wheel-physics-utils.ts`): foundation for `wrapIndex()` — same signature but modulo instead of clamp
- `indexToOffset()` / `offsetToIndex()`: unchanged — ghost items use the same coordinate system, just with extended index range
- `snapToNearestEnabled()`: works with any index — infinite mode just provides wrapped indices

### Established Patterns
- Single `$state` offset field in WheelPhysics — ghost items are purely a rendering concern, physics only deals with offset/index math
- Constructor + `update()` pattern for prop changes — `infinite` follows this
- Pure utility functions in `wheel-physics-utils.ts` — `wrapIndex` follows this pattern
- Class-based Svelte 5 rune hooks with private fields

### Integration Points
- `WheelPickerProps` in `types.ts` — add `infinite?: boolean`
- `WheelPhysics` constructor and `update()` — add `infinite` config
- `WheelPicker.svelte` template — `{#each}` loop needs to render 3x options when infinite
- `WheelPicker.svelte` keyboard handler — ArrowUp/Down need wrapping logic when infinite
- `src/lib/index.ts` — no changes needed (WheelPicker already exported)

</code_context>

<specifics>
## Specific Ideas

- Ghost items are rendering-only — the physics system deals with indices and offsets, not DOM nodes
- The offset reset on snap settle means the "real" items section is always the canonical position at rest
- Keyboard wrap animates 1 step (not a long scroll through all items) to maintain the illusion

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-infinite-loop-mode*
*Context gathered: 2026-03-24*
