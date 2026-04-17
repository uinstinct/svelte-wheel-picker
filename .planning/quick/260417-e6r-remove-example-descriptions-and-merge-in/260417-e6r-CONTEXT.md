# Quick Task 260417-e6r: Remove example descriptions and merge intro paragraphs into one - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Task Boundary

Remove verbose per-example description paragraphs from the demo page and merge the two hero intro paragraphs into a single short one.

</domain>

<decisions>
## Implementation Decisions

### Merged intro content
- Trim the two hero paragraphs to 1-2 sentences covering the core pitch: iOS-style wheel picker for Svelte 5, smooth scrolling, zero deps, headless

### Features section
- Keep the Features bullet list as-is — it's a useful quick reference distinct from per-example descriptions

### Selected value lines
- Keep the "Selected: X" display lines above each example — they demonstrate interactivity

### Per-example descriptions
- Remove all `<p class="section-description">` elements from every example section (Single Wheel, Disabled Options, Infinite Loop, Two Wheels, Drum/Cylinder, Sensitivity)

</decisions>

<specifics>
## Specific Ideas

- The `.section-description` CSS class can be removed along with the paragraphs
- Only `src/routes/+page.svelte` needs changes

</specifics>
