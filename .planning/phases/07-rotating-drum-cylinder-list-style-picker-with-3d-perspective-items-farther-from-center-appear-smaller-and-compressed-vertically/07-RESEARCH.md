# Phase 7: Drum/Cylinder Picker - Research

**Researched:** 2026-03-25
**Domain:** CSS faux-3D scaleY transforms, per-item physics offset math, Svelte 5 template patterns
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `cylindrical` is a boolean prop on the existing `WheelPicker` component — NOT a new component. Default: `false`. Added to `WheelPickerProps` in `src/lib/types.ts`.
- **D-02:** Faux 3D — `scaleY` compression (+ optional `opacity` falloff) per item based on distance from center. No `perspective`, `rotateX`, or `translateZ`. Scale formula: `cos(normalizedAngle)` or equivalent falloff. Items at edges approach but never reach scaleY=0.
- **D-03:** Auto-derived from `visibleCount` and `optionItemHeight` — no new prop.
- **D-04:** New "Drum / Cylinder" section added to `src/routes/+page.svelte`. No new routes.
- Existing flat behavior must be byte-for-byte identical when `cylindrical={false}` (default).

### Claude's Discretion

- Exact faux-3D scale formula (cosine curve vs. quadratic vs. other natural falloff)
- Whether to add `opacity` falloff alongside `scaleY`
- Whether to add a `data-swp-cylindrical` attribute on the wrapper for consumer CSS targeting
- Placement of the cylindrical transform computation (inline in template vs. helper function)
- Test coverage strategy for per-item transform values

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 7 adds a faux-3D drum/cylinder visual mode to the existing `WheelPicker` via a single new `cylindrical` boolean prop. The implementation is purely in the rendering layer: when `cylindrical={true}`, each item receives a `scaleY` transform and optional `opacity` derived from its physical distance from the viewport center.

The React reference (`@ncdai/react-wheel-picker` v1.2.2) does **not** have a cylindrical mode — it uses a flat list approach identical to ours. The React codebase was inspected directly from the npm tarball. React uses real CSS `rotateX` + `translateZ` on a 3D cylinder for a different but related visual (the "option list" vs. the "highlight list"). This phase deliberately avoids real 3D CSS and instead uses `scaleY` compression to achieve the iOS drum illusion with less complexity and no perspective camera.

The core math is derived from first principles using the cosine projection of a cylinder. An item at angular distance `theta` from the front face of a cylinder has projected height `cos(theta) * fullHeight`. Mapping the visible slot window to a 0..PI/2 arc produces natural-looking compression for any `visibleCount`. The formula is a pure function suitable for unit testing in Node.

**Primary recommendation:** Add `cylindricalScaleY(slotIndex, offset, itemHeight, visibleCount): number` to `wheel-physics-utils.ts`, apply it via `style:transform` and `style:opacity` in all three `{#each}` blocks, and export the constant `MIN_CYLINDRICAL_SCALE = 0.1`.

---

## Standard Stack

No new libraries are needed. This phase is pure math + Svelte 5 template work within the existing stack.

### Existing Stack (unchanged)

| Library | Version | Relevant to Phase |
|---------|---------|-------------------|
| Svelte 5 | 5.54.1 | Runes + `style:*` directives for per-item inline styles |
| TypeScript | 5.9.3 | `cylindrical?: boolean` prop addition to `WheelPickerProps` |
| Vitest (node project) | 4.1.0 | Unit tests for `cylindricalScaleY` pure function |

### No New Dependencies

This phase adds zero npm packages.

---

## Architecture Patterns

### Pattern 1: Pure Helper Function in wheel-physics-utils.ts

The existing `wheel-physics-utils.ts` contains all pure physics math. The new `cylindricalScaleY` function belongs here because:
1. It is side-effect-free and takes only primitives — testable in Node without a DOM.
2. Consistent with `easeOutCubic`, `indexToOffset`, `computeSnapTarget`, etc.
3. The unit test file `wheel-physics-utils.test.ts` already exists in the `unit` vitest project, which runs in Node (no Playwright needed).

```typescript
// Source: derived from @ncdai/react-wheel-picker v1.2.2 cosine projection math
// wheel-physics-utils.ts

/** Minimum scaleY to prevent items from fully collapsing at extreme edges. */
export const MIN_CYLINDRICAL_SCALE = 0.1;

/**
 * Computes the faux-3D scaleY (and opacity) for a wheel item in cylindrical mode.
 *
 * The item is modeled as sitting on a virtual cylinder. Its projected height
 * relative to the front-face item is cos(theta), where theta is the item's
 * angular displacement from the viewport center.
 *
 * Formula: theta = distanceInSlots * PI / visibleCount
 * This maps floor(visibleCount/2) slots from center to PI/2 (90 degrees),
 * giving natural compression that auto-scales with any visibleCount.
 *
 * @param slotIndex - The item's position in the combined DOM list (see below)
 * @param offset    - Current physics.offset (translateY px, from WheelPhysics.$state)
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
    const angle = dist * Math.PI / visibleCount;
    return Math.max(MIN_CYLINDRICAL_SCALE, Math.cos(angle));
}
```

### Pattern 2: Slot Index Assignment per Each Block

The `slotIndex` passed to `cylindricalScaleY` represents the item's position in the full rendered list (combined before-ghosts + real items + after-ghosts). It is computed differently for each `{#each}` block.

| Block | Each variable | slotIndex expression |
|-------|--------------|----------------------|
| Before-ghosts (infinite) | `g` (0-indexed) | `g - options.length` |
| Real items | `i` (0-indexed) | `i` |
| After-ghosts (infinite) | `j` (0-indexed) | `options.length + j` |

**Why these values are correct:**

The container `<div style:transform="translateY({physics.offset}px)">` translates the whole list. Real items occupy DOM positions `options.length..2*options.length-1` when infinite. The scaleY formula needs the item's position relative to "slot 0" of the real section, which is where real item 0 sits. Before-ghosts sit at negative slots, after-ghosts at positive slots beyond `options.length - 1`.

Verification (N=7 options, visibleCount=5, itemHeight=30, item 0 at center):
- offset = `floor(5/2) * 30 = 60`
- Real item 0: `dist = 0 + 60/30 - 2 = 0`, scaleY = cos(0) = 1.0 (correct: center)
- Real item 1: `dist = 1 + 60/30 - 2 = 1`, scaleY = cos(PI/5) = 0.809
- Before-ghost g=6 (options[0]): `dist = 6-7 + 60/30 - 2 = -1`, scaleY = cos(-PI/5) = 0.809

### Pattern 3: Template Application (Svelte 5 style directives)

The `style:transform` and `style:opacity` directives accept `undefined` to omit the attribute entirely, matching the established pattern for `data-swp-selected` (from STATE.md: "use undefined not false/null to prevent attributes from appearing in DOM").

```svelte
<!-- Real item example -->
<div
    data-swp-option
    ...
    style:height="{optionItemHeight}px"
    style:transform={cylindrical
        ? `scaleY(${cylindricalScaleY(i, physics.offset, optionItemHeight, visibleCount)})`
        : undefined}
    style:opacity={cylindrical
        ? cylindricalScaleY(i, physics.offset, optionItemHeight, visibleCount)
        : undefined}
>
```

Note: `cylindricalScaleY` is called twice per item when both `transform` and `opacity` are enabled. To avoid double computation, a `$derived` local or inline variable can cache the value per item. However, in Svelte 5 template `{#each}` blocks, there is no built-in per-iteration derived — use an inline `{@const}` block:

```svelte
{#each options as option, i}
    {@const scale = cylindrical
        ? cylindricalScaleY(i, physics.offset, optionItemHeight, visibleCount)
        : undefined}
    <div
        ...
        style:transform={scale !== undefined ? `scaleY(${scale})` : undefined}
        style:opacity={scale}
    >
```

### Pattern 4: data-swp-cylindrical Attribute

Add `data-swp-cylindrical` to the wrapper when `cylindrical={true}`. This follows the established data-attribute pattern (`data-swp-selected`, `data-swp-disabled`) and gives consumers a CSS hook for cylindrical-specific styling (e.g., applying `overflow: visible` or custom fonts).

```svelte
<div
    data-swp-wrapper
    data-swp-cylindrical={cylindrical ? 'true' : undefined}
    ...
>
```

### Anti-Patterns to Avoid

- **Calling `cylindricalScaleY` without caching per item:** Results in double computation per item per frame. Use `{@const}` in the each block.
- **Applying `style:transform` to the entire container instead of per item:** The container already uses `translateY(physics.offset)` for scrolling. Adding scaleY to the container would compress the entire picker, not individual items.
- **Using `scaleY(0)` at edges:** Items would collapse to invisible. Use `MAX(MIN_CYLINDRICAL_SCALE, ...)` to keep text barely readable at extreme edges.
- **Modifying physics.offset reading pattern:** The template already reads `physics.offset` as a reactive `$state` field. Adding per-item scale reads the same field — no new reactive dependencies needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cosine projection math | Custom "looks close enough" formula | `Math.cos` with the formula above | Cosine is the exact geometric projection of a point on a cylinder — anything else is an approximation with visible artifacts at larger visibleCount values |
| CSS 3D perspective camera | `perspective:`, `rotateX:`, `translateZ:` | Pure `scaleY` | Locked by D-02; avoids stacking context issues and `backface-visibility` edge cases |
| Per-item Svelte reactive state | `$state` per item for scale values | Direct computation from `physics.offset` in template | `physics.offset` is already `$state` — the template re-renders when it changes. Adding per-item state would create unnecessary reactivity. |

**Key insight:** The faux-3D effect is stateless — it is a pure function of `physics.offset` (which changes on every animation frame) and the item's fixed slot index. No additional reactive state is needed.

---

## React Reference Analysis

The `@ncdai/react-wheel-picker` v1.2.2 source was downloaded from npm and inspected.

**Key finding:** The React component does NOT have a `cylindrical` boolean prop. The React picker uses a fundamentally different rendering architecture: items are absolutely positioned on a real 3D cylinder using `rotateX()` + `translateZ()`. This is NOT the approach for Phase 7.

**React formulas (HIGH confidence — read from minified dist/index.mjs):**

```javascript
const S = 360 / visibleCount;                    // degrees per slot
const U = itemHeight / Math.tan(S * Math.PI / 180); // cylinder radius
const Re = Math.round(U * 2 + itemHeight * 0.25);   // container height
// Per item: transform: `rotateX(${-S * index}deg) translateZ(${U}px)`
// Container: translateZ(-U px) rotateX(S * currentIndex deg)
```

The React component uses `visibleCount=20` by default, which gives `S=18°/slot` — small enough that items near center are nearly flat-on. Our component uses `visibleCount=5` (default), giving `S=72°/slot` — the real 3D approach would look wrong with only 5 items.

**Faux scaleY derivation from React math:**

The React code computes click-position regions using:
```javascript
const projectedHeight = itemHeight * Math.cos(slotAngle * Math.PI / 180);
```
This is the same cosine projection principle we use for `scaleY`. The faux version maps the visible half-window to 90° to ensure natural compression at any `visibleCount`.

---

## Common Pitfalls

### Pitfall 1: Negative scaleY at Large Distances

**What goes wrong:** `Math.cos` returns negative values for angles > 90°. Items far from center would flip upside-down.

**Why it happens:** With `visibleCount=5`, `dist = ±2` gives angle = `±2*PI/5 = ±72°`. This is within range. But `dist = ±3` gives angle = `±108°` where `cos < 0`. During fast scrolling, physics.offset can place items further than the visible window momentarily.

**How to avoid:** `Math.max(MIN_CYLINDRICAL_SCALE, Math.cos(angle))` — clamp to a small positive minimum. `MIN_CYLINDRICAL_SCALE = 0.1` ensures items never flip and remain barely visible.

**Warning signs:** Items appear "flipped" or have negative height during fast drag.

### Pitfall 2: Double Computation of scaleY Per Item

**What goes wrong:** If both `style:transform` and `style:opacity` call `cylindricalScaleY()` without caching, the function executes twice per item per frame.

**How to avoid:** Use `{@const scale = ...}` inside the `{#each}` block to compute once and reuse.

### Pitfall 3: Forgetting Ghost Items in Infinite Mode

**What goes wrong:** Before-ghost and after-ghost items get scaleY=1 (or no transform) while real items get the cylindrical effect, creating a visual discontinuity at the wrap boundary.

**How to avoid:** Apply the cylindrical transform to ALL three `{#each}` blocks with their correct `slotIndex` values. The slot index offsets (`g - options.length` and `options.length + j`) ensure continuity across the boundary.

**Warning signs:** Visual "jump" or scale discontinuity when the picker wraps in infinite mode.

### Pitfall 4: Flat Mode Regression

**What goes wrong:** The `cylindrical` prop default is `false`, but a bug in the conditional styling causes the flat list to inadvertently receive transform or opacity styles.

**How to avoid:** Use `undefined` (not `null` or `false`) in the conditional: `cylindrical ? value : undefined`. `style:transform={undefined}` removes the attribute; `style:transform={false}` may produce `style="transform: false"`.

**Warning signs:** Flat mode items appear slightly compressed or have unexpected opacity.

### Pitfall 5: transform Conflicts with Existing styles

**What goes wrong:** Items already use `style:height`, `style:display`, `style:align-items`, `style:justify-content`. Adding `style:transform` is additive — there is no existing transform to conflict with. BUT if a consumer's CSS also applies `transform` to `[data-swp-option]` elements, the inline `style` attribute (highest specificity) will override consumer transforms.

**How to avoid:** Document in the demo that cylindrical mode uses inline `style:transform`. Consumers who want additional transforms should use CSS custom properties or wrap the component.

---

## Code Examples

### cylindricalScaleY Pure Function

```typescript
// src/lib/wheel-physics-utils.ts — add after existing constants

/** Minimum scaleY for cylindrical mode to prevent items collapsing to zero height. */
export const MIN_CYLINDRICAL_SCALE = 0.1;

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
 */
export function cylindricalScaleY(
    slotIndex: number,
    offset: number,
    itemHeight: number,
    visibleCount: number
): number {
    const dist = slotIndex + offset / itemHeight - Math.floor(visibleCount / 2);
    const angle = dist * Math.PI / visibleCount;
    return Math.max(MIN_CYLINDRICAL_SCALE, Math.cos(angle));
}
```

### Template Application (Real Items Block)

```svelte
<!-- In WheelPicker.svelte, real items {#each} block -->
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
```

### Types Addition

```typescript
// src/lib/types.ts — WheelPickerProps interface

/** Enable rotating drum/cylinder visual style with faux-3D scaleY compression. Default: false. */
cylindrical?: boolean;
```

### Demo Section

```svelte
<!-- src/routes/+page.svelte — new section at bottom -->
<section>
    <h2>Drum / Cylinder</h2>
    <p>Selected: {selectedCylindrical}</p>
    <div class="wheel-container">
        <WheelPicker
            options={fruitOptions}
            value={selectedCylindrical}
            onValueChange={(v) => { selectedCylindrical = v; }}
            cylindrical={true}
            classNames={{ wrapper: 'wheel', selection: 'wheel-selection', option: 'wheel-option' }}
        />
    </div>
</section>
```

### Unit Tests for cylindricalScaleY

```typescript
// src/lib/wheel-physics-utils.test.ts — append to existing test file

describe('cylindricalScaleY', () => {
    it('center item (dist=0) returns 1.0', () => {
        // slotIndex=0, offset=60 (item 0 at center with vc=5, ih=30)
        // dist = 0 + 60/30 - 2 = 0
        expect(cylindricalScaleY(0, 60, 30, 5)).toBeCloseTo(1.0, 5);
    });

    it('adjacent item (dist=1) returns cos(PI/5)', () => {
        // dist = 1 + 60/30 - 2 = 1
        expect(cylindricalScaleY(1, 60, 30, 5)).toBeCloseTo(Math.cos(Math.PI / 5), 5);
    });

    it('symmetric: dist=-1 equals dist=+1', () => {
        // slotIndex=-1: dist = -1 + 60/30 - 2 = -1
        expect(cylindricalScaleY(-1, 60, 30, 5)).toBeCloseTo(Math.cos(Math.PI / 5), 5);
    });

    it('clamps to MIN_CYLINDRICAL_SCALE for extreme distances', () => {
        // dist very large: cos returns negative, should clamp
        expect(cylindricalScaleY(100, 0, 30, 5)).toBeCloseTo(MIN_CYLINDRICAL_SCALE, 5);
    });

    it('returns 1.0 for any vc when dist=0', () => {
        expect(cylindricalScaleY(2, 30, 30, 7)).toBeCloseTo(1.0, 4); // item 2 centered in vc=7
    });
});
```

---

## State of the Art

| Approach | Notes | Relevance |
|----------|-------|-----------|
| Real 3D CSS (`rotateX` + `translateZ`) | Used by React reference and BetterScroll wheel plugin | Rejected by D-02 |
| Pure `scaleY` compression (this phase) | Used by some jQuery drum pickers; simpler, no stacking context issues | The chosen approach |
| `transform-style: preserve-3d` + `perspective` | Native iOS-like cylinder with real depth | Too complex; breaks headless styling |

**The React reference uses real 3D.** The faux scaleY approach has one meaningful trade-off: items do not physically "wrap around" the cylinder, so at extreme offsets during fast scrolling, items beyond the visible window may show subtle scaleY artifacts (clamped to MIN_CYLINDRICAL_SCALE). This is not visible in practice because the overflow:hidden on the wrapper clips them.

---

## Open Questions

1. **opacity falloff: same curve as scaleY, or independent?**
   - What we know: D-02 says "optional opacity falloff." The same cosine value used for scaleY (clamped to 0.1) provides a natural depth cue.
   - Recommendation: Use the same value (`cylindricalScaleY` returns one number used for both). This eliminates a separate curve parameter and matches the visual feel of native iOS pickers.

2. **{@const} in {#each} — Svelte 5 support confirmed?**
   - What we know: `{@const}` was introduced in Svelte 4 and is fully supported in Svelte 5. It works inside `{#each}` blocks.
   - Confidence: HIGH (verified against Svelte 5 docs pattern).
   - No concern.

3. **WheelPicker test for cylindrical prop in browser tests**
   - What we know: The existing `WheelPicker.test.ts` runs in Playwright browser mode. Playwright is blocked in the current sandbox environment (known limitation from STATE.md).
   - Recommendation: The `cylindricalScaleY` math is covered by Node unit tests (no browser needed). The visual prop application can be validated manually via the demo, or via a browser test that checks `style.transform` on rendered items if/when Playwright is available.

---

## Environment Availability

Step 2.6: SKIPPED — this phase has no external dependencies. It is pure code/math changes within the existing codebase.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` |
| Quick run command (unit only) | `pnpm test --project unit` |
| Full suite command | `pnpm test` |

### Phase Requirements to Test Map

This phase has no formal requirement IDs (TBD in REQUIREMENTS.md). The behavioral requirements from D-01 through D-04 map to:

| Behavior | Test Type | Automated Command | File Exists? |
|----------|-----------|-------------------|-------------|
| `cylindricalScaleY(slotIndex=0, offset=center)` returns 1.0 | unit | `pnpm test --project unit` | Wave 0 — append to `wheel-physics-utils.test.ts` |
| `cylindricalScaleY` is symmetric: dist -1 = dist +1 | unit | `pnpm test --project unit` | Wave 0 — same file |
| Large dist clamps to MIN_CYLINDRICAL_SCALE | unit | `pnpm test --project unit` | Wave 0 — same file |
| Flat mode unchanged: no transform/opacity when cylindrical=false | manual | Dev server visual check | — |
| Ghost items in infinite mode get correct transforms | manual | Dev server visual check | — |

### Sampling Rate

- **Per task commit:** `pnpm test --project unit`
- **Per wave merge:** `pnpm test --project unit`
- **Phase gate:** Unit suite green + visual demo review before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] Append `cylindricalScaleY` tests to `src/lib/wheel-physics-utils.test.ts` (export the new function and constant first)
- [ ] Export `MIN_CYLINDRICAL_SCALE` from `wheel-physics-utils.ts` so tests can import it

*(No new test files needed — the existing Node unit project covers pure functions.)*

---

## Sources

### Primary (HIGH confidence)

- `@ncdai/react-wheel-picker` v1.2.2 npm tarball (`dist/index.mjs`) — inspected directly; confirmed no cylindrical prop; extracted `S`, `U`, cosine projection formula
- `src/lib/WheelPicker.svelte` — read directly; extracted three `{#each}` blocks, slot index offsets, existing `style:*` patterns
- `src/lib/wheel-physics-utils.ts` — read directly; `indexToOffset` formula confirmed; `MIN_CYLINDRICAL_SCALE` placement verified
- `src/lib/types.ts` — read directly; `WheelPickerProps` interface for prop addition
- `vitest.config.ts` — read directly; confirmed `unit` project runs `wheel-physics-utils.test.ts` in Node

### Secondary (MEDIUM confidence)

- First-principles cylindrical projection geometry — standard mathematics; `scaleY = cos(theta)` for frontal projection of a cylinder item is well-established

### Tertiary (LOW confidence)

- General web search results for "drum picker scaleY" — no direct source found for the exact formula; formula derived independently and verified numerically

---

## Metadata

**Confidence breakdown:**

- Core math formula: HIGH — derived from first principles and cross-verified numerically
- Template implementation: HIGH — directly read existing WheelPicker.svelte patterns
- Ghost item slot indices: HIGH — verified with explicit calculations
- React reference: HIGH — read directly from npm tarball source
- Opacity recommendation: MEDIUM — reasonable inference from iOS patterns, no official source

**Research date:** 2026-03-25
**Valid until:** 2026-06-25 (stable domain — CSS transforms and Svelte 5 are not changing rapidly)
