---
phase: 2
slug: types-and-utility-hooks
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.0 (browser mode, Playwright) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test --run` |
| **Full suite command** | `pnpm test --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test --run`
- **After every plan wave:** Run `pnpm test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | COMP-03, COMP-04, DIST-01 | unit (TS compile) | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | DIST-01 | unit (TS compile) | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 2 | MODE-01, MODE-02 | unit | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 2-03-01 | 03 | 2 | INTR-06 | unit (timer) | `pnpm test --run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/types.test.ts` — stubs for COMP-03, COMP-04 (type import/inference checks)
- [ ] `src/lib/use-controllable-state.test.svelte.ts` — stubs for MODE-01, MODE-02
- [ ] `src/lib/use-typeahead-search.test.svelte.ts` — stubs for INTR-06 (with timer)

*Existing vitest + Playwright infrastructure from Phase 1 covers the framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| TypeScript inference on generic `T` shows correct type in IDE | COMP-03 | Type inference is an IDE feature, not runtime-testable | Open `src/routes/+page.svelte`, use `WheelPickerOption<number>` and hover over `value` — should show `number` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
