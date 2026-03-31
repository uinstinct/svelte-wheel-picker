---
phase: quick
plan: 260331-owu
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: false
requirements: []
must_haves:
  truths:
    - "https://www.npmjs.com/package/@uinstinct/svelte-wheel-picker loads and shows the README"
    - "npm view @uinstinct/svelte-wheel-picker returns package metadata (not 404)"
  artifacts:
    - path: "README.md"
      provides: "Package readme — already correct, always bundled by npm"
  key_links:
    - from: "README.md"
      to: "npmjs.com package page"
      via: "npm publish tarball (always included regardless of files field)"
      pattern: "README.md"
---

<objective>
Publish @uinstinct/svelte-wheel-picker to npmjs.com so the README is visible.

Purpose: The README is already correctly configured and confirmed in the tarball via `npm pack --dry-run`. The package simply has not been published yet — npmjs.com displays the README from the tarball automatically after the first publish.

Output: Package live on npmjs.com with README visible.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Research finding: `npm view @uinstinct/svelte-wheel-picker` returns 404 — package not yet on npm.
Research finding: `npm pack --dry-run` confirms README.md (8.3 kB) IS included in the tarball.
Research finding: npm always bundles README.md regardless of the `files` field in package.json.
Research finding: `publishConfig.access: "public"` is already set — scoped package will publish publicly.

Workflow note: .github/workflows/publish.yml explicitly states the FIRST publish must be done
manually (`pnpm publish --access public`) because the package doesn't exist yet on npm.
Subsequent releases are handled automatically by the release.yml → publish.yml workflow chain.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build and publish the package to npm</name>
  <files>dist/ (generated, not committed)</files>
  <action>
Run the following commands from the project root. You must be authenticated to npm as the @uinstinct scope owner.

Step 1 — Verify npm authentication:
```
npm whoami
```
Expected: `uinstinct` (or the account that owns the @uinstinct scope). If not authenticated, the user must run `npm login` first.

Step 2 — Dry-run to confirm README is in tarball (verification before publish):
```
npm pack --dry-run
```
Confirm `README.md` appears in the file list.

Step 3 — Build and publish:
```
pnpm publish --access public --no-git-checks
```
The `prepack` script runs `pnpm run package` automatically, which calls `svelte-package` then `publint`.

Do NOT use `npm publish` — use `pnpm publish` to match the workflow and trigger the prepack script correctly.

After publish succeeds, npm returns the tarball URL. Note the version published (should be 0.1.0).
  </action>
  <verify>
    <automated>npm view @uinstinct/svelte-wheel-picker version</automated>
  </verify>
  <done>Command returns `0.1.0` (or current version from package.json) without error. Package exists on registry.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Published @uinstinct/svelte-wheel-picker@0.1.0 to npmjs.com</what-built>
  <how-to-verify>
1. Visit https://www.npmjs.com/package/@uinstinct/svelte-wheel-picker in your browser
2. Confirm the page loads (not 404)
3. Confirm the README content is visible on the page (Features section, Installation section, examples, etc.)
4. npmjs.com may take up to 60-90 seconds to index — if README shows "No readme", wait 1-2 minutes and refresh

CLI verification (optional):
```
npm view @uinstinct/svelte-wheel-picker readme | head -10
```
Should return the first lines of README.md content.
  </how-to-verify>
  <resume-signal>Type "approved" when README is visible on npmjs.com, or describe any issues</resume-signal>
</task>

</tasks>

<verification>
- `npm view @uinstinct/svelte-wheel-picker` returns package metadata (not 404)
- https://www.npmjs.com/package/@uinstinct/svelte-wheel-picker shows README content
- No changes were needed to README.md, package.json, or .npmignore — configuration was already correct
</verification>

<success_criteria>
README.md content is visible on the @uinstinct/svelte-wheel-picker npmjs.com page. The automated release workflow (release.yml → publish.yml) handles all future releases without manual intervention.
</success_criteria>

<output>
After completion, create `.planning/quick/260331-owu-make-sure-my-readme-is-visible-in-npmjs-/260331-owu-SUMMARY.md`
</output>
