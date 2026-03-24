/**
 * A single option in the wheel picker.
 * @template T - The value type, constrained to string or number.
 */
export type WheelPickerOption<T extends string | number = string> = {
	value: T;
	label: string;
	/** Fallback text for type-ahead search when label is not plain text. */
	textValue?: string;
	/** Whether this option is disabled (skipped in navigation). */
	disabled?: boolean;
};

/**
 * Per-element class name overrides for WheelPicker.
 * All fields are optional — only provided classes are applied.
 */
export type WheelPickerClassNames = {
	/** Outer container div */
	wrapper?: string;
	/** Each option row */
	option?: string;
	/** Text span inside each option */
	optionText?: string;
	/** Center selection highlight overlay */
	selection?: string;
};

/**
 * Props for the WheelPicker component.
 * @template T - The option value type.
 *
 * Controlled mode: pass `value` + `onValueChange`.
 * Uncontrolled mode: pass `defaultValue` (or nothing), omit `onValueChange`.
 */
export interface WheelPickerProps<T extends string | number = string> {
	/** The list of selectable options. */
	options: WheelPickerOption<T>[];
	/** Current value (controlled mode). undefined means "no option selected". */
	value?: T;
	/** Initial value (uncontrolled mode). */
	defaultValue?: T;
	/** Callback when value changes. Presence signals controlled mode. */
	onValueChange?: (value: T) => void;
	/** Per-element CSS class overrides. */
	classNames?: WheelPickerClassNames;
	/** Number of visible option rows. Must be odd. Default: 5. */
	visibleCount?: number;
	/** Height in pixels of each option row. Default: 30. */
	optionItemHeight?: number;
	/** Pointer drag delta multiplier (affects inertia deceleration). Default: 3. */
	dragSensitivity?: number;
	/** Scroll wheel delta multiplier (affects snap animation duration). Default: 5. */
	scrollSensitivity?: number;
	/** Enable infinite loop scrolling (wraps at both ends). Default: false. */
	infinite?: boolean;
}

/**
 * Per-element class name overrides for WheelPickerWrapper.
 */
export type WheelPickerWrapperClassNames = {
	/** Outer group container div */
	group?: string;
};

/**
 * Props for the WheelPickerWrapper component.
 */
export interface WheelPickerWrapperProps {
	/** Per-element CSS class overrides for the wrapper group. */
	classNames?: WheelPickerWrapperClassNames;
}
