---
phase: quick-260331-owu
plan: 01
subsystem: infra
tags: [npm, publish, ci, github-actions, scoped-package]

requires: []
provides:
  - Corrected publish.yml: accurate NPM_TOKEN setup instructions and --access public flag
affects: [npm-publish, ci-cd]

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - .github/workflows/publish.yml

key-decisions:
  - "--access public added to pnpm publish command as belt-and-suspenders alongside publishConfig.access in package.json"
  - "Misleading 'first publish must be done manually' comment removed — publishConfig.access handles scoped packages in CI without manual intervention"

patterns-established: []

requirements-completed: [QUICK-260331-owu]

duration: 3min
completed: 2026-03-31
---

# Quick Task 260331-owu: Make sure README is visible on npmjs.com — Summary

**Corrected publish.yml: removed misleading manual-first-publish comment and added --access public flag so CI publishes scoped package on first run**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-31T14:10:00Z
- **Completed:** 2026-03-31T14:13:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Removed the misleading "First publish must be done manually" comment from publish.yml
- Clarified the NPM_TOKEN setup steps with the accurate GitHub Secrets path
- Added `--access public` to the `pnpm publish` command alongside `publishConfig.access: "public"` in package.json for explicit belt-and-suspenders scoped package access
- CI is now able to publish the package on its very first run once NPM_TOKEN is added as a GitHub secret

## Task Commits

1. **Task 1: Fix publish.yml — accurate comment and --access public flag** - `9a6a506` (fix)

## Files Created/Modified

- `.github/workflows/publish.yml` - Corrected comment block and publish command with --access public

## Decisions Made

- `--access public` is belt-and-suspenders with `publishConfig.access: "public"` in package.json — both are intentional and make the scoped package visibility explicit at two levels
- No package.json changes were needed — `publishConfig.access` and README.md being auto-bundled by npm were already correct

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

One human action remains before the README appears on npmjs.com:

Add your npm automation token as a GitHub secret named NPM_TOKEN:

1. Visit https://www.npmjs.com → avatar menu → Access Tokens → Generate New Token
2. Select type: Automation (bypasses 2FA for CI)
3. Copy the token
4. Visit your GitHub repo → Settings → Secrets and variables → Actions → New repository secret
5. Name: NPM_TOKEN — Value: the token from step 3 — click Add secret

Then push anything to main (or let the next commit trigger it). The chain runs:
  push to main → release.yml bumps version + creates GitHub release
  → publish.yml fires on release published event → publishes to npm

The README will appear on https://www.npmjs.com/package/@uinstinct/svelte-wheel-picker within ~60 seconds of the publish completing.

## Next Phase Readiness

- CI publish chain is fully automated — no manual npm steps needed
- Package is ready to publish on the next push to main once NPM_TOKEN is in GitHub secrets

---
*Phase: quick-260331-owu*
*Completed: 2026-03-31*
