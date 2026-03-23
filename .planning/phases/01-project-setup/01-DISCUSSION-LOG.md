# Phase 1: Project Setup - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-23
**Phase:** 01-project-setup
**Areas discussed:** Package identity, Source organization, Scaffold approach, Node version

---

## Package Identity

| Option | Description | Selected |
|--------|-------------|----------|
| svelte-wheel-picker | Simple, matches repo name, easy to discover | |
| @ncdai/svelte-wheel-picker | Scoped under original author's npm org | |
| Custom scoped name | Use your own @org scope | ✓ |

**User's choice:** `@uinstinct/svelte-wheel-picker` (custom scoped name)
**Notes:** User specified the exact scope and name via free text.

---

## Source Organization

| Option | Description | Selected |
|--------|-------------|----------|
| Flat | All files at src/lib/ root — simple for a small component library | ✓ |
| Grouped by concern | Subdirectories for components/, hooks/, types/ | |
| Mirror React version | Match the React source's file structure | |

**User's choice:** Flat layout
**Notes:** None — straightforward selection.

---

## Scaffold Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Manual setup | Claude creates files directly — full control, exact versions | ✓ |
| npx sv create | Official scaffolder, then adjust defaults | |
| You decide | Claude picks the best approach | |

**User's choice:** Manual setup
**Notes:** None.

---

## Node Version

| Option | Description | Selected |
|--------|-------------|----------|
| Node 18+ | LTS baseline, broadest compatibility | ✓ |
| Node 20+ | Current LTS, excludes some users on 18 | |
| No engines field | Don't restrict | |

**User's choice:** Node 18+
**Notes:** None.

---

## Claude's Discretion

- ESLint rule configuration beyond defaults
- Prettier formatting options
- Vitest config details
- Initial demo route placeholder content
- tsconfig strictness options

## Deferred Ideas

None — discussion stayed within phase scope.
