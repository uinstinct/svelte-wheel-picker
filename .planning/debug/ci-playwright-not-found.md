---
status: awaiting_human_verify
trigger: "CI failure — 'Command playwright not found' when running pnpm exec playwright install chromium --with-deps"
created: 2026-04-01T00:00:00Z
updated: 2026-04-01T00:00:00Z
---

## Current Focus

hypothesis: playwright is not a direct devDependency — it is only auto-installed as a peer of @vitest/browser-playwright. pnpm exec cannot find the binary because it is not registered in the project's own .bin/ directory.
test: add playwright@1.58.2 as a direct devDependency, run pnpm install, confirm binary resolves
expecting: playwright binary found, CI step succeeds
next_action: add playwright to devDependencies in package.json and update lockfile

## Symptoms

expected: CI workflow installs Playwright browsers and runs browser tests successfully
actual: The "Install Playwright browsers" step fails with exit code 254 — playwright binary not found
errors: ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "playwright" not found
reproduction: Push to main branch triggers the CI action at .github/workflows/ci.yml
started: Latest push — the CI workflow was recently added (quick task 260401-mci)

## Eliminated

- hypothesis: @vitest/browser-playwright is the wrong package name
  evidence: package exists at node_modules/@vitest/browser-playwright and is correctly referenced in lockfile
  timestamp: 2026-04-01T00:00:00Z

- hypothesis: playwright is not installed at all
  evidence: lockfile shows playwright@1.58.2 is resolved via autoInstallPeers for @vitest/browser-playwright peer dep; binary exists locally at node_modules/.bin/playwright
  timestamp: 2026-04-01T00:00:00Z

## Evidence

- timestamp: 2026-04-01T00:00:00Z
  checked: package.json devDependencies
  found: playwright is NOT listed as a direct devDependency; @vitest/browser-playwright@4.1.0 is listed
  implication: playwright is only present because pnpm autoInstallPeers resolved it transitively

- timestamp: 2026-04-01T00:00:00Z
  checked: pnpm-lock.yaml settings block
  found: autoInstallPeers: true — pnpm auto-resolves peer deps into the lockfile
  implication: playwright@1.58.2 IS in the lockfile and IS installed, but as an auto-peer, its binary linking behaviour differs from a direct dep

- timestamp: 2026-04-01T00:00:00Z
  checked: node_modules/.bin/playwright
  found: binary exists locally
  implication: locally pnpm links it; in CI the ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL error suggests pnpm exec cannot find it — likely because pnpm exec scans direct project deps only

- timestamp: 2026-04-01T00:00:00Z
  checked: @vitest/browser-playwright/package.json peerDependencies
  found: playwright listed as required peer (optional: false)
  implication: playwright must be a direct devDependency so CI can call pnpm exec playwright

## Resolution

root_cause: playwright@1.58.2 is only an auto-installed peer dependency of @vitest/browser-playwright, not a direct devDependency. pnpm exec searches the project's declared dependency tree for binaries; a transitive/auto-peer binary is not reliably found by pnpm exec in CI with --frozen-lockfile.
fix: add "playwright": "1.58.2" to devDependencies in package.json, run pnpm install to update lockfile, commit both files
verification: pnpm exec playwright --version returns "Version 1.58.2" after adding as direct devDependency and running pnpm install; binary is now linked in project .bin/
files_changed: [package.json, pnpm-lock.yaml]
