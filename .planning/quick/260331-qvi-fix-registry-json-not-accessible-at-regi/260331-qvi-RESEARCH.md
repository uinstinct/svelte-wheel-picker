# Quick Task: Fix /registry.json Not Accessible on Netlify - Research

**Researched:** 2026-03-31
**Domain:** SvelteKit static adapter build pipeline, shadcn-svelte registry serving
**Confidence:** HIGH

## Summary

The root cause is straightforward: `registry.json` lives at the project root but is never copied into the `static/` directory, so it never enters the SvelteKit build output (`build/`) that gets deployed to Netlify. The deploy workflow runs `pnpm build` only — it never runs `pnpm registry:build`. Even if it did, `registry:build` generates item files under `static/r/`, not a `registry.json` at the site root.

**Primary recommendation:** Copy `registry.json` into `static/registry.json` so the SvelteKit static adapter includes it in the `build/` output at `/registry.json`.

## Root Cause Analysis

### How SvelteKit static adapter handles static files

The `@sveltejs/adapter-static` adapter copies everything in `static/` verbatim into the `build/` output directory. Files at the project root (like `registry.json`) are not included. This is the SvelteKit convention — `static/` is the public webroot, not the project root.

**Confidence:** HIGH — confirmed by `svelte.config.js` using `adapter-static` with no custom `assets` config.

### What the deploy workflow actually runs

From `.github/workflows/deploy.yml`:
```
pnpm install --frozen-lockfile
pnpm build          ← SvelteKit build only
```

`pnpm registry:build` (i.e., `shadcn-svelte registry build`) is NEVER called. This means `static/r/wheel-picker.json` and `static/r/index.json` were committed to git manually (they exist in the repo), not generated at build time. Those files ARE deployed because they live in `static/`.

### What currently exists

| File | Location | Deployed? | Served at |
|------|----------|-----------|-----------|
| `registry.json` | project root | NO | N/A |
| `static/r/index.json` | `static/r/` | YES | `/r/index.json` |
| `static/r/wheel-picker.json` | `static/r/` | YES | `/r/wheel-picker.json` |

`/r/wheel-picker.json` and `/r/index.json` already work. Only `/registry.json` is broken.

### What shadcn-svelte CLI expects

The shadcn-svelte CLI does NOT require `/registry.json` at the root for `npx shadcn-svelte add <url>` to work. Users specify the full item URL directly:
```
npx shadcn-svelte add https://svelte-wheel-spinner.netlify.app/r/wheel-picker.json
```

However, the `registry.json` file at the root is referenced in the README and is useful for tooling/discovery. Making it accessible at `/registry.json` is a reasonable user expectation.

## Fix Options

### Option A: Copy registry.json into static/ (RECOMMENDED)

Copy `registry.json` to `static/registry.json`. SvelteKit will then serve it at `/registry.json` automatically.

**Pros:** Simple, no workflow changes, files stay in sync since both are tracked in git.
**Cons:** Two copies of the same data to keep in sync (project root `registry.json` and `static/registry.json`).

To avoid the two-copy problem: remove the project-root `registry.json` and keep only `static/registry.json`. The `registry:build` command reads `registry.json` by default — if the file is moved, the script reference in `package.json` must be updated or a `shadcn-svelte.config.json` pointing to the new path must be added.

**Simplest path:** Just add `static/registry.json` as a copy with the same content. The build script still reads from project-root `registry.json` for generating items; `static/registry.json` is the served copy.

### Option B: Add registry:build to deploy workflow

Add `pnpm registry:build` before `pnpm build` in `deploy.yml`. This regenerates `static/r/` from `registry.json` before the SvelteKit build runs, ensuring items stay in sync with the manifest.

But this still does NOT place `registry.json` at `static/registry.json` — the `registry:build` command generates items under `static/r/`, not a root `registry.json`. So Option B alone does not fix the problem.

### Option C: Option A + Option B (most correct)

1. Add `static/registry.json` (copy of project-root `registry.json`)
2. Add `pnpm registry:build` to `deploy.yml` before `pnpm build`

This ensures: (a) `/registry.json` is accessible, and (b) `static/r/` items are always regenerated from the manifest on every deploy rather than relying on committed generated files.

## Recommended Approach

**Option A only** is the minimal fix for the stated problem. It requires one file addition.

**Option C** is the more correct fix if the goal is also to stop committing generated `static/r/` files and regenerate them on deploy. However, that's a broader change and out of scope for this task.

For this task: add `static/registry.json` with the same content as `registry.json`.

## Common Pitfalls

### Pitfall: Assuming project-root files are served
The SvelteKit `static/` directory is the webroot. Files elsewhere in the project (including the project root) are not served. This is by design — `package.json`, `tsconfig.json`, etc. live at the root and should not be publicly accessible.

### Pitfall: Thinking registry:build generates /registry.json
The `shadcn-svelte registry build` command generates `static/r/[name].json` per item and `static/r/index.json`. It does NOT generate a `registry.json` at the site root.

## Sources

### Primary (HIGH confidence)
- `svelte.config.js` — adapter-static with default config, `static/` is webroot
- `.github/workflows/deploy.yml` — only `pnpm build` runs, no `registry:build`
- `static/` directory listing — confirmed `r/` exists, no `registry.json`
- `registry.json` project root — confirmed file exists only at root
- shadcn-svelte docs (fetched) — confirmed CLI expects `/r/[name].json` item URLs

### Secondary (MEDIUM confidence)
- shadcn-svelte docs: registry:build output goes to `static/r/` per official docs

## Metadata

**Confidence:** HIGH — all findings from direct file inspection, no inference needed.
**Valid until:** N/A — static facts about this repo's configuration.
