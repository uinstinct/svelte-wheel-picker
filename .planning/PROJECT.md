# Svelte Wheel Picker

## What This Is

A publishable Svelte 5 component library that clones `@ncdai/react-wheel-picker` — an iOS-style wheel picker with smooth inertia scrolling, infinite loop support, and full keyboard navigation. Ships as an unstyled/headless npm package with shadcn-svelte CLI integration. Includes a simple demo site.

## Core Value

Pixel-perfect, buttery-smooth wheel picker interaction that feels native on both touch and desktop — matching the React version's UX exactly.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] WheelPickerWrapper component (container for multiple wheels)
- [ ] WheelPicker component (individual scrollable wheel)
- [ ] Touch drag scrolling with inertia
- [ ] Mouse drag scrolling with inertia
- [ ] Mouse wheel/scroll support
- [ ] Full keyboard navigation (arrow keys, home, end)
- [ ] Type-ahead search
- [ ] Infinite loop scrolling mode
- [ ] Controlled mode (value + onValueChange)
- [ ] Uncontrolled mode (defaultValue)
- [ ] Configurable props: visibleCount, dragSensitivity, scrollSensitivity, optionItemHeight
- [ ] Custom classNames prop for styling overrides
- [ ] Data attributes for CSS targeting (matching React version's pattern)
- [ ] Disabled option support
- [ ] Zero runtime dependencies
- [ ] Svelte 5 runes-based reactivity
- [ ] TypeScript throughout
- [ ] Publishable npm package
- [ ] shadcn-svelte CLI integration
- [ ] Simple demo site showcasing the component

### Out of Scope

- Full docs site with multiple pages (docs, sponsors, showcases sections) — simple demo only
- Svelte 4 support — Svelte 5 only
- Built-in styled themes — unstyled/headless only
- SSR-specific optimizations — client-side component
- React compatibility layer

## Context

- Cloning `@ncdai/react-wheel-picker` (v1.2.2, 684 GitHub stars, MIT license)
- React version is zero-dependency, TypeScript, unstyled with data attributes
- React version's API: `options`, `value`, `defaultValue`, `onValueChange`, `infinite`, `visibleCount`, `dragSensitivity`, `scrollSensitivity`, `optionItemHeight`, `classNames`
- React version uses shadcn CLI registry for distribution alongside npm
- Svelte 5 uses runes ($state, $derived, $effect) instead of stores
- shadcn-svelte has its own CLI and registry system

## Constraints

- **Tech stack**: Svelte 5 with runes, TypeScript, zero runtime dependencies
- **API parity**: Props and behavior must match the React version as closely as Svelte idioms allow
- **Distribution**: Must work as both npm install and shadcn-svelte CLI add
- **Styling**: Headless — no CSS shipped, data attributes for targeting

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Svelte 5 only | Latest version, runes are the future of Svelte reactivity | — Pending |
| Unstyled/headless | Matches React version, maximum flexibility | — Pending |
| shadcn-svelte integration | User requirement, matches React version's distribution model | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-23 after initialization*
