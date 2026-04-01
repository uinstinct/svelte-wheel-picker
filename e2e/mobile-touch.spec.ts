import { test, expect } from '@playwright/test';

test.describe('Mobile Touch Scrolling', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('touch-action: none is applied to wheel picker wrapper', async ({ page }) => {
		const wrapper = page.locator('[data-swp-wrapper]').first();
		await wrapper.waitFor({ state: 'visible' });

		const touchAction = await page.evaluate((el) => {
			return window.getComputedStyle(el).touchAction;
		}, await wrapper.elementHandle());

		expect(touchAction).toBe('none');
	});

	test('user-select: none is applied to wheel picker wrapper', async ({ page }) => {
		const wrapper = page.locator('[data-swp-wrapper]').first();
		await wrapper.waitFor({ state: 'visible' });

		const userSelect = await page.evaluate((el) => {
			const style = window.getComputedStyle(el);
			return (style as CSSStyleDeclaration & { webkitUserSelect?: string }).userSelect
				?? (style as CSSStyleDeclaration & { webkitUserSelect?: string }).webkitUserSelect
				?? '';
		}, await wrapper.elementHandle());

		expect(userSelect).toBe('none');
	});

	test('pointer drag on wheel picker changes selected value', async ({ page }) => {
		const selectedText = page.locator('section').filter({ hasText: 'Single Wheel' }).locator('p');
		await expect(selectedText).toContainText('cherry');

		const wrapper = page.locator('[data-swp-wrapper]').first();
		await wrapper.waitFor({ state: 'visible' });
		await wrapper.scrollIntoViewIfNeeded();
		await page.waitForTimeout(300);

		const box = await wrapper.boundingBox();
		if (!box) throw new Error('Could not get bounding box of wheel picker wrapper');

		const cx = box.x + box.width / 2;
		const startY = box.y + box.height / 2;

		// Drag upward 200px to scroll the picker downward (reveals later items)
		await page.mouse.move(cx, startY);
		await page.mouse.down();
		for (let i = 1; i <= 20; i++) {
			await page.mouse.move(cx, startY - (200 * i) / 20);
			await page.waitForTimeout(16);
		}
		await page.mouse.up();

		// Wait for inertia animation to settle and selection to change
		await expect(selectedText).not.toContainText('cherry', { timeout: 5000 });
	});

	test('page does not scroll when dragging on wheel picker', async ({ page }) => {
		const wrapper = page.locator('[data-swp-wrapper]').first();
		await wrapper.waitFor({ state: 'visible' });
		await wrapper.scrollIntoViewIfNeeded();
		await page.waitForTimeout(300);

		const box = await wrapper.boundingBox();
		if (!box) throw new Error('Could not get bounding box of wheel picker wrapper');

		const scrollYBefore = await page.evaluate(() => window.scrollY);

		const cx = box.x + box.width / 2;
		const cy = box.y + box.height / 2;

		await page.mouse.move(cx, cy);
		await page.mouse.down();
		for (let i = 1; i <= 20; i++) {
			await page.mouse.move(cx, cy + (150 * i) / 20);
			await page.waitForTimeout(16);
		}
		await page.mouse.up();

		// Small settle time for any scroll animations
		await page.waitForTimeout(300);

		const scrollYAfter = await page.evaluate(() => window.scrollY);

		// Allow tolerance of < 5px for any micro-scroll
		expect(Math.abs(scrollYAfter - scrollYBefore)).toBeLessThan(5);
	});
});
