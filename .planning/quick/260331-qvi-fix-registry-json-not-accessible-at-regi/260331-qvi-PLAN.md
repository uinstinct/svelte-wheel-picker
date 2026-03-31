---
phase: quick-260331-qvi
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - static/registry.json
autonomous: true
requirements: []
must_haves:
  truths:
    - "GET https://svelte-wheel-spinner.netlify.app/registry.json returns the registry manifest"
  artifacts:
    - path: "static/registry.json"
      provides: "Registry manifest served at /registry.json by SvelteKit static adapter"
      contains: '"$schema": "https://shadcn-svelte.com/schema/registry.json"'
  key_links:
    - from: "static/registry.json"
      to: "/registry.json"
      via: "SvelteKit adapter-static copies static/ verbatim into build/"
---

<objective>
Fix `/registry.json` returning 404 on the Netlify site by placing the manifest where the static adapter can serve it.

Purpose: The SvelteKit static adapter only serves files from `static/` — files at the project root are never included in `build/`. Copying `registry.json` to `static/registry.json` makes it accessible at `/registry.json` with no workflow changes.
Output: `static/registry.json` — identical content to the project-root `registry.json`, served at `/registry.json` on every deploy.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add static/registry.json</name>
  <files>static/registry.json</files>
  <action>
    Create `static/registry.json` with the exact same content as the project-root `registry.json`. Do NOT modify the project-root `registry.json` — the `registry:build` script still reads from there. The `static/` copy is solely the served artefact.

    Content to write (verbatim from project-root `registry.json`):

    ```json
    {
      "$schema": "https://shadcn-svelte.com/schema/registry.json",
      "name": "@uinstinct/svelte-wheel-picker",
      "homepage": "https://svelte-wheel-spinner.netlify.app",
      "items": [
        {
          "name": "wheel-picker",
          "type": "registry:component",
          "title": "Wheel Picker",
          "description": "iOS-style wheel picker for Svelte 5 with inertia scrolling, infinite loop, and keyboard navigation.",
          "registryDependencies": [],
          "files": [
            { "path": "src/lib/WheelPicker.svelte", "type": "registry:component" },
            { "path": "src/lib/WheelPickerWrapper.svelte", "type": "registry:component" },
            { "path": "src/lib/types.ts", "type": "registry:lib" },
            { "path": "src/lib/use-wheel-physics.svelte.ts", "type": "registry:lib" },
            { "path": "src/lib/use-controllable-state.svelte.ts", "type": "registry:lib" },
            { "path": "src/lib/use-typeahead-search.svelte.ts", "type": "registry:lib" },
            { "path": "src/lib/wheel-physics-utils.ts", "type": "registry:lib" }
          ]
        }
      ]
    }
    ```

    After writing the file, run `pnpm build` to confirm the static adapter includes it in `build/registry.json` without error.
  </action>
  <verify>
    <automated>test -f /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/static/registry.json && node -e "JSON.parse(require('fs').readFileSync('/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/static/registry.json','utf8')); console.log('valid JSON')"</automated>
  </verify>
  <done>
    `static/registry.json` exists with valid JSON content matching the project-root manifest. `pnpm build` succeeds and `build/registry.json` is present in the output.
  </done>
</task>

</tasks>

<verification>
After the task completes:
1. `static/registry.json` exists and contains valid JSON
2. `pnpm build` exits 0
3. `build/registry.json` exists in the build output
4. Content of `static/registry.json` matches `registry.json` at the project root
</verification>

<success_criteria>
`/registry.json` is accessible on the deployed Netlify site (the file lands in `build/` and is deployed as a static asset on the next push to main).
</success_criteria>

<output>
After completion, create `.planning/quick/260331-qvi-fix-registry-json-not-accessible-at-regi/260331-qvi-SUMMARY.md`
</output>
