---
phase: quick
plan: 260331-p5j
subsystem: infra
tags: [vercel, github-actions, deployment, ci-cd]

# Dependency graph
requires: []
provides:
  - "vercel.json disabling automatic GitHub integration deployments"
  - "CLI-only Vercel deployment path via deploy.yml"
affects: [deployment, github-actions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "vercel.json github.enabled=false to prevent integration auto-deploys on Hobby plan"

key-files:
  created:
    - vercel.json
  modified: []

key-decisions:
  - "Disable Vercel GitHub integration via vercel.json (not dashboard) to keep the fix in source control"
  - "deploy.yml unchanged — CLI-based deployment with --token was already correct"

patterns-established:
  - "vercel.json at repo root controls Vercel project settings declaratively"

requirements-completed: []

# Metrics
duration: 2min
completed: 2026-03-31
---

# Quick Task 260331-p5j: Fix Vercel Deployment GitHub Action Error Summary

**Added vercel.json with github.enabled=false to block Vercel's automatic GitHub integration deployments, eliminating the "Git author must have access to the team" error on Hobby plan**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-31T12:39:33Z
- **Completed:** 2026-03-31T12:41:00Z
- **Tasks:** 1 (+ 1 checkpoint pending human verification)
- **Files modified:** 1

## Accomplishments

- Created vercel.json disabling Vercel's automatic GitHub integration deployments
- Root cause addressed: the Hobby plan's team membership check is triggered by the integration's auto-deploy, not the CLI workflow
- CLI-based deploy.yml (already correct) remains the sole deployment path

## Task Commits

1. **Task 1: Fix deploy.yml to bypass git-author team membership check** - `8324411` (chore)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `vercel.json` - Disables Vercel GitHub integration auto-deploys with `github.enabled: false`

## Decisions Made

- Used vercel.json (source control) rather than a Vercel dashboard toggle so the setting is version-controlled and repeatable
- deploy.yml was already using `--token` flags correctly — no changes needed to the workflow itself

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**Verification required:** After pushing this change to main, confirm the "Deploy to Vercel" GitHub Action completes successfully without the "Git author must have access to the team" error.

If the error persists after this fix, the `VERCEL_ORG_ID` secret may be set to a team ID instead of your personal account ID. In that case:
- Go to Vercel dashboard > Settings > General > "Vercel ID"
- Update the `VERCEL_ORG_ID` GitHub secret to use your personal account ID

## Next Phase Readiness

- Vercel deployments should work cleanly on next push to main
- No blockers for further development

---
*Phase: quick*
*Completed: 2026-03-31*
