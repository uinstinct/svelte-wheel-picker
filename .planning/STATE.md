---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Milestone complete
stopped_at: Completed quick-260331-qg5-PLAN.md — version bump now goes to releases/v* branch not main
last_updated: "2026-03-31T13:35:48.412Z"
last_activity: "2026-03-31 - Completed quick task 260331-pv9: add README.md and LICENSE to npm files array"
progress:
  total_phases: 7
  completed_phases: 7
  total_plans: 16
  completed_plans: 16
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-23)

**Core value:** Pixel-perfect, buttery-smooth wheel picker interaction that feels native on both touch and desktop
**Current focus:** Phase 07 — rotating-drum-cylinder-list-style-picker-with-3d-perspective-items-farther-from-center-appear-smaller-and-compressed-vertically

## Current Position

Phase: 07
Plan: Not started

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01-project-setup P01 | 5m | 2 tasks | 15 files |
| Phase 01-project-setup P02 | 5 | 2 tasks | 2 files |
| Phase 02-types-and-utility-hooks P01 | 3 | 2 tasks | 4 files |
| Phase 02-types-and-utility-hooks P03 | 3 | 1 tasks | 3 files |
| Phase 02-types-and-utility-hooks P02 | 4 | 1 tasks | 3 files |
| Phase 03-wheelpicker-core P01 | 22 | 2 tasks | 5 files |
| Phase 03-wheelpicker-core P02 | 15 | 2 tasks | 4 files |
| Phase 03-wheelpicker-core P03 | 30 | 1 tasks | 2 files |
| Phase 04-infinite-loop-mode P01 | 5 | 2 tasks | 4 files |
| Phase 04-infinite-loop-mode P02 | 2 | 2 tasks | 2 files |
| Phase 05-wheelpickerwrapper-and-package P01 | 2m | 2 tasks | 6 files |
| Phase 05-wheelpickerwrapper-and-package P02 | 7 | 1 tasks | 3 files |
| Phase 05-wheelpickerwrapper-and-package P03 | 10 | 2 tasks | 4 files |
| Phase 06-shadcn-registry-and-demo-site P01 | 2 | 2 tasks | 4 files |
| Phase 07-rotating-drum-cylinder-list-style-picker-with-3d-perspective-items-farther-from-center-appear-smaller-and-compressed-vertically PP01 | 3 | 2 tasks | 3 files |
| Phase 07 P02 | 2 | 2 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Init: Svelte 5 only, runes-based reactivity
- Init: Headless/unstyled, data attributes for CSS targeting
- Init: shadcn-svelte registry + npm dual distribution
- [Phase 01-project-setup]: Use @eslint/js@10.0.1 (10.1.0 does not exist on npm — research version was wrong)
- [Phase 01-project-setup]: PLAYWRIGHT_BROWSERS_PATH=.playwright set in test scripts — system cache dir had EPERM
- [Phase 01-project-setup]: Placeholder WheelPicker.svelte + +page.svelte created in Plan 01 (required for svelte-kit sync)
- [Phase 01-project-setup]: Removed invalid 'hot' option from vitest.config.ts — not valid in @sveltejs/vite-plugin-svelte v7
- [Phase 01-project-setup]: Added .claude/ and .playwright/ to ESLint ignores to prevent linting GSD tooling and Playwright browser binaries
- [Phase 01-project-setup]: Browser tests blocked by sandbox environment (Playwright session timeout) — documented as known limitation, not a code defect
- [Phase 02-types-and-utility-hooks]: WheelPickerClassNames uses Svelte-idiomatic names (wrapper/option/optionText/selection) not React names
- [Phase 02-types-and-utility-hooks]: vite@8.0.1 added as explicit devDependency (was missing symlink causing tsc error)
- [Phase 02-types-and-utility-hooks]: TypeaheadSearch class-based for #timer and #lastTime encapsulation;  on #buffer/#lastKey for runes consistency
- [Phase 02-types-and-utility-hooks]: Class-based Svelte 5 rune hook pattern: private $state fields in class enable reactivity outside components
- [Phase 02-types-and-utility-hooks]: Controlled/uncontrolled detection via typeof onChange === 'function' at construction time
- [Phase 03-wheelpicker-core]: vitest config split into unit (node) + browser (Playwright) projects — Playwright segfaults in sandbox, pure logic tests need node environment
- [Phase 03-wheelpicker-core]: WheelPhysics: single $state offset field; all animation tracking (isDragging, rafId, yList) is non-reactive plain class fields to prevent reactive cycles
- [Phase 03-wheelpicker-core]: Physics constants (RESISTANCE=0.3, MAX_VELOCITY=30) copied verbatim from React v1.2.2 source for UX parity
- [Phase 03-wheelpicker-core]: WheelPhysics API: endDrag/handleWheel/animateTo take minimal args — internal config handles itemHeight/visibleCount/sensitivity
- [Phase 03-wheelpicker-core]: Conditional attribute omission: use undefined (not false/null) to prevent data-swp-selected/disabled from appearing in DOM when false
- [Phase 03-wheelpicker-core]: Consumer styling via :global([data-swp-wrapper].wheel) targeting library elements from consumer style blocks
- [Phase 03-wheelpicker-core]: Snap regression fix: cancel in-flight RAF before scheduling new animateTo() to prevent concurrent animation interference
- [Phase 03-wheelpicker-core]: Dark mode CSS: define custom property values at :root and override only variables in prefers-color-scheme dark — eliminates cascade specificity conflicts
- [Phase 04-infinite-loop-mode]: wrapIndex uses ((index % n) + n) % n formula from React v1.2.2 for exact UX parity
- [Phase 04-infinite-loop-mode]: #infinite is plain boolean (not $state) — configuration field, not DOM-driving reactive state
- [Phase 04-infinite-loop-mode]: Ghost items carry data-swp-option but never data-swp-selected per D-03
- [Phase 04-infinite-loop-mode]: Before-ghosts use [...options].reverse() so last item sits directly above real section
- [Phase 04-infinite-loop-mode]: Keyboard wrap passes extended indices to animateTo; onSnap normalizes via wrapIndex + jumpTo
- [Phase 05-wheelpickerwrapper-and-package]: WheelPickerWrapperProps excludes children — Svelte 5 injects children as built-in snippet prop to avoid TypeScript conflicts
- [Phase 05-wheelpickerwrapper-and-package]: Public API trimmed to WheelPicker + WheelPickerWrapper + 5 type exports — hooks and physics constants are internal (D-07/D-08)
- [Phase 05-wheelpickerwrapper-and-package]: SSR safety validated via Vitest node project dynamic import (not raw node) — Node cannot load .svelte files natively
- [Phase 05-wheelpickerwrapper-and-package]: .npmignore added to exclude compiled test artifacts from npm tarball (svelte-package compiles all src/lib/ including tests)
- [Phase 05-wheelpickerwrapper-and-package]: Post-compile cleanup in package script (not .npmignore) is the authoritative mechanism for excluding test artifacts from tarball
- [Phase 05-wheelpickerwrapper-and-package]: Use @vitest/browser-playwright/context for userEvent import (direct dep); @vitest/browser/context is only transitive and not resolved by tsc
- [Phase 06-shadcn-registry-and-demo-site]: shadcn-svelte v1.2.3 requires registryDependencies field as empty array even when no dependencies exist — schema validation fails if field is absent
- [Phase 06-shadcn-registry-and-demo-site]: Single registry item bundles all 7 source files — no separate items for WheelPicker vs WheelPickerWrapper, no registryDependencies needed
- [Phase 07]: cylindricalScaleY uses cosine projection: dist=slotIndex+offset/itemHeight-floor(vc/2), angle=dist*PI/vc, scaleY=max(MIN_CYLINDRICAL_SCALE, cos(angle))
- [Phase 07]: Test case for cylindricalScaleY clamping uses slotIndex=5 (dist=3, cos negative) not slotIndex=100 (cosine oscillates, does not monotonically decrease)
- [Phase 07]: scale=undefined when cylindrical=false omits style:transform and style:opacity from DOM (flat mode byte-for-byte preservation)
- [quick-260331-qah]: Switched from adapter-vercel to adapter-static; requires src/routes/+layout.ts with prerender=true for build to succeed
- [quick-260331-qah]: Deployment moved from Vercel to Netlify via nwtgck/actions-netlify@v3; needs NETLIFY_AUTH_TOKEN + NETLIFY_SITE_ID secrets

### Roadmap Evolution

- Phase 7 added: rotating drum cylinder list style picker with 3D perspective — items farther from center appear smaller and compressed vertically

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 3: Behavior when parent updates `value` while inertia animation is mid-flight is unspecified — decision needed at planning time (cancel and jump, or let animation complete then reconcile)
- Phase 3: `visibleCount` must-be-multiple-of-4 constraint from React source needs validation — may be relaxable
- Phase 5: Confirm SSR safety — component must not execute browser APIs at module evaluation time
- Phase 6: shadcn registry `registryDependencies` between `WheelPicker` and `WheelPickerWrapper` must be declared correctly or CLI add fails silently

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260325-ns8 | add dark mode to demo site | 2026-03-25 | e5e7106 | [260325-ns8-add-dark-mode-to-demo-site](./quick/260325-ns8-add-dark-mode-to-demo-site/) |
| 260331-icr | add GitHub Action to deploy the website to Vercel | 2026-03-31 | d3784d3 | [260331-icr-add-a-github-action-to-deploy-the-websit](./quick/260331-icr-add-a-github-action-to-deploy-the-websit/) |
| 260331-idz | create a readme | 2026-03-31 | 004f0c9 | [260331-idz-create-a-readme](./quick/260331-idz-create-a-readme/) |
| 260331-ja8 | add a GitHub Action to publish to npm | 2026-03-31 | ee27aa3 | [260331-ja8-add-a-github-action-to-publish-to-npm](./quick/260331-ja8-add-a-github-action-to-publish-to-npm/) |
| 260331-jcm | add shadcn registry to site so it can be installed via CLI | 2026-03-31 | c9b7963 | [260331-jcm-add-shadcn-registry-to-site-so-it-can-be](./quick/260331-jcm-add-shadcn-registry-to-site-so-it-can-be/) |
| 260331-ong | auto patch release on push to main, manual major via workflow_dispatch | 2026-03-31 | 9d0944c | [260331-ong-auto-patch-release-on-push-to-main-and-m](./quick/260331-ong-auto-patch-release-on-push-to-main-and-m/) |
| 260331-owu | make sure my readme is visible in npmjs.com | 2026-03-31 | 9a6a506 | [260331-owu-make-sure-my-readme-is-visible-in-npmjs-](./quick/260331-owu-make-sure-my-readme-is-visible-in-npmjs-/) |
| 260331-p5j | fix Vercel deployment GitHub Action error (git-author team check) | 2026-03-31 | 8324411 | [260331-p5j-fix-vercel-deployment-github-action-erro](./quick/260331-p5j-fix-vercel-deployment-github-action-erro/) |
| 260331-pv9 | add README.md and LICENSE to npm files array | 2026-03-31 | 4b140dd | [260331-pv9-i-am-not-getting-the-readme-md-visible-o](./quick/260331-pv9-i-am-not-getting-the-readme-md-visible-o/) |
| 260331-qah | fully remove Vercel deployment, add Netlify via GitHub Actions | 2026-03-31 | 6d1ebd2 | [260331-qah-fully-remove-vercel-deployment-via-githu](./quick/260331-qah-fully-remove-vercel-deployment-via-githu/) |

## Session Continuity

Last session: 2026-03-31T13:35:48.401Z
Last activity: 2026-03-31 - Completed quick task 260331-pv9: add README.md and LICENSE to npm files array
Stopped at: Completed quick-260331-qg5-PLAN.md — version bump now goes to releases/v* branch not main
Resume file: None
