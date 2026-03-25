# Phase 7: Rotating Drum / Cylinder Picker - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Mode:** `--batch` (4 questions in one turn)

---

## Gray Areas Presented

1. Component shape — New `WheelPickerDrum` component vs. `cylindrical` prop on existing `WheelPicker`
2. 3D technique — True CSS 3D (`rotateX` + `translateZ`) vs. faux 3D (`scaleY` + opacity falloff)
3. Curvature config — Auto-derived from layout vs. new configurable prop
4. Demo update — New section, separate route, or replace existing example

## Discussion

### Q1: Component shape

**Options presented:**
- New `WheelPickerDrum` component — clean separation, drum-specific logic doesn't pollute WheelPicker
- `cylindrical` boolean prop on existing `WheelPicker` — one component, opt-in via prop

**User answer:** `cylindrical` boolean prop on existing `WheelPicker`

---

### Q2: 3D technique

**Options presented:**
- True CSS 3D — `perspective` container + `rotateX(angle)` + `translateZ(radius)` per item; authentic cylinder projection
- Faux 3D — `scaleY` compression + optional `opacity` falloff per item; simpler, no camera projection

**User answer:** Faux 3D (`scaleY` + opacity)

---

### Q3: Curvature config

**Options presented:**
- Auto-derived — radius computed from `visibleCount` × `optionItemHeight`; no new prop
- New prop — e.g. `drumRadius` or `perspective`; consumer can tune the visual
- Both — auto-derived default, prop to override

**User answer:** Auto-derived (no new prop)

---

### Q4: Demo update

**Options presented:**
- New section — add "Drum / Cylinder" section below existing examples in `+page.svelte`
- Separate route — new `/drum` page linked from main demo
- Replace one example — swap an existing example for a drum version

**User answer:** New section in existing `+page.svelte`
