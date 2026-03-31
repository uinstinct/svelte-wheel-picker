# Quick Task: Make README Visible on npmjs.com — Research

**Researched:** 2026-03-31
**Domain:** npm package publishing, README display on npmjs.com
**Confidence:** HIGH

## Summary

The README is not showing on npmjs.com because the package has not been published yet. `npm view @uinstinct/svelte-wheel-picker` returns 404 — the package does not exist in the registry. Once published, the README will appear automatically.

The current setup is already correct. `npm pack --dry-run` confirms that `README.md` (8.3 kB) is included in every tarball even though `package.json` only lists `"files": ["dist"]` — npm always bundles `README.md`, `LICENSE`, and `package.json` regardless of the `files` field. No changes to `package.json` or `.npmignore` are needed.

**Primary recommendation:** Publish the package. The README will display on npmjs.com automatically after the first publish.

## How npmjs.com Discovers the README (HIGH confidence)

npmjs.com displays the README from the published tarball. It searches for these filenames in this priority order (case-insensitive on npm's servers):

1. `README.md` (standard Markdown — renders with full formatting)
2. `README` (plain text — displayed but not formatted)
3. `readme.md`, `Readme.md` (case variants — accepted)

The file must exist in the **root of the tarball**, not inside a subdirectory.

### npm's Always-Included Files

npm unconditionally includes the following regardless of the `files` field or `.npmignore`:
- `package.json`
- `README` / `README.md` (any case)
- `LICENSE` / `LICENSE.md` (any case)
- `CHANGELOG` / `CHANGES` (any case)

This is why `"files": ["dist"]` does not block the README. It is always packed.

Source: [npm docs — files field](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#files) (HIGH confidence — official documentation).

## Current Package State

| Check | Result |
|-------|--------|
| Package published on npm | **No** — 404 Not Found |
| README.md exists | Yes — `README.md` at repo root, 8.3 kB |
| README.md in tarball | Yes — confirmed via `npm pack --dry-run` |
| `files` field excludes README | No — npm always includes README regardless |
| `.npmignore` blocks README | No — `.npmignore` only blocks `dist/**/*.test.*` and `dist/__tests__/` |
| README filename (case) | Correct — `README.md` is the canonical form |

## Why README Might NOT Show After Publishing (reference for future)

These are the known causes for README not appearing on npmjs.com. None currently apply to this project, but documented for completeness:

| Cause | Condition | Fix |
|-------|-----------|-----|
| Package not published | 404 on registry | Publish the package |
| README added after initial publish | Published empty, README added later | `npm publish` again — npmjs.com updates on each publish |
| README inside a subdirectory | `files` field points to a subfolder containing its own README | Add README to root, or add `"readme"` field in package.json pointing to the file path |
| Non-standard filename | `readme.txt`, `docs.md`, etc. | Rename to `README.md` |
| `package.json` `"readme"` field pointing to missing path | Rare — only if explicitly set | Remove or correct the field |
| Private package without public access | Scoped package without `publishConfig.access: "public"` | Already set correctly in this project |

## Verification Steps

Before and after publishing:

```bash
# Dry-run to see exactly what gets published (run from project root)
npm pack --dry-run

# After publishing — verify README is visible via CLI
npm view @uinstinct/svelte-wheel-picker readme | head -20

# Direct registry check
curl https://registry.npmjs.org/@uinstinct/svelte-wheel-picker | jq '.readme' | head -5
```

npmjs.com may take up to 60 seconds to index a newly published package and display the README. If the page shows "No readme" immediately after publish, wait 1-2 minutes and refresh.

## What the Plan Should Do

The task is minimal — the repository and package configuration are already correct:

1. Ensure the GitHub Actions publish workflow is wired correctly (it already exists from quick task 260331-ja8).
2. Trigger a publish (either push to main which bumps version via 260331-ong workflow, or manual `npm publish`).
3. Verify the README appears on https://www.npmjs.com/package/@uinstinct/svelte-wheel-picker after publish completes.

No file changes are required to make the README appear on npmjs.com.

## Sources

### Primary (HIGH confidence)
- `npm pack --dry-run` output — confirmed README.md in tarball
- `npm view @uinstinct/svelte-wheel-picker` — confirmed package not yet published (404)
- [npm docs: package.json files field](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#files) — always-included files list
