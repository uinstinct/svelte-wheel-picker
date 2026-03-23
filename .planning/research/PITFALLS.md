# Pitfalls Research

**Domain:** Svelte 5 component library — iOS-style wheel picker with touch/inertia scrolling
**Researched:** 2026-03-23
**Confidence:** HIGH (most findings verified against official Svelte docs, GitHub issues, and MDN)

---

## Critical Pitfalls

### Pitfall 1: Passive Touch Event Listeners Block preventDefault()

**What goes wrong:**
A wheel picker must intercept `touchmove` and `wheel` events to prevent the page from scrolling while the user is manipulating the picker. Since Chrome 56 (and other modern browsers), `touchstart`, `touchmove`, `wheel`, and `mousewheel` events are passive by default on root targets. Calling `preventDefault()` inside a passive listener silently fails with a console warning — the page scrolls instead of snapping the wheel.

**Why it happens:**
Svelte's `on:touchmove` shorthand registers listeners without options, so it inherits the browser default (passive). Developers coming from React are used to `e.preventDefault()` working unconditionally in React's synthetic event system, which handles the passive flag internally.

**How to avoid:**
Register touch and wheel event listeners imperatively with `addEventListener(element, 'touchmove', handler, { passive: false })` instead of using Svelte's declarative `on:touchmove`. Do this inside `$effect` with proper cleanup via the returned teardown function.

```typescript
$effect(() => {
  const el = containerEl;
  const handler = (e: TouchEvent) => {
    if (isDragging) e.preventDefault();
  };
  el.addEventListener('touchmove', handler, { passive: false });
  return () => el.removeEventListener('touchmove', handler, { passive: false });
});
```

**Warning signs:**
- Page scrolls while dragging the picker on mobile
- Browser console shows: "Unable to preventDefault inside passive event listener"
- Works on desktop (mouse events) but not on iOS/Android

**Phase to address:** Core interaction phase (touch drag + inertia implementation)

---

### Pitfall 2: $effect Infinite Loop When Mutating Object/Array State

**What goes wrong:**
Any `$effect` that both reads and writes the same `$state` variable holding an object or array creates an infinite loop. Unlike primitives (where Svelte bails out when the value doesn't change), objects always create a new proxy reference on assignment, causing the effect to re-trigger endlessly. Svelte treats this as expected behavior and closed related issues as "not planned."

**Why it happens:**
Svelte 5's reactivity uses runtime proxies. An array or object assigned inside `$effect` is wrapped in a new proxy, which is a different reference from the previous — so Svelte treats it as a new value and re-runs the effect. The inertia animation loop is particularly at risk: updating `scrollY` position inside a `requestAnimationFrame` callback wrapped in `$effect` will re-trigger the effect if the state variable is also read there.

**How to avoid:**
Keep animation frame state in plain mutable variables (not `$state`) for values that are purely internal and frame-by-frame. Only promote to `$state` when the value needs to drive UI updates (e.g., the selected index). Use `untrack()` from `svelte` to read reactive state inside an effect without creating a dependency.

```typescript
import { untrack } from 'svelte';

$effect(() => {
  const targetIndex = selectedIndex; // subscribe to this
  untrack(() => {
    animateTo(targetIndex); // read/write internal vars without re-triggering
  });
});
```

**Warning signs:**
- Browser tab freezes or hits "Maximum call stack" during scroll interaction
- CPU pegs at 100% when picker is mounted
- `$effect` involving animation or position calculation runs continuously in the background

**Phase to address:** Core interaction phase, specifically inertia animation loop implementation

---

### Pitfall 3: Controlled/Uncontrolled Ambiguity with $bindable

**What goes wrong:**
The React source uses a custom `use-controllable-state` hook that handles three distinct modes: no prop passed (component owns state), prop passed without binding (parent controls, component read-only), and prop passed with binding (two-way sync). Svelte's `$bindable()` only cleanly handles cases 1 and 3. When a parent passes `value` without `bind:`, the child can still mutate the prop internally, causing the parent's value and the child's display to diverge silently.

**Why it happens:**
Svelte 5 has no built-in way to detect whether a parent used `bind:value` vs. just `:value`. The `$bindable` rune makes a prop opt-in for two-way binding, but doesn't enforce the controlled behavior that React developers expect when passing a prop without binding.

**How to avoid:**
Implement an explicit controlled/uncontrolled pattern using a local `$state` for internal position, synced to the prop through `$effect`:

```typescript
let { value, onValueChange }: Props = $props();

// Internal state always drives rendering
let internalIndex = $state(findIndex(value));

// When prop changes from outside, sync inward
$effect(() => {
  if (value !== undefined) {
    internalIndex = findIndex(value);
  }
});

// When internal state changes, notify parent
$effect(() => {
  onValueChange?.(options[internalIndex].value);
});
```

Do NOT use `$bindable` for `value` — it's a controlled callback pattern, not a binding pattern.

**Warning signs:**
- Picker jumps back to parent-controlled value after user interaction
- `value` prop changes from parent are ignored after user interacts with picker
- Tests pass in isolation but fail in a controlled form context

**Phase to address:** Core component API phase (props design and controlled mode)

---

### Pitfall 4: requestAnimationFrame Not Cancelled on Component Destroy

**What goes wrong:**
The inertia scroll animation uses a `requestAnimationFrame` loop. If the RAF callback is not cancelled when the component unmounts, it continues running and attempts to update destroyed DOM nodes or stale closures. In severe cases this causes silent memory leaks; in React 18's strict mode double-mounting behavior, it causes obvious double-animation bugs that don't reproduce in production.

**Why it happens:**
Developers often write the RAF loop with no cleanup, or only cancel it in `onDestroy` which fires later than the `$effect` teardown. In Svelte 5, `$effect` teardown functions are the correct cleanup mechanism — but only if the RAF id is captured in the scope the teardown can reach.

**How to avoid:**
Always store the RAF id in a variable accessible to the `$effect` return function:

```typescript
$effect(() => {
  let rafId: number;

  function animate() {
    // update position
    rafId = requestAnimationFrame(animate);
  }

  rafId = requestAnimationFrame(animate);

  return () => cancelAnimationFrame(rafId);
});
```

**Warning signs:**
- Memory usage grows when repeatedly mounting/unmounting the picker
- Console errors about accessing properties of destroyed components
- Animation continues briefly after picker is hidden/removed from DOM

**Phase to address:** Core interaction phase (inertia animation loop)

---

### Pitfall 5: Infinite Loop Position Wrap Causes Jump at Boundary

**What goes wrong:**
Infinite loop mode (where the list wraps around) requires repositioning the scroll offset when it exceeds the virtual list bounds. If the repositioning is triggered by a reactive statement watching the scroll position, and the repositioning itself updates the scroll position, it creates a visual jump or oscillation. This is distinct from the `$effect` infinite loop — it's a UX jump that users see.

**Why it happens:**
The wrap calculation typically does: "if position > max, set position to position - range". If the condition and the assignment are in the same reactive tick, users see the position teleport rather than seamlessly continuing. React's version avoids this by computing the display transform separately from the logical position.

**How to avoid:**
Separate logical position (which wraps) from display offset (which is computed as a modulo/transform). Never let the wrap mutation be visible in the render — compute `displayOffset = logicalPosition % totalHeight` separately and apply it as a CSS `transform: translateY()`, so the visual output is always smooth even when the logical position resets.

**Warning signs:**
- Picker flickers or jumps when scrolling past the last item in infinite mode
- The jump is only visible at the list boundary, not in the middle
- Problem only occurs with `infinite={true}`, linear mode works fine

**Phase to address:** Infinite loop feature implementation

---

### Pitfall 6: Shipping Compiled .js Instead of .svelte Source Files

**What goes wrong:**
Publishing a pre-compiled JavaScript bundle instead of the raw `.svelte` source means consumers cannot tree-shake the component, cannot use their own Svelte preprocessors, and lose type inference on component props. The npm package appears to work but is larger than necessary and breaks in edge cases (e.g., consumers using SSR, or different Svelte compiler versions).

**Why it happens:**
Build tools like Vite default to bundling everything. First-time Svelte library authors copy web app build configs, which are optimized for applications not libraries. The official guidance (distribute `.svelte` files, preprocess TypeScript to plain JS) is not the default.

**How to avoid:**
Use `@sveltejs/package` (the `svelte-package` CLI) to build the library. Configure `package.json` with correct exports:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "svelte": "./dist/index.js"
}
```

Ship `.svelte` files (not `.js` compiled output) with TypeScript preprocessed out. Keep the `svelte` legacy field for backwards compatibility with older tooling.

**Warning signs:**
- Consumers report that component props have `any` type instead of typed props
- Bundle size is unexpectedly large (component bundled with Svelte runtime)
- SSR consumers get runtime errors on import

**Phase to address:** Package setup and build configuration phase

---

### Pitfall 7: Spreading $props() Breaks Fine-Grained Reactivity

**What goes wrong:**
A common pattern when building headless/customizable components is to collect unknown props and spread them onto the DOM element: `let { value, ...rest } = $props(); <div {...rest}>`. In Svelte 5, this destructuring breaks fine-grained reactivity — the spread object loses proxy tracking, meaning `$effect` blocks that depend on individual props from `rest` will not re-run when those props change.

**Why it happens:**
Svelte 5's `$props()` returns a reactive proxy. Destructuring it via rest spread (`...rest`) creates a plain JavaScript object snapshot at that moment — it is no longer a live proxy. This is documented but non-obvious, especially for developers used to React where `{...rest}` in JSX passes live values.

**How to avoid:**
For props that need to remain reactive, destructure them explicitly by name. For the `classNames` prop (which this library uses for styling override), destructure it directly:

```typescript
let { value, onValueChange, classNames, visibleCount = 5, ...rest } = $props();
```

Any prop inside `rest` will not be reactive — only use spread for truly static attributes like `id`, `aria-*`, or HTML attributes that don't need reactivity.

**Warning signs:**
- Updating `classNames` prop from parent does not cause the component to re-render
- `$effect` that reads from spread props runs once then never again
- Works in initial render but not in dynamic updates

**Phase to address:** Core component API phase (props design)

---

### Pitfall 8: File Extension Mistakes in Runes-Mode Utility Files

**What goes wrong:**
Utility functions that use runes (`$state`, `$derived`, `$effect`) outside of `.svelte` files must be in `.svelte.ts` (or `.svelte.js`) files. Placing runes-using code in plain `.ts` files causes compiler errors or silent breakage, depending on the Svelte version.

**Why it happens:**
The naming requirement is non-obvious. Developers assume runes are only relevant inside `.svelte` component files. Wheel picker logic (inertia state, typeahead search state) is naturally extracted into utility modules — these must use the `.svelte.ts` extension.

**How to avoid:**
Any module exporting functions or classes that use runes internally must be named `*.svelte.ts`. This includes:
- `use-controllable-state.svelte.ts`
- `use-typeahead-search.svelte.ts`
- Any shared picker state class using `$state` class fields

**Warning signs:**
- "Runes can only be used inside `.svelte` files" compiler error in a utility `.ts` file
- State declared with `$state` in a `.ts` utility is reactive inside the file but doesn't trigger updates in consumers

**Phase to address:** Project setup and file structure phase

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `document.addEventListener` instead of `$effect` cleanup | Simpler code | Memory leaks, double-registration on HMR reload | Never |
| Hardcoding `optionItemHeight` instead of measuring DOM | Skip ResizeObserver complexity | Breaks when consumers use custom font sizes | Only in initial prototype, must fix before publish |
| Using `setInterval` for typeahead timeout instead of `setTimeout` with cleanup | Slightly simpler | Continues running after component unmounts | Never |
| Putting all state in a single `$state` object | Feels organized | Triggers all consumers of the object on any property change | Never — keep per-property state |
| Skipping `sideEffects: false` in package.json | Save one line of config | Tree-shaking disabled for consumers, larger bundles | Never for a zero-dependency library |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| shadcn-svelte registry | Omitting `registryDependencies` for peer components | Declare all required registry components in `registryDependencies` array in `registry.json` |
| shadcn-svelte registry | Publishing compiled JS in registry files | Registry items must reference raw `.svelte` source files so consumers can customize them |
| npm package + shadcn-svelte | Two separate distribution paths get out of sync | Single source of truth: registry files ARE the source; npm publishes from same source |
| TypeScript consumers | Not declaring `typesVersions` fallback in `package.json` | Add `typesVersions` to support consumers with `moduleResolution: node` (not just `bundler`) |
| SvelteKit apps consuming the library | Importing `$app/environment` inside the component | This library is client-side only — avoid SvelteKit-specific imports; use `typeof window !== 'undefined'` if needed |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Running DOM measurement (offsetHeight) on every scroll frame | Jank on mid-range devices, layout thrash visible in DevTools | Measure once on mount, cache `optionItemHeight`; only re-measure on ResizeObserver callback | Immediate on any device during active scrolling |
| Deriving selected index inside a tight animation loop | `$derived` re-computes on every RAF tick even when value hasn't changed | Keep animation state in plain mutable variables; only update `$state` selectedIndex when the snap position actually changes | Any device, noticeable as dropped frames |
| Attaching `mousemove` listener globally on `document` instead of scoped to picker | Document-level handler fires for all mouse movement on the entire page | Attach `mousemove` and `mouseup` to `document` only during an active drag, remove immediately on `mouseup` | Any page with heavy DOM or other mouse-tracking components |
| Infinite loop cloning too many DOM nodes | Visible flicker during fast scroll as new nodes are painted | Pre-render exactly `visibleCount + 2` buffer items, not the full options list | Any list with more than ~30 options |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Snap animation that overshoots the target item | Users feel like they "missed" the selection; must scroll again | Match the React source's deceleration curve; test with fast flick gestures specifically |
| Keyboard focus lost after mouse interaction | Screen reader users lose context; keyboard navigation broken | Always return focus to the picker container on `mouseup`; never remove `tabIndex` |
| Type-ahead search with too-long debounce (>1500ms) | Characters accumulate across separate intended searches | Use 1000ms maximum reset timeout; reset on `Escape` key |
| Disabled options are reachable by touch/drag | Confused users who land on disabled items | Snap logic must skip disabled options — snapping to them silently is worse than preventing navigation |
| No visual indicator of which item is "selected" | Users don't know what value they've chosen | Ship data attributes (`data-selected`, `data-active`) so consumers can style the center item; this is table stakes, not optional |

---

## "Looks Done But Isn't" Checklist

- [ ] **Touch inertia:** Works on iOS Safari — verify `touchmove` preventDefault does not get silently swallowed by passive listener default
- [ ] **Infinite loop:** No visible jump or flicker when the position wraps — test with fast continuous scrolling for 5+ seconds
- [ ] **Controlled mode:** Parent updating `value` prop externally snaps the picker to the new position — test async value updates
- [ ] **Keyboard navigation:** Tab into picker, arrow keys scroll it, Enter/Space selects — test with VoiceOver and keyboard-only navigation
- [ ] **Type-ahead:** Pressing "M" then "a" navigates to "May" (multi-character match), not just "M" then resets to "a" — test letter sequences with <500ms timing
- [ ] **Disabled options:** Drag/scroll past a disabled option without it being selectable — verify in both linear and infinite modes
- [ ] **Package exports:** `import { WheelPicker } from 'svelte-wheel-picker'` works in a plain SvelteKit project with default config — no manual `moduleResolution` required
- [ ] **shadcn-svelte CLI:** `npx shadcn-svelte@latest add [registry-url]` adds component files to consumer project without errors — test on a fresh SvelteKit app
- [ ] **Zero runtime deps:** `npm ls --prod` shows no production dependencies in the published package
- [ ] **SSR safety:** Component renders without error in SvelteKit SSR context (even if interactive features are client-only) — no `window is not defined` on import

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Passive listener blocking preventDefault | LOW | Swap declarative `on:touchmove` for imperative `addEventListener` with `{passive: false}`; contained to one file |
| $effect infinite loop in animation | MEDIUM | Refactor animation loop to use plain mutable variables + `untrack()`; requires rewriting animation state management |
| Wrong package exports shipped to npm | MEDIUM | Publish a patch version with corrected `package.json` exports; consumers may need to clear node_modules cache |
| Controlled mode diverges from parent | HIGH | Rearchitect the value-sync pattern; all state management code must be rewritten; breaks API contract |
| Infinite loop visual jump at boundary | MEDIUM | Separate logical vs display position calculation; requires rewriting position/transform pipeline |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Passive touch listeners | Core interaction (touch drag) | Manual test: drag picker on iOS Safari — page must not scroll |
| $effect infinite loop | Core interaction (inertia animation) | Run picker under React-like stress: mount/unmount 10x, CPU stays normal |
| Controlled/uncontrolled ambiguity | Component API design | Unit test: pass value prop without bind:, change it from parent, picker updates |
| RAF not cancelled on destroy | Core interaction (inertia animation) | Memory profile: mount/unmount 20x, no baseline memory growth |
| Infinite loop visual jump | Infinite loop feature | Manual test: flick scroll rapidly for 10 seconds in infinite mode |
| Shipping compiled output | Package setup / build config | Verify: published package contains `.svelte` files, not `.js` bundles |
| Spreading $props() breaks reactivity | Component API design | Unit test: update classNames prop dynamically, verify component re-renders |
| .svelte.ts file naming | Project setup | Compiler catches this; ensure CI fails on rune usage in plain .ts files |
| shadcn registry dependency omission | Distribution setup | Test: fresh project, run CLI add command, component works without manual installs |
| DOM measurement per frame | Core interaction | Performance profile: 60fps maintained during active scroll on mid-range mobile |

---

## Sources

- [Svelte $effect documentation](https://svelte.dev/docs/svelte/$effect) — cleanup pattern, untrack usage
- [Svelte runtime errors](https://svelte.dev/docs/svelte/runtime-errors) — infinite reactive loop detection
- [GitHub: Infinite loop of $effect with arrays](https://github.com/sveltejs/svelte/issues/16224) — confirmed expected behavior, not a bug
- [GitHub: $bindable controlled prop issue](https://github.com/sveltejs/svelte/issues/11360) — three-scenario controlled/uncontrolled gap
- [GitHub: Non-obvious Svelte 5 rune details](https://github.com/sveltejs/svelte/discussions/14835) — file naming, store interop, class field proxies
- [SvelteKit packaging documentation](https://svelte.dev/docs/kit/packaging) — exports field, TypeScript resolution, sideEffects
- [MDN: Element wheel event](https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event) — passive listener defaults
- [Chrome Developers: passive listeners](https://developer.chrome.com/docs/lighthouse/best-practices/uses-passive-event-listeners) — touch event passivity by default
- [shadcn-svelte registry getting started](https://www.shadcn-svelte.com/docs/registry/getting-started) — registry distribution requirements
- [Mainmatter: Global state in Svelte 5](https://mainmatter.com/blog/2025/03/11/global-state-in-svelte-5/) — runes outside components
- [GitHub: react-wheel-picker source](https://github.com/ncdai/react-wheel-picker) — reference implementation structure
- [Svelte 5 reactivity traps](https://jamesy.dev/blog/svelte-5-states-avoiding-common-reactivity-traps) — SvelteMap/SvelteSet, circular updates, tick()

---
*Pitfalls research for: Svelte 5 iOS-style wheel picker component library*
*Researched: 2026-03-23*
