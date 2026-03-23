# Phase 2: Types and Utility Hooks - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-03-23
**Phase:** 02-types-and-utility-hooks
**Mode:** discuss
**Areas discussed:** WheelPickerClassNames shape, Type-ahead cycling, value undefined semantics

## Gray Areas Presented

| Area | Description |
|------|-------------|
| WheelPickerClassNames shape | Which DOM elements get classNames slots — defines Phase 3 API contract |
| Type-ahead cycling | Repeat same key within 500ms: accumulate chars or cycle to next match |
| value undefined semantics | Can value be T \| undefined in controlled mode? |

## Decisions Made

### WheelPickerClassNames shape
- **Options presented:** Match React exactly (root/item/itemText/indicator) | Svelte-idiomatic names (wrapper/option/optionText/selection) | Defer to Phase 3
- **User chose:** Svelte-idiomatic names
- **Reason:** User selected the Svelte-adapted naming

### Type-ahead cycling
- **Options presented:** Cycle to next match (iOS behavior) | Accumulate chars (standard listbox)
- **User chose:** Cycle to next J-match
- **Reason:** Matches native iOS wheel behavior; more intuitive for dense lists with shared prefixes

### value undefined semantics
- **Options presented:** No-selection state (value?: T) | Always requires a value | Switch to uncontrolled
- **User chose:** No-selection state
- **Reason:** Useful for "pick something" prompts; value?: T typing

## No Corrections or Deferred Ideas
