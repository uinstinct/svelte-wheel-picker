# Phase 5: WheelPickerWrapper and Package - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 05-WheelPickerWrapper and Package
**Areas discussed:** Wrapper component API, Focus management, SSR safety, Package export surface

---

## Wrapper Component API

### Q1: What role should WheelPickerWrapper play?

| Option | Description | Selected |
|--------|-------------|----------|
| Thin layout container | Just a flex-row div with data-swp-group attribute and optional classNames. Children are slotted WheelPicker instances. No shared state. Matches React version. | ✓ |
| Coordinating container | Manages shared state: group-level onValueChange, group-level disabled, shared defaults. More opinionated. | |
| No wrapper component | Skip entirely. Users compose in their own flex container. | |

**User's choice:** Thin layout container
**Notes:** None

### Q2: classNames prop shape?

| Option | Description | Selected |
|--------|-------------|----------|
| classNames object | WheelPickerWrapperClassNames type with `group` field. Consistent with WheelPicker's pattern. | ✓ |
| Simple class string | Just a `class` prop (string). Simpler but breaks pattern. | |
| You decide | Claude picks. | |

**User's choice:** classNames object
**Notes:** None

---

## Focus Management

### Q1: How should Tab/Shift+Tab work between child WheelPickers?

| Option | Description | Selected |
|--------|-------------|----------|
| Native tab order | Each WheelPicker gets tabindex="0". Tab moves naturally in DOM order. Simple and accessible. | ✓ |
| Roving tabindex | WAI-ARIA composite widget pattern. Arrow Left/Right between wheels, Tab exits group. More complex. | |
| You decide | Claude picks. | |

**User's choice:** Native tab order
**Notes:** None

---

## SSR Safety

### Q1: How should the component handle SSR safety?

| Option | Description | Selected |
|--------|-------------|----------|
| onMount + browser checks | All browser APIs only run inside onMount or $effect. Module-level code is pure. Idiomatic Svelte 5. | ✓ |
| Explicit client-only guard | Export docs noting users should wrap in {#if browser}. Simpler internally, worse DX. | |
| You decide | Claude picks. | |

**User's choice:** onMount + browser checks
**Notes:** None

---

## Package Export Surface

### Q1: What should the public package API export?

| Option | Description | Selected |
|--------|-------------|----------|
| Components + types only | WheelPicker, WheelPickerWrapper, all type definitions. Remove hooks and physics defaults from public API. | ✓ |
| Components + types + hooks | Keep current exports and add WheelPickerWrapper. Larger API surface. | |
| You decide | Claude picks based on React version and best practices. | |

**User's choice:** Components + types only
**Notes:** None

---

## Claude's Discretion

- Exact WheelPickerWrapper.svelte template structure
- SSR audit of existing WheelPicker.svelte
- npm pack testing approach
- Internal barrel organization for removed exports

## Deferred Ideas

None — discussion stayed within phase scope
