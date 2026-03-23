# Phase 2: Types and Utility Hooks - Research

**Researched:** 2026-03-23
**Domain:** Svelte 5 runes, TypeScript generics, reactive hook patterns, Vitest browser mode
**Confidence:** HIGH

## Summary

Phase 2 delivers pure TypeScript infrastructure — no UI, no components. The work splits into three buckets: (1) type definitions in `src/lib/types.ts`, (2) `useControllableState` in `src/lib/use-controllable-state.svelte.ts`, and (3) `useTypeaheadSearch` in `src/lib/use-typeahead-search.svelte.ts`. All exports flow through `src/lib/index.ts` as `export type` (required by `verbatimModuleSyntax: true`).

The two non-obvious implementation challenges are: first, Svelte 5 has no native mechanism to detect whether a prop was passed vs. omitted, which means `useControllableState` cannot rely on that detection pattern from React — it must use explicit separate props (`value`, `defaultValue`, `onValueChange`) and infer mode from whether `onValueChange` is provided. Second, `vi.useFakeTimers()` is explicitly unsupported in Vitest browser mode (Playwright) — confirmed by the Vitest team — so timer-dependent tests for `useTypeaheadSearch` must either use real-time `await` delays or test the state machine logic against an injected clock abstraction.

The class-based reactive pattern is the correct approach for `.svelte.ts` hooks: class fields decorated with `$state` and `$derived` compile correctly, are exportable as instances, and work inside and outside Svelte components.

**Primary recommendation:** Use class-based hooks returning instances, explicit `value`/`defaultValue`/`onValueChange` API for controllable state, and real-time `await new Promise(r => setTimeout(r, 510))` for the typeahead timer test.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `WheelPickerClassNames` uses Svelte-idiomatic element names:
  ```ts
  type WheelPickerClassNames = {
    wrapper?: string;
    option?: string;
    optionText?: string;
    selection?: string;
  }
  ```
  Phase 3 must use these exact element names when building the DOM.

- **D-02:** Type-ahead cycling: repeated same-key presses within 500ms cycle to the next matching option (not accumulate chars). First "J" -> first option starting with "J". Second "J" within 500ms -> next option starting with "J". Wraps around. Different key within 500ms -> accumulate. Match is case-insensitive, startsWith.

- **D-03:** `value?: T` — `undefined` is a valid controlled state meaning "no option selected". `useControllableState` treats `value` prop presence (not undefined-ness) to determine mode. Controlled mode: `value` prop is passed (even if undefined). Uncontrolled mode: `value` prop is omitted, `defaultValue` used for initial state.

- **D-04:** `WheelPickerOption<T extends string | number = string>`:
  ```ts
  type WheelPickerOption<T extends string | number = string> = {
    value: T;
    label: string;
    textValue?: string;
    disabled?: boolean;
  }
  ```

- **D-05:** Flat layout in `src/lib/`: `types.ts`, `use-controllable-state.svelte.ts`, `use-typeahead-search.svelte.ts`

- **D-06:** Hook files use `.svelte.ts` extension

- **D-07:** All types exported from `src/lib/index.ts` as `export type`. Hooks exported as named functions.

### Claude's Discretion

- Exact `useControllableState` internal rune implementation (how `$state` and `$derived` are structured)
- Test setup details for the 500ms typeahead window (timer mocking approach)
- Whether `WheelPickerProps` is a full interface or type alias

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COMP-03 | Options prop accepting array of `{ value, label, textValue?, disabled? }` | `WheelPickerOption<T>` type definition in `types.ts` — shape locked by D-04 |
| COMP-04 | Generic TypeScript type `T extends string \| number` for option values | Generic constraint on `WheelPickerOption<T>`, propagated through `WheelPickerProps` |
| MODE-01 | Controlled mode (value + onValueChange callback) | `useControllableState` detects controlled mode when `onValueChange` is provided; reads external `value` |
| MODE-02 | Uncontrolled mode (defaultValue, internal state) | `useControllableState` owns internal `$state` when `onValueChange` is absent; uses `defaultValue` as seed |
| INTR-06 | Type-ahead search (buffer keystrokes, find matching option) | `useTypeaheadSearch` class with 500ms window, cycling behavior per D-02 |
| DIST-01 | TypeScript throughout with full type exports | `export type` from `index.ts` required by `verbatimModuleSyntax: true`; confirmed pattern |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Svelte | 5.54.1 | Runes compiler — `$state`, `$derived` in `.svelte.ts` | Project constraint; runes are the only reactive model in Svelte 5 |
| TypeScript | 5.9.3 | Generic types, `export type`, `verbatimModuleSyntax` | Project constraint; `verbatimModuleSyntax: true` + `isolatedModules: true` enforced in tsconfig |
| Vitest | 4.1.0 | Test runner for unit tests of both hooks | Already installed; version 4.1 introduced `setTimerTickMode` fast-forward |
| vitest-browser-svelte | 2.1.0 | Svelte 5 component rendering in tests | Already installed; project standard |

### Supporting

No additional packages needed. This phase is pure TypeScript/Svelte runes with zero new dependencies.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Class-based `$state` hooks | Factory function returning object with getters | Class pattern is cleaner for hooks with multiple reactive properties; both work |
| Real-time `await` in timer test | Playwright `page.clock` | `page.clock` requires accessing Playwright's `page` object directly — more complex setup for a pure logic test |
| Separate `value`/`onValueChange` props | Rest props + `'value' in $$props` check | Svelte 5 has no `$$props`; rest props spread loses reactivity tracking |

**Installation:** No new packages required.

---

## Architecture Patterns

### Recommended Project Structure

```
src/lib/
├── types.ts                          # WheelPickerOption<T>, WheelPickerProps, WheelPickerClassNames
├── use-controllable-state.svelte.ts  # useControllableState hook (class-based)
├── use-typeahead-search.svelte.ts    # useTypeaheadSearch hook (class-based)
├── index.ts                          # re-exports everything
└── WheelPicker.svelte                # placeholder (existing, Phase 3 target)
```

### Pattern 1: Class-Based Reactive Hook in `.svelte.ts`

**What:** Define reactive state as class fields using `$state` and `$derived`. Export a factory function that returns an instance. Callers hold a reference to the instance; reactivity propagates through property access in component templates.

**When to use:** Any time you need a reactive utility with multiple interdependent state variables that lives outside a `.svelte` file.

**Why class over plain object factory:** TypeScript provides typed property access, `$derived` fields work correctly on class instances (compiled to getter/setter on prototype), and the instance is a stable reference across renders.

**Example (canonical Svelte 5 docs pattern):**
```typescript
// Source: https://svelte.dev/tutorial/svelte/reactive-classes
// src/lib/use-controllable-state.svelte.ts
class ControllableState<T extends string | number> {
  #internal = $state<T | undefined>(undefined);
  #isControlled: boolean;

  constructor(opts: {
    defaultValue?: T;
    isControlled: boolean;
  }) {
    this.#isControlled = opts.isControlled;
    this.#internal = opts.defaultValue;
  }

  // value getter — returns internal state (controlled mode reads external via opts)
  get current(): T | undefined {
    return this.#internal;
  }

  set current(next: T | undefined) {
    this.#internal = next;
  }
}

export function useControllableState<T extends string | number>(opts: {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T | undefined) => void;
}) {
  // Controlled mode detected by presence of onChange callback
  return new ControllableState<T>({
    defaultValue: opts.onChange ? opts.value : opts.defaultValue,
    isControlled: !!opts.onChange,
  });
}
```

### Pattern 2: Controlled/Uncontrolled Mode Detection in Svelte 5

**What:** Svelte 5 has NO mechanism to detect if a prop was passed vs. omitted. `$props()` treats `undefined` and "not passed" identically. The workaround: use the presence of the `onValueChange` callback as the controlled-mode signal.

**Why this works:** A component in controlled mode always provides an `onValueChange` handler to receive updates. A component in uncontrolled mode omits it. This is the same semantic as React's `onChange` prop convention.

**API shape for WheelPickerProps:**
```typescript
// Controlled: pass value + onValueChange
// Uncontrolled: pass defaultValue (or nothing), omit onValueChange
type WheelPickerProps<T extends string | number = string> = {
  options: WheelPickerOption<T>[];
  value?: T;                           // controlled: current value
  defaultValue?: T;                    // uncontrolled: initial seed
  onValueChange?: (value: T) => void;  // presence triggers controlled mode
  classNames?: WheelPickerClassNames;
  // ... other props added in Phase 3
};
```

**Hook logic:**
```typescript
// In the component (Phase 3), the hook call looks like:
const state = useControllableState({
  value: props.value,
  defaultValue: props.defaultValue,
  onChange: props.onValueChange,
});
// state.current = current value (reactive)
// Updating: call props.onValueChange(next) in controlled mode, set state.current in uncontrolled
```

**IMPORTANT — D-03 nuance:** The CONTEXT.md says `undefined` is a valid controlled state (no option selected). This means we cannot use `value === undefined` to detect mode. Only `onValueChange` presence signals controlled mode reliably.

### Pattern 3: TypeAhead State Machine

**What:** Class that accumulates keystrokes with a timeout reset. Same-key repeat within 500ms cycles through matches instead of appending the character.

**Key logic:**
```typescript
// src/lib/use-typeahead-search.svelte.ts
class TypeaheadSearch {
  #buffer = $state('');
  #lastKey = $state('');
  #lastTime = 0;
  #timer: ReturnType<typeof setTimeout> | null = null;

  search(key: string, options: WheelPickerOption[], currentIndex: number): number {
    const now = Date.now();
    const withinWindow = now - this.#lastTime < 500;
    const isSameKey = withinWindow && key.toLowerCase() === this.#lastKey;

    this.#lastKey = key.toLowerCase();
    this.#lastTime = now;

    // Clear reset timer
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = setTimeout(() => {
      this.#buffer = '';
      this.#lastKey = '';
    }, 500);

    if (isSameKey) {
      // Cycle to next match starting from currentIndex + 1
      return this.#cycleMatch(key, options, currentIndex);
    } else {
      // Accumulate
      this.#buffer = withinWindow ? this.#buffer + key.toLowerCase() : key.toLowerCase();
      return this.#findFirst(this.#buffer, options);
    }
  }

  #findFirst(prefix: string, options: WheelPickerOption[]): number {
    return options.findIndex(
      (o) => !o.disabled && (o.textValue ?? o.label).toLowerCase().startsWith(prefix)
    );
  }

  #cycleMatch(key: string, options: WheelPickerOption[], fromIndex: number): number {
    const prefix = key.toLowerCase();
    const matches = options
      .map((o, i) => ({ i, matches: !o.disabled && (o.textValue ?? o.label).toLowerCase().startsWith(prefix) }))
      .filter((x) => x.matches)
      .map((x) => x.i);
    if (matches.length === 0) return -1;
    const afterCurrent = matches.find((i) => i > fromIndex);
    return afterCurrent ?? matches[0]; // wrap around
  }

  destroy() {
    if (this.#timer) clearTimeout(this.#timer);
  }
}

export function useTypeaheadSearch() {
  return new TypeaheadSearch();
}
```

### Pattern 4: `export type` with `verbatimModuleSyntax`

**What:** `verbatimModuleSyntax: true` in tsconfig requires that type-only imports/exports use the `type` keyword explicitly. The compiler will error if you export a type without `export type`.

**Why it matters:** `isolatedModules: true` (implied by `verbatimModuleSyntax`) means each file is compiled independently. Without `export type`, bundlers cannot know whether to include the export in the JS bundle.

**Required pattern in `src/lib/index.ts`:**
```typescript
// Types must use "export type"
export type { WheelPickerOption, WheelPickerProps, WheelPickerClassNames } from './types.js';

// Hooks are values, not types — regular export
export { useControllableState } from './use-controllable-state.svelte.js';
export { useTypeaheadSearch } from './use-typeahead-search.svelte.js';
```

Note: SvelteKit's module resolution requires `.js` extensions in import paths even for `.ts` source files.

### Anti-Patterns to Avoid

- **Exporting `$state` variables directly:** `export let count = $state(0)` — this breaks reactivity on import. Wrap in object or class instead.
- **Using `$$props` to detect prop presence:** Does not exist in Svelte 5. Removed.
- **`writable()` or `readable()` stores:** Forbidden by CLAUDE.md. Use runes.
- **Checking `value === undefined` for controlled mode:** D-03 says `undefined` is a valid controlled value. Only `onValueChange` presence is reliable.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Timer reset with auto-clear | Manual `setTimeout` + flag tracking | Standard `setTimeout` + `clearTimeout` pattern IS correct here — no library needed for 500ms debounce |
| Type-safe generic constraints | Custom type guards | TypeScript `T extends string \| number` constraint — built-in language feature |

**Key insight:** This phase is intentionally minimal infrastructure. The only complexity worth noting is the controlled/uncontrolled detection pattern, which requires an explicit API convention (onValueChange presence) rather than any library solution.

---

## Common Pitfalls

### Pitfall 1: `vi.useFakeTimers()` in Browser Mode

**What goes wrong:** Tests calling `vi.useFakeTimers()` + `vi.advanceTimersByTime(510)` hang or produce no-ops when running in Vitest browser mode with Playwright.

**Why it happens:** Confirmed by Vitest team (GitHub issue #5750) — fake timers rely on `@sinonjs/fake-timers` which patches Node.js globals; in browser mode the actual browser's timer functions run in the page context, not Node.js. The fix requires AsyncContext API, which is not yet available.

**How to avoid:** For `useTypeaheadSearch` timer tests, use one of:
1. **Real time await** (simple): `await new Promise(r => setTimeout(r, 510))` — test runs 510ms slower but works reliably
2. **Inject clock abstraction** (fast): Accept a `getNow: () => number` parameter in the hook constructor; tests inject a manual clock function. The 500ms check uses `getNow()` instead of `Date.now()`.
3. **Vitest 4.1 fast-forward** (preferred if it works): `vi.useFakeTimers().setTimerTickMode('nextTimerAsync')` — new in Vitest 4.1, may work in browser mode but this is MEDIUM confidence; needs verification at implementation time.

**Warning signs:** Test hangs indefinitely, or timer-based assertions pass immediately without advancing time.

**Recommendation:** Default to real-time await for the test. The 500ms wait is acceptable for a unit test. Inject `getNow` if execution speed becomes a concern in CI.

### Pitfall 2: Controlled Mode Detection via `value === undefined`

**What goes wrong:** Hook reads `value` prop, sees `undefined`, assumes uncontrolled mode, and ignores the parent's intent to control with "no selection."

**Why it happens:** D-03 explicitly allows `undefined` as a valid controlled value meaning "no option selected." This is different from `value` not being passed at all.

**How to avoid:** Detect controlled mode via `onValueChange` presence, not `value` value. See Pattern 2 above.

### Pitfall 3: Import Path Extensions in SvelteKit

**What goes wrong:** `export { useControllableState } from './use-controllable-state.svelte'` — missing `.js` extension causes module resolution failure in published package.

**Why it happens:** SvelteKit and `@sveltejs/package` follow ESM resolution rules that require explicit extensions. The source is `.svelte.ts` but the compiled output is `.svelte.js`.

**How to avoid:** Always use `.js` extension in import paths in `src/lib/index.ts`:
```typescript
export { useControllableState } from './use-controllable-state.svelte.js';
```

### Pitfall 4: `$derived` on Class Instance in Constructor

**What goes wrong:** Using `$derived(this.someState)` in a class constructor — the `this` reference may not be stable before construction completes.

**Why it happens:** Svelte's compiler transforms `$derived` at field-declaration level, not inside constructor bodies. Class field syntax works; constructor body assignment can behave unexpectedly.

**How to avoid:** Declare derived fields as class field initializers:
```typescript
class Foo {
  x = $state(0);
  double = $derived(this.x * 2); // class field — works

  constructor() {
    // this.triple = $derived(this.x * 3); // constructor body — avoid
  }
}
```

### Pitfall 5: `verbatimModuleSyntax` Errors on Re-export

**What goes wrong:** `export { WheelPickerOption } from './types.js'` — TypeScript error: "Re-exporting a type when the '--isolatedModules' flag is provided requires using 'export type'."

**Why it happens:** With `verbatimModuleSyntax: true`, TypeScript cannot determine at single-file compilation whether `WheelPickerOption` is a type or value. Must be explicit.

**How to avoid:** Use `export type` for all type re-exports from `index.ts`.

---

## Code Examples

Verified patterns from official sources:

### Class with `$state` and `$derived` (Svelte 5 Docs)

```typescript
// Source: https://svelte.dev/tutorial/svelte/reactive-classes
class Box {
  width = $state(0);
  height = $state(0);
  area = $derived(this.width * this.height);

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}
```

### `export type` with `verbatimModuleSyntax`

```typescript
// Source: https://www.typescriptlang.org/tsconfig/verbatimModuleSyntax.html
// Required when verbatimModuleSyntax: true
export type { SomeType } from './types.js';
export { someValue } from './values.js';
```

### Factory Function Pattern for Hooks

```typescript
// Recommended pattern for useXxx hooks in .svelte.ts
// Source: Svelte 5 docs, community consensus
class MyState {
  value = $state<string>('');
}

export function useMyState(): MyState {
  return new MyState();
}
```

### Real-Time Timer Test (Vitest browser mode)

```typescript
// When vi.useFakeTimers() is unavailable (browser mode)
test('resets after 500ms', async () => {
  const hook = useTypeaheadSearch();
  hook.search('a', options, 0);
  await new Promise(r => setTimeout(r, 510)); // real wait
  // buffer should be reset now
  const result = hook.search('b', options, 0);
  expect(result).toBe(/* first 'b' match index */);
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Svelte stores (`writable`) for shared state | Runes (`$state` in `.svelte.ts`) | Svelte 5 (2024) | Stores still work but are deprecated path; runes work in JS files without component context |
| `$$props` to check prop presence | `onValueChange` presence convention | Svelte 5 (no `$$props`) | Controlled/uncontrolled detection requires explicit API design |
| `@testing-library/svelte` | `vitest-browser-svelte` | 2024 (project decision) | Real browser, better event accuracy; but no fake timers |
| `vi.useFakeTimers` (node mode) | Real-time await or injected clock | Vitest browser mode | Timer tests require different strategy in browser context |
| `export { Type }` | `export type { Type }` | TypeScript 5.0 (`verbatimModuleSyntax`) | Required for correctness with isolatedModules; error if omitted |

---

## Open Questions

1. **Does Vitest 4.1 `setTimerTickMode('nextTimerAsync')` work in browser mode?**
   - What we know: It was added in 4.1 (installed version), and the DEV community article describes it alongside browser mode
   - What's unclear: The Vitest GitHub issue #5750 says fake timers are unsupported in browser mode — unclear if 4.1 fixed this
   - Recommendation: Try `vi.useFakeTimers().setTimerTickMode('nextTimerAsync')` first in the test. If it fails, fall back to real-time await. Document which approach worked.

2. **`WheelPickerProps` interface vs type alias**
   - What we know: Claude's discretion per CONTEXT.md
   - What's unclear: Whether generic type alias or generic interface has any downstream difference for SvelteKit packaging
   - Recommendation: Use `interface WheelPickerProps<T extends string | number = string>` — interfaces are slightly more tooling-friendly (better error messages, declaration merging if needed later). Either works.

---

## Environment Availability

Step 2.6: SKIPPED — this phase has no external dependencies. All work is TypeScript source files and unit tests using the already-installed Vitest + Playwright stack from Phase 1.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 with vitest-browser-svelte 2.1.0 |
| Config file | `vitest.config.ts` (exists, configured with Playwright browser mode) |
| Quick run command | `PLAYWRIGHT_BROWSERS_PATH=.playwright pnpm test` |
| Full suite command | `PLAYWRIGHT_BROWSERS_PATH=.playwright pnpm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-03 | `WheelPickerOption<T>` has `value`, `label`, `textValue?`, `disabled?` | unit (type check) | `pnpm exec tsc --noEmit` | Wave 0 gap |
| COMP-04 | Generic `T extends string \| number` inferred correctly | unit (type check) | `pnpm exec tsc --noEmit` | Wave 0 gap |
| MODE-01 | `useControllableState` reads external `value` in controlled mode | unit | `PLAYWRIGHT_BROWSERS_PATH=.playwright pnpm test src/lib/use-controllable-state.test.ts` | Wave 0 gap |
| MODE-02 | `useControllableState` owns internal `$state` in uncontrolled mode | unit | `PLAYWRIGHT_BROWSERS_PATH=.playwright pnpm test src/lib/use-controllable-state.test.ts` | Wave 0 gap |
| INTR-06 | `useTypeaheadSearch` finds first match; same-key within 500ms cycles | unit | `PLAYWRIGHT_BROWSERS_PATH=.playwright pnpm test src/lib/use-typeahead-search.test.ts` | Wave 0 gap |
| DIST-01 | Types importable from package index with correct TS inference | unit (type check) | `pnpm exec tsc --noEmit` | Wave 0 gap |

### Sampling Rate

- **Per task commit:** `pnpm exec tsc --noEmit` (type check, fast)
- **Per wave merge:** `PLAYWRIGHT_BROWSERS_PATH=.playwright pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/use-controllable-state.test.ts` — covers MODE-01, MODE-02 (controlled/uncontrolled switching)
- [ ] `src/lib/use-typeahead-search.test.ts` — covers INTR-06 (accumulation, cycling, reset)
- [ ] `src/lib/types.test.ts` — type-level tests (may be `.d.ts` assertion style rather than runtime); alternatively, `tsc --noEmit` suffices for COMP-03, COMP-04, DIST-01

*(Existing `src/lib/WheelPicker.test.ts` is unchanged and should continue to pass.)*

---

## Sources

### Primary (HIGH confidence)

- Svelte 5 Docs: `$state` — https://svelte.dev/docs/svelte/$state — class-based pattern, export constraints
- Svelte 5 Tutorial: Reactive Classes — https://svelte.dev/tutorial/svelte/reactive-classes — class field `$state`/`$derived` pattern
- Svelte 5 Docs: `$bindable` — https://svelte.dev/docs/svelte/$bindable — controlled/uncontrolled with bind
- TypeScript Docs: verbatimModuleSyntax — https://www.typescriptlang.org/tsconfig/verbatimModuleSyntax.html — `export type` requirement
- Svelte Docs: TypeScript — https://svelte.dev/docs/svelte/typescript — `verbatimModuleSyntax` required for Svelte files

### Secondary (MEDIUM confidence)

- GitHub sveltejs/svelte Discussion #15019 — `$state`/`$derived` in `.svelte.ts` patterns (community + maintainer discussion)
- GitHub sveltejs/svelte Issue #11672 — confirmed no API to detect if prop was bound/passed
- Bits UI controlled state docs — https://next.bits-ui.com/docs/controlled-state — confirmed callback-based controlled mode detection pattern in production Svelte 5 library
- DEV Community: Vitest 4.1 fast-forward mode — https://dev.to/playfulprogramming-angular/vitests-41-new-fast-forward-mode-skips-timer-delays-instantly-4a4h — `setTimerTickMode('nextTimerAsync')` feature

### Tertiary (LOW confidence — needs validation)

- GitHub vitest-dev/vitest Issue #5750 — fake timers unsupported in browser mode; marked "p2-nice-to-have" pending AsyncContext. Last checked 2026-03-23. **Validate at implementation time** whether Vitest 4.1's `setTimerTickMode` resolved this.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed and verified in Phase 1
- Architecture: HIGH — class-based `$state` pattern confirmed by official Svelte 5 docs
- Controlled/uncontrolled detection: HIGH — confirmed via Svelte core team acknowledgment that prop-presence detection is impossible; callback-presence convention confirmed by bits-ui production usage
- Timer test strategy: MEDIUM — `vi.useFakeTimers` confirmed broken in browser mode; `setTimerTickMode` status is uncertain; real-time await fallback is reliable

**Research date:** 2026-03-23
**Valid until:** 2026-06-23 (stable APIs; Vitest browser mode fake timer status could change sooner)
