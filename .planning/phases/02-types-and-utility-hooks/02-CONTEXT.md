# Phase 2: Types and Utility Hooks - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

TypeScript types (`WheelPickerOption<T>`, `WheelPickerProps`, `WheelPickerClassNames`) and two rune-based utility hooks (`useControllableState`, `useTypeaheadSearch`) that WheelPicker will import. No UI, no components — pure infrastructure.

Requirements in scope: COMP-03, COMP-04, MODE-01, MODE-02, INTR-06, DIST-01

</domain>

<decisions>
## Implementation Decisions

### WheelPickerClassNames shape
- **D-01:** Use Svelte-idiomatic element names, not React's names
  ```ts
  type WheelPickerClassNames = {
    wrapper?: string;   // outer container div
    option?: string;    // each option row
    optionText?: string; // text span inside option
    selection?: string; // center selection highlight overlay
  }
  ```
  Phase 3 must use these exact element names when building the DOM.

### Type-ahead cycling behavior
- **D-02:** Repeated same-key presses within 500ms cycle to the next matching option, not accumulate chars
  - First "J" → first option starting with "J"
  - Second "J" within 500ms → next option starting with "J"
  - Wraps around when past the last match
  - Different key within 500ms → accumulate (standard startsWith search resets after 500ms)
  - Match is case-insensitive, startsWith

### Controlled mode: value undefined semantics
- **D-03:** `value?: T` — `undefined` is a valid controlled state meaning "no option selected"
  - Component renders with no option highlighted when `value={undefined}`
  - `useControllableState` treats `value` prop presence (not undefined-ness) to determine mode
  - Controlled mode: `value` prop is passed (even if undefined)
  - Uncontrolled mode: `value` prop is omitted, `defaultValue` used for initial state

### WheelPickerOption shape
- **D-04:** Options type matches REQUIREMENTS.md COMP-03 exactly:
  ```ts
  type WheelPickerOption<T extends string | number = string> = {
    value: T;
    label: string;
    textValue?: string; // fallback for type-ahead when label is not plain text
    disabled?: boolean;
  }
  ```

### File structure
- **D-05:** Flat layout in `src/lib/` (carried from Phase 1 D-03):
  - `src/lib/types.ts` — all exported types
  - `src/lib/use-controllable-state.svelte.ts` — controllable state hook
  - `src/lib/use-typeahead-search.svelte.ts` — typeahead hook
- **D-06:** Hook files use `.svelte.ts` extension (carried from Phase 1 D-04)

### Type exports
- **D-07:** All types exported from `src/lib/index.ts` as `export type` (DIST-01)
  - `WheelPickerOption<T>`, `WheelPickerProps`, `WheelPickerClassNames`
  - Hooks exported as named functions

### Claude's Discretion
- Exact `useControllableState` internal rune implementation (how `$state` and `$derived` are structured)
- Test setup details for the 500ms typeahead window (timer mocking approach)
- Whether `WheelPickerProps` is a full interface or type alias

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and scope
- `.planning/REQUIREMENTS.md` — COMP-03, COMP-04, MODE-01, MODE-02, INTR-06, DIST-01 definitions
- `.planning/ROADMAP.md` — Phase 2 success criteria (all 4 must be TRUE)

### Tech stack constraints
- `CLAUDE.md` — TypeScript config (`verbatimModuleSyntax`, `isolatedModules`), Svelte 5 runes patterns, `.svelte.ts` extension requirement

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/WheelPicker.svelte` — placeholder only (no logic yet); will import types from this phase
- `src/lib/index.ts` — currently exports just WheelPicker component; will add type exports here

### Established Patterns
- Flat `src/lib/` layout (no subdirectories) — established in Phase 1
- `.svelte.ts` extension for reactive hooks — established in Phase 1

### Integration Points
- `src/lib/index.ts` — all new types and hooks must be re-exported from here
- Phase 3 (WheelPicker Core) imports `WheelPickerOption`, `WheelPickerProps`, `WheelPickerClassNames`, `useControllableState`, `useTypeaheadSearch` from this phase
- `WheelPickerClassNames` field names (`wrapper`, `option`, `optionText`, `selection`) become the DOM element structure contract for Phase 3

</code_context>

<specifics>
## Specific Ideas

- `WheelPickerClassNames` uses Svelte-idiomatic names (wrapper/option/optionText/selection) rather than matching React's names (root/item/itemText/indicator)
- Type-ahead cycling: same key within 500ms advances to next match — matches iOS wheel behavior for dense lists with shared prefixes

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-types-and-utility-hooks*
*Context gathered: 2026-03-23*
