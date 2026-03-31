---
phase: quick
plan: 260331-rsh
subsystem: infra
tags: [npm, package.json, github, metadata]

requires: []
provides:
  - "package.json repository, bugs, and homepage fields pointing to GitHub and Netlify"
affects: [npm-publish, npmjs-sidebar]

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - package.json

key-decisions:
  - "Used git+https:// URL format (not SSH) so npm recognizes the GitHub repository link"

patterns-established: []

requirements-completed: []

duration: 2min
completed: 2026-03-31
---

# Quick 260331-rsh: Link GitHub Repo with npm Package Summary

**Added repository, bugs, and homepage fields to package.json so npmjs.com sidebar shows GitHub link, issue tracker, and demo site after next publish.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-31T19:30:00Z
- **Completed:** 2026-03-31T19:32:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Added `repository.url` with `git+https://github.com/uinstinct/svelte-wheel-picker.git` (HTTPS format required by npm)
- Added `bugs.url` with `https://github.com/uinstinct/svelte-wheel-picker/issues`
- Added `homepage` with `https://svelte-wheel-picker.netlify.app`

## Task Commits

1. **Task 1: Add repository, bugs, and homepage fields to package.json** - `6bb3973` (chore)

## Files Created/Modified

- `package.json` - Added repository, bugs, and homepage metadata fields after the license field

## Decisions Made

- Used `git+https://` URL format instead of SSH (`git@github.com:`) — npm requires HTTPS to recognize the field as a GitHub repository link and display it in the sidebar

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Links will appear on npmjs.com automatically after the next `npm publish` (triggered by push to main via the auto-release workflow).

## Next Phase Readiness

- Metadata is ready; npmjs.com sidebar will display GitHub, issues, and homepage links after the next publish

---
*Phase: quick*
*Completed: 2026-03-31*

## Self-Check: PASSED

- package.json exists and contains all three fields: VERIFIED (node verification returned PASS)
- Commit 6bb3973 exists: VERIFIED
