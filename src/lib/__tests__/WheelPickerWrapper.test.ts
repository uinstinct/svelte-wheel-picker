import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import WheelPickerWrapper from '../WheelPickerWrapper.svelte';

describe('WheelPickerWrapper', () => {
	it('renders a div with data-swp-group attribute', async () => {
		const { container } = render(WheelPickerWrapper);
		const groupEl = container.querySelector('[data-swp-group]');
		expect(groupEl).not.toBeNull();
		expect(groupEl?.tagName).toBe('DIV');
	});

	it('applies classNames.group to the outer div', async () => {
		const { container } = render(WheelPickerWrapper, {
			props: { classNames: { group: 'my-group-class' } },
		});
		const groupEl = container.querySelector('[data-swp-group]');
		expect(groupEl?.classList.contains('my-group-class')).toBe(true);
	});

	it('does not apply class attribute when classNames is undefined', async () => {
		const { container } = render(WheelPickerWrapper);
		const groupEl = container.querySelector('[data-swp-group]');
		// class attribute should either be absent or empty string
		const classVal = groupEl?.getAttribute('class');
		expect(!classVal || classVal.trim() === '').toBe(true);
	});
});
