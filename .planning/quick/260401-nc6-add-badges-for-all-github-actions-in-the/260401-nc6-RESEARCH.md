# Quick Task: Add GitHub Actions Badges to README - Research

**Researched:** 2026-04-01
**Domain:** GitHub Actions badge URLs, README formatting
**Confidence:** HIGH

## Summary

The repo has 3 GitHub Actions workflows. The README already has 2 badges (npm version, license) on line 3. The new workflow badges should be added alongside the existing ones.

**Primary recommendation:** Add shields.io-style GitHub Actions badges for all 3 workflows, placed on the same badge line as the existing npm/license badges.

## Workflows Found

| Workflow File | `name:` Field | Runs On |
|---------------|---------------|---------|
| `ci.yml` | CI | push to main, PRs to main |
| `deploy.yml` | Deploy to Netlify | push to main |
| `release.yml` | Release | push to main, workflow_dispatch |

## Badge URL Format

GitHub provides native badge endpoints. The format is:

```
https://github.com/{owner}/{repo}/actions/workflows/{workflow_file}/badge.svg?branch={branch}
```

For this repo (`uinstinct/svelte-wheel-picker`):

| Badge | Image URL | Link URL |
|-------|-----------|----------|
| CI | `https://github.com/uinstinct/svelte-wheel-picker/actions/workflows/ci.yml/badge.svg?branch=main` | `https://github.com/uinstinct/svelte-wheel-picker/actions/workflows/ci.yml` |
| Deploy to Netlify | `https://github.com/uinstinct/svelte-wheel-picker/actions/workflows/deploy.yml/badge.svg?branch=main` | `https://github.com/uinstinct/svelte-wheel-picker/actions/workflows/deploy.yml` |
| Release | `https://github.com/uinstinct/svelte-wheel-picker/actions/workflows/release.yml/badge.svg?branch=main` | `https://github.com/uinstinct/svelte-wheel-picker/actions/workflows/release.yml` |

### Markdown Syntax

```markdown
[![CI](https://github.com/uinstinct/svelte-wheel-picker/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/uinstinct/svelte-wheel-picker/actions/workflows/ci.yml)
[![Deploy to Netlify](https://github.com/uinstinct/svelte-wheel-picker/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/uinstinct/svelte-wheel-picker/actions/workflows/deploy.yml)
[![Release](https://github.com/uinstinct/svelte-wheel-picker/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/uinstinct/svelte-wheel-picker/actions/workflows/release.yml)
```

## Current README Badge Layout

Line 3-4 of README.md currently has:

```markdown
[![npm version](https://img.shields.io/npm/v/@uinstinct/svelte-wheel-picker)](https://www.npmjs.com/package/@uinstinct/svelte-wheel-picker)
[![license](https://img.shields.io/npm/l/@uinstinct/svelte-wheel-picker)](https://github.com/uinstinct/svelte-wheel-picker/blob/main/LICENSE)
```

New badges should be added on new lines immediately after the existing badges (before the blank line that precedes the description paragraph).

## Common Pitfalls

### Badge Caching
GitHub caches badge SVGs. Adding `?branch=main` ensures the badge reflects the correct branch. Without it, the badge defaults to the repo's default branch (which is `main` here, so it is the same -- but explicit is better).

### Workflow Name vs File Name
The badge alt text should use the workflow `name:` field (human-readable), while the URL uses the filename. Both are documented above.

### Badge Order Convention
Standard order: CI status first, then deploy, then release, then metadata badges (npm version, license). This puts actionable/status badges before informational ones.

## Sources

### Primary (HIGH confidence)
- GitHub docs: workflow status badges use `actions/workflows/{file}/badge.svg` endpoint
- Direct inspection of `.github/workflows/` files in this repo
- Direct inspection of current `README.md`
