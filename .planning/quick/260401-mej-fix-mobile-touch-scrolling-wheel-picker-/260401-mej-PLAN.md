---
phase: quick-260401-mej
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/WheelPicker.svelte
  - src/lib/WheelPicker.test.ts
autonomous: true
requirements: [fix-mobile-touch-scrolling]
must_haves:
  truths:
    - "Dragging inside the wheel picker on mobile scrolls the picker, not the page"
    - "touch-action: none is applied by the component itself, not by consumer CSS"
    - "user-select: none prevents text selection during drag on mobile"
    - "Desktop mouse/keyboard behavior is unchanged"
  artifacts:
    - path: "src/lib/WheelPicker.svelte"
      provides: "Inline touch-action and user-select styles on wrapper div"
      contains: "touch-action"
    - path: "src/lib/WheelPicker.test.ts"
      provides: "Test verifying touch-action and user-select inline styles"
      contains: "touch-action"
  key_links:
    - from: "src/lib/WheelPicker.svelte"
      to: "browser touch event system"
      via: "touch-action: none inline style on [data-swp-wrapper]"
      pattern: "style:touch-action"
---

<objective>
Fix mobile touch scrolling so that dragging inside the wheel picker scrolls the picker instead of the page.

Purpose: The component currently relies on consumers to add `touch-action: none` CSS. Without it, mobile browsers intercept touch gestures for native page scrolling, making the wheel picker unusable on touch devices.

Output: WheelPicker.svelte with inline `touch-action: none` and `user-select: none` styles on the wrapper div, plus a test verifying these styles are present.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker.mobile-issues/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker.mobile-issues/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/WheelPicker.svelte
@src/lib/WheelPicker.test.ts
@.planning/quick/260401-mej-fix-mobile-touch-scrolling-wheel-picker-/260401-mej-RESEARCH.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add touch-action and user-select inline styles to WheelPicker wrapper</name>
  <files>src/lib/WheelPicker.svelte</files>
  <action>
In `src/lib/WheelPicker.svelte`, add two inline style directives to the wrapper `<div>` element (the one with `data-swp-wrapper` attribute, around line 242-257):

Add these two lines after the existing `style:position="relative"` line (line 248):
```
style:touch-action="none"
style:user-select="none"
```

These are functional styles required for correct touch interaction behavior, not decorative CSS. They maintain the headless/zero-CSS constraint because they are inline Svelte style directives, not a shipped stylesheet.

- `touch-action: none` tells the browser the component handles its own touch gestures, preventing native page scrolling when the user drags within the wheel picker.
- `user-select: none` prevents text selection artifacts during drag on mobile.

Do NOT modify any event handlers or add preventDefault() calls -- the CSS property alone is sufficient (per research).

Also remove the redundant `touch-action: none` from the demo page consumer CSS in `src/routes/+page.svelte` (line 369) since the component now handles this itself. Keep `user-select: none` in the demo CSS as it may apply to other elements there.
  </action>
  <verify>
    <automated>cd /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker.mobile-issues && grep -n "touch-action" src/lib/WheelPicker.svelte && grep -n "user-select" src/lib/WheelPicker.svelte</automated>
  </verify>
  <done>The wrapper div in WheelPicker.svelte has `style:touch-action="none"` and `style:user-select="none"` inline style directives. The demo page no longer redundantly sets touch-action on the wrapper.</done>
</task>

<task type="auto">
  <name>Task 2: Add test verifying touch-action and user-select inline styles</name>
  <files>src/lib/WheelPicker.test.ts</files>
  <action>
In `src/lib/WheelPicker.test.ts`, add a new test inside the existing `describe('WheelPicker DOM structure')` block (after the existing height test around line 109):

```typescript
test('wrapper has touch-action: none for mobile scrolling', async () => {
    const { container } = await render(WheelPicker, {
        options: testOptions,
        defaultValue: 'c',
    });
    const wrapper = container.querySelector('[data-swp-wrapper]') as HTMLElement;
    expect(wrapper.style.touchAction).toBe('none');
});

test('wrapper has user-select: none to prevent selection during drag', async () => {
    const { container } = await render(WheelPicker, {
        options: testOptions,
        defaultValue: 'c',
    });
    const wrapper = container.querySelector('[data-swp-wrapper]') as HTMLElement;
    expect(wrapper.style.userSelect).toBe('none');
});
```

These tests use the same pattern as the existing height test (line 100-109) -- render with testOptions, query wrapper, check style property.
  </action>
  <verify>
    <automated>cd /Users/instinct/Desktop/wheel-picker/svelte-wheel-picker.mobile-issues && npx vitest run --project unit src/lib/WheelPicker.test.ts 2>&1 | tail -20</automated>
  </verify>
  <done>Two new tests pass: one verifying `touch-action: none` and one verifying `user-select: none` on the wrapper element.</done>
</task>

</tasks>

<verification>
- `npx vitest run --project unit src/lib/WheelPicker.test.ts` -- all tests pass including new touch-action/user-select tests
- `grep "touch-action" src/lib/WheelPicker.svelte` confirms inline style is present
- `npx svelte-kit sync && npx tsc --noEmit` -- no TypeScript errors introduced
</verification>

<success_criteria>
- WheelPicker.svelte wrapper div includes `style:touch-action="none"` and `style:user-select="none"`
- Unit tests verify both inline styles are rendered
- All existing tests continue to pass
- No shipped CSS -- only inline style directives (headless constraint maintained)
</success_criteria>

<output>
After completion, create `.planning/quick/260401-mej-fix-mobile-touch-scrolling-wheel-picker-/260401-mej-SUMMARY.md`
</output>
