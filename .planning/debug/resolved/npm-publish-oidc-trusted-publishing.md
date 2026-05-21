---
status: resolved
trigger: "release workflow failing with `npm error 404 - PUT /@uinstinct%2fsvelte-wheel-picker - Not found` despite package existing at v0.1.31"
created: 2026-05-21T12:48:00Z
updated: 2026-05-21T13:30:00Z
symptoms_prefilled: false
---

## Current Focus

hypothesis: CONFIRMED — multi-layered npm publish authentication failure. Initial token rotation surfaced a series of nested issues: granular tokens hit package-level 2FA enforcement (EOTP); switching to Trusted Publishing OIDC surfaced (a) `actions/setup-node`'s `.npmrc` poisoning the auth header with a literal `${NODE_AUTH_TOKEN}` placeholder, (b) `pnpm publish` v9 lacking trusted-publish auth flow, and (c) `npm install -g npm@latest` corrupting npm's own dependency tree on Node 22.
test: confirmed by run 26229076912 — first end-to-end success with OIDC, provenance signed, v0.1.32 published, no orphan tag created on prior failed attempts.
expecting: future publishes work hands-off; no NPM_TOKEN secret needed; failed publishes don't pollute tag history.
next_action: complete — NPM_TOKEN secret can be removed from repo settings.

## Symptoms

expected: Push to `main` → release workflow bumps version, publishes to npm, creates GitHub tag/release.
actual: Publish step failed with `npm error 404 ... is not in this registry` despite v0.1.31 of the same scoped package existing on npm.
errors:
  - First: `npm error code E404` / `404 Not Found - PUT https://registry.npmjs.org/@uinstinct%2fsvelte-wheel-picker - Not found`
  - After token rotation: `npm error code EOTP - This operation requires a one-time password from your authenticator.`
  - After Trusted Publishing config: provenance signed successfully but PUT still returned 404 (same signature as auth failure).
  - After dropping pnpm publish: `npm error code MODULE_NOT_FOUND - Cannot find module 'promise-retry'` during npm self-upgrade on Node 22.
reproduction: Push any commit to main, observe Release workflow fail at the publish step. Tag/release would still get created (initial workflow structure), accumulating orphans.
started: Run 26226625834 (~2026-05-21 12:43Z) — three consecutive runs failed at v0.1.32, v0.1.33, v0.1.34 before investigation. Last successful publish was v0.1.31 a month prior (run 24548441439).

## Eliminated

- **Package name typo / scope ownership** — `npm view @uinstinct/svelte-wheel-picker` confirmed package exists, maintainer `uinstinct`, v0.1.31 published a month ago.
- **Missing `--access public` flag** — present in command, build/pack/publint all succeeded; only the authenticated PUT failed.
- **publint or build issues** — `publint v0.3.18` reported "All good!" before the publish attempt.
- **`pnpm` itself being broken** — pnpm publish successfully signed provenance via OIDC (Sigstore transparency log entry logIndex=1591880173); only the publish-auth leg failed.
- **Account-level 2FA mode** — switching from "Auth and writes" to "Auth only" did NOT resolve EOTP; package-level enforcement overrides account-level for granular tokens.
- **Workflow filename mismatch in Trusted Publisher config** — verified via screenshot: `release.yml` (not `.github/workflows/release.yml`) with `npm publish` action allowed. OIDC was accepted for provenance signing, proving config was correct.

## Evidence

- timestamp: 2026-05-21T12:48:52Z
  checked: failed run 26226891504, publish step logs
  found: `npm error 404 - PUT ... Not Found` with `--access public` already passed
  implication: For scoped packages, npm returns 404 (not 401/403) on auth failure as a security feature to avoid leaking package existence. The token authenticates against npm but lacks publish rights for this package.

- timestamp: 2026-05-21T12:50:00Z
  checked: `gh run list --workflow=release.yml --limit 10`
  found: 3 consecutive failed runs in current session vs last success 1 month ago at v0.1.31
  implication: NPM_TOKEN likely expired/revoked or had insufficient scope. Also revealed orphan-tag drift: each failed run still created a GitHub release+tag because tag creation ran in a separate job *before* publish.

- timestamp: 2026-05-21T12:57:50Z
  checked: re-run after NPM_TOKEN rotation (run 26226891504 first re-run)
  found: `npm error code EOTP - This operation requires a one-time password from your authenticator.`
  implication: Rotation worked (no more 404), but the new granular token still required 2FA at publish time. Classic "Automation" tokens that bypass 2FA appear to be deprecated for new tokens on this account — only Granular tokens were available in the npmjs.com UI.

- timestamp: 2026-05-21T13:02:49Z
  checked: re-run after changing account 2FA to "Auth only" (run 26226891504 second re-run)
  found: Still EOTP. Package has a separate "Require two-factor authentication or a granular access token with bypass 2fa enabled" setting under Publishing Access.
  implication: Per-package 2FA enforcement overrides account-level. Granular tokens without an explicit "bypass 2fa" setting are rejected at publish time regardless of account mode.

- timestamp: 2026-05-21T13:19:12Z
  checked: run 26228467807 with Trusted Publishing configured (NPM_TOKEN dropped, `id-token: write`, `--provenance` added)
  found: `npm notice publish Signed provenance statement` succeeded (Sigstore logIndex=1591880173), but next line: `npm error code E404 ... PUT ... Not Found`. Run env log showed `NODE_AUTH_TOKEN: XXXXX-XXXXX-XXXXX-XXXXX`.
  implication: TWO discoveries: (1) `actions/setup-node@v4` with `registry-url:` writes `.npmrc` containing `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}` — when the env var is unset, npm sends the literal placeholder string as the auth token, causing 404. (2) `pnpm publish` v9 uses OIDC only for provenance signing, not for publish auth; it still relies on `.npmrc` token. The two OIDC flows are independent.

- timestamp: 2026-05-21T13:28:03Z
  checked: run 26228959584 after dropping `registry-url`, switching to `npm publish`, adding `npm install -g npm@latest`
  found: `npm error code MODULE_NOT_FOUND - Cannot find module 'promise-retry'` during the global npm upgrade step on Node 22.22.2.
  implication: npm 10.x self-upgrading to 11.x on Node 22 corrupts its own dependency tree (known npm self-upgrade bug). Need npm 11.x without the upgrade dance — Node 24 ships with npm 11.x natively.

- timestamp: 2026-05-21T13:30:19Z
  checked: run 26229076912 with `node-version: 24` and self-upgrade step removed
  found: Publish succeeded. `npm view @uinstinct/svelte-wheel-picker dist-tags` → `{ latest: '0.1.32' }`. GitHub release v0.1.32 created.
  implication: End-to-end OIDC trusted publishing works with: Node 24 + npm publish + no registry-url in setup-node + Trusted Publisher configured on npmjs.com + workflow restructured so tag creation is gated on publish success.

## Resolution

root_cause: Five overlapping causes that surfaced sequentially:
  1. **Original failure (404):** NPM_TOKEN expired or lost publish authority since the last successful release a month earlier.
  2. **First rotation (EOTP):** npmjs.com no longer offers classic Automation tokens for this account — only Granular tokens, which are subject to package-level 2FA enforcement.
  3. **Trusted Publishing first attempt (404 again):** `actions/setup-node@v4`'s `registry-url:` option writes a poisoned `.npmrc` containing `_authToken=${NODE_AUTH_TOKEN}` that gets sent as a literal placeholder when no env var is set; AND `pnpm publish` v9 does not implement OIDC trusted-publish auth (only provenance signing), so it relied on the poisoned token.
  4. **npm self-upgrade (MODULE_NOT_FOUND):** `npm install -g npm@latest` on Node 22 corrupts npm's own dependency tree.
  5. **Workflow structure drift:** Original two-job workflow created the GitHub tag/release *before* publish ran, so every failed publish accumulated an orphan tag — 6+ orphans had to be cleaned mid-debug.

fix:
  - **Switched to npm Trusted Publishing (OIDC)** — configured Trusted Publisher on npmjs.com (repo: `uinstinct/svelte-wheel-picker`, workflow filename: `release.yml`, action: `npm publish`). Eliminates NPM_TOKEN secret entirely.
  - **Dropped `registry-url:` from `actions/setup-node`** — prevents the `.npmrc` placeholder poisoning.
  - **Switched from `pnpm publish` to `npm publish`** — npm CLI ≥ 11.5.1 implements OIDC trusted-publish auth.
  - **Bumped Node version 22 → 24** — Node 24 ships with npm 11.x natively, avoiding the brittle self-upgrade step.
  - **Added `--provenance` flag** — attaches a Sigstore attestation linking the published artifact to the source workflow run.
  - **Collapsed two-job workflow into one** — bump version → publish → THEN commit version bump + create tag/release. Failed publish now stops the job cleanly with no tag pollution.
  - **Added `id-token: write` permission** at workflow level for OIDC token issuance.
  - **Cleaned up 6 orphan tags/releases** mid-investigation: v0.1.32, v0.1.33, v0.1.34, v1.0.0, v1.0.1, plus a final v0.1.32 from the OIDC-config-incomplete attempt.

verification: Run 26229076912 succeeded end-to-end. npm `latest` = 0.1.32. GitHub release v0.1.32 created. Provenance attestation visible on npmjs.com. No NPM_TOKEN env var or secret referenced anywhere in the workflow. Subsequent failed publishes (none yet, but architecture verified) will not create orphan tags because tag creation runs after publish in the same job.

files_changed: [.github/workflows/release.yml]
side_effects:
  - NPM_TOKEN secret in GitHub repo settings is now unused and can be deleted.
  - npm account 2FA was changed to "Auth only" mid-investigation; this is no longer load-bearing for Trusted Publishing and could be reverted to "Auth and writes" if desired (Trusted Publishing OIDC bypasses 2FA by design).
  - Trusted Publisher config on npmjs.com is permanent and tied to repo+workflow filename — moving the workflow file would break it.
