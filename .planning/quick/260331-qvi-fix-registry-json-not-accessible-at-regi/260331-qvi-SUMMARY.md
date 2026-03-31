---
phase: quick-260331-qvi
plan: "01"
subsystem: static-assets
tags: [registry, netlify, static-adapter, shadcn-svelte]
dependency_graph:
  requires: []
  provides: ["/registry.json endpoint on deployed Netlify site"]
  affects: [shadcn-svelte CLI add workflow]
tech_stack:
  added: []
  patterns: ["SvelteKit adapter-static copies static/ verbatim into build/"]
key_files:
  created:
    - static/registry.json
  modified: []
decisions:
  - "Place registry manifest in static/ (not project root) so adapter-static includes it in build output — project-root files are never copied by the adapter"
metrics:
  duration: "2m"
  completed: "2026-03-31"
---

# Phase quick-260331-qvi Plan 01: Fix registry.json Not Accessible at /registry.json Summary

**One-liner:** Copied registry.json to static/ so SvelteKit adapter-static serves it at /registry.json on the Netlify deployment.

## What Was Done

The registry manifest at the project root was not served by the Netlify site because the SvelteKit adapter-static only copies files from `static/` into the `build/` output directory. Files at the project root are never included.

Created `static/registry.json` as an exact copy of `registry.json`. The project-root file is unchanged — it remains the source read by `registry:build`. The `static/` copy is solely the served artefact.

`pnpm build` succeeds and `build/registry.json` is present in the output, confirming the file will be deployed on the next push to main.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add static/registry.json | 55ecc15 | static/registry.json (created) |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- static/registry.json: FOUND
- build/registry.json: FOUND
- Commit 55ecc15: FOUND
