---
phase: quick-260331-ong
plan: "01"
subsystem: ci
tags: [github-actions, release, versioning, npm]
dependency_graph:
  requires: [.github/workflows/publish.yml]
  provides: [automated-versioning, github-release-creation]
  affects: [npm-publish-pipeline]
tech_stack:
  added: []
  patterns: [release-event-chain, skip-ci-loop-prevention]
key_files:
  created: [.github/workflows/release.yml]
  modified: []
decisions:
  - "Use [skip ci] in version bump commit to prevent infinite release loop"
  - "gh release create implicitly creates the tag — no separate git tag step needed"
  - "node -e to write package.json preserves 2-space indentation; npm version avoided to prevent duplicate tag creation"
metrics:
  duration: "< 1 minute"
  completed: "2026-03-31"
  tasks: 1
  files: 1
---

# Phase quick-260331-ong Plan 01: Auto Release on Push to Main Summary

**One-liner:** GitHub Actions release workflow that auto-patches on push-to-main and bumps major via workflow_dispatch, chaining into npm publish via the release:published event.

## What Was Built

`.github/workflows/release.yml` — a two-trigger release automation workflow:

1. **Push to main** (automatic): reads current version from `package.json`, increments the PATCH component, writes it back via `node -e` (preserving 2-space formatting), commits with `[skip ci]` to prevent loop, then calls `gh release create` which fires the `release: types: [published]` event in `publish.yml`, triggering npm publish automatically.

2. **workflow_dispatch** (manual): same flow but increments MAJOR and resets MINOR/PATCH to 0.

## Task Completion

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create release.yml | 9d0944c | .github/workflows/release.yml |

## Decisions Made

- **[skip ci] loop prevention**: GitHub Actions skips workflows when commit message contains `[skip ci]` — the version bump commit pushed by the workflow does not re-trigger the release job.
- **gh release create for tagging**: `gh release create v$VERSION` creates both the tag and the release in one step. No separate `git tag` + `git push --tags` needed. The release creation fires `release: types: [published]` which chains to `publish.yml`.
- **node -e for package.json write**: Preserves exact 2-space indentation. `npm version` was avoided because it creates a git tag automatically, which would conflict with the tag created by `gh release create`.
- **permissions: contents: write at workflow level**: Covers both the git push and `gh release create` steps without needing per-job overrides.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `.github/workflows/release.yml` exists
- [x] Commit 9d0944c exists

## Self-Check: PASSED
