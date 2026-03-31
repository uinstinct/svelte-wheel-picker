---
phase: quick
plan: 260331-icr
subsystem: infra
tags: [vercel, github-actions, sveltekit, adapter-vercel, deployment, ci-cd]

requires: []
provides:
  - GitHub Actions workflow deploying SvelteKit demo site to Vercel on push to main
  - Explicit Vercel adapter replacing generic adapter-auto
affects: [demo-site, shadcn-registry, deployment]

tech-stack:
  added: ["@sveltejs/adapter-vercel@6.3.3"]
  patterns: ["Vercel CLI-based deployment via GitHub Actions with three-secret pattern (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)"]

key-files:
  created:
    - .github/workflows/deploy.yml
  modified:
    - svelte.config.js
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "Use @sveltejs/adapter-vercel (explicit) instead of adapter-auto for predictable Vercel builds"
  - "Three-secret GitHub pattern: VERCEL_TOKEN + VERCEL_ORG_ID + VERCEL_PROJECT_ID matches Vercel CLI zero-config deployment"
  - "pnpm/action-setup@v4 with version 9, Node 22, frozen-lockfile install for reproducible CI builds"

patterns-established:
  - "Vercel CLI deploy pattern: pull env -> vercel build --prod -> vercel deploy --prebuilt --prod"

requirements-completed: []

duration: 1min
completed: 2026-03-31
---

# Quick Task 260331-icr: Deploy to Vercel GitHub Action Summary

**GitHub Actions workflow deploying SvelteKit demo site to Vercel on push to main using Vercel CLI with explicit adapter-vercel**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-03-31T13:04:45Z
- **Completed:** 2026-03-31T13:05:45Z
- **Tasks:** 1 of 2 complete (checkpoint:human-action awaiting secrets)
- **Files modified:** 4

## Accomplishments

- Created `.github/workflows/deploy.yml` with push-to-main trigger and full Vercel CLI deploy pipeline
- Switched `svelte.config.js` from `@sveltejs/adapter-auto` to `@sveltejs/adapter-vercel` for explicit Vercel support
- Installed `@sveltejs/adapter-vercel@6.3.3`, removed `@sveltejs/adapter-auto`
- Confirmed `pnpm build` succeeds with the new adapter

## Task Commits

1. **Task 1: Switch to Vercel adapter and add deploy workflow** - `d3784d3` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified

- `.github/workflows/deploy.yml` - GitHub Actions workflow: checkout, pnpm setup, install, Vercel pull/build/deploy
- `svelte.config.js` - Updated import from adapter-auto to adapter-vercel
- `package.json` - Replaced @sveltejs/adapter-auto with @sveltejs/adapter-vercel devDependency
- `pnpm-lock.yaml` - Updated lockfile reflecting adapter change

## Decisions Made

- Used `@sveltejs/adapter-vercel` explicitly rather than `adapter-auto` — adapter-auto adds unnecessary auto-detection overhead and is ambiguous about target platform
- Followed Vercel CLI three-step pattern (pull -> build -> deploy) rather than GitHub integration to keep deployment secrets in GitHub, not Vercel dashboard

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

Three GitHub repository secrets must be configured before the workflow can run:

1. Run `vercel link` locally (or `npx vercel link`) to connect the project — creates `.vercel/project.json`
2. Get `orgId` and `projectId` from `.vercel/project.json`
3. Get a personal token from https://vercel.com/account/tokens
4. Add to GitHub repository secrets (Settings > Secrets and variables > Actions):
   - `VERCEL_TOKEN` = your token
   - `VERCEL_ORG_ID` = orgId from `.vercel/project.json`
   - `VERCEL_PROJECT_ID` = projectId from `.vercel/project.json`
5. Push to main — workflow triggers and deploys automatically

## Issues Encountered

None.

## Next Phase Readiness

- Workflow file is complete and committed; only the three GitHub secrets are needed
- Once secrets are set, every push to main will deploy the demo site and shadcn registry automatically
- A `.vercel/` directory will be created locally after running `vercel link` — add it to `.gitignore` if not already there

---
*Phase: quick*
*Completed: 2026-03-31*

## Self-Check

### Created files exist:

- FOUND: `.github/workflows/deploy.yml`
- FOUND: `svelte.config.js`
- FOUND: commit `d3784d3`

## Self-Check: PASSED
