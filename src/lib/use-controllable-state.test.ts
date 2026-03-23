import { describe, test, expect, vi } from 'vitest';
import { useControllableState } from './use-controllable-state.svelte.js';

describe('useControllableState', () => {
	describe('uncontrolled mode', () => {
		test('returns defaultValue initially', () => {
			const state = useControllableState<string>({ defaultValue: 'apple' });
			expect(state.current).toBe('apple');
		});

		test('returns undefined when no defaultValue', () => {
			const state = useControllableState<string>({});
			expect(state.current).toBe(undefined);
		});

		test('updates internal state on set', () => {
			const state = useControllableState<string>({ defaultValue: 'apple' });
			state.current = 'banana';
			expect(state.current).toBe('banana');
		});

		test('does not require onChange callback', () => {
			const state = useControllableState<string>({ defaultValue: 'apple' });
			state.current = 'banana';
			// no error thrown, state updated
			expect(state.current).toBe('banana');
		});
	});

	describe('controlled mode', () => {
		test('returns provided value', () => {
			const onChange = vi.fn();
			const state = useControllableState<string>({ value: 'apple', onChange });
			expect(state.current).toBe('apple');
		});

		test('returns undefined value as valid controlled state', () => {
			const onChange = vi.fn();
			const state = useControllableState<string>({ value: undefined, onChange });
			expect(state.current).toBe(undefined);
		});

		test('calls onChange when current is set', () => {
			const onChange = vi.fn();
			const state = useControllableState<string>({ value: 'apple', onChange });
			state.current = 'banana';
			expect(onChange).toHaveBeenCalledWith('banana');
		});

		test('does not update internal state in controlled mode', () => {
			const onChange = vi.fn();
			const state = useControllableState<string>({ value: 'apple', onChange });
			state.current = 'banana';
			// Still returns the controlled value, not the set value
			expect(state.current).toBe('apple');
		});
	});

	describe('generic types', () => {
		test('works with number values', () => {
			const state = useControllableState<number>({ defaultValue: 42 });
			expect(state.current).toBe(42);
			state.current = 99;
			expect(state.current).toBe(99);
		});

		test('works with string values', () => {
			const state = useControllableState<string>({ defaultValue: 'hello' });
			expect(state.current).toBe('hello');
		});
	});
});
