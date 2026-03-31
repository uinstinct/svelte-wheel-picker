---
phase: quick
plan: 260331-rsh
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
autonomous: true
must_haves:
  truths:
    - "package.json contains repository, bugs, and homepage fields"
    - "npmjs.com will display GitHub link after next publish"
  artifacts:
    - path: "package.json"
      provides: "npm metadata linking to GitHub repo"
      contains: "repository"
  key_links:
    - from: "package.json"
      to: "npmjs.com sidebar"
      via: "npm publish reads metadata"
      pattern: "repository.*github"
---

<objective>
Add repository, bugs, and homepage fields to package.json so npmjs.com displays the GitHub link, issue tracker, and homepage in the package sidebar.

Purpose: npm package currently has no link back to GitHub — users cannot find the source code or file issues.
Output: Updated package.json with all three metadata fields.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/260331-rsh-link-github-repo-with-the-npm-package/260331-rsh-RESEARCH.md
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add repository, bugs, and homepage fields to package.json</name>
  <files>package.json</files>
  <action>
Add the following three fields to package.json, placed after the "license" field:

```json
"repository": {
  "type": "git",
  "url": "git+https://github.com/uinstinct/svelte-wheel-picker.git"
},
"bugs": {
  "url": "https://github.com/uinstinct/svelte-wheel-picker/issues"
},
"homepage": "https://svelte-wheel-picker.netlify.app"
```

IMPORTANT: Use `git+https://` format for repository URL (not SSH `git@github.com:` format) — npm requires HTTPS to recognize it as a GitHub repository.

Do NOT change any other fields. Do NOT bump the version — the auto-release workflow handles versioning on push to main.
  </action>
  <verify>
    <automated>node -e "const p = require('./package.json'); const ok = p.repository?.url?.includes('github.com/uinstinct/svelte-wheel-picker') && p.bugs?.url?.includes('github.com/uinstinct/svelte-wheel-picker/issues') && p.homepage === 'https://svelte-wheel-picker.netlify.app'; console.log(ok ? 'PASS' : 'FAIL'); process.exit(ok ? 0 : 1)"</automated>
  </verify>
  <done>package.json contains repository (git+https format), bugs, and homepage fields pointing to the correct GitHub repo and Netlify demo site</done>
</task>

</tasks>

<verification>
- `node -e "console.log(JSON.stringify(require('./package.json'), null, 2))"` shows repository, bugs, homepage fields
- `npm pack --dry-run` succeeds without errors
</verification>

<success_criteria>
- package.json has repository.url = "git+https://github.com/uinstinct/svelte-wheel-picker.git"
- package.json has bugs.url = "https://github.com/uinstinct/svelte-wheel-picker/issues"
- package.json has homepage = "https://svelte-wheel-picker.netlify.app"
- No other fields changed
</success_criteria>

<output>
After completion, create `.planning/quick/260331-rsh-link-github-repo-with-the-npm-package/260331-rsh-SUMMARY.md`
</output>
