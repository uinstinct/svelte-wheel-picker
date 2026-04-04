---
phase: quick-260404-ltk
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/routes/+page.svelte
autonomous: true
must_haves:
  truths:
    - "Demo site shows a Sensitivity section with two labeled range sliders"
    - "Drag Sensitivity slider adjusts dragSensitivity on all WheelPicker instances in real time"
    - "Scroll Sensitivity slider adjusts scrollSensitivity on all WheelPicker instances in real time"
    - "Slider values are displayed next to each slider label"
    - "Default values match library defaults (drag: 3, scroll: 5)"
  artifacts:
    - path: "src/routes/+page.svelte"
      provides: "Sensitivity sliders section in demo page"
  key_links:
    - from: "slider $state variables"
      to: "WheelPicker dragSensitivity/scrollSensitivity props"
      via: "reactive binding"
      pattern: "dragSensitivity.*scrollSensitivity"
---

<objective>
Add a "Sensitivity" controls section to the demo site with two range sliders: one for dragSensitivity and one for scrollSensitivity. Both sliders reactively update all WheelPicker instances on the page.

Purpose: Let users experiment with sensitivity settings to understand their effect on the wheel picker interaction.
Output: Updated demo page with interactive sensitivity controls.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/routes/+page.svelte
@src/lib/types.ts (WheelPickerProps has dragSensitivity?: number and scrollSensitivity?: number)
@src/lib/wheel-physics-utils.ts (DEFAULT_DRAG_SENSITIVITY = 3, DEFAULT_SCROLL_SENSITIVITY = 5)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add sensitivity sliders to demo page</name>
  <files>src/routes/+page.svelte</files>
  <action>
In src/routes/+page.svelte:

1. Add two $state variables at the top of the script block:
   - `let dragSens = $state(3);` (matches DEFAULT_DRAG_SENSITIVITY)
   - `let scrollSens = $state(5);` (matches DEFAULT_SCROLL_SENSITIVITY)

2. Add a new section BEFORE the "Single Wheel" section (after the hero, before the first wheel demo). Structure:

```svelte
<section class="controls-section">
  <h2>Sensitivity</h2>
  <div class="slider-row">
    <label for="drag-sens">Drag: {dragSens}</label>
    <input id="drag-sens" type="range" min="1" max="20" step="1" bind:value={dragSens} />
  </div>
  <div class="slider-row">
    <label for="scroll-sens">Scroll: {scrollSens}</label>
    <input id="scroll-sens" type="range" min="1" max="20" step="1" bind:value={scrollSens} />
  </div>
</section>
```

3. Pass `dragSensitivity={dragSens}` and `scrollSensitivity={scrollSens}` to ALL six WheelPicker instances on the page (Single Wheel, Disabled Options, Infinite Loop, two Time Picker wheels, Drum/Cylinder).

4. Add CSS styles within the existing style block:

```css
.controls-section {
  margin-bottom: 24px;
  background: var(--color-surface);
  border-radius: 8px;
  padding: 16px;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.slider-row:last-child {
  margin-bottom: 0;
}

.slider-row label {
  font-size: 14px;
  font-weight: 500;
  min-width: 90px;
  color: var(--color-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.slider-row input[type='range'] {
  flex: 1;
  accent-color: rgb(59, 130, 246);
}
```

Keep the section visually consistent with the existing demo page design (same surface color, border radius, spacing).
  </action>
  <verify>
    <automated>cd /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker && pnpm build 2>&1 | tail -5</automated>
  </verify>
  <done>
    - Demo page has a "Sensitivity" section with two range sliders (Drag 1-20, Scroll 1-20)
    - Current value shown next to each label (e.g., "Drag: 3", "Scroll: 5")
    - All six WheelPicker instances receive the reactive dragSensitivity and scrollSensitivity props
    - Default slider positions match library defaults (3 and 5)
    - Styling matches existing demo page aesthetics
  </done>
</task>

</tasks>

<verification>
- `pnpm build` completes without errors
- `pnpm check` passes TypeScript checking
</verification>

<success_criteria>
Demo site has working sensitivity sliders that reactively control all wheel pickers on the page.
</success_criteria>

<output>
After completion, create `.planning/quick/260404-ltk-add-a-slider-in-the-demo-site-for-adjust/260404-ltk-SUMMARY.md`
</output>
