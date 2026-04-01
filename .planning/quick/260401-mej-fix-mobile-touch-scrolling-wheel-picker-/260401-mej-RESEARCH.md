# Quick Task: Fix Mobile Touch Scrolling - Research

**Researched:** 2026-04-01
**Domain:** Mobile touch event handling in scrollable components
**Confidence:** HIGH

## Summary

The wheel picker component's touch dragging on mobile does not work because the page scrolls instead of the component. The root cause is twofold:

1. **The component uses Svelte's declarative `onpointerdown`/`onpointermove`/`onpointerup` handlers, but never calls `event.preventDefault()` on the pointer/touch start or move events.** On mobile browsers, touch events trigger native page scrolling by default. Without `preventDefault()` on the initial touch event (or `touch-action: none` CSS), the browser's native scroll takes over.

2. **The component does not set `touch-action: none` on its wrapper element.** The demo page applies `touch-action: none` via consumer CSS (`:global([data-swp-wrapper].wheel)`), but this is demo-specific styling -- it is NOT part of the component itself. Any consumer who forgets this CSS will experience broken mobile scrolling.

**Primary recommendation:** Add `style:touch-action="none"` as an inline style on the component's wrapper `<div>` element. This is the cleanest fix -- it tells the browser "I will handle touch gestures myself" and prevents the page from scrolling when the user drags within the wheel picker. This is an inline style, not shipped CSS, so it maintains the headless/zero-CSS constraint.

## Root Cause Analysis

### Current Implementation (Svelte Component)

The `WheelPicker.svelte` wrapper div at line 242-256:

```svelte
<div
  data-swp-wrapper
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerUp}
  onwheel={onWheel}
  ...
>
```

**Problems identified:**

| Issue | Detail | Severity |
|-------|--------|----------|
| No `touch-action: none` on component | Only present in demo page consumer CSS | **CRITICAL** |
| No `preventDefault()` on pointer down/move | `onPointerDown` calls `setPointerCapture` and `physics.startDrag` but never prevents default | HIGH |
| Passive event listeners | Svelte's declarative `onpointerdown` handlers are added as passive by default in modern browsers for touch-origin pointer events | MEDIUM |

### React Reference Implementation (v1.2.2)

The React version takes a different approach:

1. **Uses native `touchstart`/`touchmove`/`touchend`** events (NOT pointer events)
2. **Registers with `{ passive: false }`** explicitly: `container.addEventListener("touchstart", handleDragStartEvent, { passive: false })`
3. **Calls `e.preventDefault()` on touchstart** when `e.cancelable` is true (line 583-584)
4. **Calls `event.preventDefault()` on touchmove** when `event.cancelable` is true (line 530-532)
5. **Does NOT use `touch-action: none`** in its shipped CSS -- prevention is entirely via JavaScript `preventDefault()`

## Fix Strategy

### Option A: `touch-action: none` inline style (RECOMMENDED)

Add `style:touch-action="none"` to the wrapper div. This is:
- A single line change
- Declarative and CSS-spec compliant
- Works regardless of event listener passivity
- Maintains the headless constraint (inline style, not a stylesheet)
- The standard web platform solution for "this element handles its own touch gestures"

```svelte
<div
  data-swp-wrapper
  style:touch-action="none"
  ...
>
```

### Option B: `preventDefault()` on pointer events with non-passive listeners

Would require switching from Svelte declarative handlers to `use:action` directives or `$effect` with `addEventListener({ passive: false })`. More complex, and `touch-action: none` achieves the same result declaratively.

### Option C: Both A + B

Maximum compatibility but unnecessarily complex. Option A alone is sufficient.

### Why Option A is sufficient

The `touch-action` CSS property is:
- Supported in all modern browsers (Chrome 36+, Firefox 52+, Safari 13+)
- The W3C-recommended way to control touch behavior
- Used by major UI libraries (Material UI, Radix, etc.)
- Does not require non-passive event listeners
- Processed by the browser before any JavaScript touch handlers fire

## Common Pitfalls

### Pitfall 1: Passive Event Listeners
**What goes wrong:** Modern browsers (Chrome 56+) make `touchstart` and `touchmove` listeners passive by default on `document` and `window`. Calling `preventDefault()` in a passive listener is silently ignored.
**How to avoid:** Use `touch-action: none` CSS instead of relying on `preventDefault()`. Or use `addEventListener` with `{ passive: false }` explicitly.

### Pitfall 2: `touch-action` scope
**What goes wrong:** Setting `touch-action: none` on a parent but not the scroll container itself can still allow scrolling.
**How to avoid:** Set it directly on the element that captures touch gestures (the `[data-swp-wrapper]` div).

### Pitfall 3: `user-select: none` is separate
**What goes wrong:** Text selection during drag creates visual artifacts on mobile.
**How to avoid:** The demo already sets `user-select: none`. The component should also add `style:user-select="none"` for the same reason as `touch-action`.

## Additional Inline Styles to Consider

The component should apply these interaction-related inline styles that are functional (not decorative):

| Style | Value | Purpose |
|-------|-------|---------|
| `touch-action` | `none` | Prevent browser from handling touch gestures |
| `user-select` | `none` | Prevent text selection during drag |

These are functional styles required for correct behavior, not decorative styles. They belong in the component, not in consumer CSS.

## Sources

### Primary (HIGH confidence)
- `src/lib/WheelPicker.svelte` -- current component source, no touch-action or preventDefault on pointer events
- `src/routes/+page.svelte` line 369 -- demo page applies `touch-action: none` as consumer CSS
- React reference `packages/react-wheel-picker/src/index.tsx` -- uses `{ passive: false }` + `preventDefault()` on touchstart/touchmove
- React reference `packages/react-wheel-picker/src/style.css` -- no `touch-action` in shipped CSS
- [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) -- CSS property documentation
