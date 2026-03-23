# Deferred Items — Phase 02

## Out-of-scope issues found during plan 02-03

### Pre-existing tsc error in use-controllable-state.test.ts
- **File:** src/lib/use-controllable-state.test.ts lines 18, 24, 46, 53
- **Error:** `Type '"banana"' is not assignable to type '"apple"'` — TypeScript narrows the type to a literal when initialized with a string literal
- **Cause:** Pre-existing issue from plan 02-02 (parallel execution)
- **Impact:** tsc --noEmit exits with code 2 globally, but all errors are in this file only
- **Resolution:** Plan 02-02 must fix this or the full-suite tsc verification will fail
