# Research: Add shadcn Registry to Site

**Researched:** 2026-03-31
**Domain:** shadcn-svelte registry, SvelteKit static serving, Vercel deployment
**Confidence:** HIGH

## Summary

The shadcn-svelte registry infrastructure is already fully built for this project. `registry.json` exists at the project root with a single `wheel-picker` item bundling all 7 source files. The `registry:build` script (`shadcn-svelte registry build`) has already been run and generated `static/r/index.json` and `static/r/wheel-picker.json`. The SvelteKit Vercel adapter will serve `static/r/` as static files at the deployed URL.

The task is not to set up the registry — it is already set up. The work remaining is:
1. Verify the deployed URL serves the registry files correctly
2. Add the install command to the demo page so users know how to use it

**Primary recommendation:** The install command for users will be:
```
npx shadcn-svelte@latest add https://svelte-wheel-picker.vercel.app/r/wheel-picker.json
```

## Current State of the Registry

### registry.json (project root) — EXISTS, CORRECT
- Schema: `https://shadcn-svelte.com/schema/registry.json`
- Name: `@uinstinct/svelte-wheel-picker`
- Homepage: `https://github.com/uinstinct/svelte-wheel-picker` — **should be updated to the Vercel URL**
- Single item: `wheel-picker` (type: `registry:component`)
- 7 files bundled: `WheelPicker.svelte`, `WheelPickerWrapper.svelte`, `types.ts`, `use-wheel-physics.svelte.ts`, `use-controllable-state.svelte.ts`, `use-typeahead-search.svelte.ts`, `wheel-physics-utils.ts`
- `registryDependencies: []` — correctly set to empty array (required by schema, validated in Phase 6)

### static/r/ — EXISTS, BUILT
- `static/r/index.json` — registry index listing the wheel-picker item with `relativeUrl: "wheel-picker.json"`
- `static/r/wheel-picker.json` — full registry item with all 7 files inlined as `content` strings (~35KB)

### package.json — registry:build script EXISTS
```json
"registry:build": "shadcn-svelte registry build"
```
shadcn-svelte@1.2.3 is installed as devDependency — the command is available.

## How It Works

### Static file serving
SvelteKit with `@sveltejs/adapter-vercel` serves everything in `static/` as static assets at the root URL. After deploy to `svelte-wheel-picker.vercel.app`, the following URLs will be live:
- `https://svelte-wheel-picker.vercel.app/r/index.json`
- `https://svelte-wheel-picker.vercel.app/r/wheel-picker.json`

No additional server configuration needed — Vercel handles it automatically.

### Install command format (HIGH confidence — verified via official docs)
The shadcn-svelte CLI accepts a full URL to the JSON file:
```
npx shadcn-svelte@latest add https://svelte-wheel-picker.vercel.app/r/wheel-picker.json
```
The `.json` extension is required in the URL. The CLI fetches the JSON, reads the `files` array, and copies the component source into the user's project under `src/lib/components/` (or their configured path).

### What the CLI does with the registry item
- Reads `files[]` from `wheel-picker.json`
- Writes each file's `content` into the target project
- Files typed `registry:component` go to the components directory
- Files typed `registry:lib` go to the lib/utils directory
- No npm install triggered (zero dependencies, no `dependencies` field in registry item)

## What Needs to Change

### 1. Update registry.json homepage field
Current: `"homepage": "https://github.com/uinstinct/svelte-wheel-picker"`
Should be: `"homepage": "https://svelte-wheel-picker.vercel.app"`

The homepage field is used for metadata/attribution in the CLI output. It should point to the live site, not GitHub.

After changing, run `pnpm registry:build` to regenerate `static/r/wheel-picker.json`.

### 2. Add install command to the demo page
`src/routes/+page.svelte` currently shows component demos only — no installation instructions. Users visiting the site need to see the install command.

Add a visible section showing:
```
npx shadcn-svelte@latest add https://svelte-wheel-picker.vercel.app/r/wheel-picker.json
```

Also useful: the npm install alternative:
```
npm install @uinstinct/svelte-wheel-picker
```

### 3. Verify static/r/ files are committed to git
The `static/r/` files must be committed — they are not gitignored and are served as static assets by Vercel. Vercel does not run `registry:build` at deploy time (only `vite build` runs). If `static/r/wheel-picker.json` is not in the git repo, the endpoint will 404 after deploy.

Check: `git status static/r/` — if these files are untracked, add and commit them.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Registry JSON generation | Manual JSON files | `pnpm registry:build` regenerates from `registry.json` |
| Registry endpoint serving | Custom API route in SvelteKit | `static/r/` served automatically by SvelteKit/Vercel |
| Component file inlining | Manually copying source into JSON | `registry:build` reads source files and inlines content |

## Common Pitfalls

### Pitfall 1: static/r/ not committed to git
**What goes wrong:** Vercel deploys from git, not from local build. If `static/r/*.json` are not committed, the registry URLs 404.
**How to avoid:** Commit `static/r/` files. Treat them like committed build artifacts (similar to `package-lock.json`).
**Warning signs:** `curl https://svelte-wheel-picker.vercel.app/r/wheel-picker.json` returns 404.

### Pitfall 2: registry:build not re-run after source changes
**What goes wrong:** Source files change (e.g., Phase 7 cylindrical mode added), but `static/r/wheel-picker.json` still has old content. Users install stale code.
**How to avoid:** Run `pnpm registry:build` and commit `static/r/` whenever library source files change.

### Pitfall 3: URL without .json extension
**What goes wrong:** CLI silently fails or gives a confusing error if the URL does not end in `.json`.
**How to avoid:** Always include `.json` in documented install URLs.

### Pitfall 4: homepage pointing to GitHub instead of the live site
**What goes wrong:** Minor — CLI output shows GitHub URL rather than the demo site. Not a blocker.
**How to avoid:** Update `registry.json` homepage before publishing.

## Validation

After deploy, verify with:
```bash
curl https://svelte-wheel-picker.vercel.app/r/wheel-picker.json | head -5
# Should return: {"$schema": "...", "name": "wheel-picker", ...}

curl https://svelte-wheel-picker.vercel.app/r/index.json
# Should return: [{"name": "wheel-picker", ...}]
```

End-to-end test (in a fresh Svelte 5 project):
```bash
npx shadcn-svelte@latest add https://svelte-wheel-picker.vercel.app/r/wheel-picker.json
```

## Sources

### Primary (HIGH confidence)
- shadcn-svelte docs: getting-started — install command format confirmed as `npx shadcn-svelte@latest add [URL].json`
- Project codebase: `static/r/` directory confirmed to exist with built files
- Project codebase: `registry.json` confirmed correct format (Phase 6 validated schema requirements)
- SvelteKit docs: `static/` directory served as-is at root URL
- STATE.md: Phase 6 decision — `registryDependencies: []` required even when empty

### Secondary (MEDIUM confidence)
- shadcn-svelte docs: registry-json schema — `homepage` field is metadata, not functional

## Metadata

**Confidence breakdown:**
- Registry setup: HIGH — files exist and are correctly formatted
- Install URL format: HIGH — confirmed from official docs
- What needs changing: HIGH — direct inspection of current state
- Vercel static serving: HIGH — standard SvelteKit/Vercel behavior

**Research date:** 2026-03-31
**Valid until:** 2026-05-01 (stable tooling)
