---
phase: 07-rotating-drum-cylinder-list-style-picker-with-3d-perspective-items-farther-from-center-appear-smaller-and-compressed-vertically
verified: 2026-03-25T18:06:00Z
status: human_needed
score: 9/10 must-haves verified
re_verification: false
human_verification:
  - test: "Visual quality of cylindrical drum effect"
    expected: "Center item is full-size; items above/below appear progressively compressed vertically and faded; effect animates smoothly as wheel scrolls; no visual artifact at wrap boundaries in infinite mode"
    why_human: "scaleY transform and opacity are applied as inline styles at runtime — programmatic checks confirm they are wired but cannot assess perceptual correctness or smoothness of the animation"
---

# Phase 7: Rotating Drum / Cylinder Picker Verification Report

**Phase Goal:** WheelPicker gains a `cylindrical` boolean prop that applies faux-3D scaleY compression and opacity falloff per item, creating an iOS-native drum illusion without CSS 3D transforms
**Verified:** 2026-03-25T18:06:00Z
**Status:** human_needed (all automated checks passed; visual quality requires human sign-off)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | When `cylindrical={true}`, items farther from center appear vertically compressed and faded | ? NEEDS HUMAN | `style:transform={scale !== undefined ? \`scaleY(${scale})\` : undefined}` and `style:opacity={scale}` wired in all 3 each blocks; `cylindricalScaleY` math verified by 6 unit tests — visual output requires human inspection |
| 2 | When `cylindrical={false}` (default), the wheel renders identically to before this phase | ✓ VERIFIED | `scale = cylindrical ? cylindricalScaleY(...) : undefined` — when `undefined`, Svelte omits `style:transform` and `style:opacity` attributes entirely from DOM; flat mode produces no extra attributes |
| 3 | The cylindrical effect works correctly with infinite mode — ghost items receive the same transforms with visual continuity at wrap boundaries | ✓ VERIFIED | Before-ghost block uses `cylindricalScaleY(g - options.length, ...)`, after-ghost block uses `cylindricalScaleY(options.length + j, ...)`; slot index formulas mirror the `cylindricalScaleY` JSDoc contract; wired in `{#if infinite}` blocks |
| 4 | The demo page shows a "Drum / Cylinder" section demonstrating the effect | ✓ VERIFIED | `src/routes/+page.svelte` line 119–131: `<h2>Drum / Cylinder</h2>`, `cylindrical={true}`, `fruitOptions`, `selectedCylindrical` state, `onValueChange` wired |
| 5 | `data-swp-cylindrical='true'` attribute present on wrapper when cylindrical is enabled | ✓ VERIFIED | `src/lib/WheelPicker.svelte` line 212: `data-swp-cylindrical={cylindrical ? 'true' : undefined}` |

**Score:** 9/10 must-haves verified (truths 2–5 fully verified; truth 1 confirmed wired but visual quality is human-only)

---

## Required Artifacts

### Plan 07-01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/wheel-physics-utils.ts` | `cylindricalScaleY` function + `MIN_CYLINDRICAL_SCALE` constant | ✓ VERIFIED | Lines 36–37 (`MIN_CYLINDRICAL_SCALE = 0.1`) and lines 227–236 (`cylindricalScaleY` function with cosine projection math) |
| `src/lib/wheel-physics-utils.test.ts` | 6 unit tests for `cylindricalScaleY` | ✓ VERIFIED | Lines 296–330: `describe('cylindricalScaleY', ...)` with 6 test cases; all 6 pass in CI |
| `src/lib/types.ts` | `cylindrical?: boolean` on `WheelPickerProps` | ✓ VERIFIED | Line 57–58: `/** Enable rotating drum/cylinder visual style with faux-3D scaleY compression. Default: false. */ cylindrical?: boolean;` |

### Plan 07-02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/WheelPicker.svelte` | `cylindricalScaleY` import, `cylindrical` prop, `data-swp-cylindrical`, transforms in all 3 each blocks | ✓ VERIFIED | Lines 12–13 (import), line 27 (prop), line 212 (data attribute), lines 243–245/268–270/294–296 (3 `{@const scale}` blocks), 3× `style:transform`, 3× `style:opacity` |
| `src/routes/+page.svelte` | "Drum / Cylinder" section with `cylindrical={true}` | ✓ VERIFIED | Lines 38 (`selectedCylindrical` state), 119–131 (demo section) |

---

## Key Link Verification

### Plan 07-01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `wheel-physics-utils.test.ts` | `wheel-physics-utils.ts` | `import { cylindricalScaleY, MIN_CYLINDRICAL_SCALE }` | ✓ WIRED | Line 19–20 of test file: both symbols imported and used in assertions |

### Plan 07-02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `WheelPicker.svelte` | `wheel-physics-utils.ts` | `import { cylindricalScaleY }` | ✓ WIRED | Line 12: `cylindricalScaleY` imported; called 3 times in template |
| `WheelPicker.svelte` | `types.ts` | `WheelPickerProps` includes `cylindrical` | ✓ WIRED | Line 27: `cylindrical = false,` destructured from typed `$props()` |
| `+page.svelte` | `$lib/index.ts` | `WheelPicker` with `cylindrical={true}` | ✓ WIRED | Line 127: `cylindrical={true}` passed to `WheelPicker` component |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `WheelPicker.svelte` | `scale` (per-item) | `cylindricalScaleY(slotIndex, physics.offset, optionItemHeight, visibleCount)` — pure function, derives from reactive `physics.offset` | Yes — `physics.offset` is the live scroll position (`$state`); recalculates every frame | ✓ FLOWING |
| `+page.svelte` | `selectedCylindrical` | `$state('cherry')` initial, updated via `onValueChange={(v) => { selectedCylindrical = v; }}` | Yes — bound to real user interaction | ✓ FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `cylindricalScaleY` center returns 1.0 | Unit test: `cylindricalScaleY(0, 60, 30, 5)` | `1.0` (6 tests pass) | ✓ PASS |
| `MIN_CYLINDRICAL_SCALE` is 0.1 | Unit test: `expect(MIN_CYLINDRICAL_SCALE).toBe(0.1)` | `0.1` | ✓ PASS |
| Clamping at extreme angle | Unit test: `cylindricalScaleY(5, 0, 30, 5)` returns `0.1` | `0.1` (cos(3π/5) ≈ -0.309 clamped) | ✓ PASS |
| Symmetry | Unit test: `cylindricalScaleY(-1, 60, 30, 5) === cylindricalScaleY(1, 60, 30, 5)` | Equal | ✓ PASS |
| TypeScript compiles | `pnpm exec tsc --noEmit` | Exit 0, no output | ✓ PASS |
| All 56 unit tests pass | `pnpm test --project unit -- --run` | 56 passed, 0 failed (1 suite file with no tests is a pre-existing issue) | ✓ PASS |
| Visual drum effect during scroll | `pnpm dev` → browser → scroll drum section | Cannot verify without running browser | ? SKIP |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DRUM-01 | 07-01-PLAN.md | Pure `cylindricalScaleY` function using cosine projection, clamped to `MIN_CYLINDRICAL_SCALE` (0.1) | ✓ SATISFIED | `wheel-physics-utils.ts` lines 227–236; `MIN_CYLINDRICAL_SCALE = 0.1` line 37; 6 unit tests passing |
| DRUM-02 | 07-01-PLAN.md | `cylindrical?: boolean` optional prop on `WheelPickerProps` (default `false`) | ✓ SATISFIED | `types.ts` line 58: `cylindrical?: boolean;` with JSDoc; destructured in `WheelPicker.svelte` line 27 with `= false` default |
| DRUM-03 | 07-02-PLAN.md | All three `{#each}` blocks apply per-item `scaleY` transform and opacity from `cylindricalScaleY` when `cylindrical={true}`; flat mode is byte-for-byte identical to pre-Phase-7 | ✓ SATISFIED | `WheelPicker.svelte`: 3× `{@const scale = cylindrical ? cylindricalScaleY(...) : undefined}`, 3× `style:transform={scale !== undefined ? ...}`, 3× `style:opacity={scale}`; `undefined` path omits attributes |
| DRUM-04 | 07-02-PLAN.md | Demo page "Drum / Cylinder" section with `data-swp-cylindrical` attribute on wrapper | ✓ SATISFIED | `+page.svelte` lines 119–131; `WheelPicker.svelte` line 212: `data-swp-cylindrical={cylindrical ? 'true' : undefined}` |

All 4 phase requirements satisfied. No orphaned requirements detected (REQUIREMENTS.md traceability table maps DRUM-01 through DRUM-04 exclusively to Phase 7).

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/WheelPicker.svelte` | 42–65 | Svelte compiler warning: props captured by value in `WheelPhysics` constructor (10 warnings: `value`, `defaultValue`, `onValueChange`, `optionItemHeight`, `visibleCount`, `dragSensitivity`, `scrollSensitivity`, `options`, `initialIndex`, `infinite`) | ℹ️ Info | Pre-existing issue from Phase 3/4 — not introduced in Phase 7. Does not affect cylindrical feature. The warnings are about how `WheelPhysics` receives initial values; cylindrical-related state (`cylindrical`, `physics.offset`) is correctly reactive in the template. |
| `src/lib/types.test.ts` | — | File has no `describe`/`it` blocks — Vitest reports "No test suite found" | ℹ️ Info | Pre-existing. File contains compile-time type assertions only. Pre-dates Phase 7. Does not block Phase 7 goals. |

No stub patterns, no placeholder implementations, no hardcoded empty data arrays found in Phase 7 files.

---

## Human Verification Required

### 1. Visual quality of cylindrical drum effect

**Test:** Run `pnpm dev`, open `http://localhost:5173`, scroll to the "Drum / Cylinder" section at the bottom of the page
**Expected:**
- Center item renders at full size (scaleY 1.0, full opacity)
- Items one slot above/below center appear ~80% height (cos(π/5) ≈ 0.809) and proportionally faded
- Items at the edge of the visible area appear very compressed and nearly transparent
- Dragging the wheel produces smooth real-time compression/expansion as items move through the center
- Scrolling back up to "Single Wheel" and "Infinite Loop" shows zero visual change — no transform or opacity applied
- Adding `cylindrical={true}` to the "Infinite Loop" section (optional) shows the effect continues seamlessly through wrap boundaries without jumping

**Why human:** The `style:transform` and `style:opacity` attributes are confirmed wired and reactive. The mathematical correctness of `cylindricalScaleY` is unit-tested. However, the perceptual quality of the 3D drum illusion — whether it actually looks like a cylinder rotating, whether the compression gradient feels smooth and natural — requires a human to assess in a browser viewport. Playwright cannot evaluate visual aesthetics.

---

## Gaps Summary

No functional gaps detected. All artifacts exist, are substantive, and are correctly wired. All 4 requirements (DRUM-01 through DRUM-04) are satisfied. The single item requiring human verification is the perceptual quality of the visual effect — the code is complete and correct.

The pre-existing Svelte compiler warnings about prop capture in `WheelPhysics` constructor and the `types.test.ts` "no test suite" issue both predate Phase 7 and are out of scope.

---

_Verified: 2026-03-25T18:06:00Z_
_Verifier: Claude (gsd-verifier)_
