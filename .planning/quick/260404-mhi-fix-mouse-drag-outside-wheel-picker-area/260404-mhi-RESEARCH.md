# Quick Task: Fix Mouse Drag Outside Wheel Picker Area - Research

**Researched:** 2026-04-04
**Domain:** Pointer event handling, drag behavior
**Confidence:** HIGH

## Summary

The wheel picker currently uses `setPointerCapture()` on `pointerdown`, which causes ALL subsequent pointer events to be delivered to the capturing element even when the pointer moves outside it. This is the standard pattern for drag-and-drop but prevents `pointerleave` from firing, so the drag continues indefinitely until mouseup. The user wants the drag to end when the mouse leaves the component area.

**Primary recommendation:** Remove `setPointerCapture` / `releasePointerCapture` and add a `pointerleave` handler that calls `physics.endDrag()`. This is the simplest fix. Without pointer capture, `pointermove` events will stop being delivered once the pointer leaves the element, and `pointerleave` will fire to trigger the snap animation.

## Current Implementation Analysis

### How drag works now (WheelPicker.svelte lines 212-225)

```typescript
function onPointerDown(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);       // <-- THIS is the problem
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

Events bound in template:
```svelte
onpointerdown={onPointerDown}
onpointermove={onPointerMove}
onpointerup={onPointerUp}
onpointercancel={onPointerUp}
```

### Why pointer capture causes this bug

`setPointerCapture()` redirects all pointer events for that pointer to the capturing element. This means:
- `pointermove` fires on the element even when the pointer is outside it
- `pointerleave` does NOT fire while capture is active (per spec, `pointerleave` is suppressed during capture)
- Only `pointerup` or `pointercancel` ends the capture
- Result: user drags outside, nothing happens until they release the button

### React version comparison

The React version (`@ncdai/react-wheel-picker`) uses document-level `mousemove`/`mouseup` listeners (not pointer capture). It also does NOT end the drag on mouse leave -- it continues tracking until mouseup. So the user's desired behavior is a **deviation from React parity**, which is acceptable since they explicitly requested it.

## Fix Strategy

### Option A: Remove pointer capture, add pointerleave (RECOMMENDED)

1. Remove `setPointerCapture()` from `onPointerDown`
2. Remove `releasePointerCapture()` from `onPointerUp`
3. Add `onpointerleave` handler to the wrapper div that calls `physics.endDrag()`
4. The existing `onpointercancel` handler already calls `onPointerUp` which calls `endDrag()`

**Pros:** Simple, clean, matches user expectation
**Cons:** If user drags outside and comes back, they'd need to re-initiate the drag (this is the desired behavior per the request)

**Important consideration for touch:** On touch devices, the finger physically stays on the screen. Pointer capture is important for touch because without it, moving the finger outside the element would end the touch drag -- which is NOT desirable. The fix should only apply to mouse pointers, not touch.

### Touch vs Mouse distinction

The `pointerType` property distinguishes input types:
- `e.pointerType === 'mouse'` -- mouse input
- `e.pointerType === 'touch'` -- touch/finger input
- `e.pointerType === 'pen'` -- stylus input

**Recommended approach:** Only set pointer capture for touch/pen, skip it for mouse.

```typescript
function onPointerDown(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    if (e.pointerType !== 'mouse') {
        el.setPointerCapture(e.pointerId);
    }
    physics.startDrag(e.clientY);
}

function onPointerUp(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
    }
    physics.endDrag();
}

function onPointerLeave(e: PointerEvent) {
    // Only end drag on mouse leave -- touch capture handles touch
    if (e.pointerType === 'mouse') {
        physics.endDrag();
    }
}
```

Then add `onpointerleave={onPointerLeave}` to the wrapper div.

## E2E Test Strategy

### Test infrastructure

- Playwright config at `playwright.config.ts`
- Tests in `e2e/` directory
- Two projects: `mobile-chrome` (Pixel 5) and `desktop-chrome`
- Web server: `npx vite dev --port 4173`
- Existing pattern: locate the "Single Wheel" section, find `[data-swp-wrapper]`, get bounding box, perform mouse actions

### Tests to write (2-3 tests)

File: `e2e/mouse-drag-leave.spec.ts`

**Test 1: Mouse drag that leaves the component area should end the drag and snap**
- Start a mouse drag inside the wheel picker
- Move the mouse outside the component boundary (below it)
- Verify the wheel snaps to a position (drag ended)
- Verify the value updates (not stuck waiting)

**Test 2: Mouse drag that leaves and returns should require re-initiation**
- Start a mouse drag inside the wheel picker
- Move outside the component boundary
- Move back inside (without releasing)
- Move further inside -- should NOT continue dragging (drag was ended on leave)
- Need to mousedown again to start a new drag

**Test 3: Touch drag that leaves the component should NOT end the drag** (optional, mobile project only)
- This verifies touch pointer capture is preserved
- May be difficult to test reliably with Playwright touch emulation

### Test pattern from existing tests

```typescript
// Get bounding box
const box = await wrapper.boundingBox();
const cx = box.x + box.width / 2;
const startY = box.y + box.height / 2;

// Drag sequence
await page.mouse.move(cx, startY);
await page.mouse.down();
// Move outside: use box.y + box.height + 50 (below the component)
for (let i = 1; i <= 10; i++) {
    await page.mouse.move(cx, startY - 15 * i);
    await page.waitForTimeout(16);
}
// Don't mouseup -- just wait and check that it snapped
```

## Common Pitfalls

### Pitfall 1: Breaking touch drag behavior
**What goes wrong:** Removing pointer capture entirely breaks touch scrolling -- finger sliding outside the small component area is common on mobile
**How to avoid:** Only skip pointer capture for `pointerType === 'mouse'`

### Pitfall 2: Double endDrag calls
**What goes wrong:** If `pointerleave` fires and then `pointerup` also fires, `endDrag()` is called twice
**How to avoid:** `endDrag()` already guards with `if (!this.#isDragging) return;` -- the second call is a no-op. No fix needed.

### Pitfall 3: Playwright mouse.move may not trigger pointerleave
**What goes wrong:** Playwright's `page.mouse.move()` to coordinates outside an element should trigger `pointerleave`, but timing can be tricky
**How to avoid:** Use explicit coordinates well outside the bounding box, add small waits between steps

## Sources

### Primary (HIGH confidence)
- `src/lib/WheelPicker.svelte` lines 212-248 -- current pointer event handling
- `src/lib/use-wheel-physics.svelte.ts` lines 140-252 -- drag physics (startDrag, moveDrag, endDrag)
- [MDN Pointer Capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture) -- pointer capture suppresses leave events
- React source at `packages/react-wheel-picker/src/index.tsx` -- uses document-level mouse events, no pointer capture
- Existing e2e tests in `e2e/` directory -- test patterns

### Secondary (MEDIUM confidence)
- [ncdai/react-wheel-picker GitHub](https://github.com/ncdai/react-wheel-picker) -- React version reference
