# Quick Task: README.md Not Visible on npm Published Page - Research

**Researched:** 2026-03-31
**Domain:** npm publishing / package.json `files` configuration
**Confidence:** HIGH

## Root Cause (Confirmed)

The `files` field in `package.json` is `["dist"]`. This means `npm pack` only includes the contents of `dist/` in the published tarball. `README.md` lives at the project root and is **not inside `dist/`**, so it is never included in the published package.

npm's README display logic: npm looks for `README.md` (case-insensitive) at the **root of the published tarball**. When only `dist/` is in `files`, the tarball root is the project root — but npm only packs `dist/*` into it. `README.md` is excluded.

Verified state:

| File | Location | In published tarball? |
|------|----------|-----------------------|
| `README.md` | project root (`/README.md`) | No — not in `files` array |
| `dist/` contents | `dist/*.js`, `dist/*.d.ts`, `dist/*.svelte` | Yes |
| `dist/README.md` | Does not exist | N/A |

## Fix

Two valid approaches:

### Option A: Add `"README.md"` to the `files` array (recommended)

```json
"files": [
  "dist",
  "README.md"
]
```

`npm pack` respects the `files` array as a list of individual files **and** directories. Adding `"README.md"` at the project root level causes it to be packed at the tarball root, which is exactly where npm looks for it.

This is the standard approach used by virtually all npm packages that publish a `dist/` subdirectory (e.g., Vue, Vite, SvelteKit itself).

Also add `"LICENSE"` at the same time if not already covered — it is also currently excluded:

```json
"files": [
  "dist",
  "README.md",
  "LICENSE"
]
```

### Option B: Copy README.md into dist/ during the build

Modify the `package` script to copy `README.md` into `dist/` after `svelte-package` runs:

```json
"package": "svelte-package && cp README.md dist/ && rm -rf dist/__tests__ && ..."
```

This is a valid workaround but less clean than Option A. It means `dist/README.md` exists locally alongside the package artifacts, which can be confusing. Prefer Option A.

## Why Option A is Correct

- `npm pack` behavior: when `files` lists a directory (e.g., `"dist"`), that directory's contents are included. When it lists a file (e.g., `"README.md"`), that specific file is included at the tarball root.
- npm always surfaces the README at the tarball root regardless of what's inside subdirectories.
- No build script changes required — the `package` / `prepack` chain is unchanged.
- `publint` will not flag this change as an error.

## Verification After Fix

```bash
# Preview what will be packed without publishing
npm pack --dry-run

# Look for README.md in the output list — it should appear
# Expected output includes:
# - dist/index.js
# - dist/WheelPicker.svelte
# - ...
# - README.md     <-- this must appear
```

Alternatively:
```bash
npm pack
tar -tzf uinstinct-svelte-wheel-picker-*.tgz | grep -i readme
```

## Sources

### Primary (HIGH confidence)
- npm docs: [package.json `files` field](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#files) — confirms `files` controls tarball contents, README.md must be explicitly listed if not at root of pack
- Direct inspection of `/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/package.json` — confirmed `files: ["dist"]` only
- Direct inspection of `dist/` — confirmed no `README.md` present

**Research date:** 2026-03-31
**Valid until:** Stable — npm publish behavior is unchanged for years
