import { test, expect } from '@playwright/test';

test.describe('Touch Gestures', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('touch drag up changes selection forward', async ({ page }) => {
		const selectedText = page.locator('section').filter({ hasText: 'Single Wheel' }).getByText('Selected:');
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
		const startY = box.y + box.height / 2;

		// Drag upward 150px (10 steps of 15px each) to scroll picker forward
		await page.mouse.move(cx, startY);
		await page.mouse.down();
		for (let i = 1; i <= 10; i++) {
			await page.mouse.move(cx, startY - 15 * i);
			await page.waitForTimeout(16);
		}
		await page.mouse.up();

		// Wait for inertia animation to settle
		await page.waitForTimeout(2000);

		await expect(selectedText).not.toContainText('cherry');
	});

	test('touch drag down changes selection backward', async ({ page }) => {
		const selectedText = page.locator('section').filter({ hasText: 'Single Wheel' }).getByText('Selected:');
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
		const startY = box.y + box.height / 2;

		// Drag downward 200px to scroll picker backward (reveals earlier items).
		// 200px provides enough displacement to reliably clear rubber-band resistance
		// (RESISTANCE=0.3) when cherry is near the list start with only 2 items before it.
		await page.mouse.move(cx, startY);
		await page.mouse.down();
		for (let i = 1; i <= 20; i++) {
			await page.mouse.move(cx, startY + 10 * i);
			await page.waitForTimeout(16);
		}
		await page.mouse.up();

		// Poll until selection changes — avoids fixed timeout race condition
		await expect(selectedText).not.toContainText('cherry', { timeout: 3000 });

		// Should have moved backward from cherry — expect banana or apple
		const selected = await selectedText.textContent();
		const movedBackward = selected?.includes('banana') || selected?.includes('apple');
		expect(movedBackward).toBe(true);
	});

	test('quick flick gesture triggers inertia', async ({ page }) => {
		const selectedText = page.locator('section').filter({ hasText: 'Single Wheel' }).getByText('Selected:');
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
		const startY = box.y + box.height / 2;

		// Fast flick: 3 large steps (50px each) with minimal delay to build velocity
		await page.mouse.move(cx, startY);
		await page.mouse.down();
		await page.mouse.move(cx, startY - 50, { steps: 1 });
		await page.waitForTimeout(16);
		await page.mouse.move(cx, startY - 100, { steps: 1 });
		await page.waitForTimeout(16);
		await page.mouse.move(cx, startY - 150, { steps: 1 });
		await page.mouse.up();

		// Wait for full inertia settle
		await page.waitForTimeout(3000);

		// Inertia should carry past date (just 1 item from cherry)
		// Expect elderberry, fig, or grape
		const selected = await selectedText.textContent();
		expect(selected).not.toContain('cherry');
		expect(selected).not.toContain('date');
		const movedFar = ['elderberry', 'fig', 'grape'].some((v) =>
			selected?.toLowerCase().includes(v),
		);
		expect(movedFar).toBe(true);
	});
});
