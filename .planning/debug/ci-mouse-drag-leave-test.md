---
status: awaiting_human_verify
trigger: "E2E test e2e/mouse-drag-leave.spec.ts fails in CI. Test simulates mouse drag leaving component boundary, expects selection to change from 'cherry', but selection stays 'cherry'."
created: 2026-04-04T00:00:00Z
updated: 2026-04-04T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED. Two combined test issues caused CI failure: (1) the drag loop exited the component boundary mid-loop (mouse loses onpointermove events when outside element), so insufficient drag registered; (2) the snap animation takes up to 1s but the test only waited 600ms with a static assertion.
test: Fixed test — kept loop steps inside component boundary and replaced waitForTimeout(600)+static assertion with expect().not.toContainText('cherry', {timeout:2000}).
expecting: All 36 e2e tests pass with the fix applied.
next_action: Await human verification that CI passes.

## Symptoms

expected: After mouse drag leaves the component, the wheel should snap and selection should change from "cherry"
actual: Selection remains "cherry" — the drag-leave doesn't trigger movement/snap
errors: expect(selected).not.toContain('cherry') — Received: "Selected: cherry"
reproduction: pnpm test:e2e — specifically e2e/mouse-drag-leave.spec.ts
started: Failing in latest CI run. 34 other tests pass. Fails on both mobile and desktop chrome.

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-04-04T00:00:00Z
  checked: WheelPicker.svelte pointer event handlers
  found: onPointerLeave calls physics.endDrag() only when e.pointerType === 'mouse'. For mouse, pointer capture is NOT set (only touch/pen get capture). So pointerleave SHOULD fire when mouse exits the element boundary.
  implication: The pointerleave handler logic is correct. The drag should end and snap when mouse exits.

- timestamp: 2026-04-04T00:00:00Z
  checked: WheelPicker.svelte onpointermove binding
  found: onpointermove is on the wrapper div. After mouse leaves the element, pointermove events go to other elements, NOT the wrapper. So moveDrag is NOT called for the out-of-bounds portion of the drag.
  implication: Only drag moves INSIDE the component contribute to offset changes.

- timestamp: 2026-04-04T00:00:00Z
  checked: Demo page — Single Wheel WheelPicker setup
  found: fruitOptions (7 items), value='cherry' (index 2). DEFAULT_ITEM_HEIGHT=30px, DEFAULT_VISIBLE_COUNT=5. Wrapper height = 5×30 = 150px. Center Y = 75px from top.
  implication: Starting drag from center (75px from top), 10 steps × 15px = 150px upward means cursor exits the component at step 5 (75px from top edge). Only ~75px of drag registers inside the component.

- timestamp: 2026-04-04T00:00:00Z
  checked: Snap animation duration for high-velocity drag release
  found: When endDrag() fires from pointerleave (velocity ~30 items/sec), computeAnimationDuration returns min(1.2, 30/30) = 1.0 second. But test waits only 600ms before checking selectedText.
  implication: ROOT CAUSE — The snap animation takes up to 1 second (velocity-based duration), but the test only waits 600ms. In CI (slower machine, more precise timing), the animation isn't complete when the assertion runs, so state.current is still 'cherry'. Locally, timing variations may cause it to pass.

- timestamp: 2026-04-04T00:00:00Z
  checked: Loop steps vs component boundary
  found: Test loops 10 steps × 15px from center. Component is 150px tall, center is at 75px from top. After 5 steps (75px), cursor is at the top edge. After step 6 (90px), cursor exits. pointerleave fires → endDrag(). Steps 7-10 do nothing (cursor outside, no pointermove on wrapper). So only ~75px of drag actually registers.
  implication: Combined issue: insufficient drag inside + insufficient wait timeout. Fix both.

## Resolution

root_cause: Two combined test issues. (1) The drag loop performed 10 steps × 15px = 150px upward from center, but the component is only 150px tall (5 items × 30px). Starting at center (75px from top), the cursor exits the component boundary at ~step 5. After exit, Playwright's page.mouse.move() no longer fires pointermove on the wrapper (no pointer capture for mouse events). So only ~60-75px of the 150px drag was applied. (2) After pointerleave triggers endDrag() with high velocity, computeAnimationDuration returns up to 1.0s. The test waited only 600ms via waitForTimeout before reading selectedText — the snap animation hadn't completed, so state.current was still 'cherry'.
fix: Reduced loop to 4 steps (stays inside component with cursor at box.y+15), then explicitly moved outside. Replaced waitForTimeout(600)+static assertion with expect(selectedText).not.toContainText('cherry', {timeout:2000}) which polls until the animation completes. Same fix applied to both tests in the file.
verification: All 36 e2e tests pass locally (pnpm exec playwright test --reporter=line → 36 passed).
files_changed: [e2e/mouse-drag-leave.spec.ts]
