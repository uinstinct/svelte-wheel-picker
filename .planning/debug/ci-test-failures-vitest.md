---
status: verifying
trigger: "CI test failures: types.test.ts (no test suites), focus-routing.test.ts (@vitest/browser-playwright/context not exported)"
created: 2026-04-01T00:00:00Z
updated: 2026-04-01T00:00:00Z
---

## Current Focus

hypothesis: Two independent bugs — types.test.ts has no runnable suites and should be excluded from vitest include; focus-routing.test.ts uses wrong import path for userEvent
test: Read test files, package exports, vitest config
expecting: Fix confirmed by reading package.json exports and vitest/browser export map
next_action: Apply fixes to vitest.config.ts and focus-routing.test.ts

## Symptoms

expected: All 8 test files pass in CI
actual: 2 test files fail — types.test.ts has no test suites, focus-routing.test.ts fails to import @vitest/browser-playwright/context
errors: |
  1. "No test suite found in file" for src/lib/types.test.ts
  2. Error: "./context" is not exported under the conditions ["module", "browser", "development", "svelte", "import"] from package @vitest/browser-playwright
reproduction: pnpm test in CI environment
started: Latest push to main

## Eliminated

- hypothesis: @vitest/browser-playwright package is not installed
  evidence: Package exists at node_modules/@vitest/browser-playwright with version 4.1.0
  timestamp: 2026-04-01T00:00:00Z

## Evidence

- timestamp: 2026-04-01T00:00:00Z
  checked: src/lib/types.test.ts
  found: File contains only TypeScript type-level assignments with @ts-expect-error directives. Zero describe/it/test blocks.
  implication: Vitest cannot find any test suites — it's a tsc-only file that should not be in vitest include list

- timestamp: 2026-04-01T00:00:00Z
  checked: src/lib/__tests__/focus-routing.test.ts line 3
  found: import { userEvent } from '@vitest/browser-playwright/context'
  implication: This is the bad import path

- timestamp: 2026-04-01T00:00:00Z
  checked: node_modules/@vitest/browser-playwright/package.json exports
  found: "./context" export has only a "types" condition (no default/runtime file). It exports "./context.d.ts" which re-exports from @vitest/browser/context.
  implication: At runtime the condition is never satisfied, causing the "not exported under conditions" error

- timestamp: 2026-04-01T00:00:00Z
  checked: node_modules/vitest/package.json exports
  found: "./browser" exports {"types": "./browser/context.d.ts", "default": "./browser/context.js"} — has both types and runtime
  implication: vitest/browser is the correct import path for userEvent

- timestamp: 2026-04-01T00:00:00Z
  checked: node_modules/vitest/browser/context.d.ts
  found: Re-exports from @vitest/browser-playwright/context with @ts-ignore, meaning vitest/browser is the stable public API
  implication: Confirmed — userEvent should be imported from 'vitest/browser', not '@vitest/browser-playwright/context'

## Resolution

root_cause: |
  1. types.test.ts is a pure TypeScript type-check file with no test suites. It is included in vitest.config.ts unit project but vitest requires at least one describe/test/it block. Fix: remove from vitest include (it's meant to be run via tsc --noEmit only).
  2. focus-routing.test.ts imports userEvent from '@vitest/browser-playwright/context' which only has a types-only export condition with no runtime default. The correct import is 'vitest/browser' which exports the same API with a working runtime default.
fix: |
  1. Remove 'src/lib/types.test.ts' from vitest.config.ts unit project include array
  2. Change import in focus-routing.test.ts from '@vitest/browser-playwright/context' to 'vitest/browser'
verification: []
files_changed:
  - vitest.config.ts
  - src/lib/__tests__/focus-routing.test.ts
