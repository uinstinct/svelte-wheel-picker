---
phase: quick-260401-mog
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [package.json, pnpm-lock.yaml]
autonomous: true
requirements: [CI-FIX-01]

must_haves:
  truths:
    - "playwright is listed as a direct devDependency in package.json"
    - "pnpm exec playwright --version resolves without error"
    - "CI step 'Install Playwright browsers' will find the playwright binary"
  artifacts:
    - path: "package.json"
      provides: "playwright as direct devDependency"
      contains: '"playwright": "1.58.2"'
    - path: "pnpm-lock.yaml"
      provides: "resolved playwright dependency"
  key_links:
    - from: ".github/workflows/ci.yml"
      to: "package.json"
      via: "pnpm exec playwright install chromium"
      pattern: "pnpm exec playwright"
---

<objective>
Fix CI failure by committing the already-applied fix: playwright added as a direct devDependency.

Purpose: The CI workflow runs `pnpm exec playwright install chromium` but playwright was only a transitive peer dependency of @vitest/browser-playwright. pnpm exec cannot find binaries from auto-installed peer deps in CI. Adding playwright as a direct devDependency fixes this.

Output: Committed package.json and pnpm-lock.yaml with playwright 1.58.2 as direct devDependency.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.github/workflows/ci.yml
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Verify and commit playwright direct devDependency fix</name>
  <files>package.json, pnpm-lock.yaml</files>
  <action>
    The fix is already applied locally (playwright 1.58.2 added to devDependencies in package.json, pnpm-lock.yaml updated).

    1. Verify the fix is correct by running: `pnpm exec playwright --version` — should output a version string (1.58.2 or similar)
    2. Verify package.json contains `"playwright": "1.58.2"` in devDependencies
    3. Stage and commit both package.json and pnpm-lock.yaml with message: "fix(ci): add playwright as direct devDependency for CI binary resolution"
  </action>
  <verify>
    <automated>pnpm exec playwright --version</automated>
  </verify>
  <done>package.json and pnpm-lock.yaml committed with playwright as direct devDependency; pnpm exec playwright resolves successfully</done>
</task>

</tasks>

<verification>
- `pnpm exec playwright --version` returns version without error
- `grep '"playwright"' package.json` shows the direct dependency entry
- git log shows the fix commit
</verification>

<success_criteria>
- playwright 1.58.2 is a direct devDependency in package.json
- Both package.json and pnpm-lock.yaml are committed
- CI workflow's `pnpm exec playwright install chromium` step will now find the binary
</success_criteria>

<output>
After completion, create `.planning/quick/260401-mog-fix-ci-failure-add-playwright-as-direct-/260401-mog-SUMMARY.md`
</output>
