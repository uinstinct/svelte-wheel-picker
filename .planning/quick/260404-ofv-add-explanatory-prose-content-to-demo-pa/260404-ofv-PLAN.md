---
phase: quick-260404-ofv
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/routes/+page.svelte
autonomous: true
requirements: [SEO-PROSE]
must_haves:
  truths:
    - "Homepage has 500+ words of indexable prose content"
    - "Each demo section has 2-4 sentence description explaining the feature"
    - "Hero section has expanded passage explaining the component (100+ words)"
    - "Features bullet list from README is visible on the page"
    - "Interactive demos remain the focal point — prose supplements, not replaces"
  artifacts:
    - path: "src/routes/+page.svelte"
      provides: "Demo page with SEO prose content"
      contains: "features-list"
  key_links: []
---

<objective>
Add explanatory prose content to the demo page to reach 500+ indexable words for SEO.

Purpose: The demo page currently has only ~35-40 words of indexable prose. Search engines and AI crawlers need substantial text content to understand and rank the page. The README has 1,091 words of quality content that should be surfaced on the homepage.

Output: Updated +page.svelte with expanded hero, section descriptions, and features list.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/routes/+page.svelte
@README.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Expand hero section and add section descriptions</name>
  <files>src/routes/+page.svelte</files>
  <action>
Modify src/routes/+page.svelte to add prose content. Use the existing styling patterns (`.hero-description` class for muted text, `p` tags styled at 14px with `var(--color-text-muted)`).

1. **Expand the hero section** — Replace the single-line `.hero-description` paragraph with a longer passage (100+ words). Content should cover:
   - What svelte-wheel-picker is (iOS-style wheel picker component for Svelte 5)
   - Key capabilities (smooth inertia scrolling with spring physics, infinite loop, cylindrical 3D drum effect, full keyboard navigation)
   - Design philosophy (headless/unstyled, zero runtime dependencies, data attributes for CSS targeting)
   - Use cases (date pickers, time selectors, option menus, slot-machine interfaces)
   - Distribution (npm package and shadcn-svelte CLI)
   Write this as natural prose paragraphs, not bullet points. Use the existing `.hero-description` class. Add a second paragraph element if needed — reuse the same class.

2. **Add a features list section** — Insert a new `<section>` immediately after the hero (before the "Single Wheel" section) with:
   - `<h2>Features</h2>`
   - A `<ul>` with class `features-list` containing the feature bullets from README (Svelte 5 runes-based reactivity, smooth inertia scrolling with spring physics, infinite loop mode, cylindrical/drum 3D visual effect, full keyboard navigation with type-ahead search, controlled and uncontrolled modes, disabled options support, WheelPickerWrapper for multi-wheel layouts, headless/unstyled with data attributes, zero runtime dependencies, TypeScript types included, SSR safe)
   - Style the `.features-list` in the `<style>` block: `list-style: disc`, `padding-left: 20px`, `font-size: 14px`, `color: var(--color-text-muted)`, `line-height: 1.6`, `li { margin-bottom: 4px }`

3. **Add descriptive paragraphs under each demo section h2** — For each existing section, add a `<p>` with class `section-description` between the `<h2>` and the interactive elements:

   - **Single Wheel**: "The basic wheel picker renders a scrollable list of options with one item highlighted in the center. Drag with your mouse or finger, use the scroll wheel, or press arrow keys to navigate. The selection snaps to the nearest option with a smooth spring animation. This is the foundational building block — most use cases start here."

   - **Disabled Options**: "Mark individual options as disabled to prevent selection. Disabled items appear dimmed and are automatically skipped during keyboard navigation and scroll snapping. Use this for unavailable choices, sold-out items, or options that require a prerequisite."

   - **Infinite Loop**: "Enable infinite scrolling so the list wraps seamlessly from the last option back to the first and vice versa. The picker clones ghost items above and below the real options, then silently repositions when crossing the boundary. Ideal for cyclical values like hours, months, or days of the week."

   - **Two Wheels**: "Combine multiple WheelPicker components inside a WheelPickerWrapper to create compound selectors. Each wheel operates independently with its own value and options while the wrapper aligns them in a horizontal row. Build time pickers, date selectors, or any multi-field input."

   - **Drum / Cylinder**: "Enable the cylindrical prop for a rotating drum visual effect that mimics a physical picker wheel. Options farther from the center appear compressed vertically using a cosine projection, creating a convincing 3D perspective without any WebGL or canvas rendering."

   - **Sensitivity**: "Fine-tune how the picker responds to user input with the dragSensitivity and scrollSensitivity props. Higher drag sensitivity amplifies pointer movement for faster traversal. Higher scroll sensitivity increases the distance traveled per scroll wheel tick. Adjust these sliders to see the effect in real time."

   Style `.section-description` in `<style>`: `font-size: 14px`, `color: var(--color-text-muted)`, `line-height: 1.6`, `margin-bottom: 12px`.

IMPORTANT: Keep all existing interactive demo code, state variables, styles, and `<svelte:head>` content exactly as-is. Only ADD new HTML elements and CSS rules. Do not change the `max-width: 400px` on main — the prose will flow within the same column width, keeping demos as the focal point.
  </action>
  <verify>
    <automated>cd /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker && pnpm build 2>&1 | tail -5</automated>
  </verify>
  <done>
    - Hero section has 100+ words of prose across 1-2 paragraphs
    - Features list with 12 bullet points is visible between hero and first demo
    - Each of the 6 demo sections has a 2-4 sentence description paragraph
    - Total indexable prose on page exceeds 500 words
    - All interactive demos still render and function identically
    - Build succeeds with no errors
  </done>
</task>

</tasks>

<verification>
- `pnpm build` completes without errors
- `pnpm dev` serves the page with all new prose visible
- Word count of text content (excluding code blocks and attribute values) exceeds 500
</verification>

<success_criteria>
- Homepage has 500+ words of indexable prose
- All 6 demo sections have descriptive paragraphs
- Features bullet list is present
- Hero section is expanded with component explanation
- No existing functionality is broken
</success_criteria>

<output>
After completion, create `.planning/quick/260404-ofv-add-explanatory-prose-content-to-demo-pa/260404-ofv-01-SUMMARY.md`
</output>
