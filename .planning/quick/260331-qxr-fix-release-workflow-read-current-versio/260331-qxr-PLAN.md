---
phase: quick
plan: 260331-qxr
type: execute
wave: 1
depends_on: []
files_modified: [".github/workflows/release.yml"]
autonomous: true
requirements: []
must_haves:
  truths:
    - "Release workflow reads latest version from git tags, not package.json"
    - "If no git tags exist, falls back to package.json version"
    - "Each push to main increments from the last published version"
  artifacts:
    - path: ".github/workflows/release.yml"
      provides: "Fixed version detection step"
      contains: "git tag"
  key_links:
    - from: "steps.current (Read current version)"
      to: "steps.newver (Bump version)"
      via: "steps.current.outputs.version"
      pattern: "git tag.*sort.*refname"
---

<objective>
Fix the release workflow so it reads the current version from the latest git tag instead of package.json.

Purpose: The version bump commit goes to the `releases` branch, not `main`. So `main`'s `package.json` always has the stale version. Every push to `main` reads the same old version and tries to republish the same version number. Reading from git tags (which are created by the release step) ensures correct incremental versioning.

Output: Updated `.github/workflows/release.yml` with git-tag-based version detection.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.github/workflows/release.yml
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace package.json version read with git tag lookup</name>
  <files>.github/workflows/release.yml</files>
  <action>
Replace the "Read current version" step (lines 37-41) in `.github/workflows/release.yml`.

Current (broken):
```yaml
- name: Read current version
  id: current
  run: |
    VERSION=$(node -p "require('./package.json').version")
    echo "version=$VERSION" >> "$GITHUB_OUTPUT"
```

Replace with:
```yaml
- name: Read current version from latest git tag
  id: current
  run: |
    TAG_VERSION=$(git tag --sort=-v:refname | grep '^v' | head -1 | sed 's/^v//')
    if [ -z "$TAG_VERSION" ]; then
      TAG_VERSION=$(node -p "require('./package.json').version")
      echo "No git tags found, falling back to package.json: $TAG_VERSION"
    else
      echo "Latest git tag version: $TAG_VERSION"
    fi
    echo "version=$TAG_VERSION" >> "$GITHUB_OUTPUT"
```

Key details:
- `git tag --sort=-v:refname` sorts tags by version descending (newest first)
- `grep '^v'` filters to only version tags (e.g. v0.1.5)
- `head -1` takes the latest
- `sed 's/^v//'` strips the v prefix to get bare semver
- Fallback to package.json handles fresh repos with no tags yet
- The checkout step already has `fetch-depth: 0` so all tags are available

Do NOT change any other steps. The rest of the workflow (bump, commit, release, publish) remains the same.
  </action>
  <verify>
    <automated>grep -q "git tag --sort=-v:refname" .github/workflows/release.yml && grep -q "fallback to package.json" .github/workflows/release.yml && echo "PASS" || echo "FAIL"</automated>
  </verify>
  <done>The "Read current version" step derives version from the latest git tag with package.json fallback. No other workflow steps are modified.</done>
</task>

</tasks>

<verification>
- `cat .github/workflows/release.yml` shows git-tag-based version detection
- The step id remains `current` so downstream references (`steps.current.outputs.version`) are unchanged
- `fetch-depth: 0` is already set in checkout step, ensuring tags are available
</verification>

<success_criteria>
- Release workflow reads version from latest git tag, not package.json
- Falls back to package.json if no tags exist
- All other workflow steps unchanged
- Step output name (`version`) unchanged so bump step still works
</success_criteria>

<output>
After completion, create `.planning/quick/260331-qxr-fix-release-workflow-read-current-versio/260331-qxr-SUMMARY.md`
</output>
