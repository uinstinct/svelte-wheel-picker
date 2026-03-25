# Phase 6: shadcn Registry and Demo Site - Research

**Researched:** 2026-03-25
**Domain:** shadcn-svelte registry publishing + SvelteKit demo site enhancement
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** One registry item named `wheel-picker` containing all component and utility files. No separate items for WheelPickerWrapper or utility hooks. Users run a single `shadcn add [url]/r/wheel-picker.json` to get everything.
- **D-02:** The single `wheel-picker` item lists all 7 files: `WheelPicker.svelte`, `WheelPickerWrapper.svelte`, `types.ts`, `use-wheel-physics.svelte.ts`, `use-controllable-state.svelte.ts`, `use-typeahead-search.svelte.ts`, `wheel-physics-utils.ts`. No `registryDependencies` needed between internal items.
- **D-03:** File types within the registry item: `.svelte` components use `registry:component`; `.ts` and `.svelte.ts` utility/lib files use `registry:lib`.
- **D-04:** `registry:build` (`shadcn-svelte registry build`) generates `static/r/wheel-picker.json` from `registry.json`. This command already exists in `package.json`. The built file is committed to the repo and served as a static asset by SvelteKit.
- **D-05:** The `registry.json` item uses `name: "wheel-picker"` and `type: "registry:component"` at the item level.
- **D-06:** Enhanced landing page layout with a hero section at the top containing: component title (`svelte-wheel-picker`), one-line description, npm install command, and shadcn add command. Existing interactive examples (single wheel, disabled options, infinite loop, time picker) remain below the hero.
- **D-07:** The `shadcn add` command shown in the hero uses placeholder URL `https://svelte-wheel-picker.vercel.app/r/wheel-picker.json`. For now, use a clear placeholder so it renders correctly in the demo.
- **D-08:** Demo site still uses the same `data-swp-*` CSS targeting pattern — no changes to component usage code. The hero section is the only new UI addition.

### Claude's Discretion

- Exact hero section layout and visual design (typography sizes, spacing, copy details)
- Whether to extract demo CSS into a separate `<style>` section or keep inline
- Code display in hero (simple `<pre>/<code>` or styled differently)
- Whether to add a GitHub link/badge to the hero

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DIST-04 | shadcn-svelte CLI integration (registry.json + built files) | Registry schema verified from official JSON schema endpoint; file type values `registry:component` and `registry:lib` confirmed valid; `registry:build` command already exists in package.json |
| DIST-05 | Simple demo site showcasing component usage | Existing `+page.svelte` has all four examples; hero section is a pure HTML/CSS addition; UI-SPEC.md provides complete layout, copy, and color contracts |
</phase_requirements>

---

## Summary

Phase 6 has two tightly scoped deliverables: populate `registry.json` and run `registry:build` to produce `static/r/wheel-picker.json`, then add a hero section to `src/routes/+page.svelte`. Neither task requires new libraries, new dependencies, or changes to component source code.

The shadcn-svelte registry schema is fully verified from the live schema endpoint (`https://shadcn-svelte.com/schema/registry.json`). Both `registry:component` (for `.svelte` files) and `registry:lib` (for `.ts`/`.svelte.ts` files) are valid file-level type values. The file `path` field is relative to the project root. The `registry:build` command already exists in `package.json` as `"registry:build": "shadcn-svelte registry build"` and `shadcn-svelte@1.2.3` is already installed.

The demo site enhancement is a CSS/HTML-only change to `+page.svelte` — prepend a `<section class="hero">` above the four existing sections. The UI-SPEC.md provides a complete, approved contract for copy, layout, colors, and typography that must be followed exactly.

**Primary recommendation:** Populate `registry.json` items array, run `registry:build`, commit the generated `static/r/wheel-picker.json`, then prepend the hero section to `+page.svelte` per the UI-SPEC.

---

## Standard Stack

### Core (already installed — no new dependencies needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn-svelte | 1.2.3 | `registry:build` CLI command | Already in devDependencies; provides the build tool |
| SvelteKit | 2.55.0 | Serves `static/r/` as static files | Already running; no extra server needed |
| svelte-package | 2.5.7 | npm package build (no change this phase) | Unchanged from Phase 5 |

### No New Dependencies

This phase introduces zero new packages. All tools needed are already installed.

**Installation:** None required.

**Version verification:** `shadcn-svelte@1.2.3` confirmed in `package.json`. `registry:build` script already present.

---

## Architecture Patterns

### Registry File Structure

The `registry.json` `items[].files[].path` field must be relative to the project root. Since all source files live in `src/lib/` (flat structure), paths will be:

```
src/lib/WheelPicker.svelte
src/lib/WheelPickerWrapper.svelte
src/lib/types.ts
src/lib/use-wheel-physics.svelte.ts
src/lib/use-controllable-state.svelte.ts
src/lib/use-typeahead-search.svelte.ts
src/lib/wheel-physics-utils.ts
```

### Pattern 1: Registry Item Schema

**What:** A single registry item aggregates all component and utility files into one installable unit.

**When to use:** Single-component libraries where all files must be co-installed (no partial installation supported or needed).

```json
// Source: https://shadcn-svelte.com/schema/registry.json (verified)
{
  "$schema": "https://shadcn-svelte.com/schema/registry.json",
  "name": "@uinstinct/svelte-wheel-picker",
  "homepage": "https://github.com/uinstinct/svelte-wheel-picker",
  "items": [
    {
      "name": "wheel-picker",
      "type": "registry:component",
      "title": "Wheel Picker",
      "description": "iOS-style wheel picker for Svelte 5 with inertia scrolling, infinite loop, and keyboard navigation.",
      "files": [
        { "path": "src/lib/WheelPicker.svelte", "type": "registry:component" },
        { "path": "src/lib/WheelPickerWrapper.svelte", "type": "registry:component" },
        { "path": "src/lib/types.ts", "type": "registry:lib" },
        { "path": "src/lib/use-wheel-physics.svelte.ts", "type": "registry:lib" },
        { "path": "src/lib/use-controllable-state.svelte.ts", "type": "registry:lib" },
        { "path": "src/lib/use-typeahead-search.svelte.ts", "type": "registry:lib" },
        { "path": "src/lib/wheel-physics-utils.ts", "type": "registry:lib" }
      ]
    }
  ]
}
```

### Pattern 2: Hero Section HTML Structure

**What:** Prepend a hero `<section>` above the four existing sections. All existing sections are unchanged.

**When to use:** This is the exact structure required per UI-SPEC.md (approved 2026-03-25).

```html
<!-- Source: 06-UI-SPEC.md, approved layout contract -->
<section class="hero">
  <h1>svelte-wheel-picker</h1>
  <p class="hero-description">iOS-style wheel picker for Svelte 5. Smooth inertia scrolling, infinite loop, keyboard navigation.</p>
  <div class="install-block">
    <pre><code>npm install @uinstinct/svelte-wheel-picker</code></pre>
    <pre><code>npx shadcn-svelte@latest add https://svelte-wheel-picker.vercel.app/r/wheel-picker.json</code></pre>
  </div>
  <p class="install-note">(URL shown after deployment — update before publishing)</p>
</section>
```

### Pattern 3: Hero CSS — Follows Established Token Pattern

**What:** All hero CSS uses the four existing custom properties. Dark mode via `@media (prefers-color-scheme: dark)` override at `:root` is already established — no new CSS variables needed for the hero.

```css
/* Source: 06-UI-SPEC.md color contract + existing +page.svelte pattern */
.hero {
  padding: 48px 0;       /* 2xl = 48px vertical */
  margin-bottom: 24px;   /* lg = 24px, matches section margin-bottom */
}

h1 {
  font-size: 28px;       /* upgraded from 20px per UI-SPEC display role */
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 16px;   /* md = 16px */
}

.hero-description {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.install-block {
  display: flex;
  flex-direction: column;
  gap: 8px;              /* sm = 8px */
  margin-bottom: 8px;
}

.install-block pre {
  background: var(--color-surface);
  border-radius: 6px;
  padding: 8px 12px;
  overflow-x: auto;
  margin: 0;
}

.install-block code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 14px;
  color: var(--color-text-muted);
}

.install-note {
  font-size: 12px;
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: 0;
}
```

### Anti-Patterns to Avoid

- **Separate registry items for WheelPicker and WheelPickerWrapper:** Locked decision D-01 forbids this. A single `wheel-picker` item with all 7 files is required.
- **Using `registry:hook` for `.svelte.ts` files:** Although hooks are reactive classes, the decision (D-03) specifies `registry:lib` for all `.ts` and `.svelte.ts` utilities.
- **Introducing new CSS custom properties in hero:** UI-SPEC prohibits new color tokens. Use only the four existing `--color-*` variables.
- **Using accent blue on hero elements:** The blue accent (`rgba(59,130,246,...)`) is reserved exclusively for `[data-swp-selection]`. UI-SPEC explicitly prohibits it on hero elements.
- **Editing existing `<section>` blocks:** The hero is a prepended addition only. Existing sections are untouched.
- **Committing `static/r/wheel-picker.json` before verifying it:** Always run `registry:build` and inspect the output before committing to catch schema validation errors.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Registry JSON generation | Manual JSON construction | `pnpm run registry:build` | The CLI reads `registry.json`, inlines file content, validates schema, writes output |
| File content embedding in registry | Copy-pasting source into JSON | `registry:build` handles it | The built `static/r/wheel-picker.json` contains file contents — the build tool does this |
| Static file serving for registry | Custom endpoint/API route | SvelteKit `static/r/` directory | Files in `static/` are served automatically by SvelteKit as static assets |

**Key insight:** The entire registry workflow is two commands: edit `registry.json`, run `registry:build`. No custom build logic is needed.

---

## Common Pitfalls

### Pitfall 1: File Paths Not Relative to Project Root

**What goes wrong:** Using paths like `lib/WheelPicker.svelte` or `./WheelPicker.svelte` instead of `src/lib/WheelPicker.svelte` causes `registry:build` to fail with a file-not-found error.

**Why it happens:** The `path` field is relative to the project root, not to `src/lib/` or any other base directory. The docs example uses `./registry/hello-world/hello-world.svelte` (project-root-relative).

**How to avoid:** Always prefix with `src/lib/` for files in this project's flat lib structure.

**Warning signs:** `registry:build` exits with non-zero status; output JSON is missing file contents.

### Pitfall 2: Using Wrong File Type for `.svelte.ts` Files

**What goes wrong:** Using `registry:hook` for `use-wheel-physics.svelte.ts` when the decision requires `registry:lib`. This is not a fatal error but deviates from locked decision D-03.

**Why it happens:** The `.svelte.ts` extension implies reactive/hook-like behavior, but D-03 explicitly assigns `registry:lib` to all `.ts` and `.svelte.ts` utilities.

**How to avoid:** Follow D-03 exactly: `.svelte` → `registry:component`, everything else → `registry:lib`.

**Warning signs:** Plan deviates from D-03 without explicit override instruction.

### Pitfall 3: `overflow-x: auto` Missing on `<pre>` Blocks

**What goes wrong:** Long `npx shadcn-svelte@latest add https://...` command string overflows the 400px max-width container on mobile, causing horizontal page scroll.

**Why it happens:** `<pre>` elements do not wrap by default — they preserve whitespace literally.

**How to avoid:** Add `overflow-x: auto` to `.install-block pre`. This is specified in the UI-SPEC interaction contract.

**Warning signs:** Mobile viewport (< 400px) shows horizontal scroll on page load.

### Pitfall 4: `h1` Style Conflict

**What goes wrong:** The existing `+page.svelte` has `h1 { font-size: 20px }`. The UI-SPEC requires the hero `h1` to be `28px`. A scoped override is needed — the old `h1` rule conflicts if not updated.

**Why it happens:** SvelteKit scoped styles apply globally within the component but the `h1` rule was written for the old page-level title. The new hero `h1` replaces the old standalone `h1`.

**How to avoid:** Replace the old `h1 { font-size: 20px }` rule with `h1 { font-size: 28px }` (or add a `.hero h1` selector). The old standalone `<h1>Wheel Picker</h1>` is being replaced by the hero `<h1>svelte-wheel-picker</h1>`, so updating the global `h1` rule is correct.

**Warning signs:** Hero title renders at 20px instead of 28px.

### Pitfall 5: Blocker from STATE.md — `registryDependencies` Concern

**What goes wrong:** STATE.md records a concern: "shadcn registry `registryDependencies` between `WheelPicker` and `WheelPickerWrapper` must be declared correctly or CLI add fails silently."

**Resolution:** Decision D-01 resolves this concern entirely. There is ONE registry item (`wheel-picker`) containing all 7 files. There are no separate items, so there are no `registryDependencies` to declare between internal items. The `registryDependencies` field on the single item can be omitted (defaults to empty array).

**Warning signs:** If a plan attempts to split into multiple registry items, it contradicts D-01 and reintroduces this concern.

---

## Code Examples

Verified patterns from official sources:

### Complete registry.json for this project

```json
// Source: https://shadcn-svelte.com/schema/registry.json (verified type enum values)
{
  "$schema": "https://shadcn-svelte.com/schema/registry.json",
  "name": "@uinstinct/svelte-wheel-picker",
  "homepage": "https://github.com/uinstinct/svelte-wheel-picker",
  "items": [
    {
      "name": "wheel-picker",
      "type": "registry:component",
      "title": "Wheel Picker",
      "description": "iOS-style wheel picker for Svelte 5 with inertia scrolling, infinite loop, and keyboard navigation.",
      "files": [
        { "path": "src/lib/WheelPicker.svelte", "type": "registry:component" },
        { "path": "src/lib/WheelPickerWrapper.svelte", "type": "registry:component" },
        { "path": "src/lib/types.ts", "type": "registry:lib" },
        { "path": "src/lib/use-wheel-physics.svelte.ts", "type": "registry:lib" },
        { "path": "src/lib/use-controllable-state.svelte.ts", "type": "registry:lib" },
        { "path": "src/lib/use-typeahead-search.svelte.ts", "type": "registry:lib" },
        { "path": "src/lib/wheel-physics-utils.ts", "type": "registry:lib" }
      ]
    }
  ]
}
```

### Run the build and verify output

```bash
# Source: package.json scripts + shadcn-svelte docs
pnpm run registry:build
# Expected: static/r/wheel-picker.json created with file contents inlined
ls -la static/r/wheel-picker.json
```

### Consumer install command (both methods)

```bash
# npm package
npm install @uinstinct/svelte-wheel-picker

# shadcn-svelte CLI (registry URL — placeholder until deployed)
npx shadcn-svelte@latest add https://svelte-wheel-picker.vercel.app/r/wheel-picker.json
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual registry JSON | `registry:build` from `registry.json` manifest | shadcn-svelte 1.x | File contents are inlined automatically; no manual JSON maintenance |
| `.eslintrc` legacy config | ESLint flat config (`eslint.config.js`) | ESLint 9+ | Svelte 5 runes recognized correctly |

**Deprecated/outdated:**

- `@testing-library/svelte` alone: replaced by `vitest-browser-svelte` for browser-mode tests (already done in this project).

---

## Open Questions

1. **Does `registry:build` inline file contents into the generated JSON?**
   - What we know: The built file is served at `static/r/wheel-picker.json` and consumers use it directly via `npx shadcn-svelte@latest add [url]`. The CLI copies files into the consumer project from this JSON.
   - What's unclear: The exact shape of the built JSON (whether file source code is embedded or referenced by URL). Official docs do not show a sample built output.
   - Recommendation: Run `pnpm run registry:build` as Wave 0 / Task 1 and inspect the output before assuming shape. The build itself validates the schema.
   - **Impact on plan:** LOW — the planner should include a "run build and inspect output" verification step, but this does not block schema authoring.

2. **Does `registry:build` fail on `.svelte.ts` file paths?**
   - What we know: The schema accepts `registry:lib` as a valid type. The `path` field is a string with no known extension restrictions.
   - What's unclear: Whether the shadcn-svelte CLI has special handling for Svelte 5 `.svelte.ts` reactive class files (they contain `$state` syntax that requires Svelte preprocessing to compile).
   - Recommendation: Run build immediately after authoring `registry.json`. If it fails on `.svelte.ts` files, fall back to `registry:file` type. This is LOW probability.
   - **Impact on plan:** Include a verification step after `registry:build` to confirm all 7 files appear in the output JSON.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| shadcn-svelte CLI | `registry:build` command | ✓ | 1.2.3 (devDependency) | — |
| pnpm / npm | Run scripts | ✓ | project uses npm | — |
| SvelteKit static serving | `static/r/wheel-picker.json` endpoint | ✓ | 2.55.0 | — |
| `static/r/` directory | Registry JSON output location | ✓ | exists (empty) | — |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` |
| Quick run command | `PLAYWRIGHT_BROWSERS_PATH=.playwright vitest run --project unit` |
| Full suite command | `PLAYWRIGHT_BROWSERS_PATH=.playwright vitest run` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DIST-04 | `static/r/wheel-picker.json` exists and contains all 7 files | manual/smoke | `ls -la static/r/wheel-picker.json && node -e "const f=JSON.parse(require('fs').readFileSync('static/r/wheel-picker.json','utf8')); console.log(f.files?.length ?? JSON.stringify(Object.keys(f)))"` | ❌ Wave 0 — no automated test; verified by file inspection |
| DIST-05 | Demo page loads without JS errors and all wheels interactive | manual/smoke | `pnpm run dev` + browser manual verification | n/a — visual/interactive |

**Note:** DIST-04 and DIST-05 are both distribution/demo requirements with no existing unit test coverage. DIST-04 is verifiable by file inspection after `registry:build`. DIST-05 requires browser smoke test (load the dev server, confirm no console errors, confirm wheels respond to drag).

### Sampling Rate

- **Per task commit:** `PLAYWRIGHT_BROWSERS_PATH=.playwright vitest run --project unit` (existing unit tests must still pass — no regressions)
- **Per wave merge:** `PLAYWRIGHT_BROWSERS_PATH=.playwright vitest run`
- **Phase gate:** Full suite green + manual smoke test (dev server, both mobile and desktop viewport) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] No automated test for DIST-04 — verified by file inspection post-build (acceptable for a build artifact)
- [ ] No automated test for DIST-05 — verified by manual browser smoke test (acceptable for demo UI)

*(Existing test infrastructure covers all pre-existing requirements — no new test files needed for DIST-04/DIST-05 given their nature as build artifacts and visual demos.)*

---

## Project Constraints (from CLAUDE.md)

All of the following CLAUDE.md directives apply to this phase:

| Directive | Impact on Phase 6 |
|-----------|-------------------|
| Svelte 5 with runes, TypeScript, zero runtime dependencies | No new dependencies. Hero section is plain HTML/CSS Svelte 5 component code. |
| API parity with React version | Not applicable — Phase 6 is registry/demo only, no component logic changes. |
| Distribution: npm + shadcn-svelte CLI | This phase delivers the shadcn-svelte half of distribution. |
| Headless — no CSS shipped, data attributes for targeting | Hero CSS stays in `+page.svelte` `<style>` block (demo site CSS, not library CSS). |
| `"sideEffects": false` in package.json | No change needed — already set. |
| ESLint flat config (`eslint.config.js`) | No new TS files added to lib. Hero section changes are in `.svelte` file — standard. |
| GSD workflow enforcement | All changes go through `/gsd:execute-phase`. |

---

## Sources

### Primary (HIGH confidence)

- `https://shadcn-svelte.com/schema/registry.json` (live JSON schema) — verified all valid `type` enum values at both item level and file level; confirmed `registry:component` and `registry:lib` are valid file types
- `https://www.shadcn-svelte.com/docs/registry/getting-started` — registry:build command, static/r/ output path, project-root-relative file paths
- `https://www.shadcn-svelte.com/docs/registry/registry-item-json` — all item fields, `target` field semantics, `registryDependencies` usage
- `src/lib/` directory listing — confirmed all 7 source files exist at their expected paths
- `package.json` — confirmed `registry:build` script already present, `shadcn-svelte@1.2.3` installed
- `registry.json` — confirmed `$schema`, `name`, `homepage` already scaffolded; `items: []` needs population
- `static/r/` — confirmed directory exists and is empty (ready to receive built output)
- `src/routes/+page.svelte` — confirmed existing CSS variables and section structure; h1 currently 20px (needs 28px per UI-SPEC)
- `06-UI-SPEC.md` — approved layout, typography, color, and copy contract

### Secondary (MEDIUM confidence)

- `https://www.shadcn-svelte.com/docs/registry/registry-json` — confirmed `aliases` field, `overrideDependencies` field; `registry:lib` item-type vs file-type distinction
- WebSearch cross-verification — confirmed `registry:lib` is a recognized and used file type in shadcn ecosystem (React and Svelte versions consistent)

### Tertiary (LOW confidence)

- None — all critical claims verified via official schema or official docs.

---

## Metadata

**Confidence breakdown:**

- Registry schema (type values, path convention): HIGH — verified from live JSON schema endpoint
- `registry:build` command and output location: HIGH — confirmed in official docs and package.json
- Hero section implementation: HIGH — exact spec from approved UI-SPEC.md
- Built JSON file internal shape: MEDIUM — structure inferred from CLI behavior; actual content verified by running build
- `.svelte.ts` file handling by `registry:build`: MEDIUM — no official docs address this extension; normal operation expected but flagged as open question

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (shadcn-svelte registry format is stable; 30-day window conservative)
