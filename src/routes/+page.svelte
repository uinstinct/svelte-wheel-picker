<script lang="ts">
	import { WheelPicker, WheelPickerWrapper } from '$lib';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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
	let selectedSensitivity = $state('cherry');

	// Sensitivity controls
	let dragSens = $state(3);
	let scrollSens = $state(5);

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

<nav class="navbar">
	<span class="navbar-title">svelte-wheel-picker</span>
	<div class="navbar-actions">
		<a
			href="https://github.com/uinstinct/svelte-wheel-picker"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="GitHub"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
				/>
			</svg>
		</a>
		<a
			href="https://www.npmjs.com/package/@uinstinct/svelte-wheel-picker"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="npm"
			class="navbar-npm-link"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"
				/>
			</svg>
			<span class="navbar-version">v{data.version}</span>
		</a>
		<button class="theme-toggle" onclick={cycleTheme}>{themeLabel[theme]}</button>
	</div>
</nav>

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
					>npx shadcn-svelte@latest add https://svelte-wheel-spinner.netlify.app/r/wheel-picker.json</code
				></pre>
		</div>
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

	<section>
		<h2>Sensitivity</h2>
		<p>Selected: {selectedSensitivity}</p>
		<div class="controls-section">
			<div class="slider-row">
				<label for="drag-sens">Drag: {dragSens}</label>
				<input id="drag-sens" type="range" min="1" max="20" step="1" bind:value={dragSens} />
			</div>
			<div class="slider-row">
				<label for="scroll-sens">Scroll: {scrollSens}</label>
				<input id="scroll-sens" type="range" min="1" max="20" step="1" bind:value={scrollSens} />
			</div>
		</div>
		<div class="wheel-container">
			<WheelPicker
				options={fruitOptions}
				value={selectedSensitivity}
				onValueChange={(v) => {
					selectedSensitivity = v;
				}}
				dragSensitivity={dragSens}
				scrollSensitivity={scrollSens}
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
		padding: 0;
	}

	.navbar {
		position: sticky;
		top: 0;
		z-index: 100;
		background: var(--color-bg);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-bottom: 1px solid color-mix(in srgb, var(--color-text-muted) 15%, transparent);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24px;
		height: 48px;
	}

	.navbar-title {
		font-size: 14px;
		font-weight: 600;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		color: var(--color-text);
	}

	.navbar-actions {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 12px;
	}

	.navbar-actions a {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: var(--color-text-muted);
		text-decoration: none;
	}

	.navbar-actions a:hover {
		color: var(--color-text);
	}

	.navbar-npm-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.navbar-version {
		font-size: 12px;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		color: currentColor;
	}

	.theme-toggle {
		background: var(--color-surface);
		border-radius: 999px;
		padding: 4px 12px;
		font-size: 12px;
		border: 1px solid transparent;
		cursor: pointer;
		color: var(--color-text-muted);
		font-family: inherit;
	}

	.theme-toggle:hover {
		border-color: var(--color-text-muted);
	}

	main {
		max-width: 400px;
		margin: 0 auto;
		padding: 32px;
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

	.controls-section {
		margin-bottom: 24px;
		background: var(--color-surface);
		border-radius: 8px;
		padding: 16px;
	}

	.controls-section h2 {
		margin-bottom: 12px;
	}

	.slider-row {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;
	}

	.slider-row:last-child {
		margin-bottom: 0;
	}

	.slider-row label {
		font-size: 14px;
		font-weight: 500;
		min-width: 90px;
		color: var(--color-text);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}

	.slider-row input[type='range'] {
		flex: 1;
		accent-color: rgb(59, 130, 246);
	}
</style>
