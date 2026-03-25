---
phase: 07-rotating-drum-cylinder-list-style-picker-with-3d-perspective-items-farther-from-center-appear-smaller-and-compressed-vertically
plan: 02
subsystem: ui
tags: [svelte5, wheel-picker, cylindrical, 3d-perspective, scaleY, opacity, demo]

# Dependency graph
requires:
  - phase: 07-01
    provides: cylindricalScaleY function in wheel-physics-utils.ts, cylindrical prop in WheelPickerProps
provides:
  - WheelPicker.svelte wired with cylindrical scaleY+opacity transforms in all three each blocks
  - data-swp-cylindrical attribute on wrapper when cylindrical=true
  - Drum / Cylinder demo section on +page.svelte
affects: [shadcn-registry, package-build, demo-site]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "{@const} inside {#each} for per-item derived values without $derived overhead"
    - "style:transform={scale !== undefined ? ... : undefined} pattern omits attribute entirely in flat mode"

key-files:
  created: []
  modified:
    - src/lib/WheelPicker.svelte
    - src/routes/+page.svelte

key-decisions:
  - "scale=undefined when cylindrical=false ensures style:transform and style:opacity are omitted from DOM (byte-for-byte flat mode preservation)"
  - "Before-ghost slot index: g - options.length (negative indices map correctly in cylindricalScaleY)"
  - "After-ghost slot index: options.length + j (positive indices beyond real items)"

patterns-established:
  - "Pattern: {@const} inside {#each} computes per-iteration derived values without polluting component scope"

requirements-completed: [DRUM-03, DRUM-04]

# Metrics
duration: 2min
completed: 2026-03-25
---

# Phase 7 Plan 02: Wire Cylindrical Transforms into WheelPicker Summary

**scaleY+opacity cylindrical drum effect wired into WheelPicker.svelte template across all three item rendering blocks, with Drum / Cylinder demo section on +page.svelte**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-25T12:26:41Z
- **Completed:** 2026-03-25T12:28:12Z
- **Tasks:** 3 of 3 complete
- **Files modified:** 2

## Accomplishments
- WheelPicker.svelte now imports and calls `cylindricalScaleY` from `wheel-physics-utils.js`
- All three `{#each}` blocks (before-ghosts, real items, after-ghosts) apply `scaleY` and `opacity` transforms when `cylindrical=true`
- `data-swp-cylindrical="true"` attribute appears on wrapper div when prop is enabled
- When `cylindrical=false` (default), `scale` is `undefined` — both `style:transform` and `style:opacity` are omitted from DOM entirely, preserving flat mode byte-for-byte
- Drum / Cylinder demo section added to +page.svelte using `fruitOptions` and existing CSS classes

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire cylindrical transforms into WheelPicker.svelte** - `a25ab09` (feat)
2. **Task 2: Add Drum / Cylinder demo section to +page.svelte** - `c5b8970` (feat)
3. **Task 3: Visual verification of cylindrical drum effect** - human-approved (checkpoint resolved)

## Files Created/Modified
- `src/lib/WheelPicker.svelte` - Added cylindricalScaleY import, cylindrical prop destructuring, data-swp-cylindrical attribute, {@const scale} + style:transform + style:opacity in all three each blocks
- `src/routes/+page.svelte` - Added selectedCylindrical state variable and Drum / Cylinder section with cylindrical={true} WheelPicker

## Decisions Made
- `scale=undefined` when cylindrical=false ensures `style:transform` and `style:opacity` attributes are omitted from the DOM entirely (Svelte omits attributes with `undefined` value) — preserves byte-for-byte flat mode rendering
- Before-ghost index formula: `g - options.length` (gives negative indices that map correctly through cylindricalScaleY's distance calculation)
- After-ghost index formula: `options.length + j` (gives indices beyond real items, correctly mapped)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing `types.test.ts` "No test suite found" failure — this file contains only compile-time type checks (no `describe`/`test` blocks). All 56 runtime unit tests pass. Not caused by this plan's changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 7 fully complete — human verified and approved the cylindrical drum visual effect
- Drum / Cylinder section confirmed: visible compression effect during scroll, smooth scaleY+opacity transitions
- Single Wheel and Infinite Loop sections confirmed unchanged (no cylindrical effect)
- WheelPicker cylindrical mode is production-ready

---
*Phase: 07-rotating-drum-cylinder-list-style-picker-with-3d-perspective-items-farther-from-center-appear-smaller-and-compressed-vertically*
*Completed: 2026-03-25*
