---
phase: quick-260401-mni
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - playwright.config.ts
  - e2e/mobile-touch.spec.ts
  - package.json
autonomous: true
requirements: [E2E-MOBILE-TOUCH]
must_haves:
  truths:
    - "Playwright e2e tests run against the SvelteKit dev server with iPhone 13 mobile emulation"
    - "Tests verify touch-action:none and user-select:none computed styles on [data-swp-wrapper]"
    - "Tests verify pointer drag on the wheel picker changes the selected value"
    - "Tests verify page scroll does not change when dragging the wheel picker"
  artifacts:
    - path: "playwright.config.ts"
      provides: "Standalone Playwright config with mobile device emulation and webServer"
    - path: "e2e/mobile-touch.spec.ts"
      provides: "E2E test suite for mobile touch scrolling behavior"
    - path: "package.json"
      provides: "test:e2e script"
  key_links:
    - from: "playwright.config.ts"
      to: "e2e/mobile-touch.spec.ts"
      via: "testDir config"
      pattern: "testDir.*e2e"
    - from: "e2e/mobile-touch.spec.ts"
      to: "src/routes/+page.svelte"
      via: "navigates to / demo page"
      pattern: "page\\.goto.*/"
---

<objective>
Add standalone Playwright e2e tests that verify mobile touch scrolling behavior on the wheel picker component.

Purpose: The mobile touch scrolling fix (quick-260401-mej) added `touch-action: none` and `user-select: none` inline styles. Existing vitest browser tests verify these as style properties on an isolated component. These e2e tests verify the full page-level behavior: styles are computed correctly in a mobile viewport, pointer drag gestures change the picker selection, and the page does NOT scroll during picker interaction.

Output: `playwright.config.ts` at project root, `e2e/mobile-touch.spec.ts` test file, `test:e2e` npm script.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker.mobile-issues/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker.mobile-issues/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/260401-mni-add-e2e-tests-for-mobile-touch-scrolling/260401-mni-RESEARCH.md

<interfaces>
<!-- The demo page at src/routes/+page.svelte has these key selectors: -->
<!-- [data-swp-wrapper] — the scrollable wheel picker container (has touch-action:none, user-select:none inline) -->
<!-- "Selected: {value}" — paragraph text showing current selection per section -->
<!-- h2 with "Single Wheel" — the first picker section, use for targeting -->

From src/lib/WheelPicker.svelte (relevant lines):
```svelte
style:touch-action="none"
style:user-select="none"
```

Demo page structure:
- Section "Single Wheel" with fruit picker, initial value "cherry", shows "Selected: {selectedFruit}"
- Page has multiple sections with enough content to scroll on mobile viewport
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Playwright config and e2e test suite</name>
  <files>playwright.config.ts, e2e/mobile-touch.spec.ts, package.json</files>
  <action>
1. Create `playwright.config.ts` at project root:
   - Import `defineConfig, devices` from `@playwright/test`
   - Set `testDir: './e2e'`
   - Set `webServer.command: 'npm run dev'`, `port: 5173`, `reuseExistingServer: !process.env.CI`
   - Single project named `mobile-chrome` using `...devices['iPhone 13']` (390x844, hasTouch, deviceScaleFactor 3)
   - Set `use.baseURL: 'http://localhost:5173'`
   - Set reasonable `timeout: 30000` and `retries: 0`

2. Create `e2e/mobile-touch.spec.ts` with these tests:

   **Test: "touch-action: none is applied to wheel picker wrapper"**
   - Navigate to `/`
   - Locate first `[data-swp-wrapper]`
   - Use `page.evaluate` to get `getComputedStyle(el).touchAction` on the element
   - Assert value is `'none'`

   **Test: "user-select: none is applied to wheel picker wrapper"**
   - Navigate to `/`
   - Locate first `[data-swp-wrapper]`
   - Use `page.evaluate` to get `getComputedStyle(el).userSelect` (or `webkitUserSelect` fallback)
   - Assert value is `'none'`

   **Test: "pointer drag on wheel picker changes selected value"**
   - Navigate to `/`
   - Read the "Selected:" text in the Single Wheel section (initially "cherry")
   - Get boundingBox of first `[data-swp-wrapper]`
   - Perform a drag: `page.mouse.move` to center, `page.mouse.down()`, `page.mouse.move` 100px down over 10 steps, `page.mouse.up()`
   - Wait for selection text to change (use `expect(locator).not.toContainText('cherry', { timeout: 3000 })`)
   - Assert selection text changed from initial value

   **Test: "page does not scroll when dragging on wheel picker"**
   - Navigate to `/`
   - Get `window.scrollY` before drag via `page.evaluate`
   - Perform same drag gesture on first `[data-swp-wrapper]`
   - Get `window.scrollY` after drag via `page.evaluate`
   - Assert scrollY unchanged (equal to before value)

   Use `test.describe('Mobile Touch Scrolling', ...)` to group all tests. Add `test.beforeEach` with `page.goto('/')`.

3. Add to `package.json` scripts:
   - `"test:e2e": "PLAYWRIGHT_BROWSERS_PATH=.playwright npx playwright test --config=playwright.config.ts"`

   Use the same `PLAYWRIGHT_BROWSERS_PATH=.playwright` pattern as existing test scripts (from STATE.md decision).
  </action>
  <verify>
    <automated>cd /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker.mobile-issues && npx tsc --noEmit playwright.config.ts 2>&1 || echo "tsc check done"; cat e2e/mobile-touch.spec.ts | head -5</automated>
  </verify>
  <done>
  - playwright.config.ts exists at project root with iPhone 13 mobile emulation and webServer config
  - e2e/mobile-touch.spec.ts contains 4 tests: touch-action style, user-select style, drag changes selection, page scroll unchanged
  - package.json has test:e2e script with PLAYWRIGHT_BROWSERS_PATH
  </done>
</task>

<task type="auto">
  <name>Task 2: Run e2e tests and verify they pass</name>
  <files>e2e/mobile-touch.spec.ts</files>
  <action>
Run the e2e tests:
```
cd /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker.mobile-issues
PLAYWRIGHT_BROWSERS_PATH=.playwright npx playwright test --config=playwright.config.ts
```

If tests fail:
- **Animation timing:** If the drag-changes-selection test fails because the value hasn't changed yet, increase the drag distance (try 150px) or add `{ steps: 20 }` for slower movement. Use `page.waitForFunction` to wait for the `textContent` of the Selected paragraph to change.
- **Scroll test flaky:** If page scrollY changes slightly, use a tolerance (scrollY delta < 5px).
- **Browser not found:** Run `PLAYWRIGHT_BROWSERS_PATH=.playwright npx playwright install chromium` first.
- **Dev server port conflict:** Ensure no other process on 5173, or adjust the port in config.

Fix any failures and re-run until all 4 tests pass.

Note: If tests fail due to sandbox/SEGV issues (known limitation from STATE.md), document this in the summary but do not consider it a code defect. The tests should be structurally correct.
  </action>
  <verify>
    <automated>cd /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker.mobile-issues && PLAYWRIGHT_BROWSERS_PATH=.playwright npx playwright test --config=playwright.config.ts 2>&1 | tail -20</automated>
  </verify>
  <done>
  - All 4 e2e tests pass (or are documented as blocked by sandbox SEGV if applicable)
  - No regressions in existing tests: `npm run test` still passes
  </done>
</task>

</tasks>

<verification>
- `playwright.config.ts` exists with iPhone 13 device emulation
- `e2e/mobile-touch.spec.ts` has 4 test cases covering styles and behavior
- `package.json` includes `test:e2e` script
- Tests run successfully against the dev server
</verification>

<success_criteria>
- E2e tests verify `touch-action: none` and `user-select: none` computed styles in mobile viewport
- E2e tests verify drag gesture changes wheel picker selection
- E2e tests verify page scroll is unaffected by wheel picker drag
- Tests are runnable via `npm run test:e2e`
</success_criteria>

<output>
After completion, create `.planning/quick/260401-mni-add-e2e-tests-for-mobile-touch-scrolling/260401-mni-SUMMARY.md`
</output>
