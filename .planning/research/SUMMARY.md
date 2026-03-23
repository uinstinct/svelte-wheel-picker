# Project Research Summary

**Project:** svelte-wheel-picker
**Domain:** Svelte 5 iOS-style wheel picker component library (npm + shadcn-svelte registry)
**Researched:** 2026-03-23
**Confidence:** HIGH

## Executive Summary

This project is a headless, zero-dependency Svelte 5 component library that ports the React `@ncdai/react-wheel-picker` to the Svelte ecosystem. The dominant approach in this space is: ship preprocessed `.svelte` source files via npm (not compiled JS bundles), implement touch/mouse inertia scrolling from scratch using pointer events and `requestAnimationFrame`, and distribute via both npm and the shadcn-svelte CLI registry. The recommended toolchain — SvelteKit + `@sveltejs/package` + shadcn-svelte — handles both distribution targets from a single project with no duplication. Svelte 5 runes (`$state`, `$derived`, `$effect`) replace stores throughout; mixing paradigms is explicitly discouraged and creates real problems.

The recommended build order is strict: types and utility hooks first, then the core `WheelPicker` component in layers (finite scroll → inertia → snap → keyboard → infinite loop), then the `WheelPickerWrapper` group container, then package configuration and distribution. This order is driven by concrete internal dependencies — infinite loop mode requires solid snap logic, and the wrapper requires a working picker to test against. Skipping ahead creates compounding correctness issues in the physics layer.

The primary risks are concentrated in the interaction layer, not the packaging layer. Passive browser event listeners silently break `preventDefault()` on mobile (breaking the core iOS-feel), Svelte 5's `$effect` creates infinite loops when animation state is stored as reactive objects rather than plain mutable variables, and shipping compiled JS instead of `.svelte` source files breaks tree-shaking and type inference for consumers. All three are high-recovery-cost if addressed late. They must be designed around from the first line of implementation code.

## Key Findings

### Recommended Stack

The project uses SvelteKit 2 as both the library scaffold and demo site host, with `@sveltejs/package` as the build tool that converts `src/lib/` into a publishable `dist/`. There is no separate Vite configuration — SvelteKit manages it. The same SvelteKit dev server serves the shadcn-svelte registry JSON from `static/r/`, eliminating any need for a separate static server. Testing uses Vitest 4 in browser mode with Playwright as the provider, replacing `@testing-library/svelte` (jsdom) — this is required because pointer events, scroll behavior, and `preventDefault()` calls are too shallow in jsdom for this component's interaction model.

**Core technologies:**
- **Svelte 5.54.1**: Component framework — runes-based reactivity is the only supported model; Svelte 4 stores are explicitly excluded
- **SvelteKit 2.55.0**: Library scaffold + demo site + static registry file server — one tool for all three
- **@sveltejs/package 2.5.7**: Builds `src/lib/` → `dist/` with correct `.svelte` preprocessing and `.d.ts` generation
- **shadcn-svelte 1.2.2**: Provides `registry:build` command that generates `static/r/*.json` files for CLI distribution
- **Vitest 4.1.0 + @vitest/browser + Playwright**: Real-browser component testing — required for pointer/scroll/touch event accuracy
- **publint 0.3.18**: Validates `package.json` exports before publish — catches misconfigured entry points before they reach consumers
- **TypeScript 5.9.3**: Required; `.svelte.ts` extension is mandatory for any utility file that uses runes

**What not to use:** Svelte stores, `@testing-library/svelte` (jsdom), `tsup`/`unbuild`, compiled JS distribution, CSS-in-JS, Storybook, `rollup-plugin-svelte` standalone.

### Expected Features

The feature set maps directly from the React reference implementation. Anything in the React version that is not implementation-specific (React hooks, JSX) has a clear Svelte 5 equivalent and must be present at v1. The interaction model — touch/mouse drag with inertia, snap-to-item, keyboard navigation — is the entire value proposition. Everything else is configuration and packaging.

**Must have (table stakes):**
- Touch drag scrolling with inertia + snap-to-item — the defining feel; without it this is just a `<select>`
- Mouse drag scrolling with inertia + snap-to-item — desktop parity; developers test on desktop first
- Mouse wheel / trackpad scroll — desktop UX baseline
- Keyboard navigation (Arrow Up/Down, Home, End) — accessibility and developer credibility
- Highlight / selection overlay — visual identity of a wheel picker
- `WheelPicker` and `WheelPickerWrapper` components — the core API surface
- Controlled mode (`value` + `onvaluechange`) and uncontrolled mode (`defaultValue`) — both required for real integration
- Disabled option support — needed for date/time picker use cases (the primary consumer pattern)
- `options`, `visibleCount`, `dragSensitivity`, `scrollSensitivity`, `optionItemHeight` props — necessary sizing API
- `classNames` prop + `data-rwp-*` data attributes — headless without these is unusable
- TypeScript types exported (`WheelPickerOption`, `WheelPickerClassNames`, `WheelPickerValue`)
- npm package with correct `package.json` exports

**Should have (v1.x, add after core is stable):**
- Infinite loop scrolling (`infinite` prop) — standard for time pickers; high implementation complexity, must land on solid snap logic
- Type-ahead keyboard search — a11y and power-user demand; depends on keyboard navigation being solid first
- shadcn-svelte CLI registry integration — distribution mechanism; needs npm package stable first

**Defer (v2+):**
- Rich label support via Svelte snippets — adds snippet-as-prop API complexity; block until users request it
- `textValue` for type-ahead with rich labels — blocked on both type-ahead and rich labels

**Anti-features (do not build):** Built-in CSS themes, Svelte 4 compatibility, full multi-page docs site, built-in date/time picker, virtualized rendering for large lists, SSR support, React compatibility layer.

### Architecture Approach

The architecture is two components deep: `WheelPickerWrapper` (thin group context provider managing inter-picker focus via `setContext`/`getContext`) and `WheelPicker` (owns all scroll, inertia, snap, and loop logic independently). Two rune-based utility hooks in `.svelte.ts` files handle cross-cutting concerns: `useControllableState` (bridges controlled/uncontrolled modes, identical to Radix's pattern) and `useTypeaheadSearch` (500ms debounce keyboard buffer). `scrollOffset` in pixels is the single source of truth — `selectedIndex` is always `$derived`, never primary state. This invariant is non-negotiable; inverting it produces unfixable drift during inertia animation.

**Major components:**
1. `WheelPickerWrapper.svelte` — group context: `activeIndex` tracking, picker DOM ref registry, Tab/Shift+Tab keyboard routing between sibling pickers
2. `WheelPicker.svelte` — core scrollable column: pointer event handling, inertia rAF loop, snap-to-item, infinite loop modulo math, keyboard handling, all rendered as `transform: translateY(-scrollOffset)`
3. `use-controllable-state.svelte.ts` — controlled/uncontrolled bridge hook; `$derived` reads prop in controlled mode, `$state` owns value in uncontrolled mode
4. `use-typeahead-search.svelte.ts` — keyboard type-ahead: accumulates keypresses within 500ms, finds first matching option label
5. `types.ts` — `WheelPickerOption<T>`, `WheelPickerProps`, `WheelPickerClassNames`; exported from `src/lib/index.ts`

**Key patterns:**
- Inertia uses exponential decay (`amplitude * exp(-elapsed / 325ms)`) in a single rAF loop — not two separate loops
- Infinite loop uses item duplication (ghost prefix/suffix of `quarterCount` items) + modulo offset; display offset is computed separately from logical offset to prevent visible jumps at boundaries
- Snap skips disabled items by searching outward in both directions from the nearest index
- `setContext`/`getContext` with plain `$state` objects — no stores cross any boundary

### Critical Pitfalls

1. **Passive touch event listeners silently block `preventDefault()`** — Register `touchmove` and `wheel` listeners imperatively via `addEventListener(..., { passive: false })` inside `$effect` with cleanup. Never use declarative `on:touchmove` for these. This affects the core mobile interaction and is invisible on desktop.

2. **`$effect` infinite loop with animation state in `$state` objects/arrays** — Keep inertia frame-by-frame variables (velocity, current offset during animation) in plain mutable `let` variables, not `$state`. Only the settled `scrollOffset` and `selectedIndex` need to be reactive. Use `untrack()` when reading reactive state inside effects that also write.

3. **RAF loop not cancelled on component destroy** — Store every `rafId` where the `$effect` return function can reach it. Always return `() => cancelAnimationFrame(rafId)` from the effect. Missing this causes memory leaks and ghost animations after unmount.

4. **Shipping compiled `.js` instead of `.svelte` source** — Use `@sveltejs/package` exclusively. Verify `package.json` exports have `"svelte"` field pointing to `dist/index.js` (which contains preprocessed-but-not-compiled `.svelte` files). Run `publint` as a `prepublishOnly` check to catch misconfiguration before it ships.

5. **`.svelte.ts` file extension omitted on rune-using utilities** — Any module that uses `$state`, `$derived`, or `$effect` outside a `.svelte` file must have the `.svelte.ts` extension. The Svelte compiler does not process plain `.ts` files for runes. This applies to both `use-controllable-state` and `use-typeahead-search` hooks.

## Implications for Roadmap

Based on combined research, the build order is clear and dependency-driven. The architecture file explicitly defines it; the pitfalls file confirms which phases carry the most risk. Six phases emerge naturally.

### Phase 1: Project Setup and Scaffolding

**Rationale:** All subsequent phases depend on correct toolchain configuration. The pitfalls research identifies two setup-phase landmines (wrong package exports, wrong file extensions) that are expensive to fix retroactively. Get the structure right before writing component code.

**Delivers:** Working SvelteKit library project with `@sveltejs/package`, Vitest browser mode with Playwright, ESLint flat config with `eslint-plugin-svelte`, `prettier-plugin-svelte`, correct `package.json` exports structure, `registry.json` scaffold, and CI-ready build scripts.

**Addresses:** npm package distribution setup, `publint` validation as prepack check, `.svelte.ts` file naming discipline established from day one.

**Avoids:** Pitfall 6 (shipping compiled JS — catch with `publint`), Pitfall 8 (`.svelte.ts` naming — establish convention immediately), shadcn registry integration gotchas.

**Research flag:** Standard patterns — SvelteKit library scaffold is well-documented. Skip research-phase.

### Phase 2: Types and Utility Hooks

**Rationale:** Types have no dependencies; hooks have no UI dependencies. Building these first gives WheelPicker a stable foundation to import from. The controllable state pattern is the hardest API design decision — getting it wrong here (Pitfall 3) is a high-recovery-cost architectural error.

**Delivers:** `types.ts` with `WheelPickerOption<T>`, `WheelPickerProps`, `WheelPickerClassNames`; `use-controllable-state.svelte.ts` implementing explicit controlled/uncontrolled bridge (not `$bindable`); `use-typeahead-search.svelte.ts` with 500ms debounce buffer.

**Addresses:** Controlled mode (`value` + `onvaluechange`), uncontrolled mode (`defaultValue`), TypeScript types, type-ahead search foundation.

**Avoids:** Pitfall 3 (controlled/uncontrolled ambiguity — explicit pattern from Radix, not `$bindable`), Pitfall 7 (spreading `$props()` — explicitly destructure all reactive props by name).

**Research flag:** Standard patterns — controllable state hook is a direct port from Radix/React. Skip research-phase.

### Phase 3: WheelPicker Core — Finite Scroll + Interaction

**Rationale:** This is the highest-risk phase. All three critical interaction pitfalls apply here. Build finite scroll first (simpler offset math), then layer inertia, then snap. Each sub-layer must be solid before adding the next. This is where the iOS feel is made or broken.

**Delivers:** `WheelPicker.svelte` with: `options`/`visibleCount`/`optionItemHeight`/`dragSensitivity`/`scrollSensitivity` props; pointer event drag handling; `touchmove` with `{ passive: false }`; mouse wheel support; inertia `requestAnimationFrame` loop with exponential decay; snap-to-nearest-item with disabled-option skip; highlight/selection overlay; `classNames` prop + `data-rwp-*` data attributes; keyboard navigation (Arrow Up/Down, Home, End); integration with `useControllableState` and `useTypeaheadSearch`.

**Addresses:** Touch drag with inertia + snap, mouse drag with inertia + snap, mouse wheel scroll, highlight overlay, controlled/uncontrolled mode, disabled option support, keyboard navigation, type-ahead search, `classNames` + data attributes.

**Avoids:** Pitfall 1 (passive listeners — imperative `addEventListener` with `{ passive: false }`), Pitfall 2 (`$effect` infinite loop — plain mutable variables for animation state, `untrack()` where needed), Pitfall 4 (RAF cleanup — `$effect` return function), Pitfall 7 (`$props()` spreading — explicit destructuring).

**Research flag:** Needs careful implementation — the inertia physics and snap-with-disabled-skip algorithms are well-specified in ARCHITECTURE.md. No additional research needed, but this phase needs thorough manual testing on real iOS Safari and Android Chrome before proceeding.

### Phase 4: Infinite Loop Mode

**Rationale:** Infinite loop is intentionally last among component features because it requires the snap and offset normalization code to be solid. The architecture specifies ghost item duplication + modulo display offset; the pitfalls specify that logical and display offsets must be computed separately to prevent visible jumps.

**Delivers:** `infinite` prop on `WheelPicker`; `paddedOptions` built in `$derived` (only on `options`/`infinite` change, not on every scroll frame); modulo offset wrapping; display offset computed as `logicalPosition % totalHeight` applied separately in CSS transform.

**Addresses:** Infinite loop scrolling feature (v1.x item).

**Avoids:** Pitfall 5 (infinite loop visual jump — separate logical vs display position), Anti-Pattern 3 (rebuilding padded options on every scroll frame).

**Research flag:** Standard patterns — algorithm fully specified in ARCHITECTURE.md. Skip research-phase, but test with sustained fast scrolling for boundary wrap correctness.

### Phase 5: WheelPickerWrapper and Package Distribution

**Rationale:** `WheelPickerWrapper` can only be meaningfully tested against a working `WheelPicker`. Package distribution is grouped here because it requires the component API to be stable — premature publishing locks in API decisions.

**Delivers:** `WheelPickerWrapper.svelte` with `setContext` group context for `activeIndex` and picker DOM ref registry; Tab/Shift+Tab routing between sibling pickers; `src/lib/index.ts` with named exports; `package.json` configured with correct `exports`, `types`, `svelte`, `sideEffects: false`; `publint` passing; npm-publishable dist via `svelte-package`.

**Addresses:** `WheelPickerWrapper` container, TypeScript types exported, npm package distribution.

**Avoids:** Pitfall 6 (compiled JS shipping — verified by `publint`), `typesVersions` fallback for consumers with `moduleResolution: node`.

**Research flag:** Standard patterns — well-documented. Skip research-phase.

### Phase 6: shadcn-svelte Registry and Demo Site

**Rationale:** Distribution via the shadcn-svelte CLI is a v1.x feature (not launch blocker) that requires the npm package to be stable first. The demo site is the registry host and serves as the adoption tool.

**Delivers:** `registry.json` manifest at project root; `registry:build` output in `static/r/`; demo `src/routes/+page.svelte` showing time picker, date picker, and standalone examples; demo CSS using `data-rwp-*` attributes as targeting hooks.

**Addresses:** shadcn-svelte CLI integration, interactive demo site.

**Avoids:** Registry integration gotchas (raw `.svelte` source in registry, not compiled JS; `registryDependencies` declared if needed).

**Research flag:** Standard patterns — shadcn-svelte registry schema and build process are well-documented. Skip research-phase.

### Phase Ordering Rationale

- Types/hooks before components: `WheelPicker` imports both; building bottom-up avoids rework
- Finite before infinite: infinite loop mode requires solid snap logic as its foundation
- Wrapper after picker: the wrapper has no meaningful test surface without a working picker
- Package config after stable API: premature publishing freezes API decisions; `publint` catches errors before they reach consumers
- Demo and registry last: these are delivery mechanisms, not core functionality; they can only be completed once the component API is locked
- The pitfalls research confirms this order — all three high-cost pitfalls (passive listeners, `$effect` loops, controlled mode) land in Phase 3, which is why that phase is the largest and must not be rushed

### Research Flags

Phases needing deeper research during planning:
- **Phase 3 (WheelPicker Core):** The inertia physics and snap-with-disabled algorithms are specified, but the interaction between `useControllableState` and the scroll offset animation (specifically: external `value` prop changes while inertia animation is mid-flight) may need careful design at planning time.

Phases with standard patterns (skip research-phase):
- **Phase 1:** SvelteKit library scaffold is official and well-documented
- **Phase 2:** Controllable state hook is a direct Radix port; type-ahead is a standard pattern
- **Phase 4:** Infinite loop algorithm is fully specified in ARCHITECTURE.md
- **Phase 5:** Package configuration is covered by official SvelteKit packaging docs
- **Phase 6:** shadcn-svelte registry build is official and documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified against npm registry (live), official Svelte docs, official SvelteKit docs, shadcn-svelte docs. Version numbers confirmed current as of 2026-03-23. |
| Features | HIGH | Source library API is fully documented and public on GitHub. Competitive landscape verified via npm. Feature parity requirements are concrete, not inferred. |
| Architecture | HIGH | Based on direct source analysis of the React reference implementation + foundational algorithm articles (Ariya kinetic scrolling). Patterns cross-referenced with official Svelte 5 runes docs. |
| Pitfalls | HIGH | Most findings verified against official Svelte docs and open GitHub issues with confirmed reproducibility. Passive listener behavior verified against MDN and Chrome developer docs. |

**Overall confidence:** HIGH

### Gaps to Address

- **Controlled mode + in-flight inertia:** The behavior when a parent updates `value` while an inertia animation is running is not specified in the React source. Decision needed at Phase 3 planning: cancel animation and jump to new value, or let animation complete then reconcile. This affects the API contract.
- **`visibleCount` constraint:** The React source documents that `visibleCount` must be a multiple of 4. The rationale is not explained in the source code. Validate this constraint during Phase 3 implementation — it may be an arbitrary implementation detail that can be relaxed.
- **SSR safety boundary:** The pitfalls research flags `window is not defined` as a risk for SvelteKit consumers. The component is client-only, but the import path must not execute browser APIs at module evaluation time. Validate during Phase 5 package testing with an SSR-enabled SvelteKit consumer app.
- **shadcn-svelte registry `registryDependencies`:** If both `WheelPicker` and `WheelPickerWrapper` are separate registry items, the dependency declaration between them must be correct or the CLI add command fails silently. Confirm registry schema behavior during Phase 6.

## Sources

### Primary (HIGH confidence)
- Svelte 5 official docs (svelte.dev) — runes, `$effect`, `$bindable`, cleanup patterns, `.svelte.ts` file naming
- SvelteKit official docs (svelte.dev/docs/kit) — packaging, `@sveltejs/package`, exports field
- shadcn-svelte official docs (shadcn-svelte.com) — registry getting started, `registry.json` schema, `registry:build` command
- `@ncdai/react-wheel-picker` GitHub source (github.com/ncdai/react-wheel-picker) — reference implementation API, physics algorithm
- Ariya.io kinetic scrolling algorithm (ariya.io/2013/11/javascript-kinetic-scrolling-part-2) — inertia decay formula
- Radix UI primitives (github.com/radix-ui/primitives) — controllable state pattern
- npm registry (live) — all package version numbers
- MDN Web Docs — passive event listener behavior, `wheel` event
- GitHub: sveltejs/svelte issues — `$effect` infinite loop with arrays (#16224), `$bindable` controlled prop gap (#11360)

### Secondary (MEDIUM confidence)
- Scott Spence — migrating from `@testing-library/svelte` to `vitest-browser-svelte` (community blog, setup steps verified independently)
- publint.dev — package.json linting tool documentation
- Mainmatter blog — global state in Svelte 5, runes outside components

### Tertiary (LOW confidence)
- `urmoov/svelte-wheel-picker` — competitor analysis only; source not reviewed in depth
- `react-mobile-picker` — competitor analysis only; feature comparison

---
*Research completed: 2026-03-23*
*Ready for roadmap: yes*
