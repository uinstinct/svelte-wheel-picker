---
phase: quick-260331-jcm
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - registry.json
  - static/r/index.json
  - static/r/wheel-picker.json
  - src/routes/+page.svelte
autonomous: true
requirements: [QUICK-260331-jcm]
must_haves:
  truths:
    - "https://svelte-wheel-picker.vercel.app/r/wheel-picker.json returns valid registry JSON"
    - "Demo page shows the shadcn-svelte install command without a placeholder note"
    - "registry.json homepage points to the Vercel site, not GitHub"
  artifacts:
    - path: "registry.json"
      provides: "Registry manifest"
      contains: "svelte-wheel-picker.vercel.app"
    - path: "static/r/wheel-picker.json"
      provides: "Built registry item served as static asset"
      contains: "WheelPicker"
    - path: "src/routes/+page.svelte"
      provides: "Demo page with install instructions"
  key_links:
    - from: "registry.json"
      to: "static/r/wheel-picker.json"
      via: "pnpm registry:build"
      pattern: "registry:build"
---

<objective>
Activate the shadcn-svelte registry so users can install the wheel picker via the CLI.

Purpose: The registry infrastructure already exists (static/r/ built, registry.json correct). Three small changes make it production-ready: update the homepage URL in registry.json to point to the live Vercel site, regenerate static/r/ from that updated manifest, and remove the placeholder note from the demo page install block.
Output: Users can run `npx shadcn-svelte@latest add https://svelte-wheel-picker.vercel.app/r/wheel-picker.json` and get the component source copied into their project.
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
  <name>Task 1: Update registry.json homepage and rebuild static/r/</name>
  <files>registry.json, static/r/index.json, static/r/wheel-picker.json</files>
  <action>
    1. In `registry.json`, change the `"homepage"` field from `"https://github.com/uinstinct/svelte-wheel-picker"` to `"https://svelte-wheel-picker.vercel.app"`.

    2. Run `pnpm registry:build` to regenerate `static/r/index.json` and `static/r/wheel-picker.json` from the updated manifest. This inlines the current source of all 7 library files into `static/r/wheel-picker.json`.

    3. Confirm `static/r/wheel-picker.json` contains the `WheelPicker` source content (grep for "WheelPicker" in the file).

    Do NOT manually edit `static/r/` files — always regenerate via `pnpm registry:build`.
  </action>
  <verify>
    <automated>grep -q "svelte-wheel-picker.vercel.app" /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/registry.json && grep -q "WheelPicker" /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/static/r/wheel-picker.json && echo "PASS"</automated>
  </verify>
  <done>registry.json homepage is the Vercel URL; static/r/wheel-picker.json is regenerated and contains the component source.</done>
</task>

<task type="auto">
  <name>Task 2: Remove placeholder note from demo page install block</name>
  <files>src/routes/+page.svelte</files>
  <action>
    In `src/routes/+page.svelte`, find the `<p class="install-note">` element that reads:

    ```
    <p class="install-note">(URL shown after deployment — update before publishing)</p>
    ```

    Delete that entire `<p>` element. The install block already has the correct Vercel URL in the `<pre><code>` elements above it — the placeholder note is the only thing to remove.

    Do not modify the `<pre><code>` blocks or any other part of the page.
  </action>
  <verify>
    <automated>grep -c "install-note" /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/src/routes/+page.svelte || echo "PASS — element removed"</automated>
  </verify>
  <done>The placeholder note paragraph is gone. The install block shows only the two install commands with no qualifying note.</done>
</task>

</tasks>

<verification>
After both tasks:
- `registry.json` homepage = `https://svelte-wheel-picker.vercel.app`
- `static/r/wheel-picker.json` was regenerated (mtime newer than before task 1 ran)
- `src/routes/+page.svelte` has no `install-note` paragraph
- `pnpm build` passes (no regressions from the page edit)
</verification>

<success_criteria>
- registry.json `"homepage"` value is `"https://svelte-wheel-picker.vercel.app"`
- static/r/wheel-picker.json contains current component source (grep for "WheelPicker" returns matches)
- Demo page install block shows both install commands with no placeholder note
- `pnpm build` exits 0
</success_criteria>

<output>
After completion, create `.planning/quick/260331-jcm-add-shadcn-registry-to-site-so-it-can-be/260331-jcm-SUMMARY.md`
</output>
