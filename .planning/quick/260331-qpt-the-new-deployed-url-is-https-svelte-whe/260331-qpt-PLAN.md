---
phase: quick-260331-qpt
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - README.md
  - registry.json
  - src/routes/+page.svelte
autonomous: true
must_haves:
  truths:
    - "All user-facing URLs point to https://svelte-wheel-spinner.netlify.app"
    - "shadcn-svelte CLI install command uses the Netlify domain"
    - "No remaining references to svelte-wheel-picker.vercel.app in source files"
  artifacts:
    - path: "README.md"
      contains: "svelte-wheel-spinner.netlify.app"
    - path: "registry.json"
      contains: "svelte-wheel-spinner.netlify.app"
    - path: "src/routes/+page.svelte"
      contains: "svelte-wheel-spinner.netlify.app"
  key_links:
    - from: "README.md"
      to: "https://svelte-wheel-spinner.netlify.app/r/wheel-picker.json"
      via: "shadcn install command"
    - from: "src/routes/+page.svelte"
      to: "https://svelte-wheel-spinner.netlify.app/r/wheel-picker.json"
      via: "hero install snippet"
---

<objective>
Replace all references to the old Vercel deployment URL (`svelte-wheel-picker.vercel.app`) with the new Netlify URL (`svelte-wheel-spinner.netlify.app`) across all source files.

Purpose: The demo site has moved from Vercel to Netlify. The shadcn registry install command, README, and registry manifest all reference the old domain.
Output: All three source files updated with the correct Netlify URL.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@README.md
@registry.json
@src/routes/+page.svelte
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace all vercel.app URLs with netlify.app URLs</name>
  <files>README.md, registry.json, src/routes/+page.svelte</files>
  <action>
In each of the three files, replace every occurrence of `svelte-wheel-picker.vercel.app` with `svelte-wheel-spinner.netlify.app`. The specific locations are:

1. **README.md** line 42 — the shadcn-svelte install command:
   `npx shadcn-svelte@latest add https://svelte-wheel-spinner.netlify.app/r/wheel-picker.json`

2. **registry.json** line 4 — the homepage field:
   `"homepage": "https://svelte-wheel-spinner.netlify.app"`

3. **src/routes/+page.svelte** line 126 — the install snippet in the hero section:
   `>npx shadcn-svelte@latest add https://svelte-wheel-spinner.netlify.app/r/wheel-picker.json</code`

Do NOT modify any files under `.planning/` or `.claude/worktrees/` — those are historical artifacts.
  </action>
  <verify>
    <automated>! grep -r "svelte-wheel-picker\.vercel\.app" README.md registry.json src/routes/+page.svelte && grep -q "svelte-wheel-spinner.netlify.app" README.md && grep -q "svelte-wheel-spinner.netlify.app" registry.json && grep -q "svelte-wheel-spinner.netlify.app" src/routes/+page.svelte && echo "PASS"</automated>
  </verify>
  <done>Zero occurrences of "svelte-wheel-picker.vercel.app" in README.md, registry.json, and src/routes/+page.svelte. All three files contain "svelte-wheel-spinner.netlify.app" instead.</done>
</task>

</tasks>

<verification>
- `grep -r "svelte-wheel-picker.vercel.app" README.md registry.json src/ 2>/dev/null` returns no results
- `grep -r "svelte-wheel-spinner.netlify.app" README.md registry.json src/routes/+page.svelte` returns 3 matches (one per file)
- `pnpm build` still succeeds (no broken imports from URL change)
</verification>

<success_criteria>
- All three source files reference `https://svelte-wheel-spinner.netlify.app` instead of the old Vercel URL
- No remaining `vercel.app` references in any source file (excluding .planning/ history)
- Build passes
</success_criteria>

<output>
After completion, create `.planning/quick/260331-qpt-the-new-deployed-url-is-https-svelte-whe/260331-qpt-SUMMARY.md`
</output>
