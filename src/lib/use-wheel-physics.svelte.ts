/**
 * WheelPhysics — reactive physics class for the WheelPicker component.
 *
 * Manages a RAF-driven inertia loop and snap animation. The `offset` field is
 * `$state` so any consumer that reads it will re-render when it changes.
 *
 * Design notes:
 * - Only `offset` is $state — everything else is plain class fields (Pitfall 2).
 * - The RAF loop sets `this.offset` imperatively; do NOT read it inside $effect.
 * - Boundary resistance uses RESISTANCE constant from React v1.2.2 source.
 * - Disabled options are always skipped when computing snap targets.
 */

import type { WheelPickerOption } from './types.js';
import {
	easeOutCubic,
	indexToOffset,
	offsetToIndex,
	clampIndex,
	snapToNearestEnabled,
	calculateVelocity,
	computeSnapTarget,
	computeAnimationDuration,
	RESISTANCE,
	DEFAULT_DRAG_SENSITIVITY,
	DEFAULT_SCROLL_SENSITIVITY,
	DEFAULT_ITEM_HEIGHT,
	DEFAULT_VISIBLE_COUNT,
	SNAP_BACK_DECELERATION,
} from './wheel-physics-utils.js';

// Re-export for convenience so consumers only need one import
export {
	DEFAULT_DRAG_SENSITIVITY,
	DEFAULT_SCROLL_SENSITIVITY,
	DEFAULT_ITEM_HEIGHT,
	DEFAULT_VISIBLE_COUNT,
};

export class WheelPhysics {
	// ---------------------------------------------------------------------------
	// Public reactive state ($state) — the ONLY field bound to the DOM transform
	// ---------------------------------------------------------------------------

	offset = $state(0);

	// ---------------------------------------------------------------------------
	// Private configuration (set in constructor, may be updated by update())
	// ---------------------------------------------------------------------------

	#itemHeight: number;
	#visibleCount: number;
	#dragSensitivity: number;
	#scrollSensitivity: number;
	#options: WheelPickerOption[];
	#onSnap: (index: number) => void;

	// ---------------------------------------------------------------------------
	// Private non-reactive animation/drag state (NOT $state — Pitfall 2)
	// ---------------------------------------------------------------------------

	/** Current RAF handle — null when no animation running */
	#rafId: number | null = null;

	/** True between pointerdown and pointerup */
	#isDragging = false;

	/** The offset value when the current drag began */
	#dragStartOffset = 0;

	/** clientY at the start of the current drag (used for direct delta) */
	#dragStartY = 0;

	/** Recent pointer positions for velocity calculation: [clientY, timestamp][] */
	#yList: Array<[number, number]> = [];

	/** Timestamp of the last wheel event (100ms debounce guard) */
	#lastWheelTime = -Infinity;

	/** True while a snap or inertia animation is running */
	#animating = false;

	// ---------------------------------------------------------------------------
	// Constructor
	// ---------------------------------------------------------------------------

	constructor(opts: {
		itemHeight?: number;
		visibleCount?: number;
		dragSensitivity?: number;
		scrollSensitivity?: number;
		options: WheelPickerOption[];
		initialIndex: number;
		onSnap: (index: number) => void;
	}) {
		this.#itemHeight = opts.itemHeight ?? DEFAULT_ITEM_HEIGHT;
		this.#visibleCount = opts.visibleCount ?? DEFAULT_VISIBLE_COUNT;
		this.#dragSensitivity = opts.dragSensitivity ?? DEFAULT_DRAG_SENSITIVITY;
		this.#scrollSensitivity = opts.scrollSensitivity ?? DEFAULT_SCROLL_SENSITIVITY;
		this.#options = opts.options;
		this.#onSnap = opts.onSnap;

		this.offset = indexToOffset(opts.initialIndex, this.#itemHeight, this.#visibleCount);
	}

	// ---------------------------------------------------------------------------
	// Configuration update (called when props change in parent component)
	// ---------------------------------------------------------------------------

	/**
	 * Update configuration when parent props change.
	 * This does NOT re-trigger animation — it takes effect on the next interaction.
	 */
	update(opts: {
		itemHeight?: number;
		visibleCount?: number;
		dragSensitivity?: number;
		scrollSensitivity?: number;
		options?: WheelPickerOption[];
		onSnap?: (index: number) => void;
	}): void {
		if (opts.itemHeight !== undefined) this.#itemHeight = opts.itemHeight;
		if (opts.visibleCount !== undefined) this.#visibleCount = opts.visibleCount;
		if (opts.dragSensitivity !== undefined) this.#dragSensitivity = opts.dragSensitivity;
		if (opts.scrollSensitivity !== undefined) this.#scrollSensitivity = opts.scrollSensitivity;
		if (opts.options !== undefined) this.#options = opts.options;
		if (opts.onSnap !== undefined) this.#onSnap = opts.onSnap;
	}

	// ---------------------------------------------------------------------------
	// Drag handlers (pointer events)
	// ---------------------------------------------------------------------------

	/**
	 * Called on pointerdown. Cancels any running animation and begins tracking.
	 */
	startDrag(clientY: number): void {
		this.#cancelRaf();
		this.#isDragging = true;
		this.#animating = false;
		this.#dragStartOffset = this.offset;
		this.#dragStartY = clientY;
		this.#yList = [[clientY, performance.now()]];
	}

	/**
	 * Called on pointermove. Updates offset applying boundary resistance at ends.
	 */
	moveDrag(clientY: number): void {
		if (!this.#isDragging) return;

		const delta = clientY - this.#dragStartY;
		const maxOffset = indexToOffset(0, this.#itemHeight, this.#visibleCount);
		const minOffset = indexToOffset(
			this.#options.length - 1,
			this.#itemHeight,
			this.#visibleCount
		);

		let newOffset = this.#dragStartOffset + delta;

		// Apply rubber-band resistance at boundaries
		if (newOffset > maxOffset) {
			newOffset = maxOffset + (newOffset - maxOffset) * RESISTANCE;
		} else if (newOffset < minOffset) {
			newOffset = minOffset + (newOffset - minOffset) * RESISTANCE;
		}

		this.offset = newOffset;

		// Track last 5 pointer positions for velocity calculation
		this.#yList.push([clientY, performance.now()]);
		if (this.#yList.length > 5) {
			this.#yList.shift();
		}
	}

	/**
	 * Called on pointerup. Computes velocity and kicks off inertia or direct snap.
	 */
	endDrag(): void {
		if (!this.#isDragging) return;
		this.#isDragging = false;

		const velocity = calculateVelocity(this.#yList, this.#itemHeight);
		const currentIndex = clampIndex(
			offsetToIndex(this.offset, this.#itemHeight, this.#visibleCount),
			this.#options.length
		);

		if (Math.abs(velocity) < 0.5) {
			// Slow release — snap directly to nearest enabled option
			const snapIndex = snapToNearestEnabled(currentIndex, this.#options);
			this.animateTo(snapIndex);
		} else {
			// Inertia — compute overshoot target
			const rawTarget = computeSnapTarget(currentIndex, velocity, this.#dragSensitivity);
			const clamped = clampIndex(rawTarget, this.#options.length);
			const snapIndex = snapToNearestEnabled(clamped, this.#options);
			this.animateTo(snapIndex);
		}
	}

	// ---------------------------------------------------------------------------
	// Wheel event handler
	// ---------------------------------------------------------------------------

	/**
	 * Called on wheel event. Debounced at 100ms to prevent rapid-fire scroll events.
	 *
	 * deltaY > 0: scroll down → move to next item (higher index)
	 * deltaY < 0: scroll up → move to previous item (lower index)
	 */
	handleWheel(deltaY: number): void {
		const now = performance.now();
		if (now - this.#lastWheelTime < 100) return;
		this.#lastWheelTime = now;

		const currentIndex = clampIndex(
			offsetToIndex(this.offset, this.#itemHeight, this.#visibleCount),
			this.#options.length
		);

		// deltaY > 0 = scroll down = move to next item (increment index)
		const direction = deltaY > 0 ? 1 : -1;
		const targetIndex = clampIndex(currentIndex + direction, this.#options.length);
		const snapIndex = snapToNearestEnabled(targetIndex, this.#options);

		this.animateTo(snapIndex);
	}

	// ---------------------------------------------------------------------------
	// Animation
	// ---------------------------------------------------------------------------

	/**
	 * Animates the offset to the position corresponding to targetIndex.
	 * Uses easeOutCubic easing. Calls onSnap when complete.
	 *
	 * Cancels any currently running animation before starting.
	 */
	animateTo(targetIndex: number): void {
		this.#cancelRaf();
		this.#animating = true;

		const startOffset = this.offset;
		const targetOffset = indexToOffset(targetIndex, this.#itemHeight, this.#visibleCount);
		const distance = Math.abs(targetIndex - offsetToIndex(startOffset, this.#itemHeight, this.#visibleCount));
		const durationSec = computeAnimationDuration(distance, this.#scrollSensitivity);
		const durationMs = durationSec * 1000;

		const startTime = performance.now();

		const tick = (now: number): void => {
			if (!this.#animating) return;

			const elapsed = now - startTime;
			const progress = Math.min(elapsed / durationMs, 1);
			const eased = easeOutCubic(progress);

			this.offset = startOffset + (targetOffset - startOffset) * eased;

			if (progress < 1) {
				this.#rafId = requestAnimationFrame(tick);
			} else {
				// Snap to exact target to avoid float accumulation
				this.offset = targetOffset;
				this.#rafId = null;
				this.#animating = false;
				this.#onSnap(targetIndex);
			}
		};

		this.#rafId = requestAnimationFrame(tick);
	}

	/**
	 * Immediately sets the offset to the position for the given index, no animation.
	 * Used for initial render and controlled value updates.
	 */
	jumpTo(index: number): void {
		this.#cancelRaf();
		this.offset = indexToOffset(index, this.#itemHeight, this.#visibleCount);
	}

	/**
	 * Cancels any in-progress animation.
	 */
	cancelAnimation(): void {
		this.#cancelRaf();
	}

	/**
	 * Cleans up RAF on component destroy.
	 */
	destroy(): void {
		this.cancelAnimation();
	}

	// ---------------------------------------------------------------------------
	// Private helpers
	// ---------------------------------------------------------------------------

	#cancelRaf(): void {
		if (this.#rafId !== null) {
			cancelAnimationFrame(this.#rafId);
			this.#rafId = null;
		}
		this.#animating = false;
	}
}

// Unused export to prevent unused import warnings
void SNAP_BACK_DECELERATION;
