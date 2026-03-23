<!-- GSD:project-start source:PROJECT.md -->
## Project

**Svelte Wheel Picker**

A publishable Svelte 5 component library that clones `@ncdai/react-wheel-picker` — an iOS-style wheel picker with smooth inertia scrolling, infinite loop support, and full keyboard navigation. Ships as an unstyled/headless npm package with shadcn-svelte CLI integration. Includes a simple demo site.

**Core Value:** Pixel-perfect, buttery-smooth wheel picker interaction that feels native on both touch and desktop — matching the React version's UX exactly.

### Constraints

- **Tech stack**: Svelte 5 with runes, TypeScript, zero runtime dependencies
- **API parity**: Props and behavior must match the React version as closely as Svelte idioms allow
- **Distribution**: Must work as both npm install and shadcn-svelte CLI add
- **Styling**: Headless — no CSS shipped, data attributes for targeting
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Svelte | 5.54.1 | Component framework | Project requirement. Runes (`$state`, `$derived`, `$effect`) replace stores — this is the current and future reactive model. Svelte 4 is in maintenance mode. |
| TypeScript | 5.9.3 | Static typing | Project requirement. `verbatimModuleSyntax: true` + `isolatedModules: true` is the Svelte 5 recommended config. TypeScript in component markup (not just `<script>`) is a Svelte 5 feature. |
| SvelteKit | 2.55.0 | Library scaffold + demo site | The only officially supported way to build a Svelte library with `svelte-package`. Doubles as the host for the demo site, removing the need for a separate Vite app. |
| @sveltejs/package | 2.5.7 | Build tool: Svelte → npm-publishable dist | Official SvelteKit library build tool. Processes `src/lib/`, generates `dist/` with preprocessed `.svelte` files, transpiled `.js`, and auto-generated `.d.ts` type definitions. Version 2 validates `package.json` rather than generating it — simpler to reason about. |
| @sveltejs/vite-plugin-svelte | 7.0.0 | Vite integration | Required by SvelteKit; also powers the demo site's local dev. No separate Vite config needed — SvelteKit manages it. |
### Distribution: shadcn-svelte Registry
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| shadcn-svelte | 1.2.2 | CLI + registry tooling | The only shadcn registry system for Svelte. Provides `registry:build` command that generates `static/r/[name].json` files from a `registry.json` manifest. Users run `npx shadcn-svelte add https://your-site.com/r/wheel-picker` to copy source into their project. Matches how the React version distributes. |
| SvelteKit (same instance) | 2.55.0 | Serves the registry JSON endpoints | The SvelteKit demo site's `static/r/` directory is served as static files — no extra server needed. The same dev server that runs the demo also serves the registry. |
### Development Tools
| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| Vitest | 4.1.0 | Unit + component tests | Recommended by official Svelte docs for Vite-based projects. Browser mode with Playwright replaces jsdom, giving real-browser accuracy for gesture/scroll interactions. Use `npx sv add vitest` to scaffold. |
| @vitest/browser | 4.1.0 | Browser mode runner | Required for real-browser component tests. Must match Vitest version exactly. |
| vitest-browser-svelte | 2.1.0 | Svelte component rendering in browser tests | Provides `render()` for Vitest browser mode. Modern replacement for `@testing-library/svelte`. Native Svelte 5 runes support. |
| Playwright (via @vitest/browser) | 1.58.2 | Browser provider for Vitest | Use Playwright as the Vitest browser provider — better CI/CD support than WebdriverIO. Run `pnpm exec playwright install` after setup or tests fail silently. |
| publint | 0.3.18 | package.json linting | Validates `exports`, `types`, `svelte` fields for maximum bundler compatibility. Run as `prepack` script. Catches misconfigured entry points before npm publish. |
| ESLint | 10.1.0 | Linting | Use flat config (`eslint.config.js`). Svelte 5 runes (`$state`, etc.) are only recognized correctly with ESLint 9+ flat config — older `.eslintrc` format produces false positives. |
| eslint-plugin-svelte | 3.16.0 | Svelte-aware lint rules | Official Svelte ESLint plugin. Parses `.svelte` files via `svelte-eslint-parser`. Required for linting template syntax. |
| Prettier | 3.8.1 | Code formatting | Standard. Use with `prettier-plugin-svelte` — without it Prettier mangles `.svelte` file formatting. |
| prettier-plugin-svelte | 3.5.1 | Svelte formatting | Formats `<script>`, `<style>`, and template blocks correctly. Required for consistent `.svelte` file output. |
## package.json Structure for the Library
- `"sideEffects": false` — this library ships no CSS, so tree-shaking can eliminate all unused exports. Without this, bundlers include everything when a user imports one component.
- `"svelte"` field — legacy field for older tooling that doesn't read `exports`. Keep it.
- `"peerDependencies"` — Svelte is a peer dep, not a direct dep. The consumer provides Svelte. This is required by the packaging spec.
- No `dependencies` at all — the library has zero runtime dependencies (matching the React version's design).
## shadcn-svelte Registry Setup
## Installation Commands
# Create the SvelteKit library project
# Select: SvelteKit library, TypeScript, ESLint, Prettier, Vitest
# Core dev dependencies
# shadcn-svelte CLI (for registry:build)
# Testing stack
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|------------------------|
| `@sveltejs/package` | Vite library mode (`lib.entry`) | Only if you need custom Rollup plugin configuration not possible with svelte-package. svelte-package handles `.svelte` preprocessing; Vite library mode alone does not. |
| SvelteKit for demo site | Plain Vite + `vite-plugin-svelte` | If you want a simpler setup with no routing. Not recommended here — SvelteKit also provides the static file serving for the registry JSON. Using both would duplicate the Vite config. |
| vitest-browser-svelte (browser mode) | `@testing-library/svelte` (jsdom) | jsdom is acceptable for pure logic tests. For a component with touch/pointer events and CSS scroll behavior, real-browser testing is necessary. jsdom mocks are too shallow for inertia scroll testing. |
| ESLint flat config (`eslint.config.js`) | `.eslintrc.cjs` legacy config | Legacy config does not understand Svelte 5 runes syntax without workarounds. Only use legacy if locked to ESLint 8. |
| `pnpm` | `npm` / `yarn` | All alternatives work. `pnpm` is conventional in the Svelte ecosystem (SvelteKit, shadcn-svelte all use it). Use whatever your team prefers — no technical constraint here. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Svelte 4 / `@sveltejs/kit@1` | Project requires Svelte 5 runes. Svelte 4 does not support `$state`, `$derived`, `$effect`. | Svelte 5 + SvelteKit 2 |
| Stores (`writable`, `readable`) | Replaced by runes in Svelte 5. Mixing stores and runes creates complexity. Runes work everywhere including `.svelte.js` files; stores require context. | `$state`, `$derived` |
| `rollup-plugin-svelte` standalone | Outdated — predates `svelte-package`. Requires manual TypeScript declaration generation, manual preprocessing config. | `@sveltejs/package` |
| `@testing-library/svelte` alone | Built for Svelte 4, jsdom-based. Touch/pointer/scroll events are poorly mocked in jsdom. Migration to `vitest-browser-svelte` is the official direction per Svelte docs and Scott Spence's migration guide. | `vitest-browser-svelte` with Playwright |
| `tsup` / `unbuild` | Generic TypeScript bundlers with no Svelte preprocessing support. They cannot handle `.svelte` files without custom plugins that reimplement what `svelte-package` does natively. | `@sveltejs/package` |
| CSS-in-JS or styled-components approaches | This library is headless by design. Any CSS injection breaks the zero-dependency and unstyled requirements. | Data attributes on DOM elements for consumer CSS targeting |
| Storybook for the demo | Heavy setup overhead for a single-component library. A simple SvelteKit page showcasing the component is sufficient. Storybook shines for multi-component design systems. | SvelteKit demo page |
## Version Compatibility Matrix
| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `svelte@5.x` | `@sveltejs/kit@2.x` | SvelteKit 2 required for Svelte 5. SvelteKit 1 does not support runes. |
| `@sveltejs/package@2.x` | `@sveltejs/kit@2.x` | Must be v2 — v1 generated `package.json` automatically in a way that conflicts with manual configuration. |
| `vitest@4.x` | `@vitest/browser@4.x` | Must be exact same major.minor — version mismatch causes silent test failures. |
| `vitest-browser-svelte@2.x` | `vitest@4.x`, `svelte@5.x` | v2 adds Svelte 5 runes support. v1 works with Svelte 5 components but lacks some runes-specific test utilities. |
| `shadcn-svelte@1.x` | `svelte@5.x` | shadcn-svelte v1.x targets Svelte 5. Earlier versions targeted Svelte 4. |
| `eslint-plugin-svelte@3.x` | `eslint@9-10.x` flat config | v3 supports ESLint flat config. v2 requires legacy `.eslintrc` format. |
## Stack Patterns
- All logic in `src/lib/`
- No CSS files — headless by design
- Export from `src/lib/index.ts` with named exports
- `"sideEffects": false` in package.json
- `src/routes/` for demo pages
- Import components from `$lib` (same `src/lib/` directory)
- Demo applies its own CSS using data attributes
- `static/r/` serves the shadcn-svelte registry JSON
- `registry.json` at project root
- `registry:build` generates JSON in `static/r/`
- Registry items reference the same source files used by the npm package
- No separate source maintained — single source of truth
## Sources
- [Svelte Docs: Testing](https://svelte.dev/docs/svelte/testing) — official testing recommendations, Vitest + browser mode
- [Svelte Docs: Packaging](https://svelte.dev/docs/kit/packaging) — `@sveltejs/package`, `package.json` exports format, `sideEffects`
- [shadcn-svelte: Registry Getting Started](https://www.shadcn-svelte.com/docs/registry/getting-started) — `registry.json` format, `registry:build` command
- [shadcn-svelte: registry.json reference](https://www.shadcn-svelte.com/docs/registry/registry-json) — schema fields, item types
- [shadcn-svelte: Changelog](https://www.shadcn-svelte.com/docs/changelog) — confirmed Svelte 5 + registry support
- [vitest-browser-svelte GitHub](https://github.com/vitest-dev/vitest-browser-svelte) — v2.1.0, Svelte 5 runes support confirmed
- [Scott Spence: Migrating to vitest-browser-svelte](https://scottspence.com/posts/migrating-from-testing-library-svelte-to-vitest-browser-svelte) — migration rationale, setup steps (MEDIUM confidence — community source)
- [publint.dev](https://publint.dev/) — package.json linting tool documentation
- npm registry (live queries) — version numbers for all packages above (HIGH confidence)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
