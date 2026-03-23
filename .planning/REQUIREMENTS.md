# Requirements: Svelte Wheel Picker

**Defined:** 2026-03-23
**Core Value:** Pixel-perfect, buttery-smooth wheel picker interaction that feels native on both touch and desktop

## v1 Requirements

### Core Components

- [ ] **COMP-01**: WheelPicker single-wheel scrollable component
- [ ] **COMP-02**: WheelPickerWrapper container for multiple side-by-side wheels
- [ ] **COMP-03**: Options prop accepting array of `{ value, label, textValue?, disabled? }`
- [ ] **COMP-04**: Generic TypeScript type `T extends string | number` for option values

### Interaction

- [ ] **INTR-01**: Touch drag scrolling with inertia (exponential decay)
- [ ] **INTR-02**: Mouse drag scrolling with inertia
- [ ] **INTR-03**: Mouse wheel/trackpad scroll with sensitivity control
- [ ] **INTR-04**: Snap-to-item on release
- [ ] **INTR-05**: Keyboard navigation (Arrow Up/Down, Home, End)
- [ ] **INTR-06**: Type-ahead search (buffer keystrokes, find matching option)

### Modes & State

- [ ] **MODE-01**: Controlled mode (value + onValueChange callback)
- [ ] **MODE-02**: Uncontrolled mode (defaultValue, internal state)
- [ ] **MODE-03**: Infinite loop scrolling mode
- [ ] **MODE-04**: Disabled option support (skip in keyboard/drag)

### Styling & API

- [ ] **STYL-01**: Highlight/selection overlay (center row indicator)
- [ ] **STYL-02**: classNames prop for per-element class injection
- [ ] **STYL-03**: Data attributes (data-rwp-*) for CSS targeting
- [ ] **STYL-04**: Configurable visibleCount, dragSensitivity, scrollSensitivity, optionItemHeight

### Distribution

- [ ] **DIST-01**: TypeScript throughout with full type exports
- [ ] **DIST-02**: Zero runtime dependencies
- [ ] **DIST-03**: Publishable npm package with proper exports/types/svelte fields
- [ ] **DIST-04**: shadcn-svelte CLI integration (registry.json + built files)
- [ ] **DIST-05**: Simple demo site showcasing component usage

## v2 Requirements

### Rich Labels

- **RICH-01**: Support Svelte 5 snippets as label prop for rich/custom option rendering
- **RICH-02**: textValue fallback for type-ahead when label is a snippet

### Accessibility

- **A11Y-01**: Full ARIA listbox pattern (aria-activedescendant, aria-selected, roles)
- **A11Y-02**: Screen reader announcements on value change

## Out of Scope

| Feature | Reason |
|---------|--------|
| Built-in styled themes / default CSS | Headless-only constraint; breaks customization promise |
| Svelte 4 / legacy store support | Svelte 5 only; doubles implementation surface |
| Full multi-page docs site | Simple demo only per project scope |
| Pre-composed date/time picker | Opinionated composition belongs in consumer apps |
| Virtualized rendering for large lists | Wheel pickers have short option lists; over-engineering |
| SSR support | Wheel picker is inherently client-side interactive |
| React compatibility / dual export | React version already exists |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| COMP-01 | TBD | Pending |
| COMP-02 | TBD | Pending |
| COMP-03 | TBD | Pending |
| COMP-04 | TBD | Pending |
| INTR-01 | TBD | Pending |
| INTR-02 | TBD | Pending |
| INTR-03 | TBD | Pending |
| INTR-04 | TBD | Pending |
| INTR-05 | TBD | Pending |
| INTR-06 | TBD | Pending |
| MODE-01 | TBD | Pending |
| MODE-02 | TBD | Pending |
| MODE-03 | TBD | Pending |
| MODE-04 | TBD | Pending |
| STYL-01 | TBD | Pending |
| STYL-02 | TBD | Pending |
| STYL-03 | TBD | Pending |
| STYL-04 | TBD | Pending |
| DIST-01 | TBD | Pending |
| DIST-02 | TBD | Pending |
| DIST-03 | TBD | Pending |
| DIST-04 | TBD | Pending |
| DIST-05 | TBD | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 0
- Unmapped: 23 ⚠️

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after initial definition*
