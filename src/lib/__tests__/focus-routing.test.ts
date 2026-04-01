import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import FocusRoutingFixture from './FocusRoutingFixture.svelte';

describe('Focus routing between wheels', () => {
	it('Tab moves focus from first wheel to second wheel', async () => {
		const { container } = render(FocusRoutingFixture);
		const wheels = container.querySelectorAll('[data-swp-wrapper]');
		expect(wheels.length).toBe(2);

		// Focus the first wheel
		(wheels[0] as HTMLElement).focus();
		expect(document.activeElement).toBe(wheels[0]);

		// Press Tab — focus should move to second wheel
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(wheels[1]);
	});

	it('Shift+Tab moves focus from second wheel back to first wheel', async () => {
		const { container } = render(FocusRoutingFixture);
		const wheels = container.querySelectorAll('[data-swp-wrapper]');

		// Focus the second wheel
		(wheels[1] as HTMLElement).focus();
		expect(document.activeElement).toBe(wheels[1]);

		// Press Shift+Tab — focus should move to first wheel
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		expect(document.activeElement).toBe(wheels[0]);
	});
});
