# Phase 6: shadcn Registry and Demo Site - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-03-25
**Phase:** 06-shadcn-registry-and-demo-site
**Mode:** discuss
**Areas discussed:** Registry item structure, Internal files in registry, Demo site scope

---

## Gray Areas Presented

Three areas were identified and all selected for discussion:

1. Registry item structure (1 item vs 2 items)
2. Internal files in registry (all-in-one vs separate lib items)
3. Demo site scope (current vs enhanced)

---

## Discussion

### Registry item structure

**Question:** Single item vs two separate items (wheel-picker + wheel-picker-wrapper with registryDependencies)?

**User chose:** Single item (mirrors React version's distribution, simpler for consumers)

**Decision:** One `wheel-picker` registry item containing all files. No `registryDependencies` between internal items.

---

### Internal files in registry

**Question:** Bundle all hooks/utils into the single item, or create separate `registry:lib` items?

**User chose:** All in one item

**Decision:** All 7 source files listed in the single `wheel-picker` item. File types: `.svelte` → `registry:component`, `.ts`/`.svelte.ts` → `registry:lib`.

---

### Demo site scope

**Question:** Use as-is, refine examples, or enhanced landing page?

**User chose:** Enhanced landing page

**Decision:** Add hero section with component title, description, npm install command, and shadcn add command. Keep existing 4 interactive examples below the hero.

---

## Codebase State at Discussion

- `registry.json`: scaffolded, `items: []`
- `static/r/`: directory exists, empty
- `src/routes/+page.svelte`: functional demo with 4 examples, light/dark CSS vars
- `registry:build` script: present in package.json
- All 7 source files present in `src/lib/`
