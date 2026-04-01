# Quick Task: Add E2E Tests for Mobile Touch Scrolling - Research

**Researched:** 2026-04-01
**Domain:** E2E testing, Playwright mobile emulation, touch gesture simulation
**Confidence:** HIGH

## Summary

The project already has vitest browser tests (Playwright-backed) that verify `touch-action: none` and `user-select: none` as inline style properties. The ask is for **e2e tests** that verify these styles work correctly in a mobile context -- that touch drag gestures actually scroll the wheel picker and do NOT scroll the page.

**Key discovery:** The WheelPicker uses **pointer events** (`onpointerdown`, `onpointermove`, `onpointerup` with `setPointerCapture`), not touch events. Playwright's `mouse.down()`/`mouse.move()`/`mouse.up()` fire the full pointer event sequence (pointerdown -> mouseover -> mousedown etc.) in Chromium, so low-level mouse API will trigger the component's handlers. Confirmed by Playwright maintainer Pavel Feldman: "Playwright performs real clicks. pointer events are a part of the standard event sequence."

**Primary recommendation:** Add standalone Playwright e2e tests (separate `playwright.config.ts`) that run against the SvelteKit dev/preview server with mobile device emulation. This gives real page-level verification (page scroll vs component scroll) that vitest browser mode component tests cannot provide.

## Project Constraints (from CLAUDE.md)

- Testing stack: Vitest 4.1.0 + @vitest/browser-playwright 4.1.0 + vitest-browser-svelte 2.1.0
- Playwright already installed as transitive dep of @vitest/browser-playwright
- Browser tests have a known sandbox limitation (Playwright SEGV in sandbox env)
- PLAYWRIGHT_BROWSERS_PATH=.playwright used in test scripts

## Current Test Infrastructure

| What | Status | Details |
|------|--------|---------|
| Vitest browser tests | Exists | `vitest.config.ts` with `browser` project using Playwright/Chromium |
| Playwright e2e config | Does NOT exist | No `playwright.config.ts` in repo |
| Style unit tests | Already done | `WheelPicker.test.ts` lines 111-127 verify `touch-action: none` and `user-select: none` |
| E2e tests | None | No e2e tests exist anywhere in the project |

## Architecture: Standalone Playwright E2E vs Vitest Browser Mode

**Use standalone Playwright e2e tests.** Reasons:

1. **Page-level assertions required.** Verifying "page doesn't scroll when wheel picker is dragged" requires a full page with scrollable content, not an isolated component render. Vitest browser mode renders components in an iframe -- no real page scroll context.

2. **Mobile device emulation.** Playwright's `devices['iPhone 13']` provides viewport, userAgent, hasTouch, and deviceScaleFactor in one config. Vitest browser mode has viewport control but no built-in device emulation presets.

3. **Separation of concerns.** E2e tests verify deployed behavior (styles + event handling together). Unit/browser tests verify individual properties. These are different test categories.

## How to Simulate Touch Drag on the Wheel Picker

The component uses pointer events with `setPointerCapture`. Two approaches:

### Approach 1: Playwright mouse API (RECOMMENDED)

Playwright's `mouse.down()`, `mouse.move()`, `mouse.up()` fire the full pointer event sequence in Chromium. This works because the W3C spec requires browsers to fire pointerdown before mousedown, and Playwright uses CDP's `Input.dispatchMouseEvent` which triggers the full browser event pipeline.

```typescript
// Locate the wheel picker wrapper
const picker = page.locator('[data-swp-wrapper]').first();
const box = await picker.boundingBox();

// Drag down (simulates scrolling up through options)
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 100, { steps: 10 });
await page.mouse.up();
```

### Approach 2: dispatchEvent for explicit touch events

Only needed if the component also listens for touch events (it does NOT currently):

```typescript
await picker.dispatchEvent('touchstart', {
  touches: [{ identifier: 0, clientX: cx, clientY: cy }],
  changedTouches: [{ identifier: 0, clientX: cx, clientY: cy }],
  targetTouches: [{ identifier: 0, clientX: cx, clientY: cy }]
});
```

**Use Approach 1.** The component uses pointer events, and Playwright's mouse API fires them.

## Test Strategy

### What to test

1. **Style verification (mobile viewport):** `touch-action: none` and `user-select: none` are computed on the wrapper element when viewed in a mobile viewport.

2. **Page does NOT scroll during wheel drag:** Create a page with enough content to be scrollable. Drag on the wheel picker. Assert `window.scrollY` hasn't changed.

3. **Wheel picker DOES respond to drag:** Drag on the wheel picker. Assert the selected value changed (check the displayed "Selected: X" text or the `data-swp-selected` attribute shift).

### Mobile device to emulate

Use `devices['iPhone 13']`:
- Viewport: 390x844
- hasTouch: true
- deviceScaleFactor: 3
- Mobile user agent

### Page to test against

Use the existing demo page at `/` (`src/routes/+page.svelte`). It already has multiple wheel pickers and enough content to potentially scroll.

### Playwright config

```typescript
// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'mobile-chrome',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
```

### Test file structure

```
e2e/
  mobile-touch.spec.ts      # Touch scrolling e2e tests
playwright.config.ts         # At project root (standard location)
```

## Common Pitfalls

### Pitfall 1: Pointer capture and mouse.move
**What goes wrong:** `setPointerCapture` redirects pointer events to the capturing element. If Playwright moves the mouse outside the element bounding box during a drag, the events still go to the picker (correct behavior).
**How to avoid:** This actually works in our favor -- no special handling needed.

### Pitfall 2: Animation timing
**What goes wrong:** After a drag, the physics engine runs an inertia animation before snapping. Checking selected value immediately after mouseup may see the old value.
**How to avoid:** Wait for the value to change: `await expect(page.locator('text=Selected:')).not.toContainText('cherry', { timeout: 2000 })` or use `waitForFunction`.

### Pitfall 3: Sandbox environment limitation
**What goes wrong:** Existing tests document Playwright SEGV_ACCERR in sandbox. E2e tests may hit the same issue.
**How to avoid:** Document this as a known CI consideration. Tests should still be written and runnable locally. The `PLAYWRIGHT_BROWSERS_PATH=.playwright` env var is already set for browser management.

### Pitfall 4: hasTouch doesn't change pointer event behavior
**What goes wrong:** Setting `hasTouch: true` in Playwright device config adds touch capability but `mouse.down()` still fires as a mouse/pointer input, not a touch input. `touch-action: none` only affects touch input, not mouse input.
**How to avoid:** For verifying `touch-action: none` actually prevents page scroll during touch, use `page.touchscreen.tap()` for a basic check, or `dispatchEvent` to simulate a touch drag sequence. Alternatively, verify the style is applied (computed style check) as a proxy -- the browser behavior of `touch-action: none` is well-established and doesn't need behavioral verification in a test.

## Recommended Test Approach

Given Pitfall 4, the most pragmatic test plan is:

| Test | Method | What it proves |
|------|--------|----------------|
| `touch-action: none` computed style | `getComputedStyle` check in mobile viewport | Style is correctly applied |
| `user-select: none` computed style | `getComputedStyle` check in mobile viewport | Style is correctly applied |
| Pointer drag changes selection | `mouse.down/move/up` sequence | Component responds to drag gestures |
| Page scroll unchanged after drag | Check `window.scrollY` before/after drag | Drag on picker doesn't scroll page (via pointer events + touch-action) |

The combination of style presence + pointer drag working + page not scrolling provides strong confidence that mobile touch scrolling works correctly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Mobile device emulation | Manual viewport + UA setting | `devices['iPhone 13']` from @playwright/test |
| Touch gesture simulation | Custom CDP commands | Playwright mouse API (fires pointer events) |
| Dev server management | Manual start/stop | Playwright `webServer` config |

## Sources

### Primary (HIGH confidence)
- [Playwright Touchscreen API](https://playwright.dev/docs/api/class-touchscreen) - tap-only API, limited for gestures
- [Playwright Touch Events (legacy)](https://playwright.dev/docs/touch-events) - dispatchEvent approach for touch simulation
- [Playwright Actions/Input](https://playwright.dev/docs/input) - mouse.down/move/up low-level API
- [Playwright GitHub #19823](https://github.com/microsoft/playwright/issues/19823) - Confirmed: click/mouse fires pointer events (Pavel Feldman)
- [Playwright Emulation](https://playwright.dev/docs/emulation) - device presets, hasTouch, viewport

### Secondary (MEDIUM confidence)
- [Vitest Browser Mode Interactivity](https://vitest.dev/api/browser/interactivity) - userEvent limitations for pointer events
- [E2E testing with SvelteKit and Playwright](https://www.okupter.com/blog/e2e-testing-with-sveltekit-and-playwright) - webServer config pattern

## Metadata

**Confidence breakdown:**
- Test architecture (standalone Playwright): HIGH - well-documented SvelteKit pattern
- Pointer event firing via mouse API: HIGH - confirmed by Playwright maintainer
- touch-action verification strategy: HIGH - computed style check is deterministic
- Drag gesture simulation: MEDIUM - depends on animation timing, may need waitFor patterns

**Research date:** 2026-04-01
**Valid until:** 2026-05-01
