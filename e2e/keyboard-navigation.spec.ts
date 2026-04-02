import { test, expect } from '@playwright/test';

// Helper to focus the wheel picker via Tab key (avoids pointer capture issues with click/focus)
async function focusWheel(page: import('@playwright/test').Page, sectionText: string) {
	const wrapper = page
		.locator('section')
		.filter({ hasText: sectionText })
		.locator('[data-swp-wrapper]');
	await wrapper.waitFor({ state: 'visible' });
	await wrapper.scrollIntoViewIfNeeded();
	// Use dispatchEvent to set focus without triggering pointer capture
	await wrapper.evaluate((el) => el.focus());
	// Verify focus landed
	const focused = await wrapper.evaluate((el) => document.activeElement === el);
	if (!focused) {
		// Fallback: click on the selection overlay (pointer-events: none) area won't trigger drag
		// Instead, press Tab until we reach it
		await wrapper.click({ position: { x: 5, y: 5 }, force: true });
	}
	await page.waitForTimeout(200);
}

test.describe('Keyboard Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForTimeout(500);
	});

	test('ArrowDown moves to next item', async ({ page }) => {
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('p');
		await expect(selectedText).toContainText('cherry');

		await focusWheel(page, 'Single Wheel');
		await page.keyboard.press('ArrowDown');

		await expect(selectedText).toContainText('date', { timeout: 3000 });
	});

	test('ArrowUp moves to previous item', async ({ page }) => {
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('p');
		await expect(selectedText).toContainText('cherry');

		await focusWheel(page, 'Single Wheel');
		await page.keyboard.press('ArrowUp');

		await expect(selectedText).toContainText('banana', { timeout: 3000 });
	});

	test('Multiple ArrowDown presses', async ({ page }) => {
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('p');
		await expect(selectedText).toContainText('cherry');

		await focusWheel(page, 'Single Wheel');

		// cherry -> date -> elderberry -> fig
		for (let i = 0; i < 3; i++) {
			await page.keyboard.press('ArrowDown');
			await page.waitForTimeout(600);
		}

		await expect(selectedText).toContainText('fig', { timeout: 3000 });
	});

	test('Home key selects first item', async ({ page }) => {
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('p');
		await expect(selectedText).toContainText('cherry');

		await focusWheel(page, 'Single Wheel');
		await page.keyboard.press('Home');

		await expect(selectedText).toContainText('apple', { timeout: 3000 });
	});

	test('End key selects last item', async ({ page }) => {
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('p');
		await expect(selectedText).toContainText('cherry');

		await focusWheel(page, 'Single Wheel');
		await page.keyboard.press('End');

		await expect(selectedText).toContainText('grape', { timeout: 3000 });
	});

	test('ArrowDown skips disabled options', async ({ page }) => {
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Disabled Options' })
			.locator('p');
		await expect(selectedText).toContainText('1');

		await focusWheel(page, 'Disabled Options');
		await page.keyboard.press('ArrowDown');

		// Should skip disabled Option 2 and land on Option 3
		await expect(selectedText).toContainText('3', { timeout: 3000 });
	});

	test('ArrowUp skips disabled options', async ({ page }) => {
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Disabled Options' })
			.locator('p');
		await expect(selectedText).toContainText('1');

		await focusWheel(page, 'Disabled Options');

		// First move to Option 3 (skipping disabled Option 2)
		await page.keyboard.press('ArrowDown');
		await expect(selectedText).toContainText('3', { timeout: 3000 });

		// Now ArrowUp should skip disabled Option 2 and go back to Option 1
		await page.keyboard.press('ArrowUp');
		await expect(selectedText).toContainText('1', { timeout: 3000 });
	});
});
