---
phase: quick-260402-djm
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - e2e/keyboard-navigation.spec.ts
  - e2e/touch-gestures.spec.ts
autonomous: true
requirements: [E2E-KEYBOARD, E2E-TOUCH]
must_haves:
  truths:
    - "ArrowDown key moves selection to the next enabled item"
    - "ArrowUp key moves selection to the previous enabled item"
    - "Home key moves selection to the first enabled item"
    - "End key moves selection to the last enabled item"
    - "Keyboard navigation skips disabled options"
    - "Touch drag on the picker changes the selected value"
    - "Touch drag does not scroll the page"
  artifacts:
    - path: "e2e/keyboard-navigation.spec.ts"
      provides: "Keyboard navigation E2E tests"
    - path: "e2e/touch-gestures.spec.ts"
      provides: "Touch gesture E2E tests"
  key_links:
    - from: "e2e/keyboard-navigation.spec.ts"
      to: "src/lib/WheelPicker.svelte"
      via: "Playwright keyboard events dispatched to [data-swp-wrapper]"
    - from: "e2e/touch-gestures.spec.ts"
      to: "src/lib/WheelPicker.svelte"
      via: "Playwright touch events dispatched to [data-swp-wrapper]"
---

<objective>
Add E2E Playwright tests covering keyboard navigation (ArrowUp, ArrowDown, Home, End, disabled-option skipping) and touch gesture interactions (touchstart/touchmove/touchend drag changing selection).

Purpose: Ensure the wheel picker's keyboard and touch interactions work correctly in a real browser, complementing the existing mobile-touch.spec.ts (pointer drag, CSS checks) and mouse-wheel.spec.ts tests.
Output: Two new test files in e2e/ directory.
</objective>

<execution_context>
@.claude/get-shit-done/workflows/execute-plan.md
@.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@e2e/mobile-touch.spec.ts (existing patterns: page.goto('/'), locator selectors, waitForTimeout, boundingBox)
@e2e/mouse-wheel.spec.ts (existing patterns: section filtering, selectedText assertions)
@src/lib/WheelPicker.svelte (keyboard handler: ArrowDown, ArrowUp, Home, End, typeahead; events: onpointerdown/move/up, onwheel, onkeydown)
@src/routes/+page.svelte (demo page: "Single Wheel" section with fruitOptions starting at cherry, "Disabled Options" section with disabledOptions where options 2 and 4 are disabled)
@playwright.config.ts (projects: mobile-chrome Pixel 5, desktop-chrome; baseURL localhost:4173)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create keyboard navigation E2E tests</name>
  <files>e2e/keyboard-navigation.spec.ts</files>
  <action>
Create `e2e/keyboard-navigation.spec.ts` with the following test cases. Follow existing patterns from mobile-touch.spec.ts and mouse-wheel.spec.ts.

Use `page.goto('/')` in beforeEach. Target the "Single Wheel" section (fruitOptions: apple, banana, cherry, date, elderberry, fig, grape; starts at cherry index 2) and "Disabled Options" section (options 1-5, options 2 and 4 disabled; starts at option 1).

**Test describe: "Keyboard Navigation"**

1. **ArrowDown moves to next item** — Focus the Single Wheel wrapper (`section` filter "Single Wheel" then `[data-swp-wrapper]`), press ArrowDown, wait 1000ms for animation, assert selectedText changes from "cherry" to "date".

2. **ArrowUp moves to previous item** — Focus Single Wheel wrapper, press ArrowUp, wait 1000ms, assert selected changes from "cherry" to "banana".

3. **Multiple ArrowDown presses** — Focus Single Wheel wrapper, press ArrowDown 3 times (with 800ms waits between for animation settle), assert selected is "fig" (cherry -> date -> elderberry -> fig).

4. **Home key selects first item** — Focus Single Wheel wrapper, press Home, wait 1000ms, assert selected is "apple".

5. **End key selects last item** — Focus Single Wheel wrapper, press End, wait 1000ms, assert selected is "grape".

6. **ArrowDown skips disabled options** — Focus Disabled Options wrapper (`section` filter "Disabled Options" then `[data-swp-wrapper]`). Selected starts at "1". Press ArrowDown, wait 1000ms, assert selected is "3" (skipped disabled option 2).

7. **ArrowUp skips disabled options** — In Disabled Options, first press ArrowDown to get to "3", wait 1000ms. Then press ArrowUp, wait 1000ms, assert selected is "1" (skipped disabled option 2 going back).

**Focus pattern:** Use `wrapper.focus()` before pressing keys. Use `page.keyboard.press('ArrowDown')` etc.

**Selection text pattern:** Match existing tests — `page.locator('section').filter({ hasText: 'Section Name' }).locator('p')` then `toContainText()`.
  </action>
  <verify>
    <automated>cd /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker && npx playwright test e2e/keyboard-navigation.spec.ts --project=desktop-chrome</automated>
  </verify>
  <done>All 7 keyboard navigation tests pass on desktop-chrome project. ArrowDown/ArrowUp move selection, Home/End jump to bounds, disabled options are skipped.</done>
</task>

<task type="auto">
  <name>Task 2: Create touch gesture E2E tests</name>
  <files>e2e/touch-gestures.spec.ts</files>
  <action>
Create `e2e/touch-gestures.spec.ts` with touch-specific gesture tests. These complement mobile-touch.spec.ts (which uses pointer events, not touch events) by using Playwright's `touchscreen.tap` and manual `dispatchEvent` for touchstart/touchmove/touchend sequences.

Use `page.goto('/')` in beforeEach. Target the "Single Wheel" section.

**Test describe: "Touch Gestures"**

1. **Touch drag up changes selection forward** — Get the Single Wheel wrapper boundingBox. Dispatch a touchstart/touchmove/touchend sequence via `page.evaluate()`:
   - touchstart at center of wrapper
   - 10 touchmove events stepping upward by 15px each (150px total upward drag)
   - touchend at final position
   Wait 2000ms for inertia settle. Assert selected is no longer "cherry".

2. **Touch drag down changes selection backward** — Same approach but drag downward (positive Y movement). Dispatch touchstart at center, touchmove stepping downward 15px * 10 steps, touchend. Wait 2000ms. Assert selected changed from "cherry" — expect "banana" or "apple" (moved backward in list).

3. **Quick flick gesture triggers inertia** — Dispatch a fast touch sequence: touchstart, 3 quick touchmove events with large steps (50px each in ~50ms simulated), touchend. Wait 3000ms for inertia to fully settle. Assert the selection moved more than 1 item from cherry (proving inertia carried momentum beyond the drag distance). Check that selected is NOT "date" (which would be just 1 item forward), but further like elderberry/fig/grape.

**Touch event dispatch pattern:** Use `page.evaluate()` to create and dispatch TouchEvent objects on the wrapper element. Select the element via `document.querySelector('[data-swp-wrapper]')` (first one on page). Use `new Touch({identifier, target, clientX, clientY})` and `new TouchEvent('touchstart', {touches, changedTouches, bubbles: true})`.

Note: The component uses pointer events (onpointerdown etc), not touch events directly. Playwright's pointer-based approach (as in mobile-touch.spec.ts) already covers this. So for this spec, use `page.touchscreen` API OR the pointer-based mouse.down/move/up approach with the mobile-chrome project to simulate real mobile touch. Prefer the mobile-chrome project approach: use `page.mouse.move` / `page.mouse.down` / `page.mouse.up` with the Pixel 5 device emulation which converts mouse events to touch/pointer events.

Run these tests on the `mobile-chrome` project (Pixel 5 emulation) to get real touch behavior.
  </action>
  <verify>
    <automated>cd /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker && npx playwright test e2e/touch-gestures.spec.ts --project=mobile-chrome</automated>
  </verify>
  <done>All 3 touch gesture tests pass on mobile-chrome project. Upward drag moves forward, downward drag moves backward, quick flick triggers inertia moving multiple items.</done>
</task>

</tasks>

<verification>
Run all E2E tests together:
```bash
npx playwright test --project=desktop-chrome --project=mobile-chrome
```
All existing tests (mobile-touch, mouse-wheel) plus new tests (keyboard-navigation, touch-gestures) pass.
</verification>

<success_criteria>
- e2e/keyboard-navigation.spec.ts exists with 7 tests covering ArrowDown, ArrowUp, Home, End, and disabled-option skipping
- e2e/touch-gestures.spec.ts exists with 3 tests covering upward drag, downward drag, and flick inertia
- All tests pass against the demo page at localhost:4173
- No existing tests broken
</success_criteria>

<output>
After completion, create `.planning/quick/260402-djm-add-e2e-tests-for-keyboard-navigation-mo/260402-djm-SUMMARY.md`
</output>
