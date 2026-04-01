import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import WheelPicker from './WheelPicker.svelte';

const testOptions = [
	{ value: 'a', label: 'Alpha' },
	{ value: 'b', label: 'Beta' },
	{ value: 'c', label: 'Charlie' },
	{ value: 'd', label: 'Delta' },
	{ value: 'e', label: 'Echo' },
];

describe('WheelPicker DOM structure', () => {
	test('renders wrapper with data-swp-wrapper', async () => {
		const { container } = await render(WheelPicker, {
			options: testOptions,
			defaultValue: 'c',
		});
		const wrapper = container.querySelector('[data-swp-wrapper]');
		expect(wrapper).not.toBeNull();
	});

	test('renders selection overlay with data-swp-selection', async () => {
		const { container } = await render(WheelPicker, {
			options: testOptions,
			defaultValue: 'c',
		});
		const selection = container.querySelector('[data-swp-selection]');
		expect(selection).not.toBeNull();
	});

	test('renders option rows with data-swp-option', async () => {
		const { container } = await render(WheelPicker, {
			options: testOptions,
			defaultValue: 'c',
		});
		const optionEls = container.querySelectorAll('[data-swp-option]');
		expect(optionEls.length).toBe(5);
	});

	test('renders option text spans with data-swp-option-text', async () => {
		const { container } = await render(WheelPicker, {
			options: testOptions,
			defaultValue: 'c',
		});
		const textEls = container.querySelectorAll('[data-swp-option-text]');
		expect(textEls.length).toBe(5);
		expect(textEls[0].textContent?.trim()).toBe('Alpha');
	});

	test('selected option has data-swp-selected="true"', async () => {
		const { container } = await render(WheelPicker, {
			options: testOptions,
			defaultValue: 'c',
		});
		const selected = container.querySelector('[data-swp-selected="true"]');
		expect(selected).not.toBeNull();
	});

	test('disabled option has data-swp-disabled="true"', async () => {
		const optionsWithDisabled = [
			{ value: 'a', label: 'Alpha' },
			{ value: 'b', label: 'Beta', disabled: true },
			{ value: 'c', label: 'Charlie' },
		];
		const { container } = await render(WheelPicker, {
			options: optionsWithDisabled,
			defaultValue: 'a',
		});
		const disabled = container.querySelectorAll('[data-swp-disabled="true"]');
		expect(disabled.length).toBe(1);
	});

	test('classNames prop injects classes on elements', async () => {
		const { container } = await render(WheelPicker, {
			options: testOptions,
			defaultValue: 'c',
			classNames: {
				wrapper: 'my-wrapper',
				option: 'my-option',
				optionText: 'my-text',
				selection: 'my-selection',
			},
		});
		expect(container.querySelector('.my-wrapper')).not.toBeNull();
		expect(container.querySelector('.my-option')).not.toBeNull();
		expect(container.querySelector('.my-text')).not.toBeNull();
		expect(container.querySelector('.my-selection')).not.toBeNull();
	});

	test('wrapper has tabindex="0" for keyboard focus', async () => {
		const { container } = await render(WheelPicker, {
			options: testOptions,
			defaultValue: 'c',
		});
		const wrapper = container.querySelector('[data-swp-wrapper]');
		expect(wrapper?.getAttribute('tabindex')).toBe('0');
	});

	test('wrapper height matches visibleCount * optionItemHeight', async () => {
		const { container } = await render(WheelPicker, {
			options: testOptions,
			defaultValue: 'c',
			visibleCount: 3,
			optionItemHeight: 50,
		});
		const wrapper = container.querySelector('[data-swp-wrapper]') as HTMLElement;
		expect(wrapper.style.height).toBe('150px');
	});

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
});
