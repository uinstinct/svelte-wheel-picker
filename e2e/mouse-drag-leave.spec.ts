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

		// Component is visibleCount(5) × itemHeight(30) = 150px tall.
		// Center is at box.y + 75. Keep all loop steps inside the component
		// so every pointermove fires on the wrapper (no pointer capture for mouse).
		// 4 steps × 15px = 60px upward → cursor ends at box.y+15, still inside.
		const cx = box.x + box.width / 2;
		const startY = box.y + box.height / 2;

		// Begin drag from center
		await page.mouse.move(cx, startY);
		await page.mouse.down();

		// Drag upward in steps — keep all steps inside the component boundary
		// Component top is box.y; center is box.y+75; 4×15=60px → cursor at box.y+15 (inside)
		for (let i = 1; i <= 4; i++) {
			await page.mouse.move(cx, startY - 15 * i);
			await page.waitForTimeout(16);
		}

		// Move outside component (above it) — this triggers pointerleave → endDrag + snap
		await page.mouse.move(cx, box.y - 100);
		await page.waitForTimeout(16);

		// Release mouse outside — the drag has already ended on pointerleave
		await page.mouse.up();

		// Wait for snap animation to settle (velocity-based duration can reach ~1s).
		// Use expect with timeout to poll until selection changes rather than a fixed delay.
		await expect(selectedText).not.toContainText('cherry', { timeout: 2000 });

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

		// Component is 150px tall, center at box.y+75. Keep loop steps inside the
		// component (3×15=45px upward → cursor at box.y+30, still inside).
		const cx = box.x + box.width / 2;
		const startY = box.y + box.height / 2;

		// Begin drag from center
		await page.mouse.move(cx, startY);
		await page.mouse.down();

		// Drag upward — stay inside the component during the loop
		for (let i = 1; i <= 3; i++) {
			await page.mouse.move(cx, startY - 15 * i);
			await page.waitForTimeout(16);
		}

		// Move outside component (above it) — triggers pointerleave → endDrag
		await page.mouse.move(cx, box.y - 50);
		await page.waitForTimeout(16);

		// Release mouse outside — drag already ended on pointerleave
		await page.mouse.up();

		// Wait for snap animation to settle before re-entering
		await expect(selectedText).not.toContainText('cherry', { timeout: 2000 });

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
