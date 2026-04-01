import { defineConfig, defineProject } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
	plugins: [svelte()],
	test: {
		projects: [
			// Node environment: pure logic and type tests (no DOM needed)
			defineProject({
				plugins: [svelte()],
				test: {
					name: 'unit',
					environment: 'node',
					include: [
						'src/lib/wheel-physics-utils.test.ts',
						'src/lib/__tests__/ssr-safety.test.ts',
					],
				},
			}),
			// Browser environment: component and interaction tests
			defineProject({
				plugins: [svelte()],
				test: {
					name: 'browser',
					setupFiles: ['vitest-browser-svelte'],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright(),
						instances: [{ browser: 'chromium' }],
					},
					include: [
						'src/lib/WheelPicker.test.ts',
						'src/lib/use-controllable-state.test.ts',
						'src/lib/use-typeahead-search.test.ts',
						'src/lib/__tests__/WheelPickerWrapper.test.ts',
						'src/lib/__tests__/focus-routing.test.ts',
					],
				},
			}),
		],
	},
});
