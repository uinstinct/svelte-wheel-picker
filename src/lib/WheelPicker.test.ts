import { render } from 'vitest-browser-svelte';
import { expect, test } from 'vitest';
import WheelPicker from './WheelPicker.svelte';

test('renders without errors', async () => {
	const screen = await render(WheelPicker, { label: 'Test' });
	await expect.element(screen.getByText('Test')).toBeVisible();
});
