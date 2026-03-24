# Phase 4: Infinite Loop Mode - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 04-infinite-loop-mode
**Areas discussed:** Ghost item strategy, Offset wrapping behavior, Keyboard & wheel wrapping, Boundary resistance / prop flow

---

## Ghost Item Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| 3x duplication (Recommended) | Render options array 3 times (ghosts above + real + ghosts below). Simple, matches React approach. | ✓ |
| Dynamic buffer | Only render visibleCount + small buffer of ghost items. Reposition as user scrolls. More complex but minimal DOM. | |
| You decide | Let Claude choose based on React source analysis. | |

**User's choice:** 3x duplication
**Notes:** None — straightforward pick matching React version approach.

---

## Offset Wrapping Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| On snap settle (Recommended) | After inertia/snap completes, silently reset offset to canonical range. No visual glitch since it happens at rest. | ✓ |
| Continuous modulo | Wrap offset every frame during drag/animation. Prevents drift but adds modulo math to hot RAF loop. | |
| You decide | Let Claude choose based on React source behavior. | |

**User's choice:** On snap settle
**Notes:** None.

---

## Keyboard & Wheel Wrapping

| Option | Description | Selected |
|--------|-------------|----------|
| Animate forward 1 step (Recommended) | ArrowDown on last item animates 1 step to ghost copy of first item, then offset resets. Continuous scrolling feel. | ✓ |
| Jump directly | Instantly jump to first/last item. Simpler but breaks infinite illusion. | |
| You decide | Let Claude choose based on React version behavior. | |

**User's choice:** Animate forward 1 step
**Notes:** None.

---

## Prop Flow Through Physics

| Option | Description | Selected |
|--------|-------------|----------|
| WheelPhysics flag (Recommended) | Add `infinite` boolean to WheelPhysics config. Methods branch internally: wrapIndex vs clampIndex, skip boundary resistance. | ✓ |
| Separate InfiniteWheelPhysics class | Subclass or separate class overriding boundary behavior. Cleaner separation but more code duplication. | |
| You decide | Let Claude choose the architecture. | |

**User's choice:** WheelPhysics flag
**Notes:** None.

---

## Claude's Discretion

- Exact 3x duplication template strategy (single array vs three `{#each}` loops)
- Ghost item interaction with `selectedIndex`
- `wrapIndex` implementation details
- Offset normalization math
- Typeahead behavior in infinite mode

## Deferred Ideas

None — discussion stayed within phase scope.
