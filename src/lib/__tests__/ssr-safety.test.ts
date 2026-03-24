import { describe, it, expect } from 'vitest';

describe('SSR Safety', () => {
	it('module evaluation does not reference browser globals', async () => {
		// Dynamic import simulates what happens when SvelteKit SSR imports the package
		const mod = await import('../index.js');

		// Verify public exports exist
		expect(mod.WheelPicker).toBeDefined();
		expect(mod.WheelPickerWrapper).toBeDefined();
	});
});
