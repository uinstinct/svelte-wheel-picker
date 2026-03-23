# Phase 1: Project Setup - Research

**Researched:** 2026-03-23
**Domain:** SvelteKit library scaffold — manual greenfield setup
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** npm package name is `@uinstinct/svelte-wheel-picker`
- **D-02:** Package description: iOS-style wheel picker for Svelte 5 with inertia scrolling, infinite loop, and keyboard navigation
- **D-03:** Flat layout in `src/lib/` — all files at root level (components, hooks, types, utils). No subdirectories.
- **D-04:** Hook files use `.svelte.ts` extension per Svelte 5 convention
- **D-05:** Manual file-by-file setup — Claude creates all config and scaffold files directly, no `npx sv create`. Full control over exact versions and config.
- **D-06:** `engines.node` set to `>=18` in package.json. Node 18 LTS baseline for broadest compatibility.

### Claude's Discretion

- Exact ESLint rule configuration beyond defaults
- Prettier formatting options (tab width, etc.)
- Vitest config details (timeouts, browser launch args)
- Initial demo route placeholder content
- tsconfig strictness options beyond Svelte 5 recommended defaults

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 1 creates the entire toolchain from scratch with no scaffolding tool. The stack is fully specified in CLAUDE.md (verified against npm registry on 2026-03-23 — all versions match). The primary challenge is getting three independent systems — `@sveltejs/package` (npm build), Vitest browser mode (testing), and the shadcn-svelte registry tool (`registry:build`) — configured correctly in a single SvelteKit project without conflicts.

The CLAUDE.md research (from the project's `.planning/research/` directory) is HIGH confidence and has already verified all package versions live. This phase-level research adds: (1) the exact config file contents needed for each tool, (2) the Vitest 4.x browser-mode API change (new `@vitest/browser-playwright` package pattern), and (3) the env availability audit.

**Primary recommendation:** Write all config files in one wave, then run the four success criteria checks in sequence. Do not install packages incrementally — install everything at once to let pnpm resolve peer dependencies correctly.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| svelte | 5.54.1 | Component framework | Locked — runes-based reactivity |
| @sveltejs/kit | 2.55.0 | Library scaffold + demo routing | Only official way to build Svelte libraries with `svelte-package` |
| @sveltejs/package | 2.5.7 | Build `src/lib/` → publishable `dist/` | Official build tool; preprocesses `.svelte`, transpiles TS, generates `.d.ts` |
| @sveltejs/vite-plugin-svelte | 7.0.0 | Vite integration | Required by SvelteKit; no separate Vite config needed |
| typescript | 5.9.3 | Static typing | Locked — verbatimModuleSyntax + isolatedModules required |

### Testing

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| vitest | 4.1.0 | Test runner | Vite-native; recommended by official Svelte docs |
| @vitest/browser-playwright | 4.1.0 | Browser mode via Playwright | **New in Vitest 4.x** — replaces direct `@vitest/browser` install; transitively installs `@vitest/browser` |
| vitest-browser-svelte | 2.1.0 | Svelte component rendering in browser tests | Provides `render()` for Vitest browser mode; v2 has Svelte 5 runes support |

### Distribution

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| shadcn-svelte | 1.2.3 | Registry build CLI | **1.2.3** (not 1.2.2 from CLAUDE.md — npm shows 1.2.3 is latest as of 2026-03-23) |
| publint | 0.3.18 | package.json linting | Run as `prepack` script |

### Dev Tooling

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| eslint | 10.1.0 | Linting | Flat config only — `eslint.config.js` |
| eslint-plugin-svelte | 3.16.0 | Svelte-aware lint rules | Parses `.svelte` via `svelte-eslint-parser` |
| svelte-eslint-parser | 1.6.0 | ESLint parser for `.svelte` files | Peer dep of eslint-plugin-svelte; install explicitly |
| prettier | 3.8.1 | Code formatting | Requires `prettier-plugin-svelte` |
| prettier-plugin-svelte | 3.5.1 | Svelte-specific formatting | Without it, Prettier mangles `<script>` blocks |

**Installation (pnpm):**
```bash
pnpm add -D svelte@5.54.1 @sveltejs/kit@2.55.0 @sveltejs/package@2.5.7 @sveltejs/vite-plugin-svelte@7.0.0 typescript@5.9.3
pnpm add -D vitest@4.1.0 @vitest/browser-playwright@4.1.0 vitest-browser-svelte@2.1.0
pnpm add -D shadcn-svelte@1.2.3 publint@0.3.18
pnpm add -D eslint@10.1.0 eslint-plugin-svelte@3.16.0 svelte-eslint-parser@1.6.0
pnpm add -D prettier@3.8.1 prettier-plugin-svelte@3.5.1
pnpm exec playwright install chromium
```

**Version verification (confirmed 2026-03-23 via `npm view [pkg] version`):**

| Package | Verified Version |
|---------|-----------------|
| svelte | 5.54.1 |
| @sveltejs/kit | 2.55.0 |
| @sveltejs/package | 2.5.7 |
| @sveltejs/vite-plugin-svelte | 7.0.0 |
| typescript | 5.9.3 |
| vitest | 4.1.0 |
| @vitest/browser | 4.1.0 |
| @vitest/browser-playwright | 4.1.0 |
| vitest-browser-svelte | 2.1.0 |
| shadcn-svelte | 1.2.3 |
| publint | 0.3.18 |
| eslint | 10.1.0 |
| eslint-plugin-svelte | 3.16.0 |
| svelte-eslint-parser | 1.6.0 |
| prettier | 3.8.1 |
| prettier-plugin-svelte | 3.5.1 |

---

## Architecture Patterns

### Recommended Project Structure

```
/                                  # repo root (= project root — no npx sv create)
├── src/
│   ├── lib/                       # npm package source (flat — D-03)
│   │   ├── index.ts               # entry point: re-exports everything
│   │   └── WheelPicker.svelte     # placeholder smoke-test component (Phase 1 only)
│   └── routes/
│       └── +page.svelte           # demo route / smoke-test import check
├── static/
│   └── r/                         # generated by registry:build (empty until Phase 6)
├── dist/                          # output of svelte-package (gitignored)
├── package.json                   # library config (not the app config)
├── svelte.config.js               # SvelteKit config
├── vite.config.ts                 # Vite config (extends SvelteKit)
├── vitest.config.ts               # Vitest browser mode config
├── tsconfig.json                  # TypeScript config
├── tsconfig.test.json             # TypeScript config for tests
├── eslint.config.js               # ESLint flat config
├── .prettierrc                    # Prettier config
├── .prettierignore                # Prettier ignore
├── .gitignore
└── registry.json                  # shadcn-svelte registry manifest (Phase 6 content)
```

### Pattern 1: package.json for a Headless Svelte Library

**What:** The `package.json` must be hand-written (D-05). The `exports` field, `svelte` legacy field, `peerDependencies`, and `sideEffects` are all required for correct bundler behavior.

**Exact structure:**
```json
{
  "name": "@uinstinct/svelte-wheel-picker",
  "version": "0.1.0",
  "type": "module",
  "description": "iOS-style wheel picker for Svelte 5 with inertia scrolling, infinite loop, and keyboard navigation",
  "license": "MIT",
  "engines": { "node": ">=18" },
  "svelte": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "peerDependencies": {
    "svelte": "^5.0.0"
  },
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "package": "svelte-package && publint",
    "prepack": "npm run package",
    "test": "vitest",
    "lint": "eslint .",
    "format": "prettier --write .",
    "registry:build": "shadcn-svelte registry build"
  },
  "devDependencies": {}
}
```

Key points:
- `"sideEffects": false` — headless library, no CSS — enables full tree-shaking
- `"svelte"` legacy field — for older tooling that doesn't read `exports`
- `"peerDependencies"` only — no `"dependencies"` (zero runtime deps)
- `package` script runs `svelte-package && publint` so publint runs on every build

### Pattern 2: svelte.config.js

**What:** SvelteKit configuration. For a library project, the key field is `kit.package` (or absence of it — `@sveltejs/package` reads from `src/lib/` by convention). Aliases go here, not in tsconfig.

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      '$lib': 'src/lib',
    },
  },
};

export default config;
```

Note: `vitePreprocess()` is required for TypeScript in `.svelte` files.

### Pattern 3: vitest.config.ts (Browser Mode — Vitest 4.x API)

**What:** Vitest 4.x changed the browser provider API. The `@vitest/browser-playwright` package is the correct install; it provides the `playwright` import.

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    setupFiles: ['vitest-browser-svelte'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
});
```

**Critical:** `hot: !process.env.VITEST` disables HMR during test runs to prevent Svelte from trying to set up dev-mode watchers in test context.

### Pattern 4: tsconfig.json (Svelte 5 recommended)

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true
  }
}
```

Note: The `.svelte-kit/tsconfig.json` is auto-generated by SvelteKit dev server on first `pnpm dev` run. The project must run `pnpm dev` once before TypeScript checks will pass.

### Pattern 5: ESLint Flat Config

```javascript
// eslint.config.js
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
  },
  {
    ignores: ['build/', 'dist/', '.svelte-kit/', 'node_modules/'],
  },
];
```

### Pattern 6: Smoke-Test Component (Phase 1 Placeholder)

`src/lib/index.ts` and `src/lib/WheelPicker.svelte` must exist so the success criteria #4 can be verified (TypeScript import from demo route without errors).

```typescript
// src/lib/index.ts
export { default as WheelPicker } from './WheelPicker.svelte';
```

```svelte
<!-- src/lib/WheelPicker.svelte -->
<script lang="ts">
  let { label = 'Wheel Picker' }: { label?: string } = $props();
</script>
<div data-wheel-picker>{label}</div>
```

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { WheelPicker } from '$lib';
</script>
<WheelPicker />
```

### Anti-Patterns to Avoid

- **Generating project with `npx sv create`:** D-05 prohibits this. Config must be written file-by-file for full version control.
- **Installing `@vitest/browser` directly as a standalone dep:** In Vitest 4.x, install `@vitest/browser-playwright` instead — it transitively installs `@vitest/browser` at the matching version. Avoids version skew.
- **Using `environment: 'jsdom'`:** Explicitly prohibited. Browser mode via Playwright only (CLAUDE.md).
- **Putting aliases in tsconfig.json instead of svelte.config.js:** SvelteKit requires aliases in `svelte.config.js` `kit.alias`. tsconfig aliases are ignored by the packager.
- **Missing `vitePreprocess()`:** Without it, TypeScript inside `.svelte` `<script lang="ts">` blocks will fail to compile.
- **Running publint before `svelte-package`:** `dist/` does not exist until `svelte-package` runs. Always sequence `svelte-package && publint`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Package.json exports validation | Custom validation script | `publint` | Handles bundler-specific edge cases (exports ordering, types resolution modes, sideEffects) that are non-obvious |
| `.svelte` file preprocessing for npm | Custom Rollup config | `@sveltejs/package` | Handles TypeScript extraction, `.d.ts` generation, file copying — all with correct Svelte semantics |
| Svelte component rendering in tests | jsdom + manual mounting | `vitest-browser-svelte` | Real-browser accuracy; avoids the passive-event-listener and scroll-behavior gaps in jsdom |
| TypeScript parsing in `.svelte` files | Custom Babel/TS config | `vitePreprocess()` | Official preprocessor; handles script/style/markup correctly in SvelteKit context |

---

## Common Pitfalls

### Pitfall 1: `.svelte-kit/tsconfig.json` Missing at Type-Check Time

**What goes wrong:** The `tsconfig.json` extends `.svelte-kit/tsconfig.json`, which is auto-generated by SvelteKit. If `pnpm dev` or `pnpm build` has not been run, this file does not exist and `tsc` fails with "cannot find tsconfig to extend."

**Why it happens:** This is a first-run bootstrap issue. `@sveltejs/kit` generates `.svelte-kit/` on first server start, not on install.

**How to avoid:** The plan must include a step that runs `pnpm dev --open=false` (or just `pnpm build`) once after installing packages to generate the `.svelte-kit/` directory before TypeScript checks.

**Warning signs:** `error TS5083: Cannot read file '.svelte-kit/tsconfig.json'` when running `tsc --noEmit`.

---

### Pitfall 2: Vitest 4.x Browser Mode API Break from 2.x/3.x Docs

**What goes wrong:** Many online guides (including the Svelte official testing docs at time of research) still show the `browser.name` / `browser.provider: 'playwright'` string API from Vitest 2.x/3.x. Vitest 4.x requires importing `playwright` from `@vitest/browser-playwright` and calling it as a function in `browser.provider`.

**Why it happens:** The API changed between major versions. Training-data-era docs or blog posts use the old API. The old API produces a config validation error at runtime.

**How to avoid:** Use `@vitest/browser-playwright` as documented here:
```typescript
import { playwright } from '@vitest/browser-playwright';
// ...
browser: { provider: playwright(), instances: [{ browser: 'chromium' }] }
```

**Warning signs:** `Error: Unknown browser provider 'playwright'` when running `pnpm test`.

---

### Pitfall 3: Playwright Chromium Not Installed After `pnpm install`

**What goes wrong:** `pnpm exec playwright install` must be run after package installation. Without this, Vitest browser mode fails silently or with a cryptic "browser not found" error. The Playwright binary is not part of the npm package contents.

**Why it happens:** Playwright downloads browser binaries separately from the npm package. `pnpm install` only installs the JS wrapper.

**How to avoid:** The plan must include an explicit `pnpm exec playwright install chromium` step after all package installation steps.

**Warning signs:** `Error: browserType.launch: Chromium distribution 'chrome' is not found` when running `pnpm test`.

---

### Pitfall 4: `publint` Failing on Correct Config Due to Missing `dist/`

**What goes wrong:** Running `publint` against a correct `package.json` fails because `dist/` doesn't exist yet. The error looks like a config problem but is actually a sequencing problem.

**Why it happens:** `publint` validates that files referenced in `exports` actually exist. If `svelte-package` hasn't run yet, `dist/index.js` and `dist/index.d.ts` don't exist.

**How to avoid:** Always run `svelte-package` before `publint`. The recommended `package` script in package.json chains them: `"package": "svelte-package && publint"`.

**Warning signs:** `publint` reports "File does not exist" for all export entries despite correct config.

---

### Pitfall 5: ESLint Fails on Svelte Files Without `parserOptions.parser`

**What goes wrong:** ESLint processes `.svelte` files correctly for template rules but fails on TypeScript inside `<script lang="ts">` blocks — reporting unexpected tokens or parse errors.

**Why it happens:** The `svelte-eslint-parser` handles the outer `.svelte` file structure but delegates `<script>` block parsing to a secondary parser. Without specifying `parserOptions.parser: ts.parser` in the Svelte file override block, the script block is not parsed by TypeScript's parser.

**How to avoid:** Include the `files: ['**/*.svelte']` override with `parserOptions.parser: ts.parser` in `eslint.config.js` (see Pattern 5 above).

**Warning signs:** `Parsing error: Unexpected token` on TypeScript type annotations inside `.svelte` `<script lang="ts">` blocks.

---

### Pitfall 6: `shadcn-svelte` Requires a `registry.json` to Run `registry:build`

**What goes wrong:** Running `pnpm registry:build` fails if `registry.json` does not exist at the project root.

**Why it happens:** The `shadcn-svelte registry build` command reads `registry.json` as its manifest. No file = no source of registry item definitions.

**How to avoid:** Create a minimal `registry.json` as a placeholder in Phase 1. It can declare zero items — the structure just needs to be valid JSON with the `$schema` field.

```json
{
  "$schema": "https://shadcn-svelte.com/schema/registry.json",
  "name": "@uinstinct/svelte-wheel-picker",
  "homepage": "https://github.com/uinstinct/svelte-wheel-picker",
  "items": []
}
```

**Warning signs:** `Error: Cannot find registry.json` from `shadcn-svelte registry build`.

---

## Code Examples

### Minimal Smoke-Test (Phase 1 Vitest Test)

```typescript
// src/lib/WheelPicker.test.ts
// Source: vitest-browser-svelte docs + Vitest browser mode guide
import { render } from 'vitest-browser-svelte';
import { expect, test } from 'vitest';
import WheelPicker from './WheelPicker.svelte';

test('renders without errors', async () => {
  const screen = await render(WheelPicker, { label: 'Test' });
  await expect.element(screen.getByText('Test')).toBeVisible();
});
```

### Checking publint Output

```bash
# After running svelte-package, run publint standalone to see output
pnpm exec publint
# Expected: zero errors, zero warnings for a correctly configured package
```

### Verifying dist/ Contents After Build

```bash
# svelte-package output should contain .svelte files (not compiled .js bundles)
ls dist/
# Expected: WheelPicker.svelte  index.js  index.d.ts
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@vitest/browser` direct + `browser.provider: 'playwright'` string | `@vitest/browser-playwright` package + `playwright()` function call | Vitest 4.0 | Provider config is now a typed function, not a string |
| `npx sv create` scaffold | Manual file creation (D-05) | Project decision | Full control; no scaffold-generated files to override |
| `@testing-library/svelte` (jsdom) | `vitest-browser-svelte` (real browser) | Svelte 5 migration | Touch/scroll events work correctly in tests |
| ESLint `.eslintrc.cjs` | ESLint flat config `eslint.config.js` | ESLint 9+ | Required for Svelte 5 rune syntax recognition |

**Deprecated/outdated:**
- `browser.provider: 'playwright'` (string): Vitest 3.x API, fails in 4.x
- `@testing-library/svelte`: Built for Svelte 4/jsdom — explicitly excluded in CLAUDE.md
- `npx sv create`: Excluded by D-05

---

## Open Questions

1. **shadcn-svelte 1.2.3 vs 1.2.2**
   - What we know: CLAUDE.md specifies 1.2.2, npm registry shows 1.2.3 as latest
   - What's unclear: Whether 1.2.3 has breaking changes vs 1.2.2
   - Recommendation: Use 1.2.3 (latest). The patch bump is unlikely to have breaking changes. If `registry:build` fails, pin to 1.2.2.

2. **tsconfig.test.json necessity**
   - What we know: Some Vitest + SvelteKit setups require a separate `tsconfig.test.json` pointing to vitest type definitions
   - What's unclear: Whether Vitest 4.x browser mode injects types automatically via `vitest-browser-svelte`
   - Recommendation: Start without a separate tsconfig for tests. If TypeScript reports `Cannot find name 'test'` or `Cannot find name 'expect'`, add a `tsconfig.test.json` extending the root tsconfig with `"types": ["vitest/globals"]`.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All tooling | Yes | v24.6.0 | — |
| pnpm | Package management | Yes | 10.29.2 | npm 11.5.1 |
| npm | Package install fallback | Yes | 11.5.1 | — |
| npx | Running CLI tools | Yes | bundled with npm | — |
| Playwright (Chromium) | Vitest browser mode | Not installed | — | Must install via `pnpm exec playwright install chromium` |
| git | Version control | Yes (repo exists) | — | — |

**Missing dependencies with no fallback:**
- Playwright Chromium binary: Must be installed via `pnpm exec playwright install chromium` after package install. This is a required step in the plan — tests will silently fail without it.

**Missing dependencies with fallback:**
- None

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + vitest-browser-svelte 2.1.0 |
| Config file | `vitest.config.ts` (Wave 0 — does not exist yet) |
| Quick run command | `pnpm test --run` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

Phase 1 has no v1 requirement IDs (it is foundational infrastructure). However, the success criteria are testable:

| Success Criterion | Test Type | Automated Command | File Exists? |
|-------------------|-----------|-------------------|-------------|
| `npm run build` produces `dist/` | shell integration | `pnpm package && ls dist/` | N/A — shell check |
| Vitest browser mode works | smoke | `pnpm test --run` | No — Wave 0 |
| `publint` zero errors | shell integration | `pnpm exec publint` | N/A — shell check |
| Smoke-test import works | unit (browser) | `pnpm test --run` | No — Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm exec publint` (fast, validates config)
- **Per wave merge:** `pnpm test --run && pnpm package && pnpm exec publint`
- **Phase gate:** All four success criteria green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/WheelPicker.test.ts` — smoke test: import and render the placeholder component
- [ ] `vitest.config.ts` — Vitest browser mode config (does not exist)
- [ ] `playwright install chromium` — browser binary (not a file, a runtime step)

---

## Sources

### Primary (HIGH confidence)
- npm registry live queries (`npm view [pkg] version`) — all version numbers verified 2026-03-23
- `.planning/research/STACK.md` — comprehensive stack research from initial project research phase
- `.planning/research/PITFALLS.md` — verified pitfalls research from initial project research phase
- `.planning/research/ARCHITECTURE.md` — architecture patterns from initial project research phase
- https://svelte.dev/docs/kit/packaging — `@sveltejs/package`, `package.json` exports format, `sideEffects`
- https://vitest.dev/guide/browser/ — Vitest 4.x browser mode, `@vitest/browser-playwright` API

### Secondary (MEDIUM confidence)
- https://github.com/vitest-dev/vitest-browser-svelte — `render()` usage, `setupFiles` config, Svelte 5 runes support
- npm registry: `@vitest/browser-playwright@4.1.0` metadata — confirms it transitively installs `@vitest/browser`

### Tertiary (LOW confidence)
- None for Phase 1 — all critical decisions are verified against primary sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified live against npm registry 2026-03-23
- Architecture (config files): HIGH — derived from official SvelteKit, Vitest, and Svelte docs
- Pitfalls: HIGH — `.svelte-kit/tsconfig.json` bootstrap, Playwright install, and Vitest 4.x API change all verified
- Vitest 4.x provider API: HIGH — confirmed via `npm view @vitest/browser-playwright` metadata and vitest.dev/guide/browser

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (stable ecosystem — Vitest and SvelteKit release slowly)
