export { default as WheelPicker } from './WheelPicker.svelte';

// Type exports (DIST-01)
export type { WheelPickerOption, WheelPickerProps, WheelPickerClassNames } from './types.js';

// Utility hooks
export { useControllableState } from './use-controllable-state.svelte.js';
export { useTypeaheadSearch } from './use-typeahead-search.svelte.js';

// Physics defaults — exposed so consumers can reference them when configuring the component
export {
	DEFAULT_VISIBLE_COUNT,
	DEFAULT_ITEM_HEIGHT,
	DEFAULT_DRAG_SENSITIVITY,
	DEFAULT_SCROLL_SENSITIVITY,
} from './wheel-physics-utils.js';
