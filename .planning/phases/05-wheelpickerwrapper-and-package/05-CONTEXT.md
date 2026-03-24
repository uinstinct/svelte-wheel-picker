# Phase 5: WheelPickerWrapper and Package - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Multiple WheelPicker wheels work together inside a WheelPickerWrapper group container, and the library is publishable to npm with correct exports, type inference, zero runtime dependencies, and SSR safety. shadcn-svelte registry integration and demo site are Phase 6.

Requirements in scope: COMP-02, DIST-01, DIST-02, DIST-03

</domain>

<decisions>
## Implementation Decisions

### Wrapper Component API
- **D-01:** WheelPickerWrapper is a thin layout container — a flex-row div with `data-swp-group` attribute. Children are slotted WheelPicker instances via Svelte 5 `{@render children()}`. No shared state between wheels; each wheel is fully independent.
- **D-02:** WheelPickerWrapper accepts a `classNames` prop with a `WheelPickerWrapperClassNames` type containing a single `group` field for the outer div. Consistent with WheelPicker's classNames object pattern.
- **D-03:** New types added: `WheelPickerWrapperProps` and `WheelPickerWrapperClassNames` in `types.ts`.

### Focus Management
- **D-04:** Native DOM tab order — each child WheelPicker's wrapper div has `tabindex="0"`. Tab/Shift+Tab naturally moves between wheels in DOM order. No programmatic focus trapping or roving tabindex.

### SSR Safety
- **D-05:** All browser APIs (requestAnimationFrame, pointer events, window) only execute inside `onMount` or `$effect`. Module-level code is pure TypeScript with no browser API references at evaluation time.
- **D-06:** No special SvelteKit config required — the component imports cleanly on the server but only activates interaction handlers client-side. Consumers don't need `{#if browser}` guards.

### Package Export Surface
- **D-07:** Public API exports only components and types. Utility hooks (`useControllableState`, `useTypeaheadSearch`) and physics defaults are removed from the barrel export — they are internal implementation details.
- **D-08:** Final `src/lib/index.ts` exports: `WheelPicker`, `WheelPickerWrapper`, and type exports (`WheelPickerOption`, `WheelPickerProps`, `WheelPickerClassNames`, `WheelPickerWrapperProps`, `WheelPickerWrapperClassNames`).

### Claude's Discretion
- Exact WheelPickerWrapper.svelte template structure (flex direction, gap handling)
- Whether to audit existing WheelPicker.svelte for any module-level browser API usage and fix
- `npm pack` testing approach (local tarball install in temp project vs. publint-only)
- Whether physics defaults need a non-exported internal barrel or just direct imports within src/lib/

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and scope
- `.planning/REQUIREMENTS.md` — COMP-02 (WheelPickerWrapper container), DIST-01 (TypeScript), DIST-02 (zero runtime deps), DIST-03 (publishable npm package)
- `.planning/ROADMAP.md` — Phase 5 success criteria (4 criteria that must be TRUE)

### Prior phase contracts
- `.planning/phases/03-wheelpicker-core/03-CONTEXT.md` — DOM structure contract (D-03, D-04, D-09), classNames pattern, data-swp-* prefix
- `.planning/phases/04-infinite-loop-mode/04-CONTEXT.md` — Infinite mode decisions that affect WheelPicker API surface
- `src/lib/types.ts` — Current WheelPickerProps, WheelPickerClassNames, WheelPickerOption type definitions
- `src/lib/WheelPicker.svelte` — Component to audit for SSR safety (browser API usage at module level)
- `src/lib/index.ts` — Current barrel exports to be trimmed

### Package configuration
- `package.json` — Already has `exports`, `svelte`, `types`, `sideEffects: false`, `peerDependencies`, `publint` in scripts
- `CLAUDE.md` — Package structure requirements, version compatibility matrix

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `WheelPicker.svelte` — fully functional single wheel; WheelPickerWrapper just wraps these as children
- `types.ts` — established type patterns (`WheelPickerClassNames`, `WheelPickerProps`) to follow for wrapper types
- `package.json` — already configured with correct exports structure, publint, svelte-package

### Established Patterns
- Flat `src/lib/` layout — WheelPickerWrapper.svelte goes at root level alongside WheelPicker.svelte
- `classNames` object pattern with per-element string fields (not a single class string)
- `data-swp-*` prefix for all structural data attributes
- Headless — no `<style>` blocks in components
- `.svelte.ts` extension for reactive hooks, `.ts` for pure utilities

### Integration Points
- `src/lib/index.ts` — barrel export needs WheelPickerWrapper added and hooks/defaults removed
- `src/lib/types.ts` — add `WheelPickerWrapperProps` and `WheelPickerWrapperClassNames`
- `src/lib/WheelPicker.svelte` — verify `tabindex="0"` is present on wrapper div for focus management
- `package.json` — verify `npm pack` / `svelte-package` output is correct after export changes

</code_context>

<specifics>
## Specific Ideas

- WheelPickerWrapper renders `<div data-swp-group>{@render children()}</div>` — minimal DOM
- Removing hooks from public exports is a deliberate API hygiene decision — they're implementation details, not consumer tools
- SSR safety is about module-level purity, not about blocking server rendering — the component should import fine, just not do anything interactive until mounted

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-wheelpickerwrapper-and-package*
*Context gathered: 2026-03-24*
