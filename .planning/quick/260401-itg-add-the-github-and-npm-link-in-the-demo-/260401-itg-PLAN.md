---
phase: quick-260401-itg
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/routes/+page.svelte
autonomous: true
requirements: []
must_haves:
  truths:
    - "Demo site hero section displays a clickable GitHub link"
    - "Demo site hero section displays a clickable npm link"
    - "Links open in a new tab"
  artifacts:
    - path: "src/routes/+page.svelte"
      provides: "GitHub and npm links in hero section"
      contains: "github.com/uinstinct/svelte-wheel-picker"
  key_links: []
---

<objective>
Add GitHub repository and npm package links to the demo site hero section.

Purpose: Give visitors quick access to the source code and npm package page directly from the demo.
Output: Updated `+page.svelte` with two styled links below the install block in the hero section.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/routes/+page.svelte
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add GitHub and npm links to demo hero section</name>
  <files>src/routes/+page.svelte</files>
  <action>
In `src/routes/+page.svelte`, add a links container after the `.install-block` div (before the closing `</section>` of the hero section, around line 129).

Add this markup:
```html
<div class="hero-links">
  <a href="https://github.com/uinstinct/svelte-wheel-picker" target="_blank" rel="noopener noreferrer">GitHub</a>
  <a href="https://www.npmjs.com/package/@uinstinct/svelte-wheel-picker" target="_blank" rel="noopener noreferrer">npm</a>
</div>
```

Add these styles inside the existing `<style>` block:

```css
.hero-links {
  display: flex;
  gap: 16px;
}

.hero-links a {
  font-size: 14px;
  color: var(--color-text-muted);
  text-decoration: none;
}

.hero-links a:hover {
  color: var(--color-text);
  text-decoration: underline;
}
```

The links should be simple, understated text links matching the existing muted color scheme. No icons, no buttons — just clean text links consistent with the minimal demo style.
  </action>
  <verify>
    <automated>cd /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker && grep -q "github.com/uinstinct/svelte-wheel-picker" src/routes/+page.svelte && grep -q "npmjs.com/package/@uinstinct/svelte-wheel-picker" src/routes/+page.svelte && echo "PASS" || echo "FAIL"</automated>
  </verify>
  <done>Hero section contains GitHub and npm links that open in new tabs, styled consistently with the existing demo design.</done>
</task>

</tasks>

<verification>
- Both links present in hero section markup
- Links use target="_blank" and rel="noopener noreferrer"
- Styles use existing CSS custom properties (--color-text-muted, --color-text)
- `pnpm build` succeeds
</verification>

<success_criteria>
Demo site hero section shows GitHub and npm links below the install commands. Links are clickable and open in new tabs.
</success_criteria>

<output>
After completion, create `.planning/quick/260401-itg-add-the-github-and-npm-link-in-the-demo-/260401-itg-SUMMARY.md`
</output>
