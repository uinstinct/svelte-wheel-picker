---
phase: quick-260331-qnz
plan: 01
subsystem: ci
tags: [github-actions, release, workflow]
dependency_graph:
  requires: []
  provides: [single-releases-branch]
  affects: [.github/workflows/release.yml]
tech_stack:
  added: []
  patterns: [force-push to shared branch on each release]
key_files:
  modified: [.github/workflows/release.yml]
decisions:
  - Use force push to releases branch — safe because the branch always equals main + one version bump commit; no one works on it directly
metrics:
  duration: 3m
  completed: 2026-03-31
---

# Quick 260331-qnz: Fix Release Workflow to Use Single Releases Branch Summary

**One-liner:** Release workflow now force-pushes version bump commits to a single persistent `releases` branch instead of creating a new `releases/v{version}` branch per release.

## What Was Done

The release workflow was creating a new `releases/v{version}` branch on every release (e.g. `releases/v0.1.5`, `releases/v0.1.6`), causing branch proliferation in the repo. This fix changes the workflow to always push to a single `releases` branch.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update release workflow to use single persistent releases branch | 3f12729 | .github/workflows/release.yml |

## Changes Made

**`.github/workflows/release.yml`** — "Commit and push version bump" step:
- Before: `BRANCH="releases/v${{ steps.newver.outputs.version }}"` + `git checkout -b "$BRANCH"` + `git push origin "$BRANCH"`
- After: `git checkout -b releases` + `git push origin releases --force`

**`.github/workflows/release.yml`** — "Create GitHub Release" step:
- Before: `BRANCH="releases/v${{ steps.newver.outputs.version }}"` + `--target "$BRANCH"`
- After: `--target releases` (no BRANCH variable needed)

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check

- [x] `.github/workflows/release.yml` exists and contains `releases` branch references
- [x] `grep -c "releases/v" .github/workflows/release.yml` returns 0
- [x] Commit 3f12729 exists

## Self-Check: PASSED
