<script lang="ts">
	import { WheelPicker, WheelPickerWrapper } from '$lib';

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

	const hourOptions = Array.from({ length: 12 }, (_, i) => ({
		value: String(i + 1).padStart(2, '0'),
		label: String(i + 1).padStart(2, '0'),
	}));

	const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
		value: String(i).padStart(2, '0'),
		label: String(i).padStart(2, '0'),
	}));

	let selectedHour = $state('12');
	let selectedMinute = $state('00');
	let selectedCylindrical = $state('cherry');

	// Theme toggle
	let theme = $state<'light' | 'dark' | 'system'>('system');
	let mediaQuery: MediaQueryList | null = null;

	function applyTheme(t: 'light' | 'dark' | 'system') {
		const root = document.documentElement;
		root.classList.remove('light', 'dark');
		if (t === 'dark') {
			root.classList.add('dark');
		} else if (t === 'light') {
			root.classList.add('light');
		} else {
			// system
			if (mediaQuery && mediaQuery.matches) {
				root.classList.add('dark');
			} else {
				root.classList.add('light');
			}
		}
	}

	function cycleTheme() {
		const next: Record<'system' | 'light' | 'dark', 'light' | 'dark' | 'system'> = {
			system: 'light',
			light: 'dark',
			dark: 'system',
		};
		theme = next[theme];
	}

	$effect(() => {
		if (typeof window === 'undefined') return;

		// Init from localStorage on mount
		const stored = localStorage.getItem('theme');
		if (stored === 'light' || stored === 'dark') {
			theme = stored;
		} else {
			theme = 'system';
		}

		// Set up system media query listener
		mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleSystemChange = () => {
			if (theme === 'system') {
				applyTheme('system');
			}
		};
		mediaQuery.addEventListener('change', handleSystemChange);

		return () => {
			mediaQuery?.removeEventListener('change', handleSystemChange);
		};
	});

	$effect(() => {
		if (typeof window === 'undefined') return;

		// Persist and apply on every theme change
		if (theme === 'system') {
			localStorage.removeItem('theme');
		} else {
			localStorage.setItem('theme', theme);
		}
		applyTheme(theme);
	});

	const themeLabel: Record<'light' | 'dark' | 'system', string> = {
		system: 'Auto',
		light: 'Light',
		dark: 'Dark',
	};
</script>

<button class="theme-toggle" onclick={cycleTheme}>{themeLabel[theme]}</button>

<main>
	<section class="hero">
		<h1>svelte-wheel-picker</h1>
		<p class="hero-description">
			iOS-style wheel picker for Svelte 5. Smooth inertia scrolling, infinite loop, keyboard
			navigation.
		</p>
		<div class="install-block">
			<pre><code>npm install @uinstinct/svelte-wheel-picker</code></pre>
			<pre><code
					>npx shadcn-svelte@latest add https://svelte-wheel-picker.vercel.app/r/wheel-picker.json</code
				></pre>
		</div>
		<p class="install-note">(URL shown after deployment — update before publishing)</p>
	</section>

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

	<section>
		<h2>Two Wheels</h2>
		<p>Hour: {selectedHour} — Minute: {selectedMinute}</p>
		<div class="wheel-container">
			<WheelPickerWrapper classNames={{ group: 'time-picker-group' }}>
				<WheelPicker
					options={hourOptions}
					value={selectedHour}
					onValueChange={(v) => {
						selectedHour = v;
					}}
					classNames={{ wrapper: 'wheel', selection: 'wheel-selection', option: 'wheel-option' }}
				/>
				<WheelPicker
					options={minuteOptions}
					value={selectedMinute}
					onValueChange={(v) => {
						selectedMinute = v;
					}}
					classNames={{ wrapper: 'wheel', selection: 'wheel-selection', option: 'wheel-option' }}
				/>
			</WheelPickerWrapper>
		</div>
	</section>

	<section>
		<h2>Drum / Cylinder</h2>
		<p>Selected: {selectedCylindrical}</p>
		<div class="wheel-container">
			<WheelPicker
				options={fruitOptions}
				value={selectedCylindrical}
				onValueChange={(v) => {
					selectedCylindrical = v;
				}}
				cylindrical={true}
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

	:global(:root.light) {
		color-scheme: light;
		--color-bg: #ffffff;
		--color-text: #111111;
		--color-text-muted: #555555;
		--color-surface: #f4f4f5;
	}

	:global(:root.dark) {
		color-scheme: dark;
		--color-bg: #0f0f0f;
		--color-text: #eeeeee;
		--color-text-muted: #aaaaaa;
		--color-surface: #1c1c1e;
	}

	:global(body) {
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		background: var(--color-bg);
		color: var(--color-text);
		margin: 0;
		padding: 32px;
	}

	.theme-toggle {
		position: fixed;
		top: 16px;
		right: 16px;
		background: var(--color-surface);
		border-radius: 999px;
		padding: 4px 12px;
		font-size: 12px;
		border: 1px solid transparent;
		cursor: pointer;
		color: var(--color-text-muted);
		font-family: inherit;
		z-index: 100;
	}

	.theme-toggle:hover {
		border-color: var(--color-text-muted);
	}

	main {
		max-width: 400px;
		margin: 0 auto;
	}

	h1 {
		font-size: 28px;
		font-weight: 600;
		line-height: 1.2;
		margin-bottom: 16px;
	}

	.hero {
		padding: 48px 0;
		margin-bottom: 24px;
	}

	.hero-description {
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-text-muted);
		margin-bottom: 16px;
	}

	.install-block {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 8px;
	}

	.install-block pre {
		background: var(--color-surface);
		border-radius: 6px;
		padding: 8px 12px;
		overflow-x: auto;
		margin: 0;
	}

	.install-block code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 14px;
		color: var(--color-text-muted);
	}

	.install-note {
		font-size: 12px;
		font-style: italic;
		color: var(--color-text-muted);
		margin-bottom: 0;
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

	:global([data-swp-group].time-picker-group) {
		display: flex;
		flex-direction: row;
		align-items: stretch;
	}
</style>
