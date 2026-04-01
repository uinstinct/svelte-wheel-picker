---
phase: quick-260401-mci
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .github/workflows/ci.yml
autonomous: true
must_haves:
  truths:
    - "CI workflow runs lint, build, package, and test on push to main and PRs"
    - "Playwright browsers are cached to avoid re-downloading on every run"
    - "Workflow follows existing project CI patterns (pnpm 9, Node 22)"
  artifacts:
    - path: ".github/workflows/ci.yml"
      provides: "CI workflow for build and test"
  key_links:
    - from: ".github/workflows/ci.yml"
      to: "package.json scripts"
      via: "pnpm lint, pnpm build, pnpm package, pnpm test"
      pattern: "pnpm (lint|build|package|test)"
---

<objective>
Create a GitHub Actions CI workflow that runs lint, build, package, and test on every push to main and on pull requests.

Purpose: Catch regressions before merge and verify the main branch stays green.
Output: `.github/workflows/ci.yml`
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/260401-mci-add-a-github-actions-to-build-and-test-t/260401-mci-RESEARCH.md
@.github/workflows/deploy.yml (existing workflow — match pnpm/Node setup pattern)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create CI workflow</name>
  <files>.github/workflows/ci.yml</files>
  <action>
Create `.github/workflows/ci.yml` with the following configuration:

**Triggers:** push to main, pull_request to main.

**Job: ci** on ubuntu-latest with these steps in order:
1. Checkout — `actions/checkout@v4`
2. Setup pnpm — `pnpm/action-setup@v4` with version 9 (matches existing workflows and lockfile format 9.0)
3. Setup Node — `actions/setup-node@v4` with node-version 22, cache pnpm
4. Install deps — `pnpm install --frozen-lockfile`
5. Cache Playwright browsers — `actions/cache@v4` with path `.playwright` and key `playwright-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}`
6. Install Playwright browsers — `PLAYWRIGHT_BROWSERS_PATH=.playwright pnpm exec playwright install chromium --with-deps` (the `--with-deps` flag is critical — installs OS-level libs headless Chromium needs on Ubuntu)
7. Lint — `pnpm lint`
8. Build site — `pnpm build`
9. Build package — `pnpm package`
10. Test — `pnpm test`

Match the exact checkout/pnpm/node setup pattern from `deploy.yml`. The test script already has `PLAYWRIGHT_BROWSERS_PATH=.playwright` baked in so no extra env config needed for step 10.
  </action>
  <verify>
    <automated>cat .github/workflows/ci.yml && node -e "const yaml = require('yaml'); const fs = require('fs'); const y = yaml.parse(fs.readFileSync('.github/workflows/ci.yml','utf8')); const steps = y.jobs.ci.steps.map(s=>s.name); console.log('Steps:', steps); const required = ['Lint','Build site','Build package','Test']; const missing = required.filter(r => !steps.some(s => s.includes(r))); if(missing.length) { console.error('Missing:', missing); process.exit(1); } console.log('All required steps present');" 2>/dev/null || echo "yaml module not available — manual review: file must contain lint, build, package, test steps"</automated>
  </verify>
  <done>CI workflow file exists at .github/workflows/ci.yml with all steps: checkout, pnpm setup, node setup, install, Playwright cache, Playwright install, lint, build site, build package, test. Triggers on push to main and pull_request to main.</done>
</task>

</tasks>

<verification>
- `.github/workflows/ci.yml` exists and is valid YAML
- Workflow triggers on push to main and pull_request to main
- All four key steps present: lint, build, package, test
- Playwright caching configured with `.playwright` path
- Setup matches existing workflows (pnpm 9, Node 22)
</verification>

<success_criteria>
CI workflow created that will run lint, build, package, and test on pushes to main and pull requests targeting main. Playwright browser caching avoids redundant downloads.
</success_criteria>

<output>
After completion, create `.planning/quick/260401-mci-add-a-github-actions-to-build-and-test-t/260401-mci-SUMMARY.md`
</output>
