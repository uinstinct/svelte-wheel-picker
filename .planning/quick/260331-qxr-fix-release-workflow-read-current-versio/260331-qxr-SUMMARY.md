---
phase: quick
plan: 260331-qxr
subsystem: ci-cd
tags: [github-actions, release, versioning, git-tags]
dependency_graph:
  requires: []
  provides: [correct-incremental-versioning-on-push-to-main]
  affects: [.github/workflows/release.yml]
tech_stack:
  added: []
  patterns: [git-tag-based-version-detection-with-package-json-fallback]
key_files:
  created: []
  modified:
    - .github/workflows/release.yml
decisions:
  - "Read version from latest git tag (git tag --sort=-v:refname | grep '^v' | head -1) instead of package.json because version bump commits go to releases branch, not main"
  - "Fallback to package.json when no tags exist to support fresh repos"
metrics:
  duration: "2m"
  completed: "2026-03-31"
  tasks: 1
  files: 1
---

# Quick Task 260331-qxr: Fix Release Workflow — Read Current Version from Git Tag

**One-liner:** Release workflow now reads current version from latest git tag (`git tag --sort=-v:refname`) with package.json fallback, preventing stale-version republish on every push to main.

## What Changed

The "Read current version" step in `.github/workflows/release.yml` was reading from `package.json` on the `main` branch. However, version bump commits are pushed to the `releases` branch (not `main`), so `main`'s `package.json` always has the stale pre-bump version. Every push to `main` would detect the same old version and attempt to republish it.

The fix reads from git tags instead, which are created by the GitHub Release step and are always up to date regardless of which branch is checked out.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Replace package.json version read with git tag lookup | 9e00d1b | .github/workflows/release.yml |

## Deviations from Plan

None — plan executed exactly as written.

The plan's automated verification grep used "fallback to package.json" but the replacement text contains "falling back to package.json". This is a mismatch in the plan's verification string, not in the implementation — the actual replacement text matches the plan's specified `<action>` block exactly.

## Known Stubs

None.

## Self-Check: PASSED

- `.github/workflows/release.yml` — FOUND and contains `git tag --sort=-v:refname`
- Commit 9e00d1b — FOUND in git log
