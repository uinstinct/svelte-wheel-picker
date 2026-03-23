# Phase 1: Project Setup - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

A correctly configured SvelteKit library project exists that can build, test, and eventually publish the component. This phase creates the foundation all subsequent phases depend on — no component code yet, just toolchain and structure.

</domain>

<decisions>
## Implementation Decisions

### Package Identity
- **D-01:** npm package name is `@uinstinct/svelte-wheel-picker`
- **D-02:** Package description: iOS-style wheel picker for Svelte 5 with inertia scrolling, infinite loop, and keyboard navigation

### Source Organization
- **D-03:** Flat layout in `src/lib/` — all files at root level (components, hooks, types, utils). No subdirectories.
- **D-04:** Hook files use `.svelte.ts` extension per Svelte 5 convention

### Scaffold Approach
- **D-05:** Manual file-by-file setup — Claude creates all config and scaffold files directly, no `npx sv create`. Full control over exact versions and config.

### Node Version
- **D-06:** `engines.node` set to `>=18` in package.json. Node 18 LTS baseline for broadest compatibility.

### Claude's Discretion
- Exact ESLint rule configuration beyond defaults
- Prettier formatting options (tab width, etc.)
- Vitest config details (timeouts, browser launch args)
- Initial demo route placeholder content
- tsconfig strictness options beyond Svelte 5 recommended defaults

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Tech Stack
- `CLAUDE.md` — Full technology stack with versions, package.json structure, compatibility matrix, and what NOT to use

### Requirements
- `.planning/REQUIREMENTS.md` — v1 requirement IDs and traceability (Phase 1 has no direct requirement mappings but establishes the foundation)
- `.planning/ROADMAP.md` — Phase 1 success criteria (build, test, publint, smoke-test import)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing code — this is a greenfield scaffold

### Established Patterns
- No patterns yet — Phase 1 establishes them

### Integration Points
- `src/lib/index.ts` will be the package entry point for all subsequent phases
- `src/routes/` will host the demo site (Phase 6) but needs a basic route for smoke testing now

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The tech stack in CLAUDE.md is comprehensive and defines versions, tooling, and conventions.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-project-setup*
*Context gathered: 2026-03-23*
