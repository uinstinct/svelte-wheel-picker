import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('ArrowDown moves to next item', async ({ page }) => {
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('p');
		await expect(selectedText).toContainText('cherry');

		const wrapper = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('[data-swp-wrapper]');
		await wrapper.waitFor({ state: 'visible' });
		await wrapper.focus();

		await page.keyboard.press('ArrowDown');
		await page.waitForTimeout(1000);

		await expect(selectedText).toContainText('date');
	});

	test('ArrowUp moves to previous item', async ({ page }) => {
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('p');
		await expect(selectedText).toContainText('cherry');

		const wrapper = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('[data-swp-wrapper]');
		await wrapper.waitFor({ state: 'visible' });
		await wrapper.focus();

		await page.keyboard.press('ArrowUp');
		await page.waitForTimeout(1000);

		await expect(selectedText).toContainText('banana');
	});

	test('Multiple ArrowDown presses', async ({ page }) => {
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('p');
		await expect(selectedText).toContainText('cherry');

		const wrapper = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('[data-swp-wrapper]');
		await wrapper.waitFor({ state: 'visible' });
		await wrapper.focus();

		// cherry -> date -> elderberry -> fig
		await page.keyboard.press('ArrowDown');
		await page.waitForTimeout(800);
		await page.keyboard.press('ArrowDown');
		await page.waitForTimeout(800);
		await page.keyboard.press('ArrowDown');
		await page.waitForTimeout(800);

		await expect(selectedText).toContainText('fig');
	});

	test('Home key selects first item', async ({ page }) => {
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('p');
		await expect(selectedText).toContainText('cherry');

		const wrapper = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('[data-swp-wrapper]');
		await wrapper.waitFor({ state: 'visible' });
		await wrapper.focus();

		await page.keyboard.press('Home');
		await page.waitForTimeout(1000);

		await expect(selectedText).toContainText('apple');
	});

	test('End key selects last item', async ({ page }) => {
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('p');
		await expect(selectedText).toContainText('cherry');

		const wrapper = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('[data-swp-wrapper]');
		await wrapper.waitFor({ state: 'visible' });
		await wrapper.focus();

		await page.keyboard.press('End');
		await page.waitForTimeout(1000);

		await expect(selectedText).toContainText('grape');
	});

	test('ArrowDown skips disabled options', async ({ page }) => {
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Disabled Options' })
			.locator('p');
		await expect(selectedText).toContainText('1');

		const wrapper = page
			.locator('section')
			.filter({ hasText: 'Disabled Options' })
			.locator('[data-swp-wrapper]');
		await wrapper.waitFor({ state: 'visible' });
		await wrapper.focus();

		await page.keyboard.press('ArrowDown');
		await page.waitForTimeout(1000);

		// Should skip disabled Option 2 and land on Option 3
		await expect(selectedText).toContainText('3');
	});

	test('ArrowUp skips disabled options', async ({ page }) => {
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Disabled Options' })
			.locator('p');
		await expect(selectedText).toContainText('1');

		const wrapper = page
			.locator('section')
			.filter({ hasText: 'Disabled Options' })
			.locator('[data-swp-wrapper]');
		await wrapper.waitFor({ state: 'visible' });
		await wrapper.focus();

		// First move to Option 3 (skipping disabled Option 2)
		await page.keyboard.press('ArrowDown');
		await page.waitForTimeout(1000);
		await expect(selectedText).toContainText('3');

		// Now ArrowUp should skip disabled Option 2 and go back to Option 1
		await page.keyboard.press('ArrowUp');
		await page.waitForTimeout(1000);

		await expect(selectedText).toContainText('1');
	});
});
