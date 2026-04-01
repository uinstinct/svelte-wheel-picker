import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	timeout: 30000,
	retries: 0,
	use: {
		baseURL: 'http://localhost:5173',
	},
	projects: [
		{
			name: 'mobile-chrome',
			use: { ...devices['iPhone 13'] },
		},
	],
	webServer: {
		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI,
	},
});
