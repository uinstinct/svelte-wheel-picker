---
phase: quick
plan: 260331-idz
type: execute
wave: 1
depends_on: []
files_modified: [README.md]
autonomous: true
requirements: []

must_haves:
  truths:
    - "README clearly explains what the library is and what it does"
    - "README shows how to install via npm and shadcn-svelte CLI"
    - "README documents all props with types and defaults"
    - "README includes working code examples for common use cases"
  artifacts:
    - path: "README.md"
      provides: "Complete library documentation"
      min_lines: 150
  key_links: []
---

<objective>
Replace the placeholder README.md with a complete, publish-ready README for the @uinstinct/svelte-wheel-picker npm package.

Purpose: The library is feature-complete (all 7 phases done) but the README is just a title. A proper README is essential for npm discoverability and developer adoption.
Output: A single README.md file ready for npm publish.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/types.ts (all prop interfaces and types)
@src/lib/index.ts (public exports)
@src/routes/+page.svelte (demo page with usage examples)
@package.json (package metadata, scripts)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write complete README.md</name>
  <files>README.md</files>
  <action>
Replace the placeholder README.md with a complete library README. Structure it as follows:

1. **Title and badges**: `# @uinstinct/svelte-wheel-picker` with npm version badge linking to npmjs.com package page, and a license badge (MIT).

2. **One-liner description**: "iOS-style wheel picker for Svelte 5 with smooth inertia scrolling, infinite loop support, keyboard navigation, and cylindrical 3D effect."

3. **Features list** (bullet points):
   - Svelte 5 runes-based reactivity
   - Smooth inertia scrolling with spring physics
   - Infinite loop mode
   - Cylindrical/drum 3D visual effect
   - Full keyboard navigation (arrow keys, Home/End, type-ahead search)
   - Controlled and uncontrolled modes
   - Disabled options support
   - WheelPickerWrapper for multi-wheel layouts (time picker, date picker)
   - Headless/unstyled with data attributes for CSS targeting
   - Zero runtime dependencies
   - TypeScript types included
   - SSR safe

4. **Installation** section with two sub-sections:
   - npm: `npm install @uinstinct/svelte-wheel-picker` (also show pnpm/yarn variants)
   - shadcn-svelte: `npx shadcn-svelte@latest add https://svelte-wheel-picker.vercel.app/r/wheel-picker.json`

5. **Quick Start** — minimal working example showing a controlled wheel picker with fruit options (use the pattern from +page.svelte: import, define options array, bind with $state + onValueChange).

6. **Examples** section with 4 sub-examples (code blocks only, no prose padding):
   - Basic (controlled mode with onValueChange)
   - Infinite loop (add `infinite={true}`)
   - Cylindrical/drum effect (add `cylindrical={true}`)
   - Multi-wheel with WheelPickerWrapper (hour + minute time picker pattern from demo)

7. **API Reference** section with three sub-sections:

   a. `WheelPickerProps<T>` — table with columns: Prop | Type | Default | Description. Include ALL props from the WheelPickerProps interface in types.ts: options, value, defaultValue, onValueChange, classNames, visibleCount, optionItemHeight, dragSensitivity, scrollSensitivity, infinite, cylindrical.

   b. `WheelPickerOption<T>` — table: value (T), label (string), textValue (string, optional), disabled (boolean, optional).

   c. `WheelPickerWrapperProps` — table: classNames ({ group?: string }).

8. **Styling** section explaining the headless approach:
   - Library ships no CSS
   - Use `classNames` prop to assign classes, then target with CSS
   - List all data attributes: `data-swp-wrapper`, `data-swp-option`, `data-swp-option-text`, `data-swp-selection`, `data-swp-selected`, `data-swp-disabled`, `data-swp-group`
   - Show a brief CSS example targeting data attributes (adapted from demo page styles)

9. **Keyboard Navigation** section:
   - Arrow Up/Down: move selection
   - Home/End: jump to first/last
   - Type-ahead: type characters to jump to matching option

10. **License**: MIT

Do NOT include: badges for CI/coverage (none exist), contributing guide, changelog, or demo site screenshots. Keep it factual and code-heavy. Use fenced code blocks with `svelte` language tag for component examples and `bash` for commands.
  </action>
  <verify>
    <automated>test -f README.md && wc -l README.md | awk '{if ($1 >= 150) print "PASS: " $1 " lines"; else print "FAIL: only " $1 " lines"}'</automated>
  </verify>
  <done>README.md exists with 150+ lines covering: description, features, installation (npm + shadcn), quick start, examples (basic, infinite, cylindrical, multi-wheel), full API reference tables for all exported types, styling guide with data attributes, keyboard navigation, and license.</done>
</task>

</tasks>

<verification>
- README.md contains all exported type names: WheelPicker, WheelPickerWrapper, WheelPickerOption, WheelPickerProps, WheelPickerClassNames, WheelPickerWrapperProps, WheelPickerWrapperClassNames
- All WheelPickerProps fields documented (options, value, defaultValue, onValueChange, classNames, visibleCount, optionItemHeight, dragSensitivity, scrollSensitivity, infinite, cylindrical)
- Install commands present for npm and shadcn-svelte
- At least 4 code examples included
</verification>

<success_criteria>
README.md is a complete, publish-ready document that a developer finding the package on npm can use to understand, install, and use the library without needing any other documentation.
</success_criteria>

<output>
After completion, create `.planning/quick/260331-idz-create-a-readme/260331-idz-SUMMARY.md`
</output>
