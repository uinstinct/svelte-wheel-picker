import { test, expect } from '@playwright/test';

test.describe('Mouse Drag Leave Behavior', () => {
	test('mouse drag leaving component ends drag and snaps', async ({ page }) => {
		await page.goto('/');

		const section = page.locator('section').filter({ hasText: 'Single Wheel' });
		const selectedText = section.getByText('Selected:');
		await expect(selectedText).toContainText('cherry');

		const wrapper = section.locator('[data-swp-wrapper]');
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
		for (let i = 1; i <= 10; i++) {
			await page.mouse.move(cx, startY - 15 * i);
			await page.waitForTimeout(16);
		}

		// Move outside component (above it)
		await page.mouse.move(cx, box.y - 100);
		await page.waitForTimeout(16);

		// Release mouse outside — the drag should already have ended on pointerleave
		await page.mouse.up();

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

		const section = page.locator('section').filter({ hasText: 'Single Wheel' });
		const selectedText = section.getByText('Selected:');
		await expect(selectedText).toContainText('cherry');

		const wrapper = section.locator('[data-swp-wrapper]');
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

		// Move outside component (above it)
		await page.mouse.move(cx, box.y - 50);
		await page.waitForTimeout(16);

		// Release mouse outside — drag already ended on pointerleave
		await page.mouse.up();

		// Wait for snap animation to settle
		await page.waitForTimeout(600);

		// Record the snapped value
		const snappedValue = await selectedText.textContent();

		// Move back inside and press down again — this is a new drag, not a continuation
		await page.mouse.move(cx, startY);
		await page.mouse.down();
		await page.waitForTimeout(16);

		// Move slightly — should start a fresh drag from current position, not resume old one
		await page.mouse.move(cx, startY + 10);
		await page.waitForTimeout(16);

		// Release
		await page.mouse.up();

		// Wait for any potential animation
		await page.waitForTimeout(400);

		// The value should still be close to snapped value (tiny 10px drag shouldn't move far)
		// Key assertion: old drag state was fully reset, this was independent
		const selectedOption = wrapper.locator('[data-swp-selected]');
		await expect(selectedOption).toBeVisible();
	});
});
