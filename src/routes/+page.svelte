<script lang="ts">
	import { WheelPicker } from '$lib';

	const fruitOptions = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'cherry', label: 'Cherry' },
		{ value: 'date', label: 'Date' },
		{ value: 'elderberry', label: 'Elderberry' },
		{ value: 'fig', label: 'Fig' },
		{ value: 'grape', label: 'Grape' },
	];

	const disabledOptions = [
		{ value: '1', label: 'Option 1' },
		{ value: '2', label: 'Option 2', disabled: true },
		{ value: '3', label: 'Option 3' },
		{ value: '4', label: 'Option 4', disabled: true },
		{ value: '5', label: 'Option 5' },
	];

	let selectedFruit = $state('cherry');
	let selectedDisabled = $state('1');
	let selectedInfinite = $state('cherry');
</script>

<main>
	<h1>Wheel Picker</h1>

	<section>
		<h2>Single Wheel</h2>
		<p>Selected: {selectedFruit}</p>
		<div class="wheel-container">
			<WheelPicker
				options={fruitOptions}
				value={selectedFruit}
				onValueChange={(v) => {
					selectedFruit = v;
				}}
				classNames={{ wrapper: 'wheel', selection: 'wheel-selection', option: 'wheel-option' }}
			/>
		</div>
	</section>

	<section>
		<h2>Disabled Options</h2>
		<p>Selected: {selectedDisabled}</p>
		<div class="wheel-container">
			<WheelPicker
				options={disabledOptions}
				value={selectedDisabled}
				onValueChange={(v) => {
					selectedDisabled = v;
				}}
				classNames={{ wrapper: 'wheel', selection: 'wheel-selection', option: 'wheel-option' }}
			/>
		</div>
	</section>

	<section>
		<h2>Infinite Loop</h2>
		<p>Selected: {selectedInfinite}</p>
		<div class="wheel-container">
			<WheelPicker
				options={fruitOptions}
				value={selectedInfinite}
				onValueChange={(v) => {
					selectedInfinite = v;
				}}
				infinite={true}
				classNames={{ wrapper: 'wheel', selection: 'wheel-selection', option: 'wheel-option' }}
			/>
		</div>
	</section>
</main>

<style>
	:global(:root) {
		color-scheme: light dark;
		--color-bg: #ffffff;
		--color-text: #111111;
		--color-text-muted: #555555;
		--color-surface: #f4f4f5;
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--color-bg: #0f0f0f;
			--color-text: #eeeeee;
			--color-text-muted: #aaaaaa;
			--color-surface: #1c1c1e;
		}
	}

	:global(body) {
		font-family: system-ui, -apple-system, sans-serif;
		background: var(--color-bg);
		color: var(--color-text);
		margin: 0;
		padding: 32px;
	}

	main {
		max-width: 400px;
		margin: 0 auto;
	}

	h1 {
		font-size: 20px;
		font-weight: 600;
		line-height: 1.2;
		margin-bottom: 24px;
	}

	h2 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 4px;
	}

	p {
		font-size: 14px;
		color: var(--color-text-muted);
		margin-bottom: 8px;
	}

	section {
		margin-bottom: 24px;
	}

	.wheel-container {
		background: var(--color-surface);
		border-radius: 8px;
		padding: 16px;
		display: flex;
		justify-content: center;
	}

	:global([data-swp-wrapper].wheel) {
		width: 200px;
		cursor: grab;
		user-select: none;
		touch-action: none;
	}

	:global([data-swp-wrapper].wheel:active) {
		cursor: grabbing;
	}

	:global([data-swp-selection].wheel-selection) {
		background: rgba(59, 130, 246, 0.15);
		border-top: 1px solid rgba(59, 130, 246, 0.3);
		border-bottom: 1px solid rgba(59, 130, 246, 0.3);
	}

	:global([data-swp-option].wheel-option) {
		font-size: 16px;
		font-weight: 400;
		transition: opacity 0.15s;
	}

	:global([data-swp-option][data-swp-disabled='true']) {
		opacity: 0.3;
	}

	:global([data-swp-option][data-swp-selected='true']) {
		font-weight: 500;
	}
</style>
