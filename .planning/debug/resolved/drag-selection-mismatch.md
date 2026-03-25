---
status: resolved
trigger: "drag-selection-mismatch: When changing selections by dragging mouse, the selected option differs from the central option in the wheel picker (e.g., if wheel picker is over 'cherry', selected shows 'elderberry')"
created: 2026-03-25T00:00:00Z
updated: 2026-03-25T00:00:01Z
---

## Current Focus

hypothesis: CONFIRMED — indexToOffset/offsetToIndex do not account for the N before-ghost rows prepended to the DOM container in infinite mode, causing the physics offset to place real items N*itemHeight below the center.
test: Verified by tracing: indexToOffset(2,30,5)=0 for cherry but translateY(0) centers ghost[elderberry] (container y=60), not real cherry (container y=270). The mismatch is exactly N*itemHeight = 7*30 = 210px.
expecting: Fix by correcting offset calculations in WheelPhysics to account for the ghost row prefix when infinite=true
next_action: Implement fix in use-wheel-physics.svelte.ts — add private #indexToOffset/#offsetToIndex helpers that apply ghost correction

## Symptoms

expected: When dragging the wheel picker, the highlighted/selected value should match the item visually centered in the wheel picker
actual: The selected value (emitted via onValueChange or stored in state) shows a different item than what appears centered in the wheel — there is an offset (e.g., shows "elderberry" when centered on "cherry")
errors: No console errors reported
reproduction: Open the demo page, drag the wheel picker up or down, observe that the selected/displayed value does not match the item visually in the center of the wheel
started: Unknown — possibly always present or introduced during a recent phase

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-03-25T00:00:01Z
  checked: indexToOffset(index, h, vc) formula and DOM structure of WheelPicker.svelte in infinite mode
  found: |
    DOM has N before-ghosts + N real items + N after-ghosts. Real item[i] is at container position (N + i) * h.
    For translateY(offset) to center real item[i], need: (N+i)*h + offset = floor(vc/2)*h
    → offset = floor(vc/2)*h - (N+i)*h
    But indexToOffset(i, h, vc) = floor(vc/2)*h - i*h  (missing the -N*h term)
    For cherry (i=2, N=7, h=30, vc=5): correct=-210, formula gives=0
    At translateY(0), container y=60 → ghost[reversed index 2] = fruitOptions[4] = elderberry
  implication: Root cause confirmed. indexToOffset is off by N*h in infinite mode. This is why "cherry shows elderberry".

## Resolution

root_cause: In infinite mode, WheelPicker prepends N before-ghost rows to the options container DOM. The indexToOffset and offsetToIndex functions in wheel-physics-utils.ts do not account for this, computing offsets as if real items start at the container top. This shifts visual centering by N*itemHeight, causing a misalignment of N items between what's visually centered and what's selected.
fix: Add private #indexToOffset and #offsetToIndex wrapper methods in WheelPhysics that apply a ghost correction (N * itemHeight) when infinite=true, and replace all direct calls to the utility functions with these wrappers.
verification: All 50 unit tests pass (wheel-physics-utils tests unaffected — pure utility functions unchanged). Fix adds two private methods #indexToOffset/#offsetToIndex to WheelPhysics that apply ghost correction when infinite=true, and replaces all 7 direct utility call sites in the class.
files_changed: [src/lib/use-wheel-physics.svelte.ts]
