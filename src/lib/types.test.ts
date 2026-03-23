/**
 * Type-level tests for WheelPickerOption, WheelPickerClassNames, WheelPickerProps.
 *
 * These are compile-time tests: each valid assignment should typecheck cleanly.
 * Invalid assignments are tested via @ts-expect-error directives.
 *
 * Run: pnpm exec tsc --noEmit
 */

import type { WheelPickerOption, WheelPickerClassNames, WheelPickerProps } from './types.js';

// ---------------------------------------------------------------------------
// WheelPickerOption — default generic (T = string)
// ---------------------------------------------------------------------------

// Valid: T defaults to string
const _opt1: WheelPickerOption = { value: 'a', label: 'A' };
void _opt1;

// Valid: explicit string generic
const _opt2: WheelPickerOption<string> = { value: 'hello', label: 'Hello' };
void _opt2;

// Valid: explicit number generic
const _opt3: WheelPickerOption<number> = { value: 1, label: 'One' };
void _opt3;

// Valid: optional fields absent
const _opt4: WheelPickerOption = { value: 'b', label: 'B' };
void _opt4;

// Valid: optional fields present
const _opt5: WheelPickerOption = { value: 'c', label: 'C', textValue: 'C text', disabled: false };
void _opt5;

// Invalid: boolean is not assignable to T extends string | number
// @ts-expect-error — boolean not assignable to string | number constraint
const _opt6: WheelPickerOption<boolean> = { value: true, label: 'Bad' };
void _opt6;

// ---------------------------------------------------------------------------
// WheelPickerClassNames — all fields optional
// ---------------------------------------------------------------------------

// Valid: empty object
const _cn1: WheelPickerClassNames = {};
void _cn1;

// Valid: all fields provided
const _cn2: WheelPickerClassNames = {
	wrapper: 'my-wrapper',
	option: 'my-option',
	optionText: 'my-option-text',
	selection: 'my-selection'
};
void _cn2;

// Valid: partial fields
const _cn3: WheelPickerClassNames = { wrapper: 'w', selection: 's' };
void _cn3;

// ---------------------------------------------------------------------------
// WheelPickerProps — controlled and uncontrolled modes
// ---------------------------------------------------------------------------

// Valid: options array (minimal)
const _props1: WheelPickerProps = { options: [{ value: 'a', label: 'A' }] };
void _props1;

// Valid: controlled mode
const _props2: WheelPickerProps = {
	options: [],
	value: 'a',
	onValueChange: (v) => {
		void v;
	}
};
void _props2;

// Valid: uncontrolled mode
const _props3: WheelPickerProps = { options: [], defaultValue: 'a' };
void _props3;

// Valid: with classNames
const _props4: WheelPickerProps = {
	options: [{ value: 'x', label: 'X' }],
	classNames: { wrapper: 'cls' }
};
void _props4;

// Valid: number generic
const _props5: WheelPickerProps<number> = {
	options: [{ value: 1, label: 'One' }],
	value: 1,
	onValueChange: (v) => {
		void v;
	}
};
void _props5;
