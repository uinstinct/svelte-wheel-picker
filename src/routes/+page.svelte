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
</main>

<style>
	:global(body) {
		font-family: system-ui, -apple-system, sans-serif;
		background: #ffffff;
		color: #111;
		margin: 0;
		padding: 32px;
	}

	@media (prefers-color-scheme: dark) {
		:global(body) {
			background: #0f0f0f;
			color: #eee;
		}
		.wheel-container {
			background: #1c1c1e;
		}
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
		color: #666;
		margin-bottom: 8px;
	}

	section {
		margin-bottom: 24px;
	}

	.wheel-container {
		background: #f4f4f5;
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
