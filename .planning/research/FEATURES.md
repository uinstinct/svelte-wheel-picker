# Feature Research

**Domain:** iOS-style wheel picker component library (web, headless, Svelte 5)
**Researched:** 2026-03-23
**Confidence:** HIGH — source library API is fully documented; competitive landscape verified via npm and official docs

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Touch drag scrolling with inertia | Core iOS interaction model — the defining feel of a wheel picker | HIGH | Physics: velocity tracking on touchend, exponential deceleration, snap-to-item. React source uses custom pointer event logic. |
| Mouse drag scrolling with inertia | Desktop parity — devs expect desktop to work the same as mobile | HIGH | Same physics pipeline as touch. Pointer events unify both. |
| Mouse wheel / trackpad scroll | Desktop users expect scroll wheel to move the picker | MEDIUM | `wheel` event listener; sensitivity multiplier per the `scrollSensitivity` prop |
| Snap-to-item on release | Without snap, the picker feels broken — items hang between positions | MEDIUM | Calculate nearest index from final offset, animate to it. Required for inertia end state. |
| Highlight / selection overlay | Visual affordance showing which item is selected — central to iOS aesthetic | LOW | Two overlapping divs: dimmed list behind, highlighted clone or `clip-path` in front |
| Controlled mode (value + onValueChange) | Standard React/Svelte controlled pattern — library integrates with form state | LOW | In Svelte 5: `value` prop + `onvaluechange` callback; `$bindable` also acceptable |
| Uncontrolled mode (defaultValue) | Needed when consumers manage no external state | LOW | Internal `$state` initialized from `defaultValue`; ignored after mount |
| Disabled option support | Date pickers and time pickers need to grey out unavailable slots | LOW | `disabled: true` on `WheelPickerOption`; keyboard and drag must skip disabled items |
| Keyboard navigation (Arrow Up/Down, Home, End) | Accessibility and power-user expectation; ARIA APG pattern for listbox | MEDIUM | Focus management: `tabindex`, `aria-activedescendant`; arrow keys scroll by one item |
| Type-ahead search | Expected in any listbox/select-like widget; ARIA APG recommendation | MEDIUM | Buffer keystrokes, find first matching `label`/`textValue`, animate scroll to it |
| Infinite loop scrolling mode | Standard for time pickers (hours 0-23 loop back to 0) | HIGH | Virtual index math: `index mod length` for render; requires rendering duplicated head/tail items |
| `WheelPickerWrapper` container component | API parity with React source; provides layout scaffold for multiple side-by-side wheels | LOW | Renders a flex container; `data-rwp-wrapper` attribute for CSS targeting |
| `WheelPicker` single-wheel component | Core primitive — the scrollable column itself | HIGH | All interaction logic lives here |
| `options` prop (array of value/label/disabled) | Data input — no picker without it | LOW | `WheelPickerOption<T>[]` with `value`, `label`, optional `textValue` and `disabled` |
| `visibleCount` prop | Controls how many items are visible — affects layout height | LOW | Must be a multiple of 4 (React source constraint); default 20 |
| `dragSensitivity` / `scrollSensitivity` props | Consumers need to tune feel for their use case | LOW | Multipliers applied to drag delta and wheel delta respectively |
| `optionItemHeight` prop | Layout control — affects total picker height and snap math | LOW | Default 30px; snap distance = `optionItemHeight` |
| `classNames` prop for styling overrides | Headless approach requires escape hatch for per-element class injection | LOW | Object with keys `optionItem`, `highlightWrapper`, `highlightItem` |
| Data attributes (`data-rwp-*`) for CSS targeting | Headless components need stable CSS hooks; React version uses this pattern | LOW | `data-rwp-wrapper`, `data-rwp`, `data-rwp-options`, `data-rwp-option`, `data-rwp-highlight-wrapper`, `data-rwp-focused`, `data-disabled` |
| TypeScript throughout | Expected in any serious component library in 2025 | LOW | Generic type `T extends string \| number` for option values |
| Zero runtime dependencies | Stated constraint; also a competitive signal for library quality | MEDIUM | All physics, event handling, and rendering done from scratch |
| npm package distribution | Standard library delivery mechanism | LOW | Proper `package.json` with `exports`, `types`, `svelte` fields |
| shadcn-svelte CLI integration | Matches React version's distribution model; user requirement | MEDIUM | `registry.json` + `static/r/` built files conforming to shadcn-svelte registry schema |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Svelte 5 runes-based reactivity | Only wheel picker in the Svelte ecosystem built on runes — future-proof, no stores | MEDIUM | `$state`, `$derived`, `$effect` instead of writable stores; `$bindable` for two-way binding |
| API parity with `@ncdai/react-wheel-picker` | Developers migrating from React can translate their usage 1:1 | LOW | Direct prop name mapping; same `classNames` shape; same data attribute names |
| `label: SvelteComponent` / rich label support | React source supports `ReactNode` labels — support Svelte snippet equivalents | MEDIUM | Svelte 5 snippets (`{#snippet}`) can be passed as prop; allows icons, styled text in options |
| `textValue` on options for type-ahead | When `label` is rich (non-string), `textValue` provides a plain-text string for keyboard search | LOW | Already in the React API; needs correct fallback logic |
| Interactive demo site | Shows the component in action (time picker, date picker, standalone) — aids adoption | LOW | Single-page SvelteKit app; not a full docs site per PROJECT.md |
| Monorepo structure separating lib from demo | Allows independent versioning; common professional pattern | LOW | pnpm workspace with `packages/svelte-wheel-picker` and `apps/web` |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Built-in styled themes (default CSS) | Users want a "ready-made" look | Forces opinions on styling; conflicts with consumers' design systems; increases bundle size; breaks headless promise | Ship zero CSS; provide a styled demo in the demo site as a copy-paste starting point |
| Svelte 4 / legacy store support | Some consumers haven't migrated yet | Doubles implementation surface; stores and runes cannot be mixed freely; contradicts the Svelte 5-only constraint | Document Svelte 5 requirement explicitly; point to `react-wheel-picker` for React projects |
| Full multi-page docs site | Sponsors, showcase, component API reference pages | Scope explosion beyond the stated "simple demo site" constraint; docs sites require maintenance forever | Ship a single-page demo; link to the GitHub README for API reference |
| Date/time picker built-in | A pre-composed date picker is commonly requested | Opinionated composition belongs in consumer apps; `WheelPicker` is a primitive | Provide a date picker recipe in the demo site showing how to compose multiple wheels |
| Virtualized rendering for very large lists | Seems like a performance win for 1000-item lists | Adds significant complexity; real-world wheel pickers have short option lists (hours, minutes, months); over-engineering | Document a reasonable `options` length ceiling; `infinite` mode already handles looping short lists |
| SSR / server-side rendering support | SvelteKit apps render server-side by default | Wheel picker is inherently interactive and client-only (pointer events, scroll physics); SSR adds complexity for zero benefit | Use `<WheelPicker>` inside a client-only wrapper; document `ssr: false` pattern for SvelteKit |
| React compatibility layer / dual export | One package for both React and Svelte | Doubles implementation, testing surface, and bundle; confusing to publish | Keep this as a Svelte-only package; `@ncdai/react-wheel-picker` already exists for React |

## Feature Dependencies

```
WheelPicker (core component)
    └──requires──> options prop (data input)
    └──requires──> Snap-to-item logic
                       └──requires──> optionItemHeight prop
    └──requires──> Touch/mouse drag with inertia
    └──requires──> Keyboard navigation
                       └──enhances──> Type-ahead search
                                          └──requires──> textValue on options (for rich labels)

Infinite loop mode
    └──requires──> WheelPicker (core component)
    └──requires──> Virtual index math (duplicate head/tail render)

Controlled mode
    └──requires──> value prop + onvaluechange callback
    └──conflicts──> Uncontrolled mode (use one or the other per instance)

Uncontrolled mode
    └──requires──> defaultValue prop
    └──conflicts──> Controlled mode

WheelPickerWrapper
    └──requires──> WheelPicker (at least one child)
    └──enhances──> Multiple side-by-side wheels (e.g., date/time pickers)

shadcn-svelte CLI integration
    └──requires──> Publishable npm package (component files must exist)
    └──requires──> registry.json + static/r/ output conforming to shadcn-svelte schema

classNames prop
    └──enhances──> Data attributes (both are styling hooks; classNames provides per-instance overrides)

Disabled option support
    └──requires──> Keyboard navigation (must skip disabled items on arrow key press)
    └──requires──> Drag/scroll logic (snapping must skip disabled items)
```

### Dependency Notes

- **Snap-to-item requires optionItemHeight:** The snap target position is calculated as `Math.round(offset / optionItemHeight) * optionItemHeight`. Without a known item height, snapping is impossible.
- **Type-ahead enhances keyboard navigation:** Type-ahead is a keyboard interaction pattern; it only works when the wheel has focus, which is managed by the keyboard navigation system.
- **textValue required for type-ahead with rich labels:** When `label` is a Svelte snippet (icon, styled node), there is no plain text to match against. `textValue` provides the fallback string for keyboard search.
- **Infinite loop requires duplicate head/tail rendering:** The illusion of infinite scroll requires rendering copies of the first N and last N items at opposite ends of the list. This is a non-trivial layout concern independent of the core scroll logic.
- **Controlled conflicts with uncontrolled per instance:** A single `WheelPicker` should use one mode. Passing both `value` and `defaultValue` is ambiguous — document that `value` takes precedence (matching React behavior).
- **Disabled items affect snap target selection:** When snapping after drag/scroll, the algorithm must check if the nearest item is disabled and advance to the next enabled item. This couples the snap logic to option data.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] `WheelPicker` component with `options`, `value`, `defaultValue`, `onvaluechange` — without these the component has no value
- [ ] Touch drag scrolling with inertia and snap-to-item — the core interaction; without it, it is just a `<select>`
- [ ] Mouse drag scrolling with inertia and snap-to-item — desktop parity; most developers will test on desktop first
- [ ] Mouse wheel / trackpad scroll support — desktop UX baseline
- [ ] Keyboard navigation (Arrow Up/Down, Home, End) — accessibility and developer credibility
- [ ] Highlight / selection overlay — visual identity of a wheel picker
- [ ] `visibleCount`, `dragSensitivity`, `scrollSensitivity`, `optionItemHeight` props — necessary for any real-world sizing
- [ ] `classNames` prop + `data-rwp-*` data attributes — headless without these is unusable
- [ ] Disabled option support — needed for nearly every real use case (date picker unavailable days)
- [ ] `WheelPickerWrapper` container — needed to compose multiple wheels side by side
- [ ] TypeScript types exported (`WheelPickerOption`, `WheelPickerClassNames`, `WheelPickerValue`)
- [ ] npm package with correct `package.json` exports

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Infinite loop scrolling — validates after time picker use cases emerge; adds significant complexity
- [ ] Type-ahead search — validates after a11y feedback or power-user demand
- [ ] shadcn-svelte CLI registry integration — adds after npm package is proven stable; requires registry.json maintenance

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Rich label support via Svelte snippets — defer until users request icon-bearing options; requires snippet-as-prop API design
- [ ] `textValue` for type-ahead with rich labels — blocked on both type-ahead and rich labels being built first

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Touch/mouse drag with inertia + snap | HIGH | HIGH | P1 |
| Highlight overlay | HIGH | LOW | P1 |
| Controlled + uncontrolled mode | HIGH | LOW | P1 |
| Keyboard navigation | HIGH | MEDIUM | P1 |
| `options` prop + TypeScript types | HIGH | LOW | P1 |
| Disabled option support | HIGH | LOW | P1 |
| `WheelPickerWrapper` | HIGH | LOW | P1 |
| Mouse wheel scroll | MEDIUM | MEDIUM | P1 |
| `classNames` + `data-rwp-*` attributes | HIGH | LOW | P1 |
| npm package distribution | HIGH | LOW | P1 |
| Infinite loop mode | HIGH | HIGH | P2 |
| Type-ahead search | MEDIUM | MEDIUM | P2 |
| shadcn-svelte CLI integration | MEDIUM | MEDIUM | P2 |
| Demo site | MEDIUM | LOW | P2 |
| Rich label (Svelte snippets) | LOW | MEDIUM | P3 |
| `textValue` for type-ahead | LOW | LOW | P3 (blocked on P3 above) |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | `@ncdai/react-wheel-picker` (source) | `react-mobile-picker` | `urmoov/svelte-wheel-picker` | Our Approach |
|---------|--------------------------------------|----------------------|------------------------------|--------------|
| Framework | React | React | Svelte (version unspecified) | Svelte 5 only |
| Inertia scrolling | Yes — custom physics | Yes — basic | Yes — friction-based | Match React source physics |
| Infinite loop | Yes — `infinite` prop | No | No | Yes — match React source |
| Keyboard nav + type-ahead | Yes — full | No | No | Yes — full parity |
| Disabled options | Yes — `disabled` on option | No | No | Yes |
| Controlled mode | Yes | Yes (controlled only) | `bind:selectedOption` | Yes — both controlled and uncontrolled |
| Uncontrolled mode | Yes — `defaultValue` | No | Yes (always) | Yes |
| Headless / unstyled | Yes — zero CSS shipped | Mostly (minimal CSS) | No — has 3D CSS baked in | Yes — zero CSS |
| Data attributes for styling | Yes — `data-rwp-*` | No | No | Yes — match React source attributes |
| `classNames` prop | Yes | No | `classes` / `style` strings | Yes — match React source shape |
| Zero runtime dependencies | Yes | Yes | Yes | Yes |
| TypeScript | Yes | No (JS only) | Partial | Yes — full |
| shadcn CLI distribution | Yes — shadcn (React) | No | No | Yes — shadcn-svelte |
| 3D perspective effect | No | No | Yes — configurable | No (anti-feature; baked-in style) |
| npm package | Yes | Yes | Yes | Yes |

## Sources

- `@ncdai/react-wheel-picker` GitHub: https://github.com/ncdai/react-wheel-picker
- React Wheel Picker official docs: https://react-wheel-picker.chanhdai.com/docs/getting-started
- `urmoov/svelte-wheel-picker` GitHub: https://github.com/urmoov-dev/svelte-wheel-picker
- `react-mobile-picker` GitHub: https://github.com/adcentury/react-mobile-picker
- shadcn-svelte registry docs: https://www.shadcn-svelte.com/docs/registry
- Apple HIG — Pickers: https://developer.apple.com/design/human-interface-guidelines/pickers
- ARIA APG — Keyboard Interface: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- Svelte 5 `$bindable` docs: https://svelte.dev/docs/svelte/$bindable

---
*Feature research for: Svelte 5 wheel picker component library*
*Researched: 2026-03-23*
