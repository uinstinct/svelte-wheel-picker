# Quick Task 260331-ja8: Add GitHub Action to Publish to npm — Research

**Researched:** 2026-03-31
**Domain:** GitHub Actions / npm publish / Svelte library packaging
**Confidence:** HIGH

---

## Summary

Publishing this package to npm via GitHub Actions is straightforward. Two authentication strategies exist: the classic NPM_TOKEN secret approach (always worked, still valid) and the newer OIDC-based trusted publishing (no long-lived tokens, provenance built-in, requires npm CLI >=11.5.1). Trusted publishing is the current recommended approach and is now GA (July 2025).

The `prepack` script in package.json already runs `npm run package` (which runs `svelte-package` + cleanup + `publint`), so the build step is already wired. The workflow just needs to: install deps, run `pnpm publish`, and authenticate.

**Primary recommendation:** Use OIDC trusted publishing with `id-token: write` permission and `NPM_CONFIG_PROVENANCE=true`. Trigger on GitHub release published event. No NPM_TOKEN secret needed.

---

## Existing Codebase Integration Points

| Integration Point | Detail |
|-------------------|--------|
| `prepack` script | Runs `npm run package` automatically before any publish — no extra build step needed in CI |
| `package` script | `svelte-package && rm -rf dist/__tests__ && rm -f dist/*.test.js dist/*.test.d.ts && publint` |
| Package name | `@uinstinct/svelte-wheel-picker` (scoped) |
| Package manager | pnpm (existing `deploy.yml` uses `pnpm/action-setup@v4`) |
| Node engine requirement | `>=18` |
| Existing workflow pattern | `.github/workflows/deploy.yml` — uses `pnpm/action-setup@v4`, `actions/setup-node@v4`, `actions/checkout@v4` |

The scoped package name (`@uinstinct/...`) means `--access public` is required on first publish and should be set in `publishConfig` or as a flag.

---

## Standard Stack

### Trigger: Release Published (not tag push)

Use `on: release: types: [published]` rather than `on: push: tags: v*`.

| Approach | Tradeoff |
|----------|----------|
| `release: types: [published]` | Explicit intent — only fires when a GitHub Release is published (not draft). Gives a UI for release notes. **Recommended.** |
| `push: tags: v*` | Simpler but fires on any tag push including accidental pushes; no release notes UI. |
| `push: branches: main` (with changesets) | Best for monorepos / automated versioning. Overkill for a single-package library. |

### Authentication: OIDC Trusted Publishing (Recommended)

No NPM_TOKEN needed. npm issues a short-lived token via GitHub OIDC.

**Requirements:**
- npm CLI >= 11.5.1 (upgrade in workflow step)
- `id-token: write` permission in workflow
- Trusted publisher configured on npmjs.com for this package

**Fallback: NPM_TOKEN secret** — if OIDC setup is deferred, use `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` with a classic automation token. Works with pnpm publish directly.

### publish command

```bash
pnpm publish --access public --no-git-checks
```

- `--access public` — required for scoped packages to be publicly visible
- `--no-git-checks` — required in CI (detached HEAD state)
- `prepack` fires automatically before publish, running the full build+lint chain

---

## Workflow Pattern

```yaml
name: Publish to npm

on:
  release:
    types: [published]

permissions: {}

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # Required for OIDC trusted publishing

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          registry-url: https://registry.npmjs.org  # Required for NODE_AUTH_TOKEN to work (fallback path)

      - name: Upgrade npm (OIDC trusted publishing requires >=11.5.1)
        run: npm install -g npm@latest

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Publish
        run: pnpm publish --access public --no-git-checks
        env:
          NPM_CONFIG_PROVENANCE: true
          # If NOT using OIDC trusted publishing, use this instead:
          # NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Note: `pnpm/action-setup@v4` is the same version used in the existing `deploy.yml`.

---

## Common Pitfalls

### Pitfall 1: Scoped package not public by default
**What goes wrong:** `pnpm publish` on a scoped package defaults to `--access restricted`, requiring a paid npm org. The publish silently succeeds but the package is inaccessible.
**How to avoid:** Always include `--access public` flag, or set `"publishConfig": { "access": "public" }` in package.json.

### Pitfall 2: Detached HEAD in CI
**What goes wrong:** pnpm's git checks fail because GitHub Actions checks out in detached HEAD state.
**How to avoid:** `--no-git-checks` flag on `pnpm publish`.

### Pitfall 3: prepack runs the full build — needs all devDependencies
**What goes wrong:** If you try to skip `pnpm install` or use `--prod`, the `prepack` script fails because `svelte-package`, `publint`, etc. are devDependencies.
**How to avoid:** Always run `pnpm install --frozen-lockfile` (includes devDeps by default).

### Pitfall 4: OIDC trusted publishing npm version requirement
**What goes wrong:** If the npm version bundled with Node 22 is < 11.5.1, OIDC publish fails with a cryptic error.
**How to avoid:** Add `npm install -g npm@latest` step before publish.

### Pitfall 5: OIDC setup on npmjs.com must be done per-package
**What goes wrong:** OIDC trusted publisher config is per-package, not per-account. Configuring it on a package that hasn't been published yet requires a bootstrap publish (first publish must use NPM_TOKEN).
**How to avoid:** For a brand-new package, do the first publish manually with `pnpm publish --access public` locally, then configure trusted publishers on npmjs.com, then switch the workflow to OIDC.

### Pitfall 6: Version in package.json must match release tag
**What goes wrong:** package.json `version` field is the authoritative version. The GitHub release tag (e.g. `v0.2.0`) is just a trigger — npm uses the version from package.json. If they diverge, the published version is wrong.
**How to avoid:** Ensure package.json version is bumped and committed before creating the GitHub Release.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Build + lint before publish | Custom build step in workflow | `prepack` script already handles it |
| Provenance attestation | Custom SLSA generation | `NPM_CONFIG_PROVENANCE=true` env var |
| Version management | Custom version-bump scripts | Bump in package.json, tag in GitHub Release UI |

---

## Environment Availability

Step 2.6: SKIPPED — no new tools required. GitHub Actions, pnpm, and Node.js are the only dependencies, all available in the standard ubuntu-latest runner. The existing `deploy.yml` already uses the same runner and pnpm setup actions.

---

## Sources

### Primary (HIGH confidence)
- [npm Trusted Publishers docs](https://docs.npmjs.com/trusted-publishers/) — OIDC setup, per-package configuration
- [GitHub Changelog: npm trusted publishing GA (July 2025)](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/) — GA status confirmed
- [Phil Nash: Things you need to do for npm trusted publishing](https://philna.sh/blog/2026/01/28/trusted-publishing-npm/) — npm >=11.5.1 requirement, --provenance flag, npmjs.com setup path

### Secondary (MEDIUM confidence)
- [Ross Robino: NPM Trusted Publishing](https://blog.robino.dev/posts/npm-trusted-publishing) — full workflow YAML with changesets pattern; permissions structure
- [DEV: Automatically publish with pnpm and GitHub Actions](https://dev.to/receter/automatically-publish-your-node-package-to-npm-with-pnpm-and-github-actions-22eg) — `--no-git-checks` requirement for pnpm in CI
