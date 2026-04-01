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
			// iPhone 13 device emulation: 390x844, hasTouch: true, deviceScaleFactor: 3.
			// Requires WebKit browser. In sandbox CI environments, use --project=mobile-chrome
			// only when Chromium/WebKit binaries are available without SEGV_ACCERR limitations.
			use: { ...devices['iPhone 13'] },
		},
	],
	webServer: {
		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI,
	},
});
