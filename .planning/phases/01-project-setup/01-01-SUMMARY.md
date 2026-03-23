---
phase: 01-project-setup
plan: 01
subsystem: infra
tags: [sveltekit, svelte5, vitest, playwright, eslint, prettier, typescript, pnpm, shadcn-svelte]

# Dependency graph
requires: []
provides:
  - Complete SvelteKit library project scaffold with all config files
  - pnpm package manager with all devDependencies installed
  - Playwright Chromium binary for Vitest browser mode testing
  - .svelte-kit/tsconfig.json generated (TypeScript can resolve extends)
  - Placeholder WheelPicker component and demo route
affects:
  - 01-02 (source file creation uses this config foundation)
  - All subsequent phases (build, test, lint, package scripts defined here)

# Tech tracking
tech-stack:
  added:
    - svelte@5.54.1
    - "@sveltejs/kit@2.55.0"
    - "@sveltejs/package@2.5.7"
    - "@sveltejs/vite-plugin-svelte@7.0.0"
    - "@sveltejs/adapter-auto@6.0.0"
    - typescript@5.9.3
    - vitest@4.1.0
    - "@vitest/browser-playwright@4.1.0"
    - vitest-browser-svelte@2.1.0
    - playwright@1.58.2 (Chromium binary)
    - shadcn-svelte@1.2.3
    - publint@0.3.18
    - eslint@10.1.0
    - "@eslint/js@10.0.1"
    - typescript-eslint@8.57.1
    - eslint-plugin-svelte@3.16.0
    - svelte-eslint-parser@1.6.0
    - globals@17.4.0
    - prettier@3.8.1
    - prettier-plugin-svelte@3.5.1
  patterns:
    - Vitest 4.x browser-playwright provider API (function call, not string)
    - pnpm as package manager with PLAYWRIGHT_BROWSERS_PATH=.playwright
    - ESLint flat config with typescript-eslint and svelte parser override
    - Headless library: sideEffects=false, no dependencies field

key-files:
  created:
    - package.json
    - svelte.config.js
    - vite.config.ts
    - vitest.config.ts
    - tsconfig.json
    - eslint.config.js
    - .prettierrc
    - .prettierignore
    - .gitignore
    - registry.json
    - src/app.html
    - src/app.d.ts
    - src/lib/WheelPicker.svelte
    - src/lib/index.ts
    - src/routes/+page.svelte
  modified: []

key-decisions:
  - "Use @eslint/js@10.0.1 (10.1.0 does not exist on npm — research version was wrong)"
  - "Use typescript-eslint@8.57.1 (research specified 8.38.0 but latest stable is 8.57.1)"
  - "Use globals@17.4.0 (research specified 16.2.0 but latest stable is 17.4.0)"
  - "PLAYWRIGHT_BROWSERS_PATH=.playwright set in test scripts — system cache dir had EPERM"
  - "Created placeholder WheelPicker.svelte + +page.svelte (required for svelte-kit sync)"

patterns-established:
  - "Pattern: All library source in src/lib/, flat structure per D-03"
  - "Pattern: Test scripts include PLAYWRIGHT_BROWSERS_PATH=.playwright env var"
  - "Pattern: ESLint flat config with per-file svelte override for TypeScript parser"
  - "Pattern: vitest.config.ts uses Vitest 4.x playwright() function provider (not string)"

requirements-completed: []

# Metrics
duration: 3min
completed: 2026-03-23
---

# Phase 01 Plan 01: Project Setup - Configuration Files and Dependencies

**SvelteKit library scaffold with Vitest browser-mode testing, ESLint flat config, and Playwright Chromium installed — all config files written manually per D-05**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-23T11:21:32Z
- **Completed:** 2026-03-23T11:25:29Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments

- 12 project config files created (package.json, svelte.config.js, vite.config.ts, vitest.config.ts, tsconfig.json, eslint.config.js, .prettierrc, .prettierignore, .gitignore, registry.json, src/app.html, src/app.d.ts)
- All devDependencies installed via pnpm (202 packages)
- Playwright Chromium binary downloaded to .playwright/ for Vitest browser mode
- .svelte-kit/tsconfig.json generated (TypeScript extends chain works)
- Placeholder WheelPicker component and demo route created for svelte-kit sync to work

## Task Commits

Each task was committed atomically:

1. **Task 1: Create all project configuration files** - `80f08e8` (chore)
2. **Task 2: Install dependencies and Playwright Chromium** - `9cc2fa8` (chore)

## Files Created/Modified

- `package.json` - Library config: exports, peerDependencies, sideEffects, engines, scripts
- `svelte.config.js` - SvelteKit config with vitePreprocess and adapter-auto
- `vite.config.ts` - Vite config with sveltekit plugin
- `vitest.config.ts` - Vitest 4.x browser mode with playwright() provider
- `tsconfig.json` - TypeScript config with verbatimModuleSyntax, isolatedModules
- `eslint.config.js` - ESLint flat config with svelte + typescript-eslint
- `.prettierrc` - Prettier config with prettier-plugin-svelte
- `.prettierignore` - Prettier ignore for build artifacts
- `.gitignore` - Git ignore including dist/, .svelte-kit/, .playwright/
- `registry.json` - shadcn-svelte registry manifest placeholder
- `src/app.html` - SvelteKit app shell
- `src/app.d.ts` - SvelteKit TypeScript declarations
- `src/lib/WheelPicker.svelte` - Placeholder smoke-test component
- `src/lib/index.ts` - Library entry point (re-exports WheelPicker)
- `src/routes/+page.svelte` - Demo route (imports WheelPicker from $lib)

## Decisions Made

- Used `@eslint/js@10.0.1` (latest stable) — research had wrong version `10.1.0`
- Used `typescript-eslint@8.57.1` and `globals@17.4.0` — research versions were stale
- Set `PLAYWRIGHT_BROWSERS_PATH=.playwright` in test scripts because system cache directory had EPERM — binary stored within project dir
- Created `src/lib/WheelPicker.svelte`, `src/lib/index.ts`, and `src/routes/+page.svelte` during Task 2 (needed by `svelte-kit sync` to succeed — no routes = sync fails)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect npm package versions in package.json**
- **Found during:** Task 2 (pnpm install)
- **Issue:** `@eslint/js@10.1.0` does not exist on npm (latest is 10.0.1). `typescript-eslint@8.38.0` is outdated (latest stable: 8.57.1). `globals@16.2.0` is outdated (latest: 17.4.0). Research file had stale/wrong version numbers.
- **Fix:** Updated to `@eslint/js@10.0.1`, `typescript-eslint@8.57.1`, `globals@17.4.0`
- **Files modified:** package.json
- **Verification:** pnpm install completed successfully with 202 packages
- **Committed in:** 9cc2fa8 (Task 2 commit)

**2. [Rule 3 - Blocking] Fixed Playwright binary install path (EPERM on system cache)**
- **Found during:** Task 2 (playwright install chromium)
- **Issue:** `pnpm exec playwright install chromium` failed with `EPERM: operation not permitted, lstat '/Users/instinct/Library/Caches'`
- **Fix:** Used `PLAYWRIGHT_BROWSERS_PATH=.playwright` to install into project directory. Added `.playwright/` to `.gitignore`. Set same env var in `test` and `test:watch` scripts.
- **Files modified:** .gitignore, package.json
- **Verification:** `PLAYWRIGHT_BROWSERS_PATH=.playwright pnpm exec playwright --version` returns `1.58.2`
- **Committed in:** 9cc2fa8 (Task 2 commit)

**3. [Rule 3 - Blocking] Created placeholder component files required for svelte-kit sync**
- **Found during:** Task 2 (npx svelte-kit sync)
- **Issue:** `svelte-kit sync` fails with "No routes found" when `src/routes/` is empty — it cannot generate `.svelte-kit/tsconfig.json` without at least one route
- **Fix:** Created `src/routes/+page.svelte`, `src/lib/WheelPicker.svelte`, and `src/lib/index.ts` per RESEARCH.md Pattern 6. These files were slated for Plan 02 but are needed to unblock Task 2.
- **Files modified:** src/routes/+page.svelte, src/lib/WheelPicker.svelte, src/lib/index.ts
- **Verification:** `npx svelte-kit sync` succeeds; `.svelte-kit/tsconfig.json` exists
- **Committed in:** 9cc2fa8 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All auto-fixes necessary for correctness and unblocking. Version corrections used latest stable releases. No scope creep beyond what RESEARCH.md Pattern 6 planned for Plan 02.

## Issues Encountered

None beyond what is documented in Deviations above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Project scaffold complete with all 15 files in place
- All 202 devDependencies installed
- Playwright Chromium available at `.playwright/`
- `.svelte-kit/tsconfig.json` exists — TypeScript resolution works
- Placeholder WheelPicker component ready for replacement in Plan 02
- Ready to proceed to Plan 02: source file implementation

---
*Phase: 01-project-setup*
*Completed: 2026-03-23*
