---
phase: 6
slug: shadcn-registry-and-demo-site
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `pnpm test --run` |
| **Full suite command** | `pnpm test --run && pnpm build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test --run`
- **After every plan wave:** Run `pnpm test --run && pnpm build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 0 | DIST-04 | manual | `npx shadcn-svelte@latest add [url]` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | DIST-04 | build | `pnpm registry:build && ls static/r/*.json` | ✅ | ⬜ pending |
| 06-02-01 | 02 | 1 | DIST-05 | visual | `pnpm dev` — verify demo loads | ✅ | ⬜ pending |
| 06-02-02 | 02 | 1 | DIST-05 | visual | browser: mobile viewport check | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `registry.json` — exists at project root with valid shadcn-svelte schema
- [ ] `static/r/` directory — exists and writable for registry output

*Existing infrastructure covers most phase requirements — Wave 0 is lightweight.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `npx shadcn-svelte add [url]` installs files correctly | DIST-04 | CLI requires live registry endpoint | Run against dev server, verify files appear in consumer project |
| Demo wheels interactive on mobile viewport | DIST-05 | Touch events require real browser | Open DevTools → responsive mode, verify scroll/snap works |
| Demo loads without JS errors | DIST-05 | Runtime behavior | Open browser console, confirm no errors on page load |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
