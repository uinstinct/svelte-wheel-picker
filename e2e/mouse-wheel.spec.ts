import { test, expect } from '@playwright/test';

test.describe('Mouse Wheel Scrolling', () => {
	test('mouse wheel scroll moves multiple items per scroll event', async ({ page }) => {
		await page.goto('/');

		const selectedText = page.locator('section').filter({ hasText: 'Single Wheel' }).locator('p');
		await expect(selectedText).toContainText('cherry');

		const wrapper = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('[data-swp-wrapper]');
		await wrapper.waitFor({ state: 'visible' });
		await wrapper.scrollIntoViewIfNeeded();
		await page.waitForTimeout(300);

		const box = await wrapper.boundingBox();
		if (!box) throw new Error('Could not get bounding box of wheel picker wrapper');

		const cx = box.x + box.width / 2;
		const cy = box.y + box.height / 2;

		// Move mouse to wrapper center before dispatching wheel events
		await page.mouse.move(cx, cy);

		// Dispatch a strong downward wheel event (deltaY=300).
		// With default scrollSensitivity=5, itemHeight=30: 300*1/30 = 10 items.
		// Starting at cherry (index 2), clamped to grape (index 6).
		await page.mouse.wheel(0, 300);

		// Wait for animation to settle — poll until the text changes
		await expect(selectedText).not.toContainText('cherry', { timeout: 5000 });

		const selected = await selectedText.textContent();
		// Should have moved far past cherry — expect grape (last item, clamped)
		expect(selected).toContain('grape');
	});

	test('single wheel notch scrolls exactly one item with low deltaY', async ({ page }) => {
		await page.goto('/');

		const selectedText = page.locator('section').filter({ hasText: 'Single Wheel' }).locator('p');
		await expect(selectedText).toContainText('cherry');

		const wrapper = page
			.locator('section')
			.filter({ hasText: 'Single Wheel' })
			.locator('[data-swp-wrapper]');
		await wrapper.waitFor({ state: 'visible' });
		await wrapper.scrollIntoViewIfNeeded();
		await page.waitForTimeout(300);

		const box = await wrapper.boundingBox();
		if (!box) throw new Error('Could not get bounding box of wheel picker wrapper');

		const cx = box.x + box.width / 2;
		const cy = box.y + box.height / 2;

		await page.mouse.move(cx, cy);

		// Small deltaY (10px) — should move minimum 1 item (cherry → date)
		await page.mouse.wheel(0, 10);

		await expect(selectedText).not.toContainText('cherry', { timeout: 5000 });

		const selected = await selectedText.textContent();
		// With small delta, should move exactly 1 item forward: date
		expect(selected).toContain('date');
	});
});
