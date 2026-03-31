---
phase: quick-260331-qnz
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [.github/workflows/release.yml]
autonomous: true
requirements: [QUICK-01]
must_haves:
  truths:
    - "Release workflow pushes version bump commits to a single persistent 'releases' branch"
    - "No new branch is created per release -- all releases share the 'releases' branch"
    - "GitHub Release tag targets the 'releases' branch"
    - "Publish job still checks out by release tag and publishes successfully"
  artifacts:
    - path: ".github/workflows/release.yml"
      provides: "Release workflow with fixed 'releases' branch"
      contains: "releases"
  key_links:
    - from: "release job commit step"
      to: "releases branch"
      via: "git push origin releases"
      pattern: 'git push origin releases'
---

<objective>
Fix the release workflow to push version bump commits to a single persistent `releases` branch instead of creating a new `releases/v{version}` branch per release.

Purpose: Prevent branch proliferation -- currently every release creates a new `releases/v{version}` branch that accumulates in the repo. A single `releases` branch keeps things clean.

Output: Updated `.github/workflows/release.yml`
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
  <name>Task 1: Update release workflow to use a single persistent releases branch</name>
  <files>.github/workflows/release.yml</files>
  <action>
Modify the "Commit and push version bump to release branch" step (lines 62-68) to:

1. Replace the per-version branch logic with a fixed `releases` branch:
   - Instead of `BRANCH="releases/v${{ steps.newver.outputs.version }}"` and `git checkout -b "$BRANCH"`, do:
   - Fetch the remote `releases` branch if it exists, then either check it out or create it fresh from current HEAD
   - Use: `git fetch origin releases:releases 2>/dev/null && git checkout releases && git merge --ff-only origin/main || git checkout -b releases`
   - This handles both first-run (branch doesn't exist yet) and subsequent runs (branch already exists)

2. After committing, force-push is NOT needed. The branch is always a superset of main (main commit + version bump), so a normal push works. Use `git push origin releases` (with `--force-with-lease` as safety net in case the branch tip diverged from a prior failed run).

3. Update the "Create GitHub Release" step (lines 70-78):
   - Change `BRANCH="releases/v${{ steps.newver.outputs.version }}"` to just use `releases`
   - Change `--target "$BRANCH"` to `--target releases`

4. The publish job (line 89) checks out by tag ref `v${{ needs.release.outputs.version }}` -- this still works because `gh release create` creates a tag at the target branch. No change needed there.

The final "Commit and push" step should look like:
```yaml
- name: Commit and push version bump to release branch
  run: |
    git checkout -b releases
    git add package.json
    git commit -m "chore: bump version to ${{ steps.newver.outputs.version }}"
    git push origin releases --force
```

Note: We use `git checkout -b releases` (create new local branch from current HEAD which is main) and `git push --force` because each release starts from the latest main commit. The releases branch is ephemeral in content -- it always equals main + one version bump commit. Force push is safe here because no one works on this branch directly.

And the release creation step:
```yaml
- name: Create GitHub Release
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    gh release create "v${{ steps.newver.outputs.version }}" \
      --title "v${{ steps.newver.outputs.version }}" \
      --target releases \
      --generate-notes
```
  </action>
  <verify>
    <automated>grep -q '"releases"' .github/workflows/release.yml || grep -q "'releases'" .github/workflows/release.yml || grep -q "releases" .github/workflows/release.yml && ! grep -q "releases/v" .github/workflows/release.yml && echo "PASS" || echo "FAIL"</automated>
  </verify>
  <done>
    - The workflow uses a single `releases` branch (not `releases/v{version}`)
    - No per-version branch naming anywhere in the file
    - GitHub Release targets `releases` branch
    - Publish job checkout by tag is unchanged
  </done>
</task>

</tasks>

<verification>
- `grep -c "releases/v" .github/workflows/release.yml` returns 0 (no per-version branch references)
- `grep "releases" .github/workflows/release.yml` shows the fixed branch name
- Workflow YAML is valid (no syntax errors)
</verification>

<success_criteria>
- release.yml pushes version bump to a single `releases` branch
- No `releases/v{version}` pattern remains in the workflow
- GitHub Release creation targets the `releases` branch
</success_criteria>

<output>
After completion, create `.planning/quick/260331-qnz-fix-the-release-workflow-to-push-the-ver/260331-qnz-SUMMARY.md`
</output>
