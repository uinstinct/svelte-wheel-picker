---
phase: quick
plan: 260331-qg5
subsystem: ci-cd
tags: [github-actions, release, versioning]
dependency_graph:
  requires: []
  provides: [clean-main-branch-history]
  affects: [.github/workflows/release.yml]
tech_stack:
  added: []
  patterns: [release-branch-versioning]
key_files:
  created: []
  modified:
    - .github/workflows/release.yml
decisions:
  - "Version bump commits go to releases/v{version} branch, not main — keeps main history clean of bot commits"
  - "publish job checks out by tag v{version} (not ref: main) to get bumped package.json"
  - "[skip ci] removed from commit message — no longer needed since commit lands on release branch, not main"
metrics:
  duration: 5m
  completed_date: "2026-03-31"
---

# Quick Task 260331-qg5: Version bump to releases/* branch Summary

Release workflow now commits the version bump to a `releases/v{version}` branch instead of directly to `main`, keeping the main branch free of github-actions[bot] commits.

## What Was Done

Updated `.github/workflows/release.yml` with three coordinated changes:

1. **Added `outputs` to the `release` job** — exposes `version` so the `publish` job can reference it via `needs.release.outputs.version`.

2. **Release branch for version bump** — replaced the direct `git push` (to main) with:
   - `git checkout -b "releases/v{version}"`
   - Commit `package.json` bump to that branch
   - `git push origin "releases/v{version}"`

3. **GitHub Release targets the branch** — added `--target "$BRANCH"` to `gh release create` so the tag points at the release branch commit, not at main HEAD.

4. **Publish job checks out by tag** — changed `ref: main` to `ref: v${{ needs.release.outputs.version }}` so the correct bumped `package.json` is present during `pnpm publish`.

5. **Removed `[skip ci]`** — no longer needed since the commit lands on a release branch, not main (no infinite loop risk).

## Verification

- `releases/v` appears 2 times in the workflow (branch name and `--target`)
- `git push origin` (with explicit branch target) appears once
- No `ref: main` remains in the publish job
- YAML has no syntax errors (no tab characters, valid structure)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `.github/workflows/release.yml` modified and committed
- [x] Commit b83ef71 exists

## Self-Check: PASSED
