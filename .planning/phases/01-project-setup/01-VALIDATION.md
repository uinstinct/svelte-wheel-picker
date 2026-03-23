---
phase: 1
slug: project-setup
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x with @vitest/browser-playwright |
| **Config file** | `vitest.config.ts` (created in this phase) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | SC-1 (build) | cli | `pnpm build && ls dist/` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | SC-2 (test) | cli | `pnpm test` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | SC-3 (publint) | cli | `pnpm exec publint` | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | SC-4 (smoke) | browser | `pnpm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Vitest browser mode config with Playwright provider
- [ ] `src/lib/index.ts` — package entry point
- [ ] Playwright browser binary installed (`pnpm exec playwright install chromium`)

*All infrastructure is created in this phase — Wave 0 and the main work are the same.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Demo route renders | SC-4 | Visual check | Navigate to localhost and verify component renders |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
