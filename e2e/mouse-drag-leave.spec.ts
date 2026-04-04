import { test, expect } from '@playwright/test';

test.describe('Mouse Drag Leave Behavior', () => {
	test('mouse drag leaving component ends drag and snaps', async ({ page }) => {
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
		const startY = box.y + box.height / 2;

		// Begin drag from center
		await page.mouse.move(cx, startY);
		await page.mouse.down();

		// Drag upward in steps (moves list down = scrolls toward later items)
		for (let i = 1; i <= 5; i++) {
			await page.mouse.move(cx, startY - 15 * i);
			await page.waitForTimeout(16);
		}

		// Move outside component (above it) — without calling mouse.up()
		await page.mouse.move(cx, box.y - 50);
		await page.waitForTimeout(16);

		// Do NOT call page.mouse.up() — the drag should end on pointerleave
		// Wait for snap animation to settle
		await page.waitForTimeout(600);

		// The value should have changed from 'cherry' (drag moved the wheel)
		const selected = await selectedText.textContent();
		expect(selected).not.toContain('cherry');

		// The wheel should have snapped — a [data-swp-selected] attribute exists on some option
		const selectedOption = wrapper.locator('[data-swp-selected]');
		await expect(selectedOption).toBeVisible();
	});

	test('mouse drag leaving and re-entering does not resume old drag', async ({ page }) => {
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
		const startY = box.y + box.height / 2;

		// Begin drag from center
		await page.mouse.move(cx, startY);
		await page.mouse.down();

		// Drag upward
		for (let i = 1; i <= 5; i++) {
			await page.mouse.move(cx, startY - 15 * i);
			await page.waitForTimeout(16);
		}

		// Move outside component (above it) — without calling mouse.up()
		await page.mouse.move(cx, box.y - 50);
		await page.waitForTimeout(16);

		// Wait for snap animation to settle
		await page.waitForTimeout(600);

		// Record the snapped value
		const snappedValue = await selectedText.textContent();

		// Move back inside (still holding mouse button — no mouse.up() was called)
		await page.mouse.move(cx, startY);
		await page.waitForTimeout(16);

		// Move further inside in the opposite direction (downward)
		await page.mouse.move(cx, startY + 60);
		await page.waitForTimeout(16);

		// Wait for any potential animation
		await page.waitForTimeout(400);

		// Assert selected value has NOT changed from snapped value
		// (re-entry did not resume dragging)
		const currentValue = await selectedText.textContent();
		expect(currentValue).toBe(snappedValue);
	});
});
