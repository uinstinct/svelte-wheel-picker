---
phase: 7
slug: rotating-drum-cylinder-list-style-picker-with-3d-perspective-items-farther-from-center-appear-smaller-and-compressed-vertically
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-25
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x (browser mode, Playwright) |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `pnpm test:unit` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test:unit`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | cylindrical prop types | unit | `pnpm test:unit` | ✅ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | math formula | unit | `pnpm test:unit` | ✅ W0 | ⬜ pending |
| 07-01-03 | 01 | 2 | template rendering | unit | `pnpm test` | ✅ W0 | ⬜ pending |
| 07-01-04 | 01 | 2 | demo site integration | manual | visual inspection | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/lib/wheel-physics-utils.test.ts` — unit tests for `cylindricalScaleY()` pure function (Plan 07-01 Task 1 creates this via TDD RED phase)
- [x] Tests stub: `cylindricalScaleY(0, 60, 30, 5)` → `1.0` (center item, dist=0); `cylindricalScaleY(1, 60, 30, 5)` → `cos(PI/5)` ≈ `0.809` (one slot from center)

*Existing Vitest + Playwright infrastructure covers test execution — only new test cases appended to existing test file.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual drum effect | cylinder prop visual | CSS `transform: scaleY()` not testable in unit tests | Open demo, enable `cylinder` prop, verify items near top/bottom are visually compressed |
| Smooth Interaction | picker feel | subjective UX | Drag wheel — items should look like they wrap around a cylinder, not float flat |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready
