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

		// Dispatch 3 strong downward wheel events (deltaY=300 each) with 150ms gaps
		// With itemHeight=30: 300/30 = 10 items per event. Starting at cherry (index 2),
		// clamped to grape (index 6).
		await page.mouse.wheel(0, 300);
		await page.waitForTimeout(150);
		await page.mouse.wheel(0, 300);
		await page.waitForTimeout(150);
		await page.mouse.wheel(0, 300);

		// Wait for animation to settle
		await page.waitForTimeout(3000);

		const selected = await selectedText.textContent();
		// Should NOT still be cherry and should have moved 2+ items away
		// (not banana=1 either, which would be only -1 from cherry)
		// Expected: elderberry (4), fig (5), or grape (6)
		expect(selected).not.toContain('cherry');
		expect(selected).not.toContain('date'); // date is only 1 item away
		const validValues = ['Elderberry', 'Fig', 'Grape'];
		const movedFarEnough = validValues.some((v) => selected?.includes(v));
		expect(movedFarEnough).toBe(true);
	});

	test('mouse wheel scroll is faster than one-item-per-event', async ({ page }) => {
		await page.goto('/');

		// The "Scroll Sensitivity" section uses manyOptions; cherry is at index 12
		const selectedText = page
			.locator('section')
			.filter({ hasText: 'Scroll Sensitivity' })
			.locator('p')
			.filter({ hasText: 'Selected:' });
		await expect(selectedText).toContainText('cherry');

		const wrapper = page
			.locator('section')
			.filter({ hasText: 'Scroll Sensitivity' })
			.locator('[data-swp-wrapper]');
		await wrapper.waitFor({ state: 'visible' });
		await wrapper.scrollIntoViewIfNeeded();
		await page.waitForTimeout(300);

		const box = await wrapper.boundingBox();
		if (!box) throw new Error('Could not get bounding box of wheel picker wrapper');

		const cx = box.x + box.width / 2;
		const cy = box.y + box.height / 2;

		await page.mouse.move(cx, cy);

		// Dispatch 5 downward wheel events with deltaY=200, 120ms apart.
		// 200/30 ≈ 6.67 → rounds to 7 items per event. Starting at cherry (index 12),
		// total movement should be 5*7=35 items forward in the list (far past cherry).
		for (let i = 0; i < 5; i++) {
			await page.mouse.wheel(0, 200);
			await page.waitForTimeout(120);
		}

		// Wait for animation to settle
		await page.waitForTimeout(2000);

		const selected = await selectedText.textContent();
		// Should NOT be cherry and should be at least 3 items away.
		// Immediately adjacent items to cherry in manyOptions: clementine (index 13), cherimoya (index 11)
		expect(selected).not.toContain('cherry');
		expect(selected).not.toContain('Clementine'); // 1 item away
		expect(selected).not.toContain('Cherimoya'); // 1 item away
		expect(selected).not.toContain('Damson'); // 2 items away (index 17)
		expect(selected).not.toContain('Coconut'); // 2 items away (index 14)
	});
});
