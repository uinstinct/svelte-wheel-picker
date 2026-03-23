---
phase: 3
slug: wheelpicker-core
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x (browser mode via Playwright) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test --run` |
| **Full suite command** | `pnpm test --run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test --run`
- **After every plan wave:** Run `pnpm test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | COMP-01 | unit | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | STYL-01 | browser | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 3-01-03 | 01 | 1 | STYL-02 | browser | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 3-01-04 | 01 | 1 | STYL-03 | browser | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 3-01-05 | 01 | 1 | STYL-04 | browser | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 2 | INTR-01 | browser | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 3-02-02 | 02 | 2 | INTR-02 | browser | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 3-02-03 | 02 | 2 | INTR-03 | browser | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 3-02-04 | 02 | 2 | INTR-04 | browser | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 3-02-05 | 02 | 2 | INTR-05 | browser | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 3-03-01 | 03 | 3 | MODE-04 | browser | `pnpm test --run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/wheel-physics.test.ts` — pure function tests for snap math, easing, velocity calc (INTR-01, INTR-02)
- [ ] `src/lib/__tests__/WheelPicker.browser.test.ts` — browser-mode component test stubs for COMP-01, STYL-01–04
- [ ] `src/lib/__tests__/WheelPicker.interaction.test.ts` — pointer/keyboard interaction test stubs for INTR-01–INTR-05, MODE-04

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Inertia feel is "buttery" / iOS-native | INTR-01 | Subjective quality assessment | Test on real iOS device with touch; compare against react-wheel-picker reference |
| Scroll wheel feel on desktop | INTR-02 | Hardware-dependent scroll delta varies | Test in Chrome/Firefox/Safari on Mac and Windows |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
