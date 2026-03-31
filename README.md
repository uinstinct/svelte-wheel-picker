# @uinstinct/svelte-wheel-picker

[![npm version](https://img.shields.io/npm/v/@uinstinct/svelte-wheel-picker)](https://www.npmjs.com/package/@uinstinct/svelte-wheel-picker)
[![license](https://img.shields.io/npm/l/@uinstinct/svelte-wheel-picker)](https://github.com/uinstinct/svelte-wheel-picker/blob/main/LICENSE)

iOS-style wheel picker for Svelte 5 with smooth inertia scrolling, infinite loop support, keyboard navigation, and cylindrical 3D effect.

## Features

- Svelte 5 runes-based reactivity
- Smooth inertia scrolling with spring physics
- Infinite loop mode
- Cylindrical/drum 3D visual effect
- Full keyboard navigation (arrow keys, Home/End, type-ahead search)
- Controlled and uncontrolled modes
- Disabled options support
- `WheelPickerWrapper` for multi-wheel layouts (time picker, date picker)
- Headless/unstyled with data attributes for CSS targeting
- Zero runtime dependencies
- TypeScript types included
- SSR safe

## Installation

### npm

```bash
npm install @uinstinct/svelte-wheel-picker
```

```bash
pnpm add @uinstinct/svelte-wheel-picker
```

```bash
yarn add @uinstinct/svelte-wheel-picker
```

### shadcn-svelte

```bash
npx shadcn-svelte@latest add https://svelte-wheel-picker.vercel.app/r/wheel-picker.json
```

This copies the component source directly into your project under `src/lib/components/ui/wheel-picker/`.

## Quick Start

```svelte
<script lang="ts">
  import { WheelPicker } from '@uinstinct/svelte-wheel-picker';

  const fruits = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
    { value: 'fig', label: 'Fig' },
  ];

  let selected = $state('cherry');
</script>

<WheelPicker
  options={fruits}
  value={selected}
  onValueChange={(v) => { selected = v; }}
/>
```

## Examples

### Basic (controlled mode)

```svelte
<script lang="ts">
  import { WheelPicker } from '@uinstinct/svelte-wheel-picker';

  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C' },
  ];

  let value = $state('a');
</script>

<WheelPicker
  {options}
  {value}
  onValueChange={(v) => { value = v; }}
/>
```

### Infinite loop

```svelte
<script lang="ts">
  import { WheelPicker } from '@uinstinct/svelte-wheel-picker';

  const fruits = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ];

  let selected = $state('apple');
</script>

<WheelPicker
  options={fruits}
  value={selected}
  onValueChange={(v) => { selected = v; }}
  infinite={true}
/>
```

### Cylindrical/drum effect

```svelte
<script lang="ts">
  import { WheelPicker } from '@uinstinct/svelte-wheel-picker';

  const fruits = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ];

  let selected = $state('apple');
</script>

<WheelPicker
  options={fruits}
  value={selected}
  onValueChange={(v) => { selected = v; }}
  cylindrical={true}
/>
```

### Multi-wheel with WheelPickerWrapper

```svelte
<script lang="ts">
  import { WheelPicker, WheelPickerWrapper } from '@uinstinct/svelte-wheel-picker';

  const hourOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1).padStart(2, '0'),
  }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    value: String(i).padStart(2, '0'),
    label: String(i).padStart(2, '0'),
  }));

  let hour = $state('12');
  let minute = $state('00');
</script>

<WheelPickerWrapper classNames={{ group: 'time-picker' }}>
  <WheelPicker
    options={hourOptions}
    value={hour}
    onValueChange={(v) => { hour = v; }}
  />
  <WheelPicker
    options={minuteOptions}
    value={minute}
    onValueChange={(v) => { minute = v; }}
  />
</WheelPickerWrapper>

<style>
  :global([data-swp-group].time-picker) {
    display: flex;
    flex-direction: row;
    align-items: stretch;
  }
</style>
```

## API Reference

### `WheelPickerProps<T>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `WheelPickerOption<T>[]` | — | The list of selectable options. Required. |
| `value` | `T` | `undefined` | Current value (controlled mode). `undefined` means no option selected. |
| `defaultValue` | `T` | `undefined` | Initial value (uncontrolled mode). |
| `onValueChange` | `(value: T) => void` | `undefined` | Callback when value changes. Presence signals controlled mode. |
| `classNames` | `WheelPickerClassNames` | `{}` | Per-element CSS class overrides. |
| `visibleCount` | `number` | `5` | Number of visible option rows. Must be odd. |
| `optionItemHeight` | `number` | `30` | Height in pixels of each option row. |
| `dragSensitivity` | `number` | `3` | Pointer drag delta multiplier (affects inertia deceleration). |
| `scrollSensitivity` | `number` | `5` | Scroll wheel delta multiplier (affects snap animation duration). |
| `infinite` | `boolean` | `false` | Enable infinite loop scrolling (wraps at both ends). |
| `cylindrical` | `boolean` | `false` | Enable rotating drum/cylinder visual style with faux-3D scaleY compression. |

### `WheelPickerOption<T>`

| Field | Type | Description |
|-------|------|-------------|
| `value` | `T` | The option's value. Must be `string` or `number`. |
| `label` | `string` | Display text rendered in the wheel. |
| `textValue` | `string` (optional) | Fallback text for type-ahead search when `label` is not plain text. |
| `disabled` | `boolean` (optional) | Whether this option is disabled (skipped in navigation). |

### `WheelPickerWrapperProps`

| Prop | Type | Description |
|------|------|-------------|
| `classNames` | `WheelPickerWrapperClassNames` | Per-element CSS class overrides for the wrapper group container. |

**`WheelPickerWrapperClassNames`**: `{ group?: string }` — optional CSS class for the outer group container div.

## Styling

The library ships no CSS. It is fully headless. Use the `classNames` prop to assign your own CSS classes, then target elements with your stylesheet.

### Data Attributes

All elements expose data attributes for CSS targeting:

| Attribute | Element | Notes |
|-----------|---------|-------|
| `data-swp-wrapper` | Outer container of `WheelPicker` | Always present |
| `data-swp-option` | Each option row | Always present |
| `data-swp-option-text` | Text span inside each option | Always present |
| `data-swp-selection` | Center selection highlight overlay | Always present |
| `data-swp-selected` | Option row | Present with value `"true"` when the option is currently selected |
| `data-swp-disabled` | Option row | Present with value `"true"` when the option is disabled |
| `data-swp-group` | Outer container of `WheelPickerWrapper` | Always present |

### CSS Example

```css
/* Make the wheel container draggable */
[data-swp-wrapper].my-wheel {
  width: 200px;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

[data-swp-wrapper].my-wheel:active {
  cursor: grabbing;
}

/* Style the selection highlight */
[data-swp-selection].my-selection {
  background: rgba(59, 130, 246, 0.15);
  border-top: 1px solid rgba(59, 130, 246, 0.3);
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
}

/* Style each option row */
[data-swp-option].my-option {
  font-size: 16px;
  transition: opacity 0.15s;
}

/* Dim disabled options */
[data-swp-option][data-swp-disabled='true'] {
  opacity: 0.3;
}

/* Bold the selected option */
[data-swp-option][data-swp-selected='true'] {
  font-weight: 600;
}
```

Pass your class names via the `classNames` prop:

```svelte
<WheelPicker
  {options}
  {value}
  onValueChange={(v) => { value = v; }}
  classNames={{
    wrapper: 'my-wheel',
    selection: 'my-selection',
    option: 'my-option',
  }}
/>
```

## Keyboard Navigation

When the wheel picker is focused:

| Key | Action |
|-----|--------|
| `Arrow Up` | Move selection up by one |
| `Arrow Down` | Move selection down by one |
| `Home` | Jump to first option |
| `End` | Jump to last option |
| Type a character | Type-ahead search: jump to the next option whose label (or `textValue`) starts with the typed character(s) |

## License

MIT
