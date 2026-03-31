# Quick Task: Link GitHub Repo with npm Package - Research

**Researched:** 2026-03-31
**Domain:** npm package metadata / GitHub integration
**Confidence:** HIGH

## Summary

The npm package `@uinstinct/svelte-wheel-picker` is missing the `repository`, `homepage`, and `bugs` fields in `package.json`. Adding these three fields is all that is needed for npmjs.com to display the GitHub link, homepage link, and issue tracker link in the package sidebar.

**Primary recommendation:** Add `repository`, `bugs`, and `homepage` fields to `package.json`, then publish a new version.

## Current State

The `package.json` has `name`, `description`, `license`, and all build/export fields configured correctly. It is missing:

- `repository` — npmjs.com uses this to show the "Repository" link in the sidebar
- `bugs` — npmjs.com uses this to show the "Issues" link
- `homepage` — npmjs.com uses this to show the "Homepage" link

The git remote is: `git@github.com:uinstinct/svelte-wheel-picker.git`

## Required Changes

### Fields to Add

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/uinstinct/svelte-wheel-picker.git"
  },
  "bugs": {
    "url": "https://github.com/uinstinct/svelte-wheel-picker/issues"
  },
  "homepage": "https://svelte-wheel-picker.netlify.app"
}
```

### Field Details

| Field | Value | Effect on npmjs.com |
|-------|-------|---------------------|
| `repository.url` | `git+https://github.com/uinstinct/svelte-wheel-picker.git` | Shows "Repository" link in sidebar, enables "GitHub" badge |
| `bugs.url` | `https://github.com/uinstinct/svelte-wheel-picker/issues` | Shows "Issues" link in sidebar |
| `homepage` | `https://svelte-wheel-picker.netlify.app` | Shows "Homepage" link in sidebar |

### Important Notes

1. **URL format for repository**: npm expects `git+https://` prefix (not `git@github.com:` SSH format). The shorthand `"repository": "github:uinstinct/svelte-wheel-picker"` also works, but the object form is more explicit and standard.

2. **No npm CLI commands needed**: There is no `npm link` or `npm config` step. The fields in `package.json` are the sole mechanism. npmjs.com reads them at publish time.

3. **No GitHub settings needed**: GitHub does not need any configuration. npm reads the metadata from `package.json` during `npm publish`.

4. **Requires republish**: The links will only appear on npmjs.com after the next `npm publish`. The existing published version will not retroactively update.

## Common Pitfalls

### Pitfall 1: SSH URL instead of HTTPS
**What goes wrong:** Using `git@github.com:user/repo.git` instead of `git+https://github.com/user/repo.git` causes npm to not recognize it as a GitHub repository.
**How to avoid:** Always use the `git+https://` format in the `repository.url` field.

### Pitfall 2: Forgetting to republish
**What goes wrong:** Adding the fields but not publishing a new version means npmjs.com still shows the old metadata.
**How to avoid:** Bump version and publish after making the change. Since this project has auto-release on push to main, merging the change will trigger a new release.

## Sources

### Primary (HIGH confidence)
- npm docs: package.json `repository` field — standard npm metadata specification
- Current `package.json` at project root — verified missing fields
- Git remote — confirmed `uinstinct/svelte-wheel-picker`

## Metadata

**Confidence breakdown:**
- Required fields: HIGH - standard npm specification, well-documented
- URL format: HIGH - verified against npm conventions

**Research date:** 2026-03-31
**Valid until:** Indefinite (stable npm specification)
