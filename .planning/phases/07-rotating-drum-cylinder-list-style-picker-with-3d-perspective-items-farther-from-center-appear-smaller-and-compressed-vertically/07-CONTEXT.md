# Phase 7: Rotating Drum / Cylinder Picker - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a 3D rotating drum/cylinder visual style to the existing `WheelPicker` component via a new `cylindrical` boolean prop. When `cylindrical={true}`, items farther from the center selection appear vertically compressed and optionally faded, creating an iOS-native drum illusion using faux-3D CSS transforms. All physics, snap, keyboard, and interaction logic is unchanged — only the per-item rendering transform changes.

No new component is introduced. The existing `WheelPicker` gains one new optional prop.

</domain>

<decisions>
## Implementation Decisions

### Component Shape
- **D-01:** `cylindrical` is a boolean prop on the existing `WheelPicker` component — NOT a new `WheelPickerDrum` component.
  - Default: `false` (flat list, current behavior unchanged)
  - When `true`: per-item faux-3D transforms are applied in the template
  - The prop is added to `WheelPickerProps` in `src/lib/types.ts`

### 3D Technique
- **D-02:** Faux 3D — `scaleY` compression (+ optional `opacity` falloff) per item based on distance from center.
  - No `perspective`, `rotateX`, or `translateZ` — pure scaleY illusion
  - Distance from center: computed from `physics.offset` and each item's flat position
  - Scale formula: `cos(normalizedAngle)` or equivalent falloff — researcher determines exact formula from React v1.2.2 or derives a natural-looking curve
  - Items at the edges of `visibleCount` approach but never reach scaleY=0
  - Claude's discretion: whether to also apply opacity falloff alongside scaleY, and the exact curve shape

### Curvature / Radius
- **D-03:** Auto-derived from `visibleCount` and `optionItemHeight` — no new prop.
  - The "cylinder radius" (which controls how dramatic the compression is) is derived from the visible window: `radius = (visibleCount * optionItemHeight) / (2 * Math.PI / visibleCount)` or similar — researcher should verify the formula that produces a visually natural result
  - Consumer cannot override the curvature; they can indirectly tune it via `visibleCount` and `optionItemHeight` (as before)

### Demo Update
- **D-04:** A new "Drum / Cylinder" section is added to the existing `src/routes/+page.svelte` below the current examples.
  - Shows at least one wheel with `cylindrical={true}` using the same `data-swp-*` CSS targeting
  - Keeps the page focused — no new routes, no replacing existing examples

### Claude's Discretion
- Exact faux-3D scale formula (cosine curve vs. quadratic vs. other natural falloff)
- Whether to add `opacity` falloff alongside `scaleY` (both are reasonable; opacity adds depth cue)
- Whether to add a `data-swp-cylindrical` attribute on the wrapper for consumer CSS targeting
- Placement of the cylindrical transform computation (inline in template vs. helper function)
- Test coverage strategy for the per-item transform values

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing component source
- `src/lib/WheelPicker.svelte` — Full current implementation; `cylindrical` prop and per-item transform branches go here
- `src/lib/types.ts` — `WheelPickerProps` interface; `cylindrical?: boolean` needs to be added
- `src/lib/use-wheel-physics.svelte.ts` — `WheelPhysics` class; `offset` is the reactive state that drives all rendering. No changes expected here.
- `src/lib/wheel-physics-utils.ts` — Physics constants and pure utility functions; may need a new helper for the faux-3D scale computation

### Demo site
- `src/routes/+page.svelte` — Current demo page; new "Drum / Cylinder" section added at the bottom

### React reference
- `@ncdai/react-wheel-picker` v1.2.2 — If the React version has a cylinder/drum mode, researcher should extract the scale formula. If not, researcher derives one from first principles.

### Requirements and scope
- `.planning/ROADMAP.md` §"Phase 7" — Phase goal and (TBD) success criteria
- `.planning/REQUIREMENTS.md` — No existing requirement maps to Phase 7; this is additive

### Tech stack constraints
- `CLAUDE.md` — Svelte 5 runes patterns, headless/data-attributes approach, zero runtime dependencies

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `WheelPhysics.offset` (`$state`) — The single reactive value that drives all rendering. The faux-3D transform reads this same value to compute each item's distance from center on every frame. No changes to the physics class needed.
- `WheelPickerProps` — Already has `visibleCount` and `optionItemHeight`; both are inputs to the auto-derived curvature formula.
- Ghost items (infinite mode) — Must also receive the cylindrical transform when `cylindrical={true}` and `infinite={true}`.

### Established Patterns
- Per-item inline styles via `style:*` directives — Current items use `style:height`, `style:display`, etc. The cylindrical transform adds `style:transform` conditionally.
- `$derived` for computed values — Distance-from-center calculations should be `$derived` or computed inline per item from `physics.offset`.
- Headless — No `<style>` block; all visual styling is consumer CSS. The `scaleY` transform is applied via `style:transform` (inline style), not a class — this is consistent with how `height` is already applied inline.

### Integration Points
- `WheelPicker.svelte` template — Three `{#each}` blocks (before-ghosts, real items, after-ghosts) all need the conditional transform applied when `cylindrical={true}`
- `types.ts` — `WheelPickerProps` needs `cylindrical?: boolean` (optional, default `false`)
- `+page.svelte` — New demo section appended after existing examples

</code_context>

<specifics>
## Specific Ideas

- The faux-3D effect is `scaleY`-only (no perspective camera, no rotateX) — simpler to implement, easier for consumers to reason about
- Auto-derived curvature means zero new API surface — consumers get the drum look just by passing `cylindrical={true}`
- Existing flat behavior must be byte-for-byte identical when `cylindrical={false}` (the default) — no regressions

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-rotating-drum-cylinder-list-style-picker-with-3d-perspective-items-farther-from-center-appear-smaller-and-compressed-vertically*
*Context gathered: 2026-03-25*
