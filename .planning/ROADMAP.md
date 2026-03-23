# Roadmap: Svelte Wheel Picker

## Overview

Six phases build the library bottom-up: scaffolding first, then types and utility hooks, then the core WheelPicker interaction layer (the highest-risk phase), then infinite loop mode layered on top of solid snap logic, then the wrapper component and npm package, and finally the shadcn-svelte registry and demo site. Each phase delivers a verifiable capability; nothing ships until the layer beneath it is solid.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Project Setup** - SvelteKit library scaffold with correct toolchain and package structure (completed 2026-03-23)
- [x] **Phase 2: Types and Utility Hooks** - Core TypeScript types, controllable state hook, type-ahead hook (completed 2026-03-23)
- [ ] **Phase 3: WheelPicker Core** - Finite scroll, inertia, snap, keyboard, styling API — the iOS feel
- [ ] **Phase 4: Infinite Loop Mode** - Ghost-item duplication and modulo offset for seamless wrap-around
- [ ] **Phase 5: WheelPickerWrapper and Package** - Group container, npm publication, publint validation
- [ ] **Phase 6: shadcn Registry and Demo Site** - CLI registry integration and interactive demo

## Phase Details

### Phase 1: Project Setup
**Goal**: A correctly configured SvelteKit library project exists that can build, test, and eventually publish the component
**Depends on**: Nothing (first phase)
**Requirements**: (no v1 requirements map here — this phase creates the foundation all requirements depend on)
**Success Criteria** (what must be TRUE):
  1. `npm run build` runs `svelte-package` and produces a `dist/` directory with preprocessed `.svelte` files
  2. `npm run test` runs Vitest in real-browser mode via Playwright with no jsdom fallback
  3. `publint` reports zero errors against the `package.json` exports configuration
  4. A basic smoke-test component can be imported from `src/lib/index.ts` in the demo route without TypeScript errors
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Project configuration files and dependency installation
- [x] 01-02-PLAN.md — Source files (placeholder component, test, demo route) and success criteria verification

### Phase 2: Types and Utility Hooks
**Goal**: The foundational TypeScript types and two rune-based utility hooks exist, giving WheelPicker a stable import layer
**Depends on**: Phase 1
**Requirements**: COMP-03, COMP-04, MODE-01, MODE-02, INTR-06, DIST-01
**Success Criteria** (what must be TRUE):
  1. `WheelPickerOption<T>`, `WheelPickerProps`, and `WheelPickerClassNames` are importable from the package index with correct TypeScript inference on generic `T extends string | number`
  2. `useControllableState` correctly reads from the external `value` prop in controlled mode and owns internal `$state` in uncontrolled mode — confirmed by a unit test that switches between both modes
  3. `useTypeaheadSearch` accumulates keystrokes within a 500ms window and returns the first matching option label — confirmed by a unit test with a time delay
  4. All utility files use the `.svelte.ts` extension and contain no Svelte 4 stores
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — TypeScript type definitions and package barrel exports
- [x] 02-02-PLAN.md — useControllableState hook (controlled/uncontrolled reactive state)
- [x] 02-03-PLAN.md — useTypeaheadSearch hook (keystroke accumulation with cycling)

### Phase 3: WheelPicker Core
**Goal**: A single WheelPicker wheel delivers the iOS-feel interaction — touch, mouse, keyboard, snap, styling API — in finite mode
**Depends on**: Phase 2
**Requirements**: COMP-01, INTR-01, INTR-02, INTR-03, INTR-04, INTR-05, MODE-04, STYL-01, STYL-02, STYL-03, STYL-04
**Success Criteria** (what must be TRUE):
  1. Dragging the wheel on a touch device produces smooth inertia scrolling that decelerates and snaps to the nearest enabled option on release
  2. Dragging with a mouse and using the scroll wheel both produce inertia scroll with snap-to-item on a desktop browser
  3. Arrow Up/Down keys move selection one item at a time; Home/End jump to first/last enabled option; disabled options are skipped in all navigation modes
  4. The center row shows a visible selection highlight overlay, and all structural elements expose `data-swp-*` attributes that can be targeted with consumer CSS
  5. Passing a `classNames` prop injects custom classes onto the correct elements; changing `visibleCount`, `optionItemHeight`, `dragSensitivity`, and `scrollSensitivity` props visibly affects layout and feel
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Types extension + pure physics functions + WheelPhysics reactive class
- [ ] 03-02-PLAN.md — WheelPicker.svelte component, barrel exports, tests, and demo page
- [ ] 03-03-PLAN.md — Visual and functional verification checkpoint

### Phase 4: Infinite Loop Mode
**Goal**: WheelPicker wraps seamlessly at both ends when `infinite` is true, with no visible jump or stutter at boundaries
**Depends on**: Phase 3
**Requirements**: MODE-03
**Success Criteria** (what must be TRUE):
  1. When `infinite={true}`, scrolling or dragging past the last option wraps to the first option continuously with no visual discontinuity
  2. Rapid sustained scrolling in either direction never produces a visible position jump or a blank option slot
  3. When `infinite={false}` (the default), the wheel stops at the first and last options with no wrap behavior
**Plans**: TBD
**UI hint**: yes

### Phase 5: WheelPickerWrapper and Package
**Goal**: Multiple wheels work together as a unit and the library is publishable to npm with correct exports
**Depends on**: Phase 4
**Requirements**: COMP-02, DIST-01, DIST-02, DIST-03
**Success Criteria** (what must be TRUE):
  1. `WheelPickerWrapper` containing two or more `WheelPicker` wheels correctly routes Tab/Shift+Tab focus between them
  2. `npm pack` produces a tarball that a fresh SvelteKit project can install and import without TypeScript errors, with full type inference on generic props
  3. `publint` reports zero errors; the package has no runtime dependencies in `node_modules` propagation (`sideEffects: false`, zero deps)
  4. An SSR-enabled SvelteKit consumer app imports the package without a `window is not defined` error at module evaluation time
**Plans**: TBD
**UI hint**: yes

### Phase 6: shadcn Registry and Demo Site
**Goal**: Developers can add the component via `shadcn-svelte` CLI and see a working interactive demo
**Depends on**: Phase 5
**Requirements**: DIST-04, DIST-05
**Success Criteria** (what must be TRUE):
  1. Running `npx shadcn-svelte@latest add [registry-url]` copies the component source files into a consumer project and the component renders correctly
  2. The demo site at the root route shows at least two working examples (e.g., time picker, standalone single wheel) using `data-swp-*` CSS targeting for styling
  3. The demo site loads without JavaScript errors and all wheels are interactive on both desktop and a mobile viewport
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Setup | 2/2 | Complete   | 2026-03-23 |
| 2. Types and Utility Hooks | 3/3 | Complete   | 2026-03-23 |
| 3. WheelPicker Core | 0/3 | In progress | - |
| 4. Infinite Loop Mode | 0/TBD | Not started | - |
| 5. WheelPickerWrapper and Package | 0/TBD | Not started | - |
| 6. shadcn Registry and Demo Site | 0/TBD | Not started | - |
