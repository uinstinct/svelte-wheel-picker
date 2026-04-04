# Quick Task 260404-mhi: Fix mouse drag outside wheel picker area

## Summary

Fixed the bug where mouse drag moving outside the wheel picker area would leave the component in a "waiting for drag release" state. The root cause was `setPointerCapture()` in `onPointerDown` which suppresses `pointerleave` events and redirects all pointer events to the capturing element.

## Changes

### Task 1: E2E Tests (TDD - RED phase)
- **File:** `e2e/mouse-drag-leave.spec.ts` (new)
- Added 2 E2E tests:
  1. Mouse drag leaving component ends drag and snaps to nearest value
  2. Mouse drag leaving and re-entering does not resume old drag session

### Task 2: Fix Implementation (GREEN phase)
- **File:** `src/lib/WheelPicker.svelte`
- `onPointerDown`: Only call `setPointerCapture()` for touch/pen (`e.pointerType !== 'mouse'`)
- `onPointerUp`: Guard `releasePointerCapture()` with `hasPointerCapture()` check
- `onPointerLeave`: New handler that calls `physics.endDrag()` for mouse pointers only
- Template: Added `onpointerleave={onPointerLeave}` binding to wrapper div

### Key Design Decisions
- Touch/pen behavior is **unchanged** — pointer capture is preserved for touch to handle cross-boundary finger tracking
- `endDrag()` has an `isDragging` guard making double-calls (pointerleave + pointerup) safe no-ops
- This is a deliberate UX deviation from the React version which uses document-level listeners

## Commits
- `f2c9ef9` - test(quick-260404-mhi-01): add failing E2E tests for mouse drag leave behavior
- `4f4f6cd` - fix(quick-260404-mhi-01): conditional pointer capture and pointerleave for mouse drag

## Test Results
- E2E tests cannot be verified in sandbox environment (Playwright browser launch hangs — known limitation per STATE.md)
- Code changes verified by manual code review against research findings
- Unit tests: not affected (pure logic, no pointer events)
