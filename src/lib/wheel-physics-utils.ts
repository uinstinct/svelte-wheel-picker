/**
 * Pure physics utility functions for the WheelPicker.
 *
 * All functions here are side-effect-free and do not reference DOM or Svelte
 * reactivity — they can be unit-tested in a plain Node environment.
 *
 * Physics constants are copied from @ncdai/react-wheel-picker v1.2.2 to
 * achieve UX parity with the React version.
 */

// ---------------------------------------------------------------------------
// Physics constants (from React source v1.2.2)
// ---------------------------------------------------------------------------

/** Boundary resistance factor — how much drag is applied when pulling past the ends. */
export const RESISTANCE = 0.3;

/** Maximum scroll velocity in items/second. */
export const MAX_VELOCITY = 30;

/** Default drag sensitivity (pointer drag delta multiplier for inertia). */
export const DEFAULT_DRAG_SENSITIVITY = 3;

/** Default scroll sensitivity (wheel event multiplier for snap animation duration). */
export const DEFAULT_SCROLL_SENSITIVITY = 5;

/** Default height in pixels of each option row. */
export const DEFAULT_ITEM_HEIGHT = 30;

/** Default number of visible option rows. */
export const DEFAULT_VISIBLE_COUNT = 5;

/** Deceleration constant used in snap-back calculations. */
export const SNAP_BACK_DECELERATION = 10;

/** Minimum scaleY for cylindrical mode to prevent items collapsing to zero height. */
export const MIN_CYLINDRICAL_SCALE = 0.1;

// ---------------------------------------------------------------------------
// Pure physics functions
// ---------------------------------------------------------------------------

/**
 * Cubic ease-out easing function.
 * Matches the React version's easing: `Math.pow(p - 1, 3) + 1`
 *
 * @param p - Progress from 0 to 1
 * @returns Eased progress from 0 to 1
 */
export function easeOutCubic(p: number): number {
	return Math.pow(p - 1, 3) + 1;
}

/**
 * Converts a selected option index to a translateY offset value.
 *
 * The center slot is at `Math.floor(visibleCount / 2) * itemHeight`.
 * Index 0 sits at the center slot (largest positive offset).
 *
 * @param index - The option index (0-based)
 * @param itemHeight - Height in pixels of each option row
 * @param visibleCount - Number of visible rows
 * @returns The translateY offset value in pixels
 */
export function indexToOffset(index: number, itemHeight: number, visibleCount: number): number {
	return Math.floor(visibleCount / 2) * itemHeight - index * itemHeight;
}

/**
 * Converts a translateY offset value to the nearest option index.
 * Inverse of `indexToOffset`.
 *
 * @param offset - Current translateY offset in pixels
 * @param itemHeight - Height in pixels of each option row
 * @param visibleCount - Number of visible rows
 * @returns The nearest option index
 */
export function offsetToIndex(offset: number, itemHeight: number, visibleCount: number): number {
	return Math.round((Math.floor(visibleCount / 2) * itemHeight - offset) / itemHeight);
}

/**
 * Clamps an index to the valid range [0, optionsLength - 1].
 *
 * @param index - The index to clamp
 * @param optionsLength - Total number of options
 * @returns The clamped index
 */
export function clampIndex(index: number, optionsLength: number): number {
	return Math.max(0, Math.min(index, optionsLength - 1));
}

/**
 * Wraps an index into the valid range [0, optionsLength) using modulo.
 * Handles negative indices correctly (JavaScript modulo returns negative for negative inputs).
 *
 * Formula from @ncdai/react-wheel-picker v1.2.2: ((index % n) + n) % n
 *
 * @param index - The index to wrap (may be negative or >= optionsLength)
 * @param optionsLength - Total number of options
 * @returns The wrapped index in [0, optionsLength - 1]
 */
export function wrapIndex(index: number, optionsLength: number): number {
	return ((index % optionsLength) + optionsLength) % optionsLength;
}

/**
 * Finds the nearest enabled option from a target index.
 *
 * Walks outward in both directions (lower-delta first), returning the nearest
 * enabled option. If all options are disabled, returns the original targetIndex.
 *
 * @param targetIndex - The desired index
 * @param options - Array of options (only `disabled` field is used)
 * @returns The nearest enabled index
 */
export function snapToNearestEnabled(
	targetIndex: number,
	options: Array<{ disabled?: boolean }>
): number {
	if (!options[targetIndex]?.disabled) {
		return targetIndex;
	}

	// Walk outward from targetIndex to find the nearest enabled option
	for (let delta = 1; delta < options.length; delta++) {
		const lower = targetIndex - delta;
		const upper = targetIndex + delta;

		if (lower >= 0 && !options[lower]?.disabled) {
			return lower;
		}
		if (upper < options.length && !options[upper]?.disabled) {
			return upper;
		}
	}

	// All options are disabled — return original target
	return targetIndex;
}

/**
 * Calculates the scroll velocity from recent pointer positions.
 *
 * Uses the last two entries in yList to compute items/second.
 * Result is clamped to [-MAX_VELOCITY, MAX_VELOCITY].
 *
 * @param yList - Array of [clientY, timestamp] tuples (newest last)
 * @param itemHeight - Height in pixels of each option row
 * @returns Velocity in items/second (positive = scrolling down)
 */
export function calculateVelocity(yList: Array<[number, number]>, itemHeight: number): number {
	if (yList.length < 2) {
		return 0;
	}

	const [y1, t1] = yList[yList.length - 2];
	const [y2, t2] = yList[yList.length - 1];

	if (t2 === t1) {
		return 0;
	}

	const velocity = ((y2 - y1) / itemHeight) * (1000 / (t2 - t1));
	const clamped = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity));
	return clamped;
}

/**
 * Computes the inertia overshoot snap target index.
 *
 * Based on: `baseDeceleration = dragSensitivity * 10`,
 * `overshoot = 0.5 * v^2 / baseDeceleration`,
 * `rawTarget = currentIndex + sign(v) * overshoot`
 *
 * @param currentIndexFromOffset - The index at current offset
 * @param velocity - Current velocity in items/second
 * @param dragSensitivity - Drag sensitivity (affects deceleration)
 * @returns The rounded target index after inertia overshoot
 */
export function computeSnapTarget(
	currentIndexFromOffset: number,
	velocity: number,
	dragSensitivity: number
): number {
	const baseDeceleration = dragSensitivity * 10;
	const overshoot = (0.5 * velocity * velocity) / baseDeceleration;
	// Velocity sign is inverted relative to index direction:
	// drag down (positive velocity) increases offset → decreases index → overshoot toward lower index.
	const rawTarget = currentIndexFromOffset - Math.sign(velocity) * overshoot;
	return Math.round(rawTarget);
}

/**
 * Computes the duration of a snap animation in seconds.
 *
 * When `velocity` is provided and |velocity| >= 0.5 (inertia flick), uses the
 * kinematic formula: `|velocity| / (scrollSensitivity * 6)`, clamped to [0.1, 1.2].
 * This matches the React reference's velocity-based duration model, producing
 * natural deceleration where faster flicks get proportionally longer animations.
 *
 * When `velocity` is undefined or < 0.5 (keyboard, wheel, slow release), falls
 * back to the distance-based formula: `Math.sqrt(|distance| / scrollSensitivity)`,
 * clamped to [0.1, 0.6] — unchanged from the original implementation.
 *
 * @param distance - Distance in index steps to travel
 * @param scrollSensitivity - Scroll sensitivity (affects duration)
 * @param velocity - Optional scroll velocity in items/second (from inertia flick)
 * @returns Animation duration in seconds
 */
export function computeAnimationDuration(
	distance: number,
	scrollSensitivity: number,
	velocity?: number
): number {
	if (velocity !== undefined && Math.abs(velocity) >= 0.5) {
		// Velocity-based duration: time proportional to flick speed.
		// deceleration = scrollSensitivity * 6 produces duration=1.0s at v=30
		// (MAX_VELOCITY) with scrollSensitivity=5, a reasonable maximum.
		const deceleration = scrollSensitivity * 6;
		const raw = Math.abs(velocity) / deceleration;
		return Math.max(0.1, Math.min(1.2, raw));
	}
	// Distance-based fallback (keyboard, wheel events, slow releases)
	const raw = Math.sqrt(Math.abs(distance) / scrollSensitivity);
	return Math.max(0.1, Math.min(0.6, raw));
}

/**
 * Computes per-item scaleY (and opacity) for cylindrical drum mode.
 *
 * Derived from the cosine projection of a virtual cylinder: an item at angle
 * theta from front-face has projected height cos(theta) * fullHeight.
 * Maps floor(visibleCount/2) slots from center to PI/2, auto-scaling with visibleCount.
 *
 * slotIndex assignments:
 *   - Non-infinite real item i:    slotIndex = i
 *   - Infinite before-ghost g:     slotIndex = g - options.length
 *   - Infinite after-ghost j:      slotIndex = options.length + j
 *
 * @param slotIndex - The item's position in the combined DOM list
 * @param offset    - Current physics.offset (translateY px)
 * @param itemHeight - Height of each option row in pixels
 * @param visibleCount - Number of visible rows (must be odd)
 * @returns scaleY in range [MIN_CYLINDRICAL_SCALE, 1.0]
 */
export function cylindricalScaleY(
	slotIndex: number,
	offset: number,
	itemHeight: number,
	visibleCount: number
): number {
	const dist = slotIndex + offset / itemHeight - Math.floor(visibleCount / 2);
	const angle = (dist * Math.PI) / visibleCount;
	return Math.max(MIN_CYLINDRICAL_SCALE, Math.cos(angle));
}
