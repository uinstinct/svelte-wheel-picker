# Requirements: Svelte Wheel Picker

**Defined:** 2026-03-23
**Core Value:** Pixel-perfect, buttery-smooth wheel picker interaction that feels native on both touch and desktop

## v1 Requirements

### Core Components

- [x] **COMP-01**: WheelPicker single-wheel scrollable component
- [ ] **COMP-02**: WheelPickerWrapper container for multiple side-by-side wheels
- [x] **COMP-03**: Options prop accepting array of `{ value, label, textValue?, disabled? }`
- [x] **COMP-04**: Generic TypeScript type `T extends string | number` for option values

### Interaction

- [x] **INTR-01**: Touch drag scrolling with inertia (exponential decay)
- [x] **INTR-02**: Mouse drag scrolling with inertia
- [x] **INTR-03**: Mouse wheel/trackpad scroll with sensitivity control
- [x] **INTR-04**: Snap-to-item on release
- [x] **INTR-05**: Keyboard navigation (Arrow Up/Down, Home, End)
- [x] **INTR-06**: Type-ahead search (buffer keystrokes, find matching option)

### Modes & State

- [x] **MODE-01**: Controlled mode (value + onValueChange callback)
- [x] **MODE-02**: Uncontrolled mode (defaultValue, internal state)
- [ ] **MODE-03**: Infinite loop scrolling mode
- [x] **MODE-04**: Disabled option support (skip in keyboard/drag)

### Styling & API

- [x] **STYL-01**: Highlight/selection overlay (center row indicator)
- [x] **STYL-02**: classNames prop for per-element class injection
- [x] **STYL-03**: Data attributes (data-rwp-*) for CSS targeting
- [x] **STYL-04**: Configurable visibleCount, dragSensitivity, scrollSensitivity, optionItemHeight

### Distribution

- [x] **DIST-01**: TypeScript throughout with full type exports
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
| COMP-01 | Phase 3 | Complete |
| COMP-02 | Phase 5 | Pending |
| COMP-03 | Phase 2 | Complete |
| COMP-04 | Phase 2 | Complete |
| INTR-01 | Phase 3 | Complete |
| INTR-02 | Phase 3 | Complete |
| INTR-03 | Phase 3 | Complete |
| INTR-04 | Phase 3 | Complete |
| INTR-05 | Phase 3 | Complete |
| INTR-06 | Phase 2 | Complete |
| MODE-01 | Phase 2 | Complete |
| MODE-02 | Phase 2 | Complete |
| MODE-03 | Phase 4 | Pending |
| MODE-04 | Phase 3 | Complete |
| STYL-01 | Phase 3 | Complete |
| STYL-02 | Phase 3 | Complete |
| STYL-03 | Phase 3 | Complete |
| STYL-04 | Phase 3 | Complete |
| DIST-01 | Phase 2 | Complete |
| DIST-02 | Phase 5 | Pending |
| DIST-03 | Phase 5 | Pending |
| DIST-04 | Phase 6 | Pending |
| DIST-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after roadmap creation*
