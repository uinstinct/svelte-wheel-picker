# Phase 3: WheelPicker Core - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-23
**Phase:** 03-wheelpicker-core
**Areas discussed:** Scrolling mechanism, Data attribute prefix, Mid-flight value update, visibleCount constraints

---

## Scrolling Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| JS-driven translateY + RAF | Pointer/touch events update JS offset, RAF drives CSS transform. Full inertia control, exact React clone approach. | ✓ |
| CSS scroll snap + JS overlay | Native overflow scroll with scroll-snap-type. Simpler but inertia feel is browser-dependent. | |
| Hybrid: CSS snap for mobile, JS for desktop | Touch uses native scroll snap, mouse uses JS-driven. Two interaction models to maintain. | |

**User's choice:** JS-driven translateY + RAF
**Notes:** None — clear preference for exact React clone approach.

---

## Physics Constants

| Option | Description | Selected |
|--------|-------------|----------|
| Copy React source exactly | Read React version's constants and duplicate them. Guarantees identical feel. | ✓ |
| Implement from scratch | Write own physics loop. May feel slightly different from React version. | |
| Copy React, expose as configurable props | Start with React constants but expose friction/velocity as advanced props. | |

**User's choice:** Copy React source exactly
**Notes:** Goal is UX parity — identical feel to the React version.

---

## Data Attribute Prefix

| Option | Description | Selected |
|--------|-------------|----------|
| data-swp-* | Svelte Wheel Picker prefix. Distinct from React version. | ✓ |
| data-rwp-* | Same prefix as React version. CSS-portable but implies React compatibility. | |
| data-wheel-picker-* | Generic, framework-agnostic. Verbose. | |

**User's choice:** data-swp-*
**Notes:** Deliberately different from React's data-rwp-*.

---

## State Data Attributes

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, state attributes too | data-swp-disabled, data-swp-selected for pure-CSS consumer styling. | ✓ |
| Structural attributes only | Only structural elements get data-swp-* attributes. | |

**User's choice:** Yes, state attributes too
**Notes:** Enables pure-CSS consumer styling of all states.

---

## Mid-Flight Value Update

| Option | Description | Selected |
|--------|-------------|----------|
| Cancel inertia, snap to new value immediately | External value always wins. Inertia cancelled, wheel animates to new position. | ✓ |
| Let inertia complete, then reconcile | Current animation finishes, then wheel snaps to new value if it differs. | |
| Ignore prop update until wheel is idle | Queue the value, apply it when wheel comes to rest. | |

**User's choice:** Cancel inertia, snap to new value immediately
**Notes:** Matches iOS UIPickerView semantics. Controlled mode is authoritative.

---

## visibleCount Constraints

| Option | Description | Selected |
|--------|-------------|----------|
| Enforce odd — warning if even | console.warn and round up to nearest odd if even value passed. | ✓ |
| Any number, center defined by Math.floor | Allow any visibleCount, use Math.floor(visibleCount / 2) as center index. | |
| Silently clamp to nearest odd | Accept any value, silently use nearest odd. No warning. | |

**User's choice:** Enforce odd — warning if even
**Notes:** Default is 5 (matching React version).

---

## visibleCount Default

| Option | Description | Selected |
|--------|-------------|----------|
| 5 | Matches React version default. Shows 2 items above and below selection. | ✓ |
| 3 | Minimal — one above, selection, one below. | |
| 7 | Wider view — three above and below. | |

**User's choice:** 5
**Notes:** Matches React version exactly.

---

## Claude's Discretion

- Exact RAF loop implementation and $state integration with animation frame callbacks
- Cancellation mechanism for in-progress RAF loops
- Whether useControllableState is called directly in WheelPicker.svelte or wrapped
- Selection overlay DOM placement
- Exact snap animation curve (linear vs. ease-out) — use React source as reference
- Test strategy for inertia

## Deferred Ideas

None — discussion stayed within phase scope
