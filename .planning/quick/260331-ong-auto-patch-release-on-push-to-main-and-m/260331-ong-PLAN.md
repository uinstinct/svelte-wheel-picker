---
phase: quick-260331-ong
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .github/workflows/release.yml
autonomous: true
requirements: []
must_haves:
  truths:
    - "Every push to main auto-increments the patch version, commits it with [skip ci], tags it, and creates a GitHub Release"
    - "A manual workflow_dispatch bumps the major version, commits it with [skip ci], tags it, and creates a GitHub Release"
    - "Each GitHub Release creation triggers the existing publish.yml workflow (release: types: [published]) to publish to npm"
    - "The version bump commit does not trigger another release cycle (infinite loop prevention)"
  artifacts:
    - path: ".github/workflows/release.yml"
      provides: "Auto patch + manual major release workflow"
  key_links:
    - from: ".github/workflows/release.yml"
      to: ".github/workflows/publish.yml"
      via: "gh release create → GitHub Release published event"
      pattern: "release.*types.*published"
---

<objective>
Add a GitHub Actions workflow that automates versioning and GitHub Release creation for two scenarios: patch bumps on every push to main, and major bumps via manual trigger. The existing publish.yml already listens for `release: types: [published]` — so creating a GitHub Release here chains into npm publish automatically.

Purpose: Remove the manual version-bump-tag-release ceremony from the publish cycle.
Output: `.github/workflows/release.yml`
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.github/workflows/publish.yml
@package.json

Current version: 0.1.0
Publish trigger: `release: types: [published]` in publish.yml — creating a GitHub Release is all that's needed to kick off npm publish.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create release.yml — auto patch on push to main, manual major via workflow_dispatch</name>
  <files>.github/workflows/release.yml</files>
  <action>
Create `.github/workflows/release.yml` with two triggers:

1. `push` to `main` branch (patch bump)
2. `workflow_dispatch` with no required inputs (major bump)

**Permissions required:**
- `contents: write` — to commit version bump and create releases
- No other permissions needed

**Job steps:**

```yaml
- name: Checkout
  uses: actions/checkout@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    fetch-depth: 0

- name: Configure git
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"

- name: Determine bump type
  id: bump
  run: |
    if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
      echo "type=major" >> "$GITHUB_OUTPUT"
    else
      echo "type=patch" >> "$GITHUB_OUTPUT"
    fi

- name: Read current version
  id: current
  run: |
    VERSION=$(node -p "require('./package.json').version")
    echo "version=$VERSION" >> "$GITHUB_OUTPUT"

- name: Bump version
  id: newver
  run: |
    BUMP="${{ steps.bump.outputs.type }}"
    VERSION="${{ steps.current.outputs.version }}"
    IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"
    if [ "$BUMP" = "major" ]; then
      NEW_VERSION="$((MAJOR + 1)).0.0"
    else
      NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
    fi
    # Write new version to package.json using node (preserves formatting)
    node -e "
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      pkg.version = '$NEW_VERSION';
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    echo "version=$NEW_VERSION" >> "$GITHUB_OUTPUT"

- name: Commit and push version bump
  run: |
    git add package.json
    git commit -m "chore: bump version to ${{ steps.newver.outputs.version }} [skip ci]"
    git push

- name: Create GitHub Release
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    gh release create "v${{ steps.newver.outputs.version }}" \
      --title "v${{ steps.newver.outputs.version }}" \
      --generate-notes
```

**Key implementation notes:**
- `[skip ci]` in commit message prevents the push-to-main from re-triggering the workflow (GitHub Actions skips workflows when commit message contains `[skip ci]`)
- `fetch-depth: 0` ensures `gh release create --generate-notes` can access full history for changelog generation
- `gh release create` (GitHub CLI, pre-installed on `ubuntu-latest`) creates the release which fires the `release: types: [published]` event, triggering publish.yml automatically
- Use `node -e` to write package.json to preserve the existing 2-space indentation format rather than `npm version` (which also creates a git tag we don't need separately)
- The tag `v$NEW_VERSION` is created by `gh release create` implicitly — no separate `git tag` step needed
- `secrets.GITHUB_TOKEN` is the built-in token — no additional secrets required for this workflow (npm publish still uses `NPM_TOKEN` in publish.yml)

Full workflow structure:
```yaml
name: Release

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      # ... steps above
```
  </action>
  <verify>
    <automated>test -f .github/workflows/release.yml && echo "File exists" || echo "MISSING"</automated>
  </verify>
  <done>
    - `.github/workflows/release.yml` exists
    - Workflow has both `push: branches: [main]` and `workflow_dispatch` triggers
    - Patch bump logic increments PATCH component on push
    - Major bump logic increments MAJOR component and resets MINOR/PATCH on workflow_dispatch
    - Commit message contains `[skip ci]`
    - `gh release create` step present — will fire publish.yml automatically
    - `permissions: contents: write` declared at job or workflow level
  </done>
</task>

</tasks>

<verification>
After the file is created, review it end-to-end:
1. YAML syntax is valid (no indentation errors)
2. Both trigger scenarios are present
3. `[skip ci]` is in the commit message string
4. `gh release create` uses `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` env var (required for gh CLI auth)
5. No hardcoded version strings — all version logic is dynamic from package.json
</verification>

<success_criteria>
- Pushing to main creates a patch release (e.g. 0.1.0 → 0.1.1), publishes to npm, and does not loop
- Running the workflow manually creates a major release (e.g. 0.1.1 → 1.0.0) and publishes to npm
- The package.json version bump is committed and visible in git history
</success_criteria>

<output>
After completion, create `.planning/quick/260331-ong-auto-patch-release-on-push-to-main-and-m/260331-ong-SUMMARY.md`
</output>
