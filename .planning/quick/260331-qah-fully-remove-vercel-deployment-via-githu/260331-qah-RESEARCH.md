# Quick Task: Remove Vercel, Add Netlify Deployment - Research

**Researched:** 2026-03-31
**Domain:** SvelteKit deployment — Vercel removal, Netlify GitHub Actions
**Confidence:** HIGH

## Summary

The project currently uses `@sveltejs/adapter-vercel` and a GitHub Actions workflow (`deploy.yml`) that calls the Vercel CLI directly. Deployment has been persistently broken due to a Hobby-plan team-scope conflict (documented in `.planning/debug/vercel-deploy-git-author-team-access.md`). The fix chosen is a clean break: replace everything Vercel with Netlify.

The full scope of changes is small but touches five distinct locations: the GitHub Actions workflow, the SvelteKit adapter, `package.json`, `svelte.config.js`, and the `README.md` shadcn registry URL. There is also `vercel.json` to delete.

**Primary recommendation:** Switch to `@sveltejs/adapter-static` (not `adapter-netlify`) since the demo site is a pure static export — no SSR, no Edge Functions needed. Deploy via GitHub Actions using `nwtgck/actions-netlify` v3. The Netlify site URL will need to be confirmed after the Netlify site is created before updating `README.md`.

## Inventory: All Vercel-Touching Files

| File | What Needs Changing | Action |
|------|---------------------|--------|
| `.github/workflows/deploy.yml` | Entire workflow uses `vercel` CLI, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | Replace with Netlify workflow |
| `vercel.json` | Entire file — Vercel config, no longer needed | Delete |
| `svelte.config.js` | `import adapter from '@sveltejs/adapter-vercel'` | Swap to `@sveltejs/adapter-static` |
| `package.json` devDependencies | `"@sveltejs/adapter-vercel": "^6.3.3"` | Replace with `@sveltejs/adapter-static` |
| `README.md` line 42 | `https://svelte-wheel-picker.vercel.app/r/wheel-picker.json` | Update to Netlify URL after site is created |

No `.vercelignore` file exists. The `.vercel/` local directory is gitignored and irrelevant to CI. `release.yml` has no Vercel references — leave it untouched.

## Standard Stack for Netlify Deployment

### SvelteKit Adapter

| Package | Version | Why |
|---------|---------|-----|
| `@sveltejs/adapter-static` | 3.0.10 (current) | Pure static site export — no SSR, no serverless functions, no Netlify-specific features needed. Simpler than `adapter-netlify`. Output goes to `build/` by default. |

`@sveltejs/adapter-netlify` (6.0.4) is the alternative but adds Netlify Edge Function overhead that this project does not need. Use `adapter-static`.

### GitHub Actions

| Action | Version | Why |
|--------|---------|-----|
| `nwtgck/actions-netlify` | v3.0.0 | Purpose-built Netlify deploy action. Handles the Netlify API call, outputs the deploy URL, supports production deploys and deploy previews. MIT license. |

`nwtgck/actions-netlify@v3` requires two GitHub secrets: `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`.

### Installation

```bash
pnpm remove @sveltejs/adapter-vercel
pnpm add -D @sveltejs/adapter-static@3.0.10
```

## Architecture Patterns

### Netlify Deploy Workflow Pattern

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches:
      - main

jobs:
  deploy:
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

      - name: Build
        run: pnpm build

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: ./build
          production-branch: main
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

**Key differences from the Vercel workflow:**
- No CLI install step — action handles the deploy
- Build uses `pnpm build` (SvelteKit static export), not `vercel build`
- Publish directory is `./build` (adapter-static default)
- Two secrets instead of three: `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID`

### svelte.config.js Adapter Swap

```js
// Before
import adapter from '@sveltejs/adapter-vercel';

// After
import adapter from '@sveltejs/adapter-static';

// adapter-static config — fallback needed for SPA routing (optional, omit if no client-side routing)
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: { $lib: 'src/lib' },
  },
};
```

The demo site uses SvelteKit file-based routing but it's a single page (`src/routes/+page.svelte`). No fallback config needed. Default `adapter-static` settings produce `build/` as the output directory.

## Common Pitfalls

### Pitfall 1: Wrong publish directory
**What goes wrong:** `nwtgck/actions-netlify` defaults to `./` if `publish-dir` is not specified — deploys the source repo, not the built site.
**How to avoid:** Always explicitly set `publish-dir: ./build` for `adapter-static`.

### Pitfall 2: Forgetting `adapter-static` prerendering requirement
**What goes wrong:** `adapter-static` requires all pages to be prerenderable. If any route uses server-side load functions without `export const prerender = true`, the build fails.
**How to avoid:** The demo site's `+page.svelte` uses no server load functions — it's fully static. No action needed. But if a new route is added later with server logic, it needs `export const prerender = true` or `export const ssr = false`.

### Pitfall 3: README URL updated before Netlify site exists
**What goes wrong:** Committing a Netlify URL in `README.md` before the Netlify site is created produces a broken shadcn registry link.
**How to avoid:** Create the Netlify site first, copy the assigned site URL (e.g., `https://svelte-wheel-picker.netlify.app`), then update `README.md`. If a custom domain is used, update with that instead.

### Pitfall 4: Old `VERCEL_*` secrets left in GitHub
**What goes wrong:** No functional breakage but stale secrets create confusion.
**How to avoid:** Document for the user that they should delete `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` from GitHub repo secrets after the Netlify workflow is verified working. This is a manual step — cannot be automated via code.

## Required GitHub Secrets (after switch)

| Secret | Where to Get It |
|--------|----------------|
| `NETLIFY_AUTH_TOKEN` | Netlify dashboard → User Settings → Applications → Personal access tokens |
| `NETLIFY_SITE_ID` | Netlify dashboard → Site → Site configuration → Site ID (also called "API ID") |

The Netlify site must be created first (either via `netlify init` CLI or via netlify.com UI). For a static export, the easiest path is: create a new Netlify site manually (no Git integration needed), then copy the Site ID.

## What Does NOT Change

- `release.yml` — npm publish workflow, no Vercel references
- `src/` — all component source, no Vercel references
- `static/r/` — registry JSON files, URLs are relative paths served by the site
- `.gitignore` — `.vercel` entry can stay (harmless) or be removed (cosmetic)

## Sources

### Primary (HIGH confidence)
- `nwtgck/actions-netlify` npm view — version 3.0.0 confirmed
- `@sveltejs/adapter-static` npm view — version 3.0.10 confirmed
- `@sveltejs/adapter-netlify` npm view — version 6.0.4 confirmed
- Project files read directly: `deploy.yml`, `svelte.config.js`, `package.json`, `vercel.json`, `README.md`

### Secondary (MEDIUM confidence)
- `nwtgck/actions-netlify` README (via npm view) — `publish-dir`, `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` parameters confirmed
