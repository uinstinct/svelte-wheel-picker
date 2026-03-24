import { describe, it, expect } from 'vitest';
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
	MAX_VELOCITY,
	RESISTANCE,
	DEFAULT_DRAG_SENSITIVITY,
	DEFAULT_SCROLL_SENSITIVITY,
	DEFAULT_ITEM_HEIGHT,
	DEFAULT_VISIBLE_COUNT,
	SNAP_BACK_DECELERATION,
} from './wheel-physics-utils.js';

describe('easeOutCubic', () => {
	it('easeOutCubic(0) === 0', () => {
		expect(easeOutCubic(0)).toBe(0);
	});

	it('easeOutCubic(1) === 1', () => {
		expect(easeOutCubic(1)).toBe(1);
	});

	it('easeOutCubic(0.5) is approximately 0.875', () => {
		expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 5);
	});

	it('easeOutCubic(0.25) is between 0 and 1', () => {
		const result = easeOutCubic(0.25);
		expect(result).toBeGreaterThan(0);
		expect(result).toBeLessThan(1);
	});
});

describe('indexToOffset', () => {
	it('indexToOffset(0, 40, 5) === 80 (center slot = floor(5/2)*40 = 80)', () => {
		expect(indexToOffset(0, 40, 5)).toBe(80);
	});

	it('indexToOffset(2, 40, 5) === 0 (index 2 centered: 80 - 2*40 = 0)', () => {
		expect(indexToOffset(2, 40, 5)).toBe(0);
	});

	it('indexToOffset(0, 30, 5) === 60 (center slot = floor(5/2)*30 = 60)', () => {
		expect(indexToOffset(0, 30, 5)).toBe(60);
	});

	it('indexToOffset(1, 30, 5) === 30', () => {
		expect(indexToOffset(1, 30, 5)).toBe(30);
	});
});

describe('offsetToIndex', () => {
	it('offsetToIndex(80, 40, 5) === 0', () => {
		expect(offsetToIndex(80, 40, 5)).toBe(0);
	});

	it('offsetToIndex(0, 40, 5) === 2', () => {
		expect(offsetToIndex(0, 40, 5)).toBe(2);
	});

	it('offsetToIndex(-40, 40, 5) === 3', () => {
		expect(offsetToIndex(-40, 40, 5)).toBe(3);
	});

	it('offsetToIndex rounds to nearest integer', () => {
		// Midway between index 1 and 2 (offset 50 for itemHeight=40, visibleCount=5)
		// center = 80, index = (80 - 50) / 40 = 30/40 = 0.75 → rounds to 1
		expect(offsetToIndex(50, 40, 5)).toBe(1);
	});

	it('indexToOffset and offsetToIndex are inverses', () => {
		expect(offsetToIndex(indexToOffset(3, 30, 5), 30, 5)).toBe(3);
		expect(offsetToIndex(indexToOffset(0, 30, 7), 30, 7)).toBe(0);
	});
});

describe('clampIndex', () => {
	it('clamps below 0 to 0', () => {
		expect(clampIndex(-1, 5)).toBe(0);
	});

	it('clamps above length-1 to length-1', () => {
		expect(clampIndex(10, 5)).toBe(4);
	});

	it('returns valid index unchanged', () => {
		expect(clampIndex(2, 5)).toBe(2);
	});

	it('handles length 1', () => {
		expect(clampIndex(0, 1)).toBe(0);
		expect(clampIndex(5, 1)).toBe(0);
	});
});

describe('wrapIndex', () => {
	it('wrapIndex(0, 5) returns 0 (identity)', () => {
		expect(wrapIndex(0, 5)).toBe(0);
	});

	it('wrapIndex(4, 5) returns 4 (identity at boundary)', () => {
		expect(wrapIndex(4, 5)).toBe(4);
	});

	it('wrapIndex(5, 5) returns 0 (wraps forward one cycle)', () => {
		expect(wrapIndex(5, 5)).toBe(0);
	});

	it('wrapIndex(-1, 5) returns 4 (wraps backward one step)', () => {
		expect(wrapIndex(-1, 5)).toBe(4);
	});

	it('wrapIndex(-6, 5) returns 4 (wraps backward multiple cycles)', () => {
		expect(wrapIndex(-6, 5)).toBe(4);
	});

	it('wrapIndex(10, 5) returns 0 (wraps forward multiple cycles)', () => {
		expect(wrapIndex(10, 5)).toBe(0);
	});

	it('wrapIndex(0, 1) returns 0 (single-item list)', () => {
		expect(wrapIndex(0, 1)).toBe(0);
	});

	it('wrapIndex(3, 1) returns 0 (single-item list, forward wrap)', () => {
		expect(wrapIndex(3, 1)).toBe(0);
	});

	it('wrapIndex(-1, 1) returns 0 (single-item list, backward wrap)', () => {
		expect(wrapIndex(-1, 1)).toBe(0);
	});
});

describe('snapToNearestEnabled', () => {
	it('snapToNearestEnabled(0, [{disabled:false},{disabled:false}]) === 0 (already enabled)', () => {
		const options = [{ disabled: false }, { disabled: false }];
		expect(snapToNearestEnabled(0, options)).toBe(0);
	});

	it('snapToNearestEnabled(2, [{disabled:false},{disabled:true},{disabled:true},{disabled:false}]) === 3 (walks to next enabled)', () => {
		const options = [
			{ disabled: false },
			{ disabled: true },
			{ disabled: true },
			{ disabled: false },
		];
		expect(snapToNearestEnabled(2, options)).toBe(3);
	});

	it('skips to closest enabled option from index 1 when 1 and 2 are disabled', () => {
		const options = [
			{ disabled: false },
			{ disabled: true },
			{ disabled: true },
			{ disabled: false },
		];
		// nearest to 1 is either 0 or 3 — both are distance 1 or 2; 0 is closer
		expect(snapToNearestEnabled(1, options)).toBe(0);
	});

	it('returns targetIndex if all options are disabled', () => {
		const options = [{ disabled: true }, { disabled: true }, { disabled: true }];
		expect(snapToNearestEnabled(1, options)).toBe(1);
	});

	it('handles option without disabled field (treated as enabled)', () => {
		const options = [{ disabled: true }, {}, { disabled: false }] as Array<{
			disabled?: boolean;
		}>;
		expect(snapToNearestEnabled(0, options)).toBe(1);
	});
});

describe('calculateVelocity', () => {
	it('returns 0 if yList has fewer than 2 entries', () => {
		expect(calculateVelocity([], 30)).toBe(0);
		expect(calculateVelocity([[100, 1000]], 30)).toBe(0);
	});

	it('computes items/second from two points', () => {
		// y2=160, y1=100, itemHeight=30, t2=2000, t1=1000
		// velocity = ((160 - 100) / 30) * 1000 / (2000 - 1000) = (2) * 1 = 2
		const yList: Array<[number, number]> = [
			[100, 1000],
			[160, 2000],
		];
		expect(calculateVelocity(yList, 30)).toBeCloseTo(2, 5);
	});

	it('clamps velocity to MAX_VELOCITY', () => {
		// Very fast movement
		const yList: Array<[number, number]> = [
			[0, 1000],
			[10000, 1001],
		];
		expect(calculateVelocity(yList, 30)).toBe(MAX_VELOCITY);
	});

	it('clamps negative velocity to -MAX_VELOCITY', () => {
		const yList: Array<[number, number]> = [
			[10000, 1000],
			[0, 1001],
		];
		expect(calculateVelocity(yList, 30)).toBe(-MAX_VELOCITY);
	});

	it('uses only last two entries in yList', () => {
		// Only last two should matter: [200, 3000] and [260, 4000]
		const yList: Array<[number, number]> = [
			[100, 1000],
			[150, 1500],
			[200, 3000],
			[260, 4000],
		];
		// velocity = ((260 - 200) / 30) * 1000 / (4000 - 3000) = 2 * 1 = 2
		expect(calculateVelocity(yList, 30)).toBeCloseTo(2, 5);
	});
});

describe('computeSnapTarget', () => {
	it('returns current index when velocity is 0', () => {
		expect(computeSnapTarget(3, 0, 3)).toBe(3);
	});

	it('overshoots in the negative direction with positive velocity (drag down = lower index)', () => {
		// Positive velocity = drag down = offset increases = lower index in view.
		// Inertia should carry toward lower indices (negative index direction).
		const target = computeSnapTarget(2, 10, 3);
		expect(target).toBeLessThan(2);
	});

	it('overshoots in the positive direction with negative velocity (drag up = higher index)', () => {
		// Negative velocity = drag up = offset decreases = higher index in view.
		// Inertia should carry toward higher indices (positive index direction).
		const target = computeSnapTarget(2, -10, 3);
		expect(target).toBeGreaterThan(2);
	});
});

describe('computeAnimationDuration', () => {
	it('returns at least 0.1 seconds', () => {
		expect(computeAnimationDuration(0, 5)).toBeGreaterThanOrEqual(0.1);
		expect(computeAnimationDuration(1, 100)).toBeGreaterThanOrEqual(0.1);
	});

	it('returns at most 0.6 seconds', () => {
		expect(computeAnimationDuration(1000000, 1)).toBeLessThanOrEqual(0.6);
	});

	it('larger distance gives longer duration (up to max)', () => {
		const short = computeAnimationDuration(1, 5);
		const long = computeAnimationDuration(100, 5);
		expect(long).toBeGreaterThanOrEqual(short);
	});
});

describe('constants', () => {
	it('MAX_VELOCITY is 30', () => {
		expect(MAX_VELOCITY).toBe(30);
	});

	it('RESISTANCE is 0.3', () => {
		expect(RESISTANCE).toBeCloseTo(0.3, 10);
	});

	it('DEFAULT_DRAG_SENSITIVITY is 3', () => {
		expect(DEFAULT_DRAG_SENSITIVITY).toBe(3);
	});

	it('DEFAULT_SCROLL_SENSITIVITY is 5', () => {
		expect(DEFAULT_SCROLL_SENSITIVITY).toBe(5);
	});

	it('DEFAULT_ITEM_HEIGHT is 30', () => {
		expect(DEFAULT_ITEM_HEIGHT).toBe(30);
	});

	it('DEFAULT_VISIBLE_COUNT is 5', () => {
		expect(DEFAULT_VISIBLE_COUNT).toBe(5);
	});

	it('SNAP_BACK_DECELERATION is 10', () => {
		expect(SNAP_BACK_DECELERATION).toBe(10);
	});
});
