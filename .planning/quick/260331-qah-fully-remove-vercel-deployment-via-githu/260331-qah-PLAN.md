---
phase: quick-260331-qah
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .github/workflows/deploy.yml
  - svelte.config.js
  - package.json
  - vercel.json
  - README.md
autonomous: false
requirements: []
must_haves:
  truths:
    - "GitHub Actions deploys to Netlify on push to main (no Vercel steps)"
    - "SvelteKit builds with adapter-static producing a ./build output directory"
    - "adapter-vercel is removed from package.json devDependencies"
    - "vercel.json is deleted"
    - "README.md shadcn install URL points to Netlify domain (not vercel.app)"
  artifacts:
    - path: ".github/workflows/deploy.yml"
      provides: "Netlify deploy workflow using nwtgck/actions-netlify@v3"
    - path: "svelte.config.js"
      provides: "adapter-static import replacing adapter-vercel"
    - path: "package.json"
      provides: "adapter-static devDep, no adapter-vercel"
  key_links:
    - from: ".github/workflows/deploy.yml"
      to: "netlify.com"
      via: "nwtgck/actions-netlify@v3 with NETLIFY_AUTH_TOKEN + NETLIFY_SITE_ID secrets"
    - from: "svelte.config.js"
      to: "build/"
      via: "adapter-static() produces static export in ./build"
---

<objective>
Replace all Vercel deployment infrastructure with Netlify deployment via GitHub Actions.

Purpose: The Vercel deployment has been persistently broken due to a Hobby-plan team-scope conflict. Clean break to Netlify eliminates the root cause.
Output: Working Netlify deploy workflow, adapter-static swap, vercel.json deleted, README URL updated.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/260331-qah-fully-remove-vercel-deployment-via-githu/260331-qah-RESEARCH.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Swap adapter and remove Vercel config files</name>
  <files>svelte.config.js, package.json, vercel.json</files>
  <action>
    1. Run: `pnpm remove @sveltejs/adapter-vercel && pnpm add -D @sveltejs/adapter-static@3.0.10`

    2. Update svelte.config.js — change the import line:
       FROM: `import adapter from '@sveltejs/adapter-vercel';`
       TO:   `import adapter from '@sveltejs/adapter-static';`
       The rest of the config (adapter(), alias) stays exactly the same. No fallback config needed — the demo site is a single-page static export.

    3. Delete vercel.json entirely (it has no content relevant to Netlify).

    4. Verify package.json now has `@sveltejs/adapter-static` in devDependencies and no `@sveltejs/adapter-vercel` entry.
  </action>
  <verify>
    Run `pnpm build` — it must complete without errors and produce a `./build` directory.
    Run `grep adapter-vercel package.json` — must return nothing.
    Run `ls vercel.json` — must return "No such file or directory".
  </verify>
  <done>Build succeeds with adapter-static, vercel.json deleted, adapter-vercel removed from package.json</done>
</task>

<task type="auto">
  <name>Task 2: Replace GitHub Actions deploy workflow</name>
  <files>.github/workflows/deploy.yml</files>
  <action>
    Completely replace the contents of `.github/workflows/deploy.yml` with the Netlify workflow below.
    The existing file uses Vercel CLI steps — remove all of them.

    ```yaml
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

    Key points:
    - `publish-dir: ./build` — matches adapter-static default output directory (do NOT omit or it deploys the source repo)
    - Two secrets: `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID` (replaces the three VERCEL_* secrets)
    - No Vercel CLI install step
  </action>
  <verify>
    Run `grep -i vercel .github/workflows/deploy.yml` — must return nothing.
    Run `grep 'nwtgck/actions-netlify' .github/workflows/deploy.yml` — must return a match.
  </verify>
  <done>deploy.yml contains only Netlify steps, zero Vercel references</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Task 1 + 2 automated:
    - adapter-static installed, adapter-vercel removed
    - svelte.config.js updated
    - vercel.json deleted
    - .github/workflows/deploy.yml replaced with Netlify workflow
    README.md still has the old vercel.app URL — needs the Netlify site URL which only the user can provide.
  </what-built>
  <how-to-verify>
    Before approving, complete these manual steps:

    1. **Create a Netlify site** (if not already done):
       - Go to https://app.netlify.com → "Add new site" → "Deploy manually" (no Git integration needed)
       - Or use the Netlify CLI: `npx netlify-cli sites:create`
       - Note the assigned site URL (e.g., `https://svelte-wheel-picker.netlify.app`) and the Site ID

    2. **Add GitHub secrets** in repo Settings → Secrets and variables → Actions:
       - `NETLIFY_AUTH_TOKEN`: from https://app.netlify.com/user/applications → Personal access tokens
       - `NETLIFY_SITE_ID`: from Netlify site dashboard → Site configuration → API ID

    3. **Update README.md line 42** — change:
       ```
       npx shadcn-svelte@latest add https://svelte-wheel-picker.vercel.app/r/wheel-picker.json
       ```
       to:
       ```
       npx shadcn-svelte@latest add https://{YOUR-NETLIFY-SITE-URL}/r/wheel-picker.json
       ```
       (Replace `{YOUR-NETLIFY-SITE-URL}` with the actual Netlify domain, e.g. `svelte-wheel-picker.netlify.app`)

    4. **Optionally** delete the old `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets from GitHub — they are no longer referenced.

    5. Push a commit to main and verify the GitHub Action succeeds in the Actions tab.
  </how-to-verify>
  <resume-signal>Type "approved" once the Netlify site is created, secrets are set, README is updated, and (optionally) a test deploy confirms the workflow passes.</resume-signal>
</task>

</tasks>

<verification>
- `pnpm build` succeeds and produces `./build/` with static HTML/CSS/JS
- `grep -r vercel .github/ svelte.config.js package.json` returns nothing relevant (no Vercel CLI or adapter references)
- `vercel.json` does not exist
- `README.md` shadcn install URL uses the Netlify domain
- GitHub Actions deploy workflow runs green on push to main
</verification>

<success_criteria>
- Netlify deploy workflow active and passing on push to main
- Zero Vercel references in tracked project files (workflow, config, package.json)
- README shadcn-svelte install command points to live Netlify URL
- `pnpm build` produces static output in `./build`
</success_criteria>

<output>
After completion, create `.planning/quick/260331-qah-fully-remove-vercel-deployment-via-githu/260331-qah-SUMMARY.md`
</output>
