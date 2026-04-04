---
phase: quick-260404-mhi
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - e2e/mouse-drag-leave.spec.ts
  - src/lib/WheelPicker.svelte
autonomous: true
requirements: [fix-mouse-drag-outside]
must_haves:
  truths:
    - "Mouse drag that leaves the wheel picker area ends the drag and triggers snap"
    - "Touch drag that leaves the wheel picker area continues tracking (pointer capture preserved)"
    - "Mouse drag that leaves and re-enters does not resume the old drag"
  artifacts:
    - path: "e2e/mouse-drag-leave.spec.ts"
      provides: "E2E tests for mouse drag leave behavior"
    - path: "src/lib/WheelPicker.svelte"
      provides: "Fixed pointer event handlers with pointerleave"
      contains: "onPointerLeave"
  key_links:
    - from: "src/lib/WheelPicker.svelte"
      to: "use-wheel-physics.svelte.ts"
      via: "physics.endDrag() on pointerleave"
      pattern: "onPointerLeave.*endDrag"
---

<objective>
Fix mouse drag outside wheel picker area: when mouse drag moves outside the wheel picker, the drag should end and the wheel should snap. Touch behavior must NOT change.

Purpose: Mouse drags that leave the component currently continue indefinitely (due to setPointerCapture). Users expect the drag to release when the cursor leaves.
Output: E2E tests proving the fix, updated WheelPicker.svelte with conditional pointer capture
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/WheelPicker.svelte
@src/lib/use-wheel-physics.svelte.ts
@e2e/mouse-wheel.spec.ts

<interfaces>
From src/lib/WheelPicker.svelte (lines 211-225, current pointer handlers):
```typescript
function onPointerDown(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    physics.startDrag(e.clientY);
}

function onPointerMove(e: PointerEvent) {
    physics.moveDrag(e.clientY);
}

function onPointerUp(e: PointerEvent) {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    physics.endDrag();
}
```

Template bindings (line 245-248):
```svelte
onpointerdown={onPointerDown}
onpointermove={onPointerMove}
onpointerup={onPointerUp}
onpointercancel={onPointerUp}
```

From src/lib/use-wheel-physics.svelte.ts (endDrag guard):
```typescript
endDrag(): void {
    if (!this.#isDragging) return;  // Safe to call multiple times
    // ... triggers snap animation
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Write failing E2E tests for mouse drag leave behavior</name>
  <files>e2e/mouse-drag-leave.spec.ts</files>
  <behavior>
    - Test 1: Mouse drag that moves outside the component boundary should end the drag and snap to a value (not hang waiting for mouseup)
    - Test 2: Mouse drag that leaves and re-enters (without releasing) should NOT resume dragging -- a new mousedown is required
  </behavior>
  <action>
Create `e2e/mouse-drag-leave.spec.ts` with 2 tests following the existing e2e pattern (see mouse-wheel.spec.ts):

1. Locate the "Single Wheel" section, find `[data-swp-wrapper]`, get bounding box.
2. Use `page.mouse.move/down/move` to simulate drags.

**Test 1: "mouse drag leaving component ends drag and snaps"**
- Navigate to `/`, wait for "cherry" selected text.
- Get wrapper bounding box (`box`), compute center `cx`, `startY = box.y + box.height / 2`.
- `page.mouse.move(cx, startY)` then `page.mouse.down()`.
- Drag upward in steps: loop 5 steps of `page.mouse.move(cx, startY - 15*i)` with 16ms waits.
- Move outside component: `page.mouse.move(cx, box.y - 50)` (above the component).
- Wait 16ms, then do NOT call `page.mouse.up()`.
- Wait 600ms for snap animation to settle.
- Assert selected text is NOT "cherry" (value changed from drag).
- Assert `[data-swp-selected]` attribute exists on some option (wheel snapped, not stuck mid-drag).

**Test 2: "mouse drag leaving and re-entering does not resume old drag"**
- Same setup as Test 1.
- Drag upward, move outside (`box.y - 50`), wait 600ms for snap.
- Record the selected value after snap.
- Move back inside: `page.mouse.move(cx, startY)` (still holding mouse button -- no mouseup was called).
- Move further inside: `page.mouse.move(cx, startY + 60)` with 16ms wait.
- Wait 400ms.
- Assert selected value has NOT changed from the snapped value (the re-entry did not resume dragging).

Run with: `npx playwright test e2e/mouse-drag-leave.spec.ts --project=desktop-chrome`
Tests MUST FAIL at this point (the bug still exists -- drag does not end on leave).
  </action>
  <verify>
    <automated>npx playwright test e2e/mouse-drag-leave.spec.ts --project=desktop-chrome 2>&1 | tail -20</automated>
  </verify>
  <done>2 E2E tests exist in e2e/mouse-drag-leave.spec.ts. Tests fail because the bug has not been fixed yet (RED phase of TDD).</done>
</task>

<task type="auto">
  <name>Task 2: Fix pointer event handlers -- conditional capture + pointerleave</name>
  <files>src/lib/WheelPicker.svelte</files>
  <action>
Modify `src/lib/WheelPicker.svelte` pointer event handlers (lines 211-225) and template bindings (lines 245-248):

**1. Update `onPointerDown`** -- only setPointerCapture for touch/pen, not mouse:
```typescript
function onPointerDown(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    if (e.pointerType !== 'mouse') {
        el.setPointerCapture(e.pointerId);
    }
    physics.startDrag(e.clientY);
}
```

**2. Update `onPointerUp`** -- only releasePointerCapture if element has it:
```typescript
function onPointerUp(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
    }
    physics.endDrag();
}
```

**3. Add `onPointerLeave`** -- end drag only for mouse pointers:
```typescript
function onPointerLeave(e: PointerEvent) {
    if (e.pointerType === 'mouse') {
        physics.endDrag();
    }
}
```

**4. Add `onpointerleave` binding** to the wrapper div (after `onpointercancel`):
```svelte
onpointerleave={onPointerLeave}
```

This is safe because:
- `endDrag()` has an `if (!this.#isDragging) return;` guard, so double-calls (pointerleave + pointerup) are no-ops.
- Touch/pen still gets pointer capture, so touch behavior is unchanged.
- Mouse no longer gets pointer capture, so `pointermove` stops and `pointerleave` fires when cursor exits.
  </action>
  <verify>
    <automated>npx playwright test e2e/mouse-drag-leave.spec.ts --project=desktop-chrome 2>&1 | tail -20</automated>
  </verify>
  <done>Both E2E tests pass (GREEN phase). Mouse drag ending on leave works. Touch behavior unchanged (pointer capture preserved for touch/pen).</done>
</task>

<task type="auto">
  <name>Task 3: Run full E2E suite to verify no regressions</name>
  <files></files>
  <action>
Run the complete E2E test suite across both desktop and mobile projects to confirm no regressions:

```bash
npx playwright test --project=desktop-chrome
npx playwright test --project=mobile-chrome
```

If any existing tests fail, investigate and fix. The most likely regression point would be touch gesture tests in `e2e/touch-gestures.spec.ts` or `e2e/mobile-touch.spec.ts` -- verify those still pass since we preserved pointer capture for touch/pen.

Also run the unit test suite: `pnpm test:unit` to verify no type or logic regressions.
  </action>
  <verify>
    <automated>npx playwright test 2>&1 | tail -20</automated>
  </verify>
  <done>All E2E tests pass (desktop + mobile). All unit tests pass. No regressions introduced.</done>
</task>

</tasks>

<verification>
- E2E tests in `e2e/mouse-drag-leave.spec.ts` pass on desktop-chrome
- Existing E2E tests in `e2e/touch-gestures.spec.ts` and `e2e/mobile-touch.spec.ts` still pass
- Mouse drag leaving component ends the drag and triggers snap animation
- Touch drag is unaffected (pointer capture preserved for touch/pen)
</verification>

<success_criteria>
- 2 new E2E tests passing in mouse-drag-leave.spec.ts
- WheelPicker.svelte uses conditional pointer capture (touch/pen only)
- WheelPicker.svelte has onpointerleave handler calling physics.endDrag() for mouse
- Full E2E suite green (no regressions)
</success_criteria>

<output>
After completion, create `.planning/quick/260404-mhi-fix-mouse-drag-outside-wheel-picker-area/260404-mhi-SUMMARY.md`
</output>
