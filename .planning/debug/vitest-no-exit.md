---
status: awaiting_human_verify
trigger: "pnpm run test does not exit after tests pass or fail"
created: 2026-03-23T00:00:00Z
updated: 2026-03-23T00:05:00Z
---

## Current Focus

hypothesis: CONFIRMED — vitest.config.ts does not set `browser.headless: true`. Vitest's config resolver defaults `headless` to `isCI` (i.e. !!process.env.CI). Locally, headless defaults to false, so Playwright opens a visible browser AND vitest UI opens (`browser.ui` also defaults to true when not headless and not CI). These two GUI processes keep Node alive indefinitely after `vitest run` completes.
test: Confirmed by reading vitest dist source: `resolved.browser.headless ??= isCI` (coverage.Bri33R1t.js:468) and `resolved.browser.ui ??= resolved.browser.headless === true ? false : !isCI` (line 473).
expecting: Adding `headless: true` to the browser block in vitest.config.ts will prevent both the Playwright GUI and Vitest UI from being spawned, allowing the process to exit normally.
next_action: Apply fix — add `headless: true` to browser config in vitest.config.ts

## Symptoms

expected: vitest exits after all tests pass or fail
actual: process hangs indefinitely — never returns to shell
errors: none visible
reproduction: run `pnpm run test` in /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker
started: unknown — may have always been this way

## Eliminated

- hypothesis: watch mode default is causing the hang
  evidence: package.json scripts.test explicitly uses `vitest run`, which disables watch mode
  timestamp: 2026-03-23T00:01:00Z

- hypothesis: @vitest/browser-playwright is an invalid/wrong package
  evidence: package exists in node_modules with correct vitest 4.x versioning; exports `playwright()` factory correctly; reads headless from project.config.browser.headless
  timestamp: 2026-03-23T00:04:00Z

## Evidence

- timestamp: 2026-03-23T00:01:00Z
  checked: package.json scripts.test
  found: `"test": "PLAYWRIGHT_BROWSERS_PATH=.playwright vitest run"` — uses `vitest run` flag (not watch mode)
  implication: watch mode is NOT the cause; the hang is not from --watch default

- timestamp: 2026-03-23T00:02:00Z
  checked: vitest.config.ts
  found: browser block has no `headless` property set; `provider: playwright()` with no options
  implication: headless will default to isCI — false when running locally

- timestamp: 2026-03-23T00:03:00Z
  checked: @vitest/browser-playwright/dist/index.js lines 868-870
  found: `headless: options.headless` where `options` is `project.config.browser` — it reads from vitest config, not from the playwright() call args
  implication: The headless setting must be in the vitest.config browser block, not inside playwright()

- timestamp: 2026-03-23T00:04:00Z
  checked: vitest/dist/chunks/coverage.Bri33R1t.js lines 468 and 473
  found: `resolved.browser.headless ??= isCI` and `resolved.browser.ui ??= resolved.browser.headless === true ? false : !isCI`
  implication: ROOT CAUSE CONFIRMED — locally (no CI env var), headless=false and ui=true. The Playwright browser window and the Vitest UI server both stay open, preventing process exit.

## Resolution

root_cause: vitest.config.ts does not set `browser.headless: true`. Locally, vitest defaults headless to false (only true in CI). This causes Playwright to launch a visible browser window and also enables the vitest UI server. Both remain open after test completion, keeping the Node.js process alive indefinitely.
fix: Added `headless: true` to the browser configuration block in vitest.config.ts
verification: awaiting user confirmation
files_changed: [vitest.config.ts]
