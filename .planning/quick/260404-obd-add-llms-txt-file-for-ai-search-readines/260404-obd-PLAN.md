---
phase: quick-260404-obd
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [static/llms.txt]
autonomous: true
requirements: [SEO-llms-txt]
must_haves:
  truths:
    - "GET /llms.txt returns 200 with plain text content"
    - "AI systems can discover package name, purpose, installation, and links"
  artifacts:
    - path: "static/llms.txt"
      provides: "AI-readable package summary following llms.txt convention"
      contains: "@uinstinct/svelte-wheel-picker"
  key_links: []
---

<objective>
Add an llms.txt file to static/ so AI crawlers and LLM-based search tools can discover and summarize the svelte-wheel-picker package.

Purpose: AI search readiness — the site currently returns 404 for /llms.txt.
Output: static/llms.txt served at https://svelte-wheel-spinner.netlify.app/llms.txt
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@README.md
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create static/llms.txt with package summary</name>
  <files>static/llms.txt</files>
  <action>
Create static/llms.txt following the llms.txt convention (https://llmstxt.org/). The file is plain text, structured with markdown-like headings.

Content to include:

1. **Title line**: `# @uinstinct/svelte-wheel-picker`
2. **Description**: One-line summary — "iOS-style wheel picker for Svelte 5 with smooth inertia scrolling, infinite loop support, keyboard navigation, and cylindrical 3D effect."
3. **Features section** listing key features:
   - Svelte 5 runes-based reactivity
   - Smooth inertia scrolling with spring physics
   - Infinite loop mode
   - Cylindrical/drum 3D visual effect
   - Full keyboard navigation (arrow keys, Home/End, type-ahead search)
   - Controlled and uncontrolled modes
   - WheelPickerWrapper for multi-wheel layouts
   - Headless/unstyled with data attributes for CSS targeting
   - Zero runtime dependencies
   - TypeScript types included
   - SSR safe
4. **Installation section** with npm and shadcn-svelte commands:
   - `npm install @uinstinct/svelte-wheel-picker`
   - `npx shadcn-svelte@latest add https://svelte-wheel-spinner.netlify.app/r/wheel-picker.json`
5. **Quick Start** section with a brief Svelte code example (the basic controlled mode example from README)
6. **Links section**:
   - Demo: https://svelte-wheel-spinner.netlify.app
   - npm: https://www.npmjs.com/package/@uinstinct/svelte-wheel-picker
   - GitHub: https://github.com/uinstinct/svelte-wheel-picker
   - License: MIT

Keep the file concise — optimized for LLM consumption, not exhaustive documentation. No badges, no images.
  </action>
  <verify>
    <automated>test -f static/llms.txt && grep -q "@uinstinct/svelte-wheel-picker" static/llms.txt && echo "PASS" || echo "FAIL"</automated>
  </verify>
  <done>static/llms.txt exists with package name, description, features, installation commands, and links. Will be served at /llms.txt by SvelteKit static adapter.</done>
</task>

</tasks>

<verification>
- `cat static/llms.txt` shows well-structured plain text with all required sections
- After `pnpm build`, the file appears in `build/llms.txt`
</verification>

<success_criteria>
- static/llms.txt exists and contains accurate package information
- File follows llms.txt convention with markdown-style headings
- All links are correct and current
</success_criteria>

<output>
After completion, create `.planning/quick/260404-obd-add-llms-txt-file-for-ai-search-readines/260404-obd-SUMMARY.md`
</output>
