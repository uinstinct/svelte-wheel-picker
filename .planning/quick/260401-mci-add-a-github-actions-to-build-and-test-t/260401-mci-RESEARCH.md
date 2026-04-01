# Quick Task: Add GitHub Actions to Build and Test - Research

**Researched:** 2026-04-01
**Domain:** GitHub Actions CI for SvelteKit library with Vitest browser tests
**Confidence:** HIGH

## Summary

The project already has two GitHub Actions workflows (`deploy.yml` for Netlify, `release.yml` for npm publish) that establish the CI pattern: pnpm 9, Node 22, `pnpm install --frozen-lockfile`. The new CI workflow needs to run lint, type-check, build the library package, and run tests (both unit and browser via Playwright).

The main complexity is Playwright browser installation for Vitest browser-mode tests. The vitest config uses `@vitest/browser-playwright` with headless Chromium. In CI, Playwright browsers must be installed explicitly and cached to avoid re-downloading ~150MB on every run.

**Primary recommendation:** Create a single `ci.yml` workflow triggered on push/PR to main, reusing the existing pnpm/Node setup pattern, adding Playwright browser install with caching, and running lint, build (svelte-package), and test steps.

## Existing Project Setup

### Current Workflows
| File | Trigger | What It Does |
|------|---------|--------------|
| `deploy.yml` | push to main | Build SvelteKit site, deploy to Netlify |
| `release.yml` | push to main, workflow_dispatch | Bump version, create GitHub release, publish to npm |

### Current Scripts (package.json)
| Script | Command | CI-Relevant |
|--------|---------|-------------|
| `lint` | `eslint .` | Yes |
| `build` | `vite build` | Yes (site build, validates SvelteKit compilation) |
| `package` | `svelte-package && rm -rf dist/__tests__ && rm -f dist/*.test.js dist/*.test.d.ts && publint` | Yes (library build + publint validation) |
| `test` | `PLAYWRIGHT_BROWSERS_PATH=.playwright vitest run` | Yes (unit + browser tests) |

### Missing But Recommended
- **`svelte-check`** is NOT installed. The project has no type-checking script. Adding `svelte-check` would catch type errors in `.svelte` files that `tsc` alone misses. However, since it is not currently in devDependencies, adding it is a separate concern from the CI workflow. The CI workflow should include it IF we add it as a dependency; otherwise skip.

## CI Workflow Design

### Recommended Steps (in order)
1. **Checkout** - `actions/checkout@v4`
2. **Setup pnpm** - `pnpm/action-setup@v4` with version 9
3. **Setup Node** - `actions/setup-node@v4` with node-version 22, cache pnpm
4. **Install dependencies** - `pnpm install --frozen-lockfile`
5. **Install Playwright browsers** - `pnpm exec playwright install chromium --with-deps`
6. **Lint** - `pnpm lint`
7. **Build site** - `pnpm build` (validates SvelteKit compilation)
8. **Build package** - `pnpm package` (svelte-package + publint)
9. **Test** - `pnpm test` (runs both unit and browser test projects)

### Trigger Strategy
```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```
This ensures CI runs on PRs (catch issues before merge) and on pushes to main (verify the merge result).

### Playwright Browser Caching

The `PLAYWRIGHT_BROWSERS_PATH` is set to `.playwright` in the test script. In CI, use the standard Playwright cache approach:

```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: .playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}

- name: Install Playwright browsers
  run: PLAYWRIGHT_BROWSERS_PATH=.playwright pnpm exec playwright install chromium --with-deps
```

The `--with-deps` flag installs OS-level dependencies (libgbm, libwoff, etc.) that headless Chromium needs on Ubuntu. Without it, browser launch fails silently or with cryptic errors.

**Important:** The cache key uses `pnpm-lock.yaml` hash because Playwright version is pinned transitively through `@vitest/browser-playwright`. When that dep updates, Playwright version changes and the cache should invalidate.

### Environment Variable

The test script already has `PLAYWRIGHT_BROWSERS_PATH=.playwright` baked in, so tests will look in the right place without additional CI env config.

## Common Pitfalls

### Pitfall 1: Missing Playwright OS Dependencies
**What goes wrong:** Chromium fails to launch in CI with `error while loading shared libraries`
**How to avoid:** Always use `--with-deps` flag on `playwright install` in CI. This installs system packages via apt.

### Pitfall 2: pnpm Lockfile Version Mismatch
**What goes wrong:** `pnpm install --frozen-lockfile` fails because CI pnpm version doesn't match lockfile version (lockfile is v9, local pnpm is 10.29.2)
**How to avoid:** The lockfile version is `9.0`. The existing workflows use `pnpm/action-setup@v4` with `version: 9`. However, the local machine runs pnpm 10.29.2. The lockfile format `9.0` is compatible with pnpm 9.x. Keep `version: 9` in the workflow to match the lockfile, OR update to match local pnpm version if the lockfile is regenerated with pnpm 10.

### Pitfall 3: Vitest Browser Tests Timeout
**What goes wrong:** Browser tests hang or timeout in CI due to resource constraints
**How to avoid:** Tests already run headless. The default GitHub Actions runner (ubuntu-latest, 2 CPU, 7GB RAM) is sufficient. No special configuration needed.

### Pitfall 4: Running CI on Release Commits
**What goes wrong:** The release workflow pushes a version bump commit, which triggers CI, which triggers release again (loop)
**How to avoid:** The release workflow pushes to a `releases` branch, not `main`. CI triggers on `main` only. No loop risk with current setup.

## Code Example: Complete Workflow

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
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

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: .playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}

      - name: Install Playwright browsers
        run: PLAYWRIGHT_BROWSERS_PATH=.playwright pnpm exec playwright install chromium --with-deps

      - name: Lint
        run: pnpm lint

      - name: Build site
        run: pnpm build

      - name: Build package
        run: pnpm package

      - name: Test
        run: pnpm test
```

## Sources

### Primary (HIGH confidence)
- Existing project workflows (`deploy.yml`, `release.yml`) - established CI patterns
- Project `package.json` and `vitest.config.ts` - actual scripts and test configuration
- [GitHub Actions: actions/cache](https://github.com/actions/cache) - caching documentation
- [Playwright CI docs](https://playwright.dev/docs/ci-intro) - CI installation guidance

## Metadata

**Confidence breakdown:**
- Workflow structure: HIGH - follows existing project patterns and standard GitHub Actions practices
- Playwright caching: HIGH - well-documented, standard approach
- Step ordering: HIGH - matches dependencies (install before lint/build/test)

**Research date:** 2026-04-01
**Valid until:** 2026-05-01
