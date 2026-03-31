---
phase: quick
plan: 260331-icr
type: execute
wave: 1
depends_on: []
files_modified:
  - .github/workflows/deploy.yml
  - svelte.config.js
autonomous: true
requirements: []
must_haves:
  truths:
    - "Pushing to main triggers a Vercel deployment of the demo site"
    - "The SvelteKit build completes successfully in the GitHub Action"
  artifacts:
    - path: ".github/workflows/deploy.yml"
      provides: "GitHub Actions workflow for Vercel deployment"
    - path: "svelte.config.js"
      provides: "SvelteKit config with Vercel adapter"
  key_links:
    - from: ".github/workflows/deploy.yml"
      to: "Vercel"
      via: "vercel CLI deploy"
      pattern: "vercel.*--prod"
---

<objective>
Add a GitHub Actions workflow that deploys the SvelteKit demo site to Vercel on push to main.

Purpose: Automate deployment so the demo site and shadcn registry stay up-to-date with every merge.
Output: `.github/workflows/deploy.yml` workflow file, updated svelte.config.js with Vercel adapter.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@svelte.config.js
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Switch to Vercel adapter and add deploy workflow</name>
  <files>.github/workflows/deploy.yml, svelte.config.js, package.json</files>
  <action>
1. Install `@sveltejs/adapter-vercel` as a devDependency (replace `@sveltejs/adapter-auto`):
   `pnpm add -D @sveltejs/adapter-vercel && pnpm remove @sveltejs/adapter-auto`

2. Update `svelte.config.js`:
   - Change import from `@sveltejs/adapter-auto` to `@sveltejs/adapter-vercel`
   - Keep all other config identical

3. Create `.github/workflows/deploy.yml` with this workflow:
   - Name: "Deploy to Vercel"
   - Triggers: push to `main` branch
   - Single job `deploy` running on `ubuntu-latest`
   - Steps:
     a. `actions/checkout@v4`
     b. `pnpm/action-setup@v4` with version 9
     c. `actions/setup-node@v4` with node-version 22, cache pnpm
     d. `pnpm install --frozen-lockfile`
     e. Install Vercel CLI: `pnpm add -g vercel@latest`
     f. Pull Vercel environment: `vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}`
     g. Build: `vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}`
     h. Deploy: `vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}`
   - Environment variables for steps f-h:
     - `VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}`
     - `VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}`

Note: The user must configure three GitHub repository secrets:
- `VERCEL_TOKEN` — from https://vercel.com/account/tokens
- `VERCEL_ORG_ID` — from `.vercel/project.json` after running `vercel link`
- `VERCEL_PROJECT_ID` — from `.vercel/project.json` after running `vercel link`
  </action>
  <verify>
    <automated>cat .github/workflows/deploy.yml && node -e "import('./svelte.config.js').then(m => console.log('adapter loaded'))"</automated>
  </verify>
  <done>
  - `.github/workflows/deploy.yml` exists with push-to-main trigger and Vercel deploy steps
  - `svelte.config.js` imports `@sveltejs/adapter-vercel`
  - `pnpm build` still succeeds locally
  </done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <what-built>GitHub Actions workflow for Vercel deployment</what-built>
  <how-to-verify>
    Three GitHub repository secrets must be configured for the workflow to function:

    1. Run `vercel link` locally (or `npx vercel link`) to connect the project — this creates `.vercel/project.json`
    2. Get `orgId` and `projectId` from `.vercel/project.json`
    3. Get a token from https://vercel.com/account/tokens
    4. Add these as GitHub repository secrets (Settings > Secrets and variables > Actions):
       - `VERCEL_TOKEN` = your token
       - `VERCEL_ORG_ID` = orgId from project.json
       - `VERCEL_PROJECT_ID` = projectId from project.json
    5. Push to main — the workflow should trigger and deploy
  </how-to-verify>
  <resume-signal>Type "done" once secrets are configured, or "skip" to handle later</resume-signal>
</task>

</tasks>

<verification>
- `.github/workflows/deploy.yml` parses as valid YAML
- `svelte.config.js` uses `@sveltejs/adapter-vercel`
- `pnpm build` succeeds
</verification>

<success_criteria>
GitHub Actions workflow file exists and is correctly configured to deploy to Vercel on push to main. Adapter switched from auto to vercel for explicit Vercel support.
</success_criteria>

<output>
After completion, create `.planning/quick/260331-icr-add-a-github-action-to-deploy-the-websit/260331-icr-SUMMARY.md`
</output>
