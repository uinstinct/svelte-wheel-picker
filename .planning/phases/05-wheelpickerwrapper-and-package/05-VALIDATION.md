---
phase: 5
slug: wheelpickerwrapper-and-package
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x (browser mode via Playwright) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test -- --run` |
| **Full suite command** | `pnpm test -- --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- --run`
- **After every plan wave:** Run `pnpm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | COMP-02 | component | `pnpm test -- --run` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | COMP-02 | unit | `pnpm test -- --run` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | DIST-01 | unit | `pnpm run package && pnpm exec publint` | ✅ | ⬜ pending |
| 05-02-02 | 02 | 2 | DIST-02 | integration | `pnpm pack --dry-run` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 2 | DIST-03 | unit | `pnpm test -- --run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/WheelPickerWrapper.test.ts` — WheelPickerWrapper focus routing tests (COMP-02)
- [ ] `src/lib/__tests__/ssr-safety.test.ts` — SSR module evaluation test (DIST-03)

*Existing infrastructure covers test framework and Playwright setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tab/Shift+Tab focus routing between wheels in wrapper | COMP-02 | Browser focus behavior needs visual confirmation | Open demo page, Tab through two WheelPicker instances, verify focus moves between them |
| npm tarball installs in fresh project | DIST-02 | Requires external project setup | Run `pnpm pack`, create fresh SvelteKit project, install tarball, import component |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
