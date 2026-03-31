---
phase: quick-260331-ja8
plan: 01
subsystem: ci-cd
tags: [github-actions, npm, publish, release]
dependency_graph:
  requires: []
  provides: [npm-publish-workflow]
  affects: [package.json]
tech_stack:
  added: []
  patterns: [release-triggered-publish, publishConfig-scoped-access]
key_files:
  created:
    - .github/workflows/publish.yml
  modified:
    - package.json
decisions:
  - "Use release:published trigger (not tag push) so draft releases can be prepared before publishing"
  - "publishConfig.access=public in package.json rather than --access flag in workflow — single source of truth"
  - "Top-level permissions:{} with job-level contents:read follows principle of least privilege"
  - "NODE_AUTH_TOKEN set on publish step only (not workflow-wide) minimizes token exposure"
metrics:
  duration: 3m
  completed: "2026-03-31"
  tasks: 1
  files: 2
---

# Quick Task 260331-ja8: Add GitHub Action to Publish to npm — Summary

**One-liner:** GitHub Actions workflow that publishes @uinstinct/svelte-wheel-picker to npm on Release published, authenticated via NPM_TOKEN secret with publishConfig.access=public for scoped package visibility.

## What Was Built

Added automated npm publishing triggered by creating a GitHub Release. The workflow installs dependencies with `--frozen-lockfile`, then runs `pnpm publish --no-git-checks` — the `prepack` script fires automatically before publish, running `svelte-package && cleanup && publint` without a separate build step.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add publishConfig to package.json and create publish workflow | ee27aa3 | .github/workflows/publish.yml, package.json |

## Verification

All plan checks passed:
- `publishConfig.access = "public"` present in package.json
- Workflow trigger is `release: types: [published]`
- `pnpm publish --no-git-checks` is the publish command
- `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` set on the publish step
- No duplicate `--access public` flag (handled by publishConfig)
- Top-level `permissions: {}` with job-level `contents: read` (least privilege)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `.github/workflows/publish.yml` exists: FOUND
- `package.json` updated with publishConfig: FOUND
- Commit ee27aa3 exists: FOUND
