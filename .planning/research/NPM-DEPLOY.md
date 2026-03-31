# NPM Publish Guide: @uinstinct/svelte-wheel-picker

**Researched:** 2026-03-31
**Package:** `@uinstinct/svelte-wheel-picker`
**Status:** FIRST PUBLISH (not yet on npm registry)

---

## Project Readiness

### Current state — all green

| Item | Value | Status |
|------|-------|--------|
| Package name | `@uinstinct/svelte-wheel-picker` | Scoped under `@uinstinct` |
| Version | `0.1.0` | Real version, not a placeholder `0.0.0` |
| `dist/` exists | Yes — 16 files present | Build output is current |
| `files` field | `["dist"]` | Only `dist/` goes in the tarball |
| `exports` field | Correct — `types` + `svelte` conditions | publint-compatible |
| `sideEffects` | `false` | Correct for headless library |
| `peerDependencies` | `svelte: "^5.0.0"` | Svelte is peer dep, not bundled |
| `prepack` script | `npm run package` | Auto-runs build before pack/publish |
| `publint` | Included in `package` script | Validates before every build |
| `.npmignore` | Exists | Excludes test artifacts from tarball |
| npm login | NOT logged in | Must log in before publishing |
| Package on npm | NOT YET PUBLISHED | This is a first publish |
| `.npmrc` | Does not exist | No custom registry config needed |

### What `dist/` contains right now

```
index.d.ts / index.js
types.d.ts / types.js
use-controllable-state.svelte.d.ts / .js
use-typeahead-search.svelte.d.ts / .js
use-wheel-physics.svelte.d.ts / .js
wheel-physics-utils.d.ts / .js
WheelPicker.svelte / WheelPicker.svelte.d.ts
WheelPickerWrapper.svelte / WheelPickerWrapper.svelte.d.ts
```

No test files present — the `package` script explicitly removes `dist/__tests__/` and
`dist/*.test.js / *.test.d.ts` after `svelte-package` runs.

---

## Pre-Publish Checklist

Work through this top-to-bottom before running `npm publish`.

### 1. npm account prerequisites

- [ ] You own (or have rights to) the npm scope `@uinstinct`
  - Scoped packages (`@uinstinct/...`) require the scope to exist on npm
  - Create it at https://www.npmjs.com/org/create or it is auto-created when you
    first publish with `--access public` using your personal account username as scope
  - If `@uinstinct` is your npm username (common pattern), no extra step needed

- [ ] Log in to npm from this machine:
  ```bash
  npm login
  ```
  Follow the browser-based auth flow. Verify with `npm whoami`.

### 2. Decide: public or private

Scoped packages default to **private** on npm (costs money). This package should be
**public** (free). You must pass `--access public` on the very first publish. After the
first publish the access level is stored by npm and you do not need to repeat it.

### 3. Rebuild before publishing (optional but safe)

The `prepack` hook runs `npm run package` automatically before every `npm publish` or
`npm pack`. However, if you want to verify manually first:

```bash
pnpm run package
```

This runs `svelte-package`, removes test artifacts, then runs `publint`. If publint
reports errors, fix them before continuing.

### 4. Dry-run to inspect the tarball

```bash
npm pack --dry-run
```

Read the output and confirm:
- Only files under `dist/` are listed
- No test files (`.test.js`, `.test.d.ts`, `__tests__/`) are included
- No source files from `src/` are included
- `package.json`, `README.md`, and `LICENSE` appear (npm always includes these
  regardless of `files` field)

### 5. Verify version number

`0.1.0` is already set. Confirm this is the version you want to ship. You cannot
unpublish and re-publish the same version once it is on npm (npm's 72-hour unpublish
window applies, and re-publishing the exact same version number is blocked permanently).

---

## Step-by-Step Publish Process

### First publish

```bash
# Step 1: Log in (one-time per machine)
npm login
npm whoami   # should print your npm username

# Step 2: Rebuild and validate (prepack runs this automatically,
#          but running manually lets you catch issues early)
pnpm run package

# Step 3: Inspect the tarball without publishing
npm pack --dry-run

# Step 4: Publish as public (REQUIRED for scoped packages)
npm publish --access public
```

That's it. If successful, npm prints:
```
+ @uinstinct/svelte-wheel-picker@0.1.0
```

Verify at: https://www.npmjs.com/package/@uinstinct/svelte-wheel-picker

---

## First Publish vs Version Bump

### First publish (current situation)

- Must use `--access public` — without it npm creates a private package (paid)
- The `@uinstinct` scope is claimed when this command succeeds
- Cannot be undone without unpublishing within 72 hours (and even then, the version
  number is permanently reserved)

### Subsequent version bumps

```bash
# Bump version in package.json
npm version patch   # 0.1.0 → 0.1.1
# or
npm version minor   # 0.1.0 → 0.2.0
# or
npm version major   # 0.1.0 → 1.0.0

# Publish (no --access flag needed after first publish)
npm publish
```

`npm version` also creates a git tag (`v0.1.1`) automatically. Push it:
```bash
git push && git push --tags
```

For pnpm users: pnpm does not have a `pnpm version` command. Use `npm version` from
the same directory — it only modifies `package.json` and creates the git tag. Then
use `pnpm publish` to publish.

---

## Common Pitfalls

### Pitfall 1: Scoped package defaults to private

**What goes wrong:** You run `npm publish` without `--access public`. npm silently
creates a private package. You get no error. The package appears in your dashboard
but is not installable by others without paying for npm Teams/Orgs.

**How to avoid:** Always pass `--access public` on the FIRST publish of a scoped
package. After that, npm remembers.

**Recovery:** Run `npm access public @uinstinct/svelte-wheel-picker` to flip access.

### Pitfall 2: Not logged in / wrong account

**What goes wrong:** `npm publish` fails with `E403 Forbidden` or
`You must be logged in to publish packages`.

**How to avoid:** Run `npm whoami` first. If it prints "Not logged in", run `npm login`.

### Pitfall 3: Stale dist/ from an old build

**What goes wrong:** You edited source files but forgot to rebuild. The published package
contains outdated code.

**How to avoid:** The `prepack` hook runs `pnpm run package` automatically before
`npm publish`. This is already configured. Trust it, or run `pnpm run package` manually
and inspect the output.

### Pitfall 4: Test files leaking into the tarball

**What goes wrong:** `svelte-package` compiles everything in `src/lib/` including
`*.test.ts` files into `dist/`. These then ship to consumers.

**How this project prevents it:**
1. The `package` script explicitly runs `rm -rf dist/__tests__ && rm -f dist/*.test.js dist/*.test.d.ts` after `svelte-package`
2. `.npmignore` also excludes those patterns as a belt-and-suspenders approach

**Verify:** Run `npm pack --dry-run` and confirm no `.test.` files appear.

### Pitfall 5: Missing `--access public` scope issue with pnpm

**What goes wrong:** When using pnpm to publish, the flag syntax is the same but
some pnpm versions behave differently.

**Correct command with pnpm:**
```bash
pnpm publish --access public --no-git-checks
```

`--no-git-checks` skips pnpm's requirement that the working tree be clean. Only use
this if you deliberately want to publish with uncommitted changes — typically you want
the tree clean anyway.

### Pitfall 6: `publint` errors block the build

**What goes wrong:** `pnpm run package` fails at the `publint` step because
`package.json` exports are misconfigured.

**How to check:** Run `npx publint` separately to see detailed errors. The current
`package.json` exports look correct (`types` + `svelte` conditions), so this should
pass. If you add new entry points in the future, update `exports` accordingly.

### Pitfall 7: npm 2FA requirement for scoped packages

**What goes wrong:** npm enforces OTP (one-time password) for publishing scoped
packages if your account has 2FA enabled in "auth and writes" mode.

**How to avoid:** Either complete the OTP prompt when it appears, or use an npm
Automation token (generated in your npm account settings) stored as `NPM_TOKEN` for
CI/CD publishing.

---

## Confidence

| Section | Confidence | Reason |
|---------|------------|--------|
| Project readiness | HIGH | Directly read from package.json, dist/, .npmignore — no inference |
| First publish not yet done | HIGH | `npm view @uinstinct/svelte-wheel-picker` returned not found |
| `--access public` requirement | HIGH | npm official docs — scoped packages require this flag for free public publishing |
| `prepack` auto-run behavior | HIGH | npm lifecycle spec — `prepack` runs before `npm publish` and `npm pack` |
| Test artifact exclusion | HIGH | Directly read from .npmignore and package script |
| pnpm version vs npm version | MEDIUM | pnpm docs confirm no `pnpm version` command; npm version works in pnpm projects |
| npm 2FA behavior | MEDIUM | Known npm behavior, not verified against current npm docs for this session |
