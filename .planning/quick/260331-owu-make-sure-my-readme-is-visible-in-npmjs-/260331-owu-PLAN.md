---
phase: quick-260331-owu
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .github/workflows/publish.yml
autonomous: true
requirements: [QUICK-260331-owu]
must_haves:
  truths:
    - "publish.yml no longer contains the misleading 'first publish must be done manually' comment"
    - "publish command includes --access public for explicit scoped package access"
    - "README appears on npmjs.com after CI publishes the package"
  artifacts:
    - path: ".github/workflows/publish.yml"
      provides: "Corrected publish workflow with accurate comment and --access public flag"
  key_links:
    - from: "release.yml"
      to: "publish.yml"
      via: "release published event trigger"
      pattern: "on:\\s+release:\\s+types: \\[published\\]"
---

<objective>
Fix the misleading comment in publish.yml and add --access public to the publish command so the automated CI publish chain works correctly for a scoped npm package on its very first run.

Purpose: The package has never been published. Once NPM_TOKEN is added as a GitHub secret (one human action), pushing to main must trigger a successful publish without any additional manual steps. The current workflow comment says "First publish must be done manually" — this is wrong because publishConfig.access: "public" in package.json already handles scoped package access for CI.

Output: Updated publish.yml with accurate comment and belt-and-suspenders --access public flag. README will appear on npmjs.com automatically after CI publishes.
</objective>

<execution_context>
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/instinct/Desktop/wheel-picker/svelte-wheel-picker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.github/workflows/publish.yml
@package.json

Research confirmed:
- README.md IS in the tarball (npm pack --dry-run output, 8.3 kB)
- npm always bundles README.md regardless of the `files` field — no package.json changes needed
- publishConfig.access: "public" is already set — CI can publish a scoped package without manual first-publish
- The misleading comment in publish.yml is the only actionable item
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix publish.yml — accurate comment and --access public flag</name>
  <files>.github/workflows/publish.yml</files>
  <action>
    Rewrite the comment block at the top of the file (lines 1-12) and update the publish command.

    Replace the entire comment block that currently reads:
    ```
    # NPM_TOKEN setup:
    # 1. Go to npmjs.com → Access Tokens → Generate New Token (Automation type)
    # 2. Add the token as a GitHub secret named NPM_TOKEN in repo Settings → Secrets
    #
    # First publish must be done manually: pnpm publish --access public
    # After that, this workflow handles all subsequent releases.
    #
    # OIDC upgrade path (no long-lived tokens):
    # Once the package exists on npm, configure a Trusted Publisher on npmjs.com
    # (package → Settings → Publishing → Trusted Publishers), then replace
    # NODE_AUTH_TOKEN with id-token: write permission + NPM_CONFIG_PROVENANCE=true.
    ```

    With this corrected version:
    ```
    # NPM_TOKEN setup (one-time human action):
    # 1. Go to npmjs.com → your avatar → Access Tokens → Generate New Token (Automation type)
    # 2. Go to GitHub repo → Settings → Secrets and variables → Actions → New repository secret
    #    Name: NPM_TOKEN  Value: the token from step 1
    #
    # No manual first publish needed — publishConfig.access: "public" in package.json
    # handles scoped package access automatically. CI publishes on first run.
    #
    # OIDC upgrade path (no long-lived tokens):
    # Once the package exists on npm, configure a Trusted Publisher on npmjs.com
    # (package → Settings → Publishing → Trusted Publishers), then replace
    # NODE_AUTH_TOKEN with id-token: write permission + NPM_CONFIG_PROVENANCE=true.
    ```

    Also update the Publish step's run line from:
    ```yaml
        run: pnpm publish --no-git-checks
    ```
    to:
    ```yaml
        run: pnpm publish --no-git-checks --access public
    ```

    The --access public flag is belt-and-suspenders alongside publishConfig.access: "public" in
    package.json. Both together make intent explicit and guarantee scoped package visibility.
    Do not change anything else in the file.
  </action>
  <verify>
    <automated>grep -c "must be done manually" .github/workflows/publish.yml</automated>
  </verify>
  <done>
    grep returns 0 (the misleading line is gone).
    grep finds "--access public" on the publish run line.
    The comment block accurately states no manual publish is needed — only NPM_TOKEN in secrets.
  </done>
</task>

</tasks>

<verification>
grep -c "must be done manually" .github/workflows/publish.yml   # must return 0
grep -c "\-\-access public" .github/workflows/publish.yml       # must return 1
</verification>

<success_criteria>
- publish.yml comment is accurate: CI handles all publishes including the very first one
- publish command has --access public for explicit scoped package access
- User knows the single required action: add NPM_TOKEN to GitHub repo secrets, then push to main
</success_criteria>

<user_action_required>
After this plan executes, one human action remains before the README appears on npmjs.com:

Add your npm automation token as a GitHub secret named NPM_TOKEN:

1. Visit https://www.npmjs.com → avatar menu → Access Tokens → Generate New Token
2. Select type: Automation (bypasses 2FA for CI)
3. Copy the token
4. Visit your GitHub repo → Settings → Secrets and variables → Actions → New repository secret
5. Name: NPM_TOKEN — Value: the token from step 3 — click Add secret

Then push anything to main (or let the next commit trigger it). The chain runs:
  push to main → release.yml bumps version + creates GitHub release
  → publish.yml fires on release published event → publishes to npm

The README will appear on https://www.npmjs.com/package/@uinstinct/svelte-wheel-picker
within ~60 seconds of the publish completing.
</user_action_required>

<output>
After completion, create `.planning/quick/260331-owu-make-sure-my-readme-is-visible-in-npmjs-/260331-owu-SUMMARY.md`
</output>
