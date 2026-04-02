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
	wrapIndex,
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
	#infinite: boolean;

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
		infinite?: boolean;
		options: WheelPickerOption[];
		initialIndex: number;
		onSnap: (index: number) => void;
	}) {
		this.#itemHeight = opts.itemHeight ?? DEFAULT_ITEM_HEIGHT;
		this.#visibleCount = opts.visibleCount ?? DEFAULT_VISIBLE_COUNT;
		this.#dragSensitivity = opts.dragSensitivity ?? DEFAULT_DRAG_SENSITIVITY;
		this.#scrollSensitivity = opts.scrollSensitivity ?? DEFAULT_SCROLL_SENSITIVITY;
		this.#infinite = opts.infinite ?? false;
		this.#options = opts.options;
		this.#onSnap = opts.onSnap;

		this.offset = this.#indexToOffset(opts.initialIndex);
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
		infinite?: boolean;
		options?: WheelPickerOption[];
		onSnap?: (index: number) => void;
	}): void {
		if (opts.itemHeight !== undefined) this.#itemHeight = opts.itemHeight;
		if (opts.visibleCount !== undefined) this.#visibleCount = opts.visibleCount;
		if (opts.dragSensitivity !== undefined) this.#dragSensitivity = opts.dragSensitivity;
		if (opts.scrollSensitivity !== undefined) this.#scrollSensitivity = opts.scrollSensitivity;
		if (opts.infinite !== undefined) this.#infinite = opts.infinite;
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
		const maxOffset = this.#indexToOffset(0);
		const minOffset = this.#indexToOffset(this.#options.length - 1);

		let newOffset = this.#dragStartOffset + delta;

		if (this.#infinite) {
			// Infinite mode: normalize offset when the drag exceeds the ghost item bounds.
			// The DOM has 3×N items (before-ghosts + real + after-ghosts), covering rawIndex
			// -N..2N-1. When the pointer is captured outside the container, the user can drag
			// past these bounds into empty space. Normalizing by ±N*itemHeight keeps the drag
			// within the populated DOM region and ensures seamless infinite scroll.
			//
			// Applying the same shift to #dragStartOffset keeps future delta computations
			// consistent so the drag feels continuous across the normalization boundary.
			const loopDistance = this.#options.length * this.#itemHeight;
			// After-ghost overflow: newOffset went past the last after-ghost (rawIndex >= 2N)
			const afterGhostEnd = this.#indexToOffset(2 * this.#options.length);
			// Before-ghost overflow: newOffset went past the first before-ghost (rawIndex < -N)
			const beforeGhostEnd = this.#indexToOffset(-this.#options.length - 1);

			while (newOffset < afterGhostEnd) {
				newOffset += loopDistance;
				this.#dragStartOffset += loopDistance;
			}
			while (newOffset > beforeGhostEnd) {
				newOffset -= loopDistance;
				this.#dragStartOffset -= loopDistance;
			}
		} else {
			// Apply rubber-band resistance at boundaries
			if (newOffset > maxOffset) {
				newOffset = maxOffset + (newOffset - maxOffset) * RESISTANCE;
			} else if (newOffset < minOffset) {
				newOffset = minOffset + (newOffset - minOffset) * RESISTANCE;
			}
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
		const rawIndex = this.#offsetToIndex(this.offset);
		const N = this.#options.length;
		const currentIndex = this.#infinite
			? wrapIndex(rawIndex, N)
			: clampIndex(rawIndex, N);

		if (Math.abs(velocity) < 0.5) {
			// Slow release — snap directly to nearest enabled option
			const snapIndex = snapToNearestEnabled(currentIndex, this.#options);
			if (this.#infinite) {
				// Preserve ghost-section context so the snap animation continues in the
				// same direction as the drag rather than jumping backward to real-section.
				// rawIndex is in [-N, 2N-1] (guaranteed by moveDrag normalization).
				// Determine which "loop offset" we are in and apply to snapIndex:
				//   before-ghost (rawIndex < 0): animate to snapIndex - N
				//   after-ghost  (rawIndex >= N): animate to snapIndex + N
				//   real section (rawIndex in [0, N-1]): animate to snapIndex directly
				const loopOffset = rawIndex < 0 ? -N : rawIndex >= N ? N : 0;
				this.animateTo(snapIndex + loopOffset);
			} else {
				this.animateTo(snapIndex);
			}
		} else {
			// Inertia — compute overshoot target
			// Use rawIndex (not currentIndex) so the overshoot accounts for the current
			// ghost-loop position, giving the correct item index after inertia deceleration.
			const rawTarget = computeSnapTarget(rawIndex, velocity, this.#dragSensitivity);
			if (this.#infinite) {
				// snapIndex is the nearest enabled item to the overshoot target (in [0, N-1])
				const wrapped = wrapIndex(rawTarget, N);
				const snapIndex = snapToNearestEnabled(wrapped, this.#options);
				// Animate to the ghost-section position of snapIndex matching the current
				// loop, so the animation moves in the same direction as the drag.
				// snapIndex is in [0,N-1]; loopOffset is -N, 0, or +N based on current section.
				const loopOffset = rawIndex < 0 ? -N : rawIndex >= N ? N : 0;
				this.animateTo(snapIndex + loopOffset, velocity);
			} else {
				const clamped = clampIndex(rawTarget, N);
				const snapIndex = snapToNearestEnabled(clamped, this.#options);
				this.animateTo(snapIndex, velocity);
			}
		}
	}

	// ---------------------------------------------------------------------------
	// Wheel event handler
	// ---------------------------------------------------------------------------

	/**
	 * Called on wheel event. Moves proportionally to deltaY magnitude.
	 *
	 * deltaY > 0: scroll down → move to next item(s) (higher index)
	 * deltaY < 0: scroll up → move to previous item(s) (lower index)
	 *
	 * A typical mouse wheel notch sends deltaY ~100-150px. Dividing by itemHeight
	 * gives a proportional item count, so scrolling feels natural and fast.
	 * The in-flight animation is cancelled before computing the new target so
	 * rapid wheel events feel snappy (each event immediately updates the target).
	 */
	handleWheel(deltaY: number): void {
		// Cancel any in-flight animation so rapid scrolling feels immediate
		this.#cancelRaf();

		// Calculate number of items to move based on deltaY magnitude.
		// A typical mouse wheel notch sends deltaY ~100-150px.
		// Divide by itemHeight to get proportional item count, minimum 1.
		const itemsToMove = Math.max(1, Math.round(Math.abs(deltaY) / this.#itemHeight));
		const direction = deltaY > 0 ? 1 : -1;
		const steps = itemsToMove * direction;

		const rawIndex = this.#offsetToIndex(this.offset);
		const N = this.#options.length;
		const currentIndex = this.#infinite ? wrapIndex(rawIndex, N) : clampIndex(rawIndex, N);

		if (this.#infinite) {
			const next = currentIndex + steps;
			const wrapped = wrapIndex(next, N);
			const snapIndex = snapToNearestEnabled(wrapped, this.#options);
			this.animateTo(snapIndex);
		} else {
			const targetIndex = clampIndex(currentIndex + steps, N);
			const snapIndex = snapToNearestEnabled(targetIndex, this.#options);
			this.animateTo(snapIndex);
		}
	}

	// ---------------------------------------------------------------------------
	// Animation
	// ---------------------------------------------------------------------------

	/**
	 * Animates the offset to the position corresponding to targetIndex.
	 * Uses easeOutCubic easing. Calls onSnap when complete.
	 *
	 * When `velocity` is provided (inertia flick), duration is computed from
	 * velocity for natural deceleration proportional to flick speed. Without
	 * velocity (keyboard, wheel, slow release), duration is distance-based.
	 *
	 * Cancels any currently running animation before starting.
	 */
	animateTo(targetIndex: number, velocity?: number): void {
		this.#cancelRaf();
		this.#animating = true;

		const startOffset = this.offset;
		const targetOffset = this.#indexToOffset(targetIndex);
		const distance = Math.abs(targetIndex - this.#offsetToIndex(startOffset));
		const durationSec = computeAnimationDuration(distance, this.#scrollSensitivity, velocity);
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
	 * Returns the option index that the current offset visually corresponds to.
	 * Used to guard against redundant animations when the wheel is already positioned correctly.
	 */
	get currentIndex(): number {
		const raw = this.#offsetToIndex(this.offset);
		return this.#infinite
			? wrapIndex(raw, this.#options.length)
			: clampIndex(raw, this.#options.length);
	}

	/**
	 * Immediately sets the offset to the position for the given index, no animation.
	 * Used for initial render and controlled value updates.
	 */
	jumpTo(index: number): void {
		this.#cancelRaf();
		this.offset = this.#indexToOffset(index);
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

	/**
	 * Converts an option index to a translateY offset, accounting for before-ghost
	 * rows prepended to the DOM container in infinite mode.
	 *
	 * In infinite mode the container begins with N = options.length ghost rows, so
	 * real item[i] sits at DOM position (N + i) * itemHeight. The offset must be
	 * shifted by -N * itemHeight relative to the non-infinite formula.
	 */
	#indexToOffset(index: number): number {
		const ghostCount = this.#infinite ? this.#options.length : 0;
		return indexToOffset(index + ghostCount, this.#itemHeight, this.#visibleCount);
	}

	/**
	 * Converts a translateY offset back to an option index, accounting for the
	 * before-ghost prefix in infinite mode (inverse of #indexToOffset).
	 */
	#offsetToIndex(offset: number): number {
		const ghostCount = this.#infinite ? this.#options.length : 0;
		return offsetToIndex(offset, this.#itemHeight, this.#visibleCount) - ghostCount;
	}
}

// Unused export to prevent unused import warnings
void SNAP_BACK_DECELERATION;
