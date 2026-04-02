import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	timeout: 30000,
	retries: 0,
	use: {
		baseURL: 'http://localhost:4173',
	},
	projects: [
		{
			name: 'mobile-chrome',
			use: {
				...devices['Pixel 5'],
			},
		},
		{
			name: 'desktop-chrome',
			use: {
				...devices['Desktop Chrome'],
			},
		},
	],
	webServer: {
		command: 'npx vite dev --port 4173',
		port: 4173,
		reuseExistingServer: !process.env.CI,
	},
});
