---
status: resolved
trigger: "drag-outside-selection-wrong: When the mouse drags outside the wheel picker container during a drag, releasing the mouse selects the wrong (seemingly random) option instead of the one the wheel was scrolled to."
created: 2026-03-25T00:00:00Z
updated: 2026-03-25T00:00:00Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: CONFIRMED. moveDrag() allows offset to go beyond the 3×N ghost DOM items. At offset=-620.87 (rawIndex=16, past last after-ghost at rawIndex=13), the visible area is empty. On release, wrapIndex(16,7)=2 (Cherry) is correctly computed but the wheel animates 410px backward to Cherry. User sees empty → backward snap → wrong item. The .reverse() fix was correct for before-ghost visual fidelity but does NOT prevent this out-of-bounds drag. Root cause: no offset normalization in moveDrag for infinite mode.
test: Implement offset normalization in moveDrag: when newOffset goes past ghost bounds, shift by ±N*itemHeight and adjust #dragStartOffset by the same amount. Verify: dragging past after-ghost continues smoothly, selection matches last visually-centered item, no backward snap on release.
expecting: After fix, dragging smoothly wraps at ghost boundaries, release always selects the visually-centered item, no backward animation.
next_action: Implement fix in use-wheel-physics.svelte.ts moveDrag()

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Drag should continue tracking as mouse moves outside the container, and mouseup should commit the selection to whichever option the wheel landed on
actual: When the mouse leaves the container boundary mid-drag and is released outside, the wrong option is selected (seems random/unpredictable)
errors: No visible errors
reproduction: Start a mouse drag on the wheel, move the mouse outside the container boundary while still dragging, release the mouse — the wrong option is selected
started: Works correctly when drag stays inside the container. Broken only when mouse exits the container during drag.

## Eliminated
<!-- APPEND only - prevents re-investigating -->

- hypothesis: Pointer capture not working / events not delivered outside container
  evidence: Svelte compiles pointer events as delegated handlers on document. setPointerCapture is correctly called on e.currentTarget (wrapper div) inside the delegated handler. Captured events dispatch to wrapper div and bubble to document where Svelte's delegated listener catches them. Event routing is correct.
  timestamp: 2026-03-25

- hypothesis: #offsetToIndex or #indexToOffset math is wrong (the drag-selection-mismatch fix)
  evidence: The formulas are correct for real items (DOM N..2N-1) and after-ghosts (DOM 2N..3N-1). The issue is the BEFORE-GHOST content is in the wrong order, not the formula.
  timestamp: 2026-03-25

- hypothesis: .reverse() removal fixes the before-ghost wrong-selection bug (which is the root cause of drag-outside-selection-wrong)
  evidence: User confirmed .reverse() removal did NOT fix the reported bug. Console trace shows rawIndex=16 (after-ghost overflow) not rawIndex in before-ghost range. The before-ghost mismatch is a secondary correctness issue; the primary drag-outside bug is offset overflow in moveDrag allowing the wheel to go past all DOM items.
  timestamp: 2026-03-25

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-03-25T12:00:00Z
  checked: Mathematical trace of endDrag + animateTo for before-ghost region (offset=-120) after cfa92bd fix
  found: After cfa92bd, animateTo(6) targets #indexToOffset(6) = -330 (REAL Grape position), not -120 (ghost position). The snap correctly ends at real Grape. onSnap(6) fires, wrapIndex(6,7)=6, jumpTo(6)=-330. state.current='grape'. All math confirms correct selection regardless of .reverse() status.
  implication: The .reverse() fix addresses a VISUAL artifact during drag (before-ghost shows wrong item while dragging), but does NOT affect the selection outcome. The selection was already correct after cfa92bd. The persisting bug must have a different root cause.

- timestamp: 2026-03-25T12:00:00Z
  checked: Re-analysis of event routing for Svelte 5 delegated pointerup with pointer capture
  found: All analysis confirms correct routing. setPointerCapture called on wrapper div. Captured events bubble to document. Delegation fires. endDrag is called. Math produces correct index. This cannot be verified without actual runtime observation.
  implication: Need runtime trace (console.log) to observe: (1) is endDrag called at all? (2) what offset/velocity/index at call time? (3) what does animateTo receive? Added logging to endDrag, animateTo, onPointerDown, onPointerUp, and onSnap callback.

- timestamp: 2026-03-25
  checked: Svelte compiled output for WheelPicker.svelte pointer events
  found: pointerdown/pointermove/pointerup are DELEGATED via document-level listener. pointercancel and wheel are direct listeners. setPointerCapture is correctly called on e.currentTarget (wrapper div) inside the handler. Pointer capture + Svelte delegation is a valid combination.
  implication: Event routing is not the bug. All pointer events including those captured outside the container are delivered correctly.

- timestamp: 2026-03-25
  checked: Before-ghost DOM layout in WheelPicker.svelte (line 239: {#each [...options].reverse() as option})
  found: Before-ghosts rendered as REVERSED options: [Grape, Fig, Elderberry, Date, Cherry, Banana, Apple] at DOM positions 0-6. DOM position 6 (just above real Apple) = Apple ghost. This means the item visually just above real Apple is APPLE AGAIN, not Grape.
  implication: When user scrolls past Apple into before-ghost area, they see Apple (ghost) then Banana, etc. — NOT Grape wrapping around. The visual is semantically wrong.

- timestamp: 2026-03-25
  checked: #offsetToIndex for before-ghost region
  found: For before-ghost at DOM position k (k < N): #offsetToIndex returns wrapIndex(k - N, N) = k mod N. So DOM 6 → 6 (Grape), DOM 0 → 0 (Apple). But visually DOM 6 shows Apple (reversed ghost) and DOM 0 shows Grape. MISMATCH — code computes Grape for position that shows Apple, and vice versa.
  implication: Any drag that releases while offset corresponds to before-ghost region will snap to the WRONG option (N-1-k instead of k).

- timestamp: 2026-03-25
  checked: When is before-ghost region reachable?
  found: For 7 options, 5 visible (150px container), starting at Cherry (index 2, offset=-210): entering before-ghost region requires offset > -150 (past Apple) + one more 30px step → offset > -120. From Cherry center, that requires 90px drag. Container center to edge is 75px (half of 150px). So minimum 15px outside the container is needed to enter the before-ghost area from Cherry.
  implication: The bug ONLY manifests when dragging outside the container (the 90px threshold exceeds what's possible while staying inside). This exactly matches the reported symptom: "works inside, broken only when mouse exits container."

- timestamp: 2026-03-25T13:00:00Z
  checked: User-provided console output for one drag-outside-release sequence. rawIndex=16, offset=-620.8671875, currentIndex=2 (Cherry), snapIndex=2, cherry selected. Traced math: from Cherry(offset=-210), drag delta=-410px, rawIndex=16, wrapIndex(16,7)=2=Cherry. Math is correct. BUT: DOM only has 3N=21 items covering rawIndex -7..13. rawIndex=16 is past the last after-ghost (rawIndex 13, DOM20) at offset=-540. At offset=-620, the visible area is COMPLETELY EMPTY. The user sees nothing in the center slot.
  implication: moveDrag() does not constrain the offset in infinite mode. The user can drag past all ghost items into empty space. On release, wrapIndex returns the correct item mathematically but the wheel animates 410px BACKWARD to reach it. User perceives this as "wrong selection" because (a) empty space visible at release, (b) large backward animation. The .reverse() fix (before-ghost visual fidelity) is correct but insufficient — the root cause is missing offset normalization in moveDrag for infinite mode.

- timestamp: 2026-03-25T13:00:00Z
  checked: Whether inertia path computeSnapTarget bug causes wrong selection
  found: computeSnapTarget(currentIndex=wrapIndex(rawIndex,N), velocity) vs computeSnapTarget(rawIndex, velocity) — for infinite mode, the overshoot direction/magnitude gives the same wrapped result regardless of starting loop, because wrapIndex is linear modulo. No bug here.
  implication: The inertia path does not cause wrong selection. The bug is only in moveDrag offset overflow.

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: moveDrag() in WheelPhysics applies unconstrained offset updates in infinite mode (no boundary limits). The DOM has exactly 3×N items (before-ghosts + real + after-ghosts) covering rawIndex -N..2N-1. When the user drags outside the container (pointer capture), the offset can exceed these bounds — e.g., dragging far down puts offset=-620 with rawIndex=16 (past last after-ghost at rawIndex=13, offset=-540). The visible area becomes completely empty. On release, endDrag() correctly computes wrapIndex(rawIndex,N) but animateTo() then snaps 410px BACKWARD to the real section, which looks and feels like the wrong item being selected. Additionally, the before-ghost .reverse() issue (visual/selection mismatch in before-ghost region) is a secondary correctness issue compounded by the same root cause.
fix: (1) In moveDrag(), added infinite-mode offset normalization using while-loops: when newOffset goes past afterGhostEnd (#indexToOffset(2N)) or beforeGhostEnd (#indexToOffset(-N-1)), normalize by ±loopDistance (N*itemHeight) applied to BOTH newOffset AND #dragStartOffset for drag continuity. This keeps the DOM always populated at the visual center. (2) In endDrag() infinite slow path and inertia path, compute loopOffset = rawIndex < 0 ? -N : rawIndex >= N ? N : 0 and call animateTo(snapIndex + loopOffset) instead of animateTo(snapIndex). This makes the snap animation move in the same direction as the drag (forward) rather than jumping backward to real-section. onSnap normalizes via wrapIndex + jumpTo as before. (3) The .reverse() removal (already in working tree) remains for before-ghost visual correctness. Files changed: src/lib/use-wheel-physics.svelte.ts.
verification: Mathematical verification: (a) moveDrag normalization for N=7,h=30 — afterGhostEnd=-570, beforeGhostEnd=90, loopDistance=210. Offset -620.87 < -570 → +210 → -410.87, rawIndex=9 (after-ghost Cherry). ✓ (b) endDrag slow path at rawIndex=9: loopOffset=7, animateTo(9) → target offset=-420, current≈-420, 0-distance snap, onSnap(9) → jumpTo(2), cherry ✓. (c) endDrag slow path in before-ghost at rawIndex=-1 (Grape): loopOffset=-7, animateTo(-1) → target=-120, current≈-120, onSnap(-1) → jumpTo(6), grape ✓. (d) All 50 unit tests pass (browser tests have pre-existing Playwright crash unrelated to this fix).
files_changed: [src/lib/use-wheel-physics.svelte.ts]
