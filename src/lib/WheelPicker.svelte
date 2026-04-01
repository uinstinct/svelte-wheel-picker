<script lang="ts" generics="T extends string | number">
	import { untrack } from 'svelte';
	import type { WheelPickerProps } from './types.js';
	import { WheelPhysics } from './use-wheel-physics.svelte.js';
	import { useControllableState } from './use-controllable-state.svelte.js';
	import { useTypeaheadSearch } from './use-typeahead-search.svelte.js';
	import {
		DEFAULT_VISIBLE_COUNT,
		DEFAULT_ITEM_HEIGHT,
		DEFAULT_DRAG_SENSITIVITY,
		DEFAULT_SCROLL_SENSITIVITY,
		cylindricalScaleY,
	} from './wheel-physics-utils.js';
	import { wrapIndex } from './wheel-physics-utils.js';

	let {
		options,
		value,
		defaultValue,
		onValueChange,
		classNames,
		visibleCount: rawVisibleCount = DEFAULT_VISIBLE_COUNT,
		optionItemHeight = DEFAULT_ITEM_HEIGHT,
		dragSensitivity = DEFAULT_DRAG_SENSITIVITY,
		scrollSensitivity = DEFAULT_SCROLL_SENSITIVITY,
		infinite = false,
		cylindrical = false,
	}: WheelPickerProps<T> = $props();

	// D-07: visibleCount must be odd — warn and round up if even
	const visibleCount = $derived.by(() => {
		if (rawVisibleCount % 2 === 0) {
			console.warn(
				`[WheelPicker] visibleCount must be an odd number. Received ${rawVisibleCount}, rounding up to ${rawVisibleCount + 1}.`,
			);
			return rawVisibleCount + 1;
		}
		return rawVisibleCount;
	});

	// Controlled/uncontrolled state management
	const state = useControllableState({
		value,
		defaultValue,
		onChange: onValueChange,
	});

	// Derive the currently selected index
	const selectedIndex = $derived(options.findIndex((o) => o.value === state.current));

	// Determine initial index — use selectedIndex if found, otherwise first enabled
	const initialIndex = $derived.by(() => {
		if (selectedIndex >= 0) return selectedIndex;
		const first = options.findIndex((o) => !o.disabled);
		return first >= 0 ? first : 0;
	});

	// Instantiate the physics engine
	const physics = new WheelPhysics({
		itemHeight: optionItemHeight,
		visibleCount: visibleCount,
		dragSensitivity,
		scrollSensitivity,
		options,
		initialIndex,
		infinite,
		onSnap: (index: number) => {
			console.log('[onSnap] index=', index, 'infinite=', infinite, 'offset=', physics.offset);
			if (infinite) {
				// D-04: Normalize offset on snap settle
				const wrappedIndex = wrapIndex(index, options.length);
				physics.jumpTo(wrappedIndex);
				const opt = options[wrappedIndex];
				console.log(
					'[onSnap] wrappedIndex=',
					wrappedIndex,
					'opt=',
					opt?.value,
					'jumpTo offset=',
					physics.offset,
				);
				if (opt && !opt.disabled) {
					state.current = opt.value;
				}
			} else {
				const opt = options[index];
				if (opt && !opt.disabled) {
					state.current = opt.value;
				}
			}
		},
	});

	// Typeahead search instance
	const typeahead = useTypeaheadSearch();

	// Cleanup on component destroy
	$effect(() => {
		return () => {
			physics.destroy();
			typeahead.destroy();
		};
	});

	// Keep state.current reactive in controlled mode — update tracked value when value prop changes
	$effect(() => {
		state.updateControlledValue(value);
	});

	// React to external `value` prop changes (D-05: cancel mid-flight, jump to new position)
	// Guard: only animate if the target index differs from the current visual position.
	// IMPORTANT: physics.currentIndex reads physics.offset ($state) — must be untracked to prevent
	// this effect from re-running on every pointer-move or animation tick.
	$effect(() => {
		const v = value;
		if (v === undefined) return;
		const idx = options.findIndex((o) => o.value === v);
		if (idx >= 0 && idx !== untrack(() => physics.currentIndex)) {
			physics.cancelAnimation();
			physics.animateTo(idx);
		}
	});

	// Helper: animate the wheel to a given index and update state
	function setValue(index: number) {
		physics.animateTo(index);
	}

	// Keyboard navigation (per RESEARCH Pattern 5)
	function handleKeydown(e: KeyboardEvent) {
		const currentIdx = selectedIndex >= 0 ? selectedIndex : 0;
		switch (e.key) {
			case 'ArrowDown': {
				e.preventDefault();
				if (infinite) {
					let next = currentIdx + 1;
					let guard = 0;
					while (options[wrapIndex(next, options.length)]?.disabled && guard < options.length) {
						next++;
						guard++;
					}
					if (guard < options.length) {
						// Animate to the extended index (ghost position) for correct direction.
						// onSnap will normalize back to [0, N-1] via wrapIndex + jumpTo.
						setValue(next);
					}
				} else {
					let next = currentIdx + 1;
					while (next < options.length && options[next].disabled) next++;
					if (next < options.length) setValue(next);
				}
				break;
			}
			case 'ArrowUp': {
				e.preventDefault();
				if (infinite) {
					let next = currentIdx - 1;
					let guard = 0;
					while (options[wrapIndex(next, options.length)]?.disabled && guard < options.length) {
						next--;
						guard++;
					}
					if (guard < options.length) {
						// Animate to the extended index (ghost position) for correct direction.
						setValue(next);
					}
				} else {
					let next = currentIdx - 1;
					while (next >= 0 && options[next].disabled) next--;
					if (next >= 0) setValue(next);
				}
				break;
			}
			case 'Home': {
				e.preventDefault();
				const first = options.findIndex((o) => !o.disabled);
				if (first !== -1) setValue(first);
				break;
			}
			case 'End': {
				e.preventDefault();
				for (let i = options.length - 1; i >= 0; i--) {
					if (!options[i].disabled) {
						setValue(i);
						break;
					}
				}
				break;
			}
			default: {
				const result = typeahead.search(e.key, options, currentIdx);
				if (result !== -1) setValue(result);
			}
		}
	}

	// Pointer event handlers (Pattern 2: Pointer Capture for reliable drag tracking)
	function onPointerDown(e: PointerEvent) {
		console.log(
			'[onPointerDown] type=',
			e.type,
			'currentTarget=',
			e.currentTarget,
			'target=',
			e.target,
		);
		const el = e.currentTarget as HTMLElement;
		el.setPointerCapture(e.pointerId);
		console.log(
			'[onPointerDown] setPointerCapture called, hasCapture=',
			el.hasPointerCapture(e.pointerId),
		);
		physics.startDrag(e.clientY);
	}

	function onPointerMove(e: PointerEvent) {
		physics.moveDrag(e.clientY);
	}

	function onPointerUp(e: PointerEvent) {
		console.log(
			'[onPointerUp] type=',
			e.type,
			'currentTarget=',
			e.currentTarget,
			'target=',
			e.target,
			'clientY=',
			e.clientY,
		);
		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		physics.endDrag();
	}

	// Wheel/trackpad scroll handler — one item per scroll event
	function onWheel(e: WheelEvent) {
		e.preventDefault();
		physics.handleWheel(e.deltaY);
	}
</script>

<div
	data-swp-wrapper
	data-swp-cylindrical={cylindrical ? 'true' : undefined}
	class={classNames?.wrapper ?? undefined}
	style:height="{visibleCount * optionItemHeight}px"
	style:overflow="hidden"
	style:position="relative"
	style:touch-action="none"
	style:user-select="none"
	tabindex="0"
	role="listbox"
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	onpointercancel={onPointerUp}
	onwheel={onWheel}
	onkeydown={handleKeydown}
>
	<!-- Selection overlay — absolutely positioned center row indicator -->
	<div
		data-swp-selection
		class={classNames?.selection ?? undefined}
		style:position="absolute"
		style:top="{Math.floor(visibleCount / 2) * optionItemHeight}px"
		style:left="0"
		style:right="0"
		style:height="{optionItemHeight}px"
		style:pointer-events="none"
	></div>

	<!-- Options container — translated by physics offset -->
	<div style:transform="translateY({physics.offset}px)">
		{#if infinite}
			<!-- Before-ghosts: reversed so options[N-1] appears just above real section (Pitfall 3) -->
			{#each [...options].reverse() as option, g}
				{@const scale = cylindrical
					? cylindricalScaleY(g - options.length, physics.offset, optionItemHeight, visibleCount)
					: undefined}
				<div
					data-swp-option
					data-swp-disabled={option.disabled ? 'true' : undefined}
					class={classNames?.option ?? undefined}
					style:height="{optionItemHeight}px"
					style:display="flex"
					style:align-items="center"
					style:justify-content="center"
					style:transform={scale !== undefined ? `scaleY(${scale})` : undefined}
					style:opacity={scale}
					role="option"
					aria-selected={false}
				>
					<span data-swp-option-text class={classNames?.optionText ?? undefined}>
						{option.label}
					</span>
				</div>
			{/each}
		{/if}

		<!-- Real items section -->
		{#each options as option, i}
			{@const scale = cylindrical
				? cylindricalScaleY(i, physics.offset, optionItemHeight, visibleCount)
				: undefined}
			<div
				data-swp-option
				data-swp-selected={selectedIndex === i ? 'true' : undefined}
				data-swp-disabled={option.disabled ? 'true' : undefined}
				class={classNames?.option ?? undefined}
				style:height="{optionItemHeight}px"
				style:display="flex"
				style:align-items="center"
				style:justify-content="center"
				style:transform={scale !== undefined ? `scaleY(${scale})` : undefined}
				style:opacity={scale}
				role="option"
				aria-selected={selectedIndex === i}
			>
				<span data-swp-option-text class={classNames?.optionText ?? undefined}>
					{option.label}
				</span>
			</div>
		{/each}

		{#if infinite}
			<!-- After-ghosts: same order as real items -->
			{#each options as option, j}
				{@const scale = cylindrical
					? cylindricalScaleY(options.length + j, physics.offset, optionItemHeight, visibleCount)
					: undefined}
				<div
					data-swp-option
					data-swp-disabled={option.disabled ? 'true' : undefined}
					class={classNames?.option ?? undefined}
					style:height="{optionItemHeight}px"
					style:display="flex"
					style:align-items="center"
					style:justify-content="center"
					style:transform={scale !== undefined ? `scaleY(${scale})` : undefined}
					style:opacity={scale}
					role="option"
					aria-selected={false}
				>
					<span data-swp-option-text class={classNames?.optionText ?? undefined}>
						{option.label}
					</span>
				</div>
			{/each}
		{/if}
	</div>
</div>
