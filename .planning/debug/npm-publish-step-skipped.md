---
status: verifying
trigger: "npm publish step is being skipped — package never published to npm despite token being set as a GitHub repo secret"
created: 2026-03-31T00:00:00Z
updated: 2026-03-31T00:00:00Z
symptoms_prefilled: true
---

## Current Focus

hypothesis: CONFIRMED — publish.yml triggers on `release: [published]` but release.yml's `gh release create` uses `--generate-notes` without `--latest` flag interaction issues; more specifically, the two-workflow chain is broken: release.yml creates a GitHub Release which SHOULD trigger publish.yml, but the release created by `gh release create` inside a workflow using GITHUB_TOKEN does NOT trigger other workflows — GitHub prevents recursive workflow triggers from GITHUB_TOKEN-authenticated actions.
test: confirmed by reading workflow files — release.yml creates release via GITHUB_TOKEN, which does not fire the `release: published` event that publish.yml listens for
expecting: fix by either (a) using a PAT instead of GITHUB_TOKEN for gh release create, or (b) combining publish into release.yml directly
next_action: apply fix — add publish job to release.yml directly (simpler and avoids PAT requirement)

## Symptoms

expected: GitHub Action publishes the npm package to npmjs.com on each trigger
actual: The publish step is skipped — the job runs but publish never executes
errors: No error messages — the step is simply skipped/not reached
reproduction: Push to main (or whatever the workflow trigger is) — publish step skips
started: Never worked — first time setting up, has never successfully published
token_setup: NPM token added as a GitHub repo secret

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-03-31T00:00:00Z
  checked: .github/workflows/publish.yml trigger
  found: `on: release: types: [published]` — publish.yml ONLY runs when a GitHub Release is published
  implication: publish never runs on push to main; it requires a Release event

- timestamp: 2026-03-31T00:00:00Z
  checked: .github/workflows/release.yml — how it creates the GitHub Release
  found: uses `gh release create` with `env: GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`
  implication: GitHub explicitly does NOT trigger downstream workflow events when GITHUB_TOKEN is used to create releases/push commits. This is a documented GitHub Actions security constraint. The `release: published` event in publish.yml is therefore NEVER fired by the release workflow.

- timestamp: 2026-03-31T00:00:00Z
  checked: release.yml line 63 — version bump commit
  found: commit message contains `[skip ci]` — this prevents the push from re-triggering release.yml (correct). But the release creation on line 70 with GITHUB_TOKEN also silently fails to trigger publish.yml.
  implication: The entire two-workflow chain is broken by design. The token used to create the release determines whether downstream workflows fire. GITHUB_TOKEN = no downstream trigger. PAT = downstream trigger fires.

- timestamp: 2026-03-31T00:00:00Z
  checked: publish.yml steps
  found: Publish step has no `if:` condition — it runs unconditionally IF the workflow is triggered. The step itself is not skipped; the entire workflow is never triggered.
  implication: The "step skipped" appearance is actually the entire publish.yml workflow never running at all, not a step-level skip.

## Resolution

root_cause: publish.yml triggers on `release: types: [published]`, but the GitHub Release is created inside release.yml using `secrets.GITHUB_TOKEN`. GitHub explicitly does not fire workflow trigger events for actions performed via GITHUB_TOKEN — this is a security constraint to prevent recursive workflow loops. As a result, the `release: published` event is never dispatched when release.yml creates the release, so publish.yml is never invoked at all. The workflow is not "skipped at the step level" — it simply never starts.
fix: Merge the publish job directly into release.yml as a second job with `needs: release`. This eliminates the cross-workflow trigger entirely. The publish job runs in the same workflow execution, directly after the release job completes, using NPM_TOKEN from secrets.
verification: Self-check — release.yml now contains a `publish` job with `needs: release`. The publish job checks out `ref: main` to get the version-bumped package.json committed by the release job. pnpm publish runs with NODE_AUTH_TOKEN from NPM_TOKEN secret. No cross-workflow event trigger required. Deleted publish.yml which was unreachable.
files_changed: [.github/workflows/release.yml, .github/workflows/publish.yml]
