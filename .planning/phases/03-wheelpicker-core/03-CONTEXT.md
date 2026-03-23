# Phase 3: WheelPicker Core - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

A single WheelPicker wheel delivers the iOS-feel interaction — touch drag, mouse drag, scroll wheel, inertia, snap-to-item, keyboard navigation, disabled option support, selection highlight overlay, data attributes, classNames injection, and configurable props — in finite mode only. Infinite loop scrolling is Phase 4.

Requirements in scope: COMP-01, INTR-01, INTR-02, INTR-03, INTR-04, INTR-05, MODE-04, STYL-01, STYL-02, STYL-03, STYL-04

</domain>

<decisions>
## Implementation Decisions

### Scrolling Mechanism
- **D-01:** Use JS-driven translateY + requestAnimationFrame (RAF) for all scrolling — no CSS scroll snap.
  - Pointer/touch events track delta → update a JS offset → CSS transform applied each frame
  - On release: kick off inertia decay loop (friction applied per RAF frame until velocity < threshold)
  - Then snap: animate to nearest item index
  - This is the exact approach used in the React version and is required for tunable inertia feel.

### Physics Constants
- **D-02:** Copy the React source physics constants exactly (`@ncdai/react-wheel-picker` v1.2.2).
  - Do not invent our own friction coefficient, velocity threshold, or snap duration.
  - Goal is UX parity — identical feel to the React version.
  - Researcher must read the React source to extract exact constants.

### Data Attribute Prefix
- **D-03:** Use `data-swp-*` prefix (Svelte Wheel Picker) for all structural data attributes.
  - Does NOT match the React version's `data-rwp-*` — we use our own namespace.
  - Structural elements and their attributes:
    ```
    data-swp-wrapper     → outer container div
    data-swp-option      → each option row
    data-swp-option-text → text span inside each option (maps to WheelPickerClassNames.optionText)
    data-swp-selection   → center selection highlight overlay
    ```
- **D-04:** State data attributes are also applied (enables pure-CSS consumer styling):
  ```
  data-swp-selected="true"   → on the currently selected option
  data-swp-disabled="true"   → on disabled options
  ```
  All structural + state attributes use the `data-swp-*` prefix consistently.

### Mid-Flight Value Update
- **D-05:** When the external `value` prop changes while inertia is still animating, cancel inertia immediately and animate the wheel to the new value's position.
  - External value always wins — controlled mode is authoritative.
  - The wheel should animate quickly (not snap instantaneously) to the new position for smoothness.
  - Matches iOS UIPickerView semantics.

### visibleCount Prop
- **D-06:** `visibleCount` default is `5` (matching the React version).
- **D-07:** `visibleCount` must be an odd number (ensures a true center row for the selection highlight).
  - If an even number is passed, emit a `console.warn` and round up to the nearest odd number.
  - Contract: odd only. Default: 5. Typical values: 3, 5, 7.

### Props Extension
- **D-08:** The remaining configurable props (`visibleCount`, `dragSensitivity`, `scrollSensitivity`, `optionItemHeight`) are added to the `WheelPickerProps` interface in `src/lib/types.ts`.
  - These are optional with documented defaults matching the React version.
  - `infinite` prop is NOT added in Phase 3 — that's Phase 4's work.

### DOM Structure Contract
- **D-09:** Carries forward Phase 2 D-01 — WheelPickerClassNames element names (`wrapper`, `option`, `optionText`, `selection`) map exactly to the DOM elements with their `data-swp-*` attributes:
  ```
  wrapper     → data-swp-wrapper
  option      → data-swp-option
  optionText  → data-swp-option-text
  selection   → data-swp-selection
  ```

### Claude's Discretion
- Exact RAF loop implementation and how $state integrates with animation frame callbacks
- How to cancel an in-progress RAF loop (cancel token / boolean flag)
- Whether `useControllableState` is called directly inside WheelPicker.svelte or wrapped in a thin adapter
- Selection overlay DOM placement (before/after options list, or absolutely positioned within wrapper)
- Exact snap animation curve (linear vs. ease-out) — use React source as reference
- Test strategy for inertia (unit test physics in isolation vs. integration test in browser)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### React source (physics + DOM structure)
- React version npm package: `@ncdai/react-wheel-picker` v1.2.2 — researcher must install or find source to extract: friction coefficient, velocity threshold, snap animation duration, DOM structure, data attribute names used in React version (for contrast)
- GitHub: https://github.com/ncdai/react-wheel-picker (MIT license, 684 stars as of project start)

### Requirements and scope
- `.planning/REQUIREMENTS.md` — COMP-01, INTR-01 through INTR-05, MODE-04, STYL-01 through STYL-04 definitions
- `.planning/ROADMAP.md` — Phase 3 success criteria (5 criteria that must be TRUE)

### Prior phase contracts
- `.planning/phases/02-types-and-utility-hooks/02-CONTEXT.md` — WheelPickerClassNames shape, WheelPickerProps interface, useControllableState and useTypeaheadSearch hook APIs
- `src/lib/types.ts` — Current WheelPickerProps definition (needs extension with visibleCount, dragSensitivity, scrollSensitivity, optionItemHeight)
- `src/lib/use-controllable-state.svelte.ts` — Hook API for controlled/uncontrolled state
- `src/lib/use-typeahead-search.svelte.ts` — Hook API for type-ahead keyboard search

### Tech stack constraints
- `CLAUDE.md` — Svelte 5 runes patterns, zero runtime dependencies constraint, headless/data-attributes approach

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/use-controllable-state.svelte.ts` — manages controlled/uncontrolled value state; WheelPicker will use this for `value`/`defaultValue`/`onValueChange`
- `src/lib/use-typeahead-search.svelte.ts` — handles keystroke accumulation and option matching; WheelPicker will wire keyboard events to this
- `src/lib/types.ts` — `WheelPickerProps`, `WheelPickerClassNames`, `WheelPickerOption<T>` are all ready; only needs prop additions (D-08)

### Established Patterns
- Flat `src/lib/` layout — no subdirectories; WheelPicker.svelte stays at root level
- `.svelte.ts` extension for reactive hooks — any new hook files for animation state use this extension
- Headless — no `<style>` blocks; all visual styling via consumer CSS targeting `data-swp-*`
- Class-based Svelte 5 rune hooks (established in Phase 2) for encapsulating private `$state` fields

### Integration Points
- `src/lib/WheelPicker.svelte` — placeholder div to be fully replaced; the real component lives here
- `src/lib/index.ts` — already exports WheelPicker; no barrel changes needed unless new files are added
- `src/lib/types.ts` — `WheelPickerProps` needs `visibleCount`, `dragSensitivity`, `scrollSensitivity`, `optionItemHeight` added with defaults documented

</code_context>

<specifics>
## Specific Ideas

- Data attribute prefix is `data-swp-*` (Svelte Wheel Picker), deliberately different from React's `data-rwp-*`
- State data attributes (`data-swp-selected`, `data-swp-disabled`) enable pure-CSS consumer styling without JS — intentional design choice
- Physics constants must come from the React source v1.2.2, not invented
- Mid-flight cancellation: external value always wins — controlled mode is authoritative, inertia is subordinate to prop updates

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-wheelpicker-core*
*Context gathered: 2026-03-23*
