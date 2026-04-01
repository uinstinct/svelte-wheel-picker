---
phase: quick-260401-mtf
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/WheelPicker.svelte
  - eslint.config.js
autonomous: true
requirements: []
must_haves:
  truths:
    - "pnpm lint passes with zero errors"
    - ".svelte.ts rune files are parsed without 'Unexpected token' errors"
    - "{#each} blocks in WheelPicker.svelte have key expressions"
  artifacts:
    - path: "src/lib/WheelPicker.svelte"
      provides: "Keyed {#each} blocks"
      contains: "(option.value)"
    - path: "eslint.config.js"
      provides: "Parser config for .svelte.ts files"
      contains: "*.svelte.ts"
  key_links:
    - from: "eslint.config.js"
      to: "src/lib/*.svelte.ts"
      via: "files glob + svelte-eslint-parser"
      pattern: "svelte.ts"
---

<objective>
Fix two CI lint failures: (1) add key expressions to three {#each} blocks in WheelPicker.svelte to satisfy the svelte/require-each-key rule, and (2) configure ESLint to parse .svelte.ts rune files through svelte-eslint-parser so they don't produce "Unexpected token" errors.

Purpose: Unblock CI — lint step currently fails.
Output: Clean `pnpm lint` pass.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/WheelPicker.svelte
@eslint.config.js
@src/lib/types.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add key expressions to {#each} blocks in WheelPicker.svelte</name>
  <files>src/lib/WheelPicker.svelte</files>
  <action>
Add key expressions to all three {#each} blocks to satisfy svelte/require-each-key.
Use `option.value` as the key since WheelPickerOption.value is the unique identifier.

Line 274 — before-ghosts (reversed):
  Change: `{#each [...options].reverse() as option, g}`
  To:     `{#each [...options].reverse() as option, g (option.value)}`

Line 299 — real items:
  Change: `{#each options as option, i}`
  To:     `{#each options as option, i (option.value)}`

Line 325 — after-ghosts:
  Change: `{#each options as option, j}`
  To:     `{#each options as option, j (option.value)}`
  </action>
  <verify>
    <automated>cd /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker && grep -n '{#each' src/lib/WheelPicker.svelte | grep -v 'option.value' | wc -l | tr -d ' '</automated>
  </verify>
  <done>All three {#each} blocks have (option.value) key expressions. Grep returns 0 unkeyed {#each} blocks.</done>
</task>

<task type="auto">
  <name>Task 2: Configure ESLint to parse .svelte.ts rune files</name>
  <files>eslint.config.js</files>
  <action>
Add a new config object for .svelte.ts files that routes them through svelte-eslint-parser with the TypeScript parser nested inside. The .svelte.ts extension is Svelte 5's convention for rune-enabled TypeScript modules — ESLint's default TypeScript parser chokes on $state/$derived rune syntax.

Add this config object after the existing `**/*.svelte` block (before the ignores block):

```js
{
  files: ['**/*.svelte.ts'],
  languageOptions: {
    parser: svelte.parser,
    parserOptions: {
      parser: ts.parser,
    },
  },
},
```

This mirrors the existing `**/*.svelte` config but targets `.svelte.ts` files. The `svelte.parser` import comes from the already-imported `eslint-plugin-svelte` — access it via `svelte` which is the default export that includes a `parser` property. Verify the parser is available:
- `eslint-plugin-svelte` exports a `parser` at `eslint-plugin-svelte/parser` or via the plugin object
- If `svelte.parser` is not available, import it directly: `import svelteParser from 'eslint-plugin-svelte/parser'` and use `parser: svelteParser`
  </action>
  <verify>
    <automated>cd /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker && pnpm lint 2>&1 | tail -20</automated>
  </verify>
  <done>`pnpm lint` exits with code 0 and no "Unexpected token" errors for .svelte.ts files, no svelte/require-each-key violations.</done>
</task>

</tasks>

<verification>
Run `pnpm lint` — must exit cleanly with no errors.
Run `pnpm check` — TypeScript check must still pass (no regressions).
</verification>

<success_criteria>
- `pnpm lint` passes with zero errors
- All three {#each} blocks in WheelPicker.svelte have key expressions
- All three .svelte.ts files (use-controllable-state, use-typeahead-search, use-wheel-physics) parse without errors
- No regressions in `pnpm check`
</success_criteria>

<output>
After completion, create `.planning/quick/260401-mtf-fix-ci-lint-failure-each-key-svelte-ts-p/260401-mtf-SUMMARY.md`
</output>
