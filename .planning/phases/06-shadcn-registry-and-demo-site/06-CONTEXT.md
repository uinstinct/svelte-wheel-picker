# Phase 6: shadcn Registry and Demo Site - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up the shadcn-svelte registry so developers can `shadcn add` the component, and build an enhanced demo site with a landing page hero plus interactive examples. Requirements: DIST-04, DIST-05.

shadcn-svelte CLI integration and demo site only — no changes to component logic, API, or npm package structure.

</domain>

<decisions>
## Implementation Decisions

### Registry item structure
- **D-01:** One registry item named `wheel-picker` containing all component and utility files. No separate items for WheelPickerWrapper or utility hooks. Users run a single `shadcn add [url]/r/wheel-picker.json` to get everything.
- **D-02:** The single `wheel-picker` item lists all 7 files: `WheelPicker.svelte`, `WheelPickerWrapper.svelte`, `types.ts`, `use-wheel-physics.svelte.ts`, `use-controllable-state.svelte.ts`, `use-typeahead-search.svelte.ts`, `wheel-physics-utils.ts`. No `registryDependencies` needed between internal items.
- **D-03:** File types within the registry item: `.svelte` components use `registry:component`; `.ts` and `.svelte.ts` utility/lib files use `registry:lib`.

### Registry build
- **D-04:** `registry:build` (`shadcn-svelte registry build`) generates `static/r/wheel-picker.json` from `registry.json`. This command already exists in `package.json`. The built file is committed to the repo and served as a static asset by SvelteKit.
- **D-05:** The `registry.json` item uses `name: "wheel-picker"` and `type: "registry:component"` at the item level.

### Demo site
- **D-06:** Enhanced landing page layout with a hero section at the top containing: component title (`svelte-wheel-picker`), one-line description, npm install command, and shadcn add command. Existing interactive examples (single wheel, disabled options, infinite loop, time picker) remain below the hero.
- **D-07:** The `shadcn add` command shown in the hero uses a placeholder URL pattern (`https://svelte-wheel-picker.vercel.app/r/wheel-picker.json` or similar) — this will be updated when deployed. For now, use a clear placeholder so it renders correctly in the demo.
- **D-08:** Demo site still uses the same `data-swp-*` CSS targeting pattern — no changes to component usage code. The hero section is the only new UI addition.

### Claude's Discretion
- Exact hero section layout and visual design (typography sizes, spacing, copy details)
- Whether to extract demo CSS into a separate `<style>` section or keep inline
- Code display in hero (simple `<pre>/<code>` or styled differently)
- Whether to add a GitHub link/badge to the hero

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Registry format
- `registry.json` — Current file at project root; `items: []` needs to be populated per D-01–D-03
- `CLAUDE.md` §"shadcn-svelte Registry Setup" — Registry build command, static/r/ serving pattern, registry.json schema reference

### Source files to register
- `src/lib/WheelPicker.svelte` — Primary component (registry:component)
- `src/lib/WheelPickerWrapper.svelte` — Wrapper component (registry:component)
- `src/lib/types.ts` — All type definitions (registry:lib)
- `src/lib/use-wheel-physics.svelte.ts` — Physics reactive class (registry:lib)
- `src/lib/use-controllable-state.svelte.ts` — Controlled/uncontrolled state hook (registry:lib)
- `src/lib/use-typeahead-search.svelte.ts` — Typeahead search hook (registry:lib)
- `src/lib/wheel-physics-utils.ts` — Physics pure utilities (registry:lib)

### Demo site
- `src/routes/+page.svelte` — Current demo page to be enhanced with hero section
- `.planning/ROADMAP.md` §"Phase 6" — Success criteria (3 criteria that must be TRUE)

### shadcn-svelte docs reference
- https://www.shadcn-svelte.com/docs/registry/getting-started — registry.json format, registry:build command
- https://www.shadcn-svelte.com/docs/registry/registry-json — schema fields, item types, file types

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/routes/+page.svelte` — Full working demo with 4 examples, CSS variables for light/dark, `data-swp-*` targeting. Needs hero section prepended, not a rewrite.
- `registry.json` — Scaffolded with correct `$schema`, `name`, and `homepage`. Only `items` needs to be filled.
- `package.json` `registry:build` script — Already present. Just needs to be run after populating registry.json.
- `static/r/` directory — Already exists, ready to receive built registry JSON.

### Established Patterns
- All component source lives in flat `src/lib/` — registry file paths will be relative to `src/lib/`
- Demo uses `data-swp-*` attributes with `:global()` CSS — this pattern should be shown in hero code snippet
- Dark/light mode via CSS custom properties at `:root` — hero should inherit the same variables

### Integration Points
- `registry.json` items → `registry:build` → `static/r/wheel-picker.json` (served by SvelteKit static)
- `src/routes/+page.svelte` hero section → references `static/r/` URL for the shadcn add command

</code_context>

<specifics>
## Specific Ideas

- Hero section should show both install paths side by side: `npm install @uinstinct/svelte-wheel-picker` and `npx shadcn-svelte@latest add [url]`
- shadcn-svelte registry URL format based on docs: `npx shadcn-svelte@latest add https://[host]/r/wheel-picker.json`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-shadcn-registry-and-demo-site*
*Context gathered: 2026-03-25*
