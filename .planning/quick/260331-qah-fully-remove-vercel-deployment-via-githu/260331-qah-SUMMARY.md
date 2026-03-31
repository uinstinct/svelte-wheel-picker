---
phase: quick-260331-qah
plan: 01
subsystem: infra
tags: [netlify, vercel, adapter-static, github-actions, sveltekit]

requires: []
provides:
  - "Netlify deploy workflow via nwtgck/actions-netlify@v3"
  - "adapter-static replacing adapter-vercel for static site export"
  - "vercel.json deleted"
affects: [deploy, registry-urls]

tech-stack:
  added: ["@sveltejs/adapter-static@3.0.10"]
  patterns: ["SvelteKit static export with prerender=true in root layout"]

key-files:
  created:
    - ".github/workflows/deploy.yml (replaced)"
    - "src/routes/+layout.ts"
  modified:
    - "svelte.config.js"
    - "package.json"
    - "pnpm-lock.yaml"
  deleted:
    - "vercel.json"

key-decisions:
  - "Use adapter-static (not adapter-netlify) — demo site is a pure static export, no SSR or Edge Functions needed"
  - "Add src/routes/+layout.ts with prerender=true — required by adapter-static for all routes"
  - "README.md shadcn URL update deferred to checkpoint:human-verify — requires Netlify site URL only user can provide"

requirements-completed: []

duration: 5min
completed: 2026-03-31
---

# Quick Task 260331-qah: Fully Remove Vercel Deployment via GitHub Summary

**Replaced all Vercel deployment infrastructure with Netlify: adapter-static swap, vercel.json deleted, GitHub Actions workflow rewritten to use nwtgck/actions-netlify@v3**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-31T19:01:00Z
- **Completed:** 2026-03-31T19:06:00Z
- **Tasks:** 2 of 3 automated (Task 3 is checkpoint:human-verify)
- **Files modified:** 6

## Accomplishments

- Removed `@sveltejs/adapter-vercel` and installed `@sveltejs/adapter-static@3.0.10`
- Updated `svelte.config.js` adapter import
- Deleted `vercel.json`
- Added `src/routes/+layout.ts` with `export const prerender = true` (required for adapter-static)
- Replaced `.github/workflows/deploy.yml` — all Vercel CLI steps removed, Netlify action added
- `pnpm build` verified: produces `./build` static output successfully

## Task Commits

1. **Task 1: Swap adapter and remove Vercel config files** - `1140487` (chore)
2. **Task 2: Replace GitHub Actions deploy workflow** - `6d1ebd2` (chore)

## Files Created/Modified

- `.github/workflows/deploy.yml` - Replaced with Netlify workflow using nwtgck/actions-netlify@v3
- `svelte.config.js` - Import changed from adapter-vercel to adapter-static
- `package.json` - adapter-vercel removed, adapter-static@3.0.10 added
- `pnpm-lock.yaml` - Updated lockfile
- `src/routes/+layout.ts` - Created with `export const prerender = true`
- `vercel.json` - Deleted

## Decisions Made

- Used `adapter-static` (not `adapter-netlify`) since the demo site is a pure static export — no SSR, no Netlify Edge Functions needed. Simpler and correct.
- Added `src/routes/+layout.ts` with `prerender = true` — adapter-static requires all routes to be prerenderable; without this the build fails with "Encountered dynamic routes" error.
- README.md URL update deferred: the Netlify site URL is unknown until the user creates the Netlify site.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added +layout.ts with prerender=true**
- **Found during:** Task 1 (build verification)
- **Issue:** `pnpm build` failed with "Encountered dynamic routes" — adapter-static requires all routes to be prerenderable; the plan did not mention adding `export const prerender = true`
- **Fix:** Created `src/routes/+layout.ts` with `export const prerender = true` — enables full site prerender
- **Files modified:** `src/routes/+layout.ts` (created)
- **Verification:** `pnpm build` completed successfully, wrote static output to `./build`
- **Committed in:** `1140487` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (missing critical functionality)
**Impact on plan:** Essential fix — without prerender=true, adapter-static cannot build the site. No scope creep.

## User Setup Required

The checkpoint:human-verify (Task 3) requires the following manual steps before the deployment is fully operational:

1. **Create a Netlify site** — go to https://app.netlify.com or use `npx netlify-cli sites:create`
2. **Add GitHub secrets** in repo Settings → Secrets and variables → Actions:
   - `NETLIFY_AUTH_TOKEN` — from https://app.netlify.com/user/applications → Personal access tokens
   - `NETLIFY_SITE_ID` — from Netlify site dashboard → Site configuration → API ID
3. **Update README.md line 42** — change the shadcn install URL from `svelte-wheel-picker.vercel.app` to your Netlify domain
4. **Optionally delete** stale `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets from GitHub
5. **Push to main** to trigger the workflow and verify it passes in the Actions tab

## Next Phase Readiness

- All Vercel code references removed from tracked files
- Build produces static output in `./build` ready for Netlify
- Workflow file ready — only needs secrets to activate
- README.md still has old vercel.app URL — must be updated after Netlify site URL is known

---
*Quick task: 260331-qah*
*Completed: 2026-03-31*
