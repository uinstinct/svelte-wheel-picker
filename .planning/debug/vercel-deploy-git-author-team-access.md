---
status: awaiting_human_verify
trigger: "vercel-deploy-git-author-team-access: Vercel deployment still failing with 'Git author must have access to team' error even after adding vercel.json to disable GitHub integration."
created: 2026-03-31T00:00:00Z
updated: 2026-03-31T00:00:00Z
---

## Current Focus

hypothesis: VERCEL_ORG_ID secret is set to a Vercel Team/Org ID rather than the personal account ID. The Vercel CLI reads this env var and scopes the deployment to the team. Because the commit author (61635505+uinstinct@users.noreply.github.com) is the GitHub Actions bot email — not a member of the Vercel team — the CLI rejects the deploy. The vercel.json "github.enabled: false" only disables the Vercel GitHub App auto-deploy; it has no effect on CLI-initiated deploys that explicitly pass VERCEL_ORG_ID pointing to a team.
test: Examine deploy.yml and vercel.json for org/scope configuration. Cross-reference the error message ("team Instinct's projects") with what VERCEL_ORG_ID likely contains.
expecting: VERCEL_ORG_ID contains a team ID (starts with "team_"), and the fix is to replace it with the personal account ID (starts with a different prefix) so the CLI deploys under the personal scope where Hobby plan restrictions don't apply.
next_action: CHECKPOINT — awaiting human to confirm which fix option to apply (replace VERCEL_ORG_ID secret value vs add --scope flag to deploy.yml) and to retrieve personal Vercel account ID.

## Symptoms

expected: GitHub Action deploys to Vercel successfully on push to main
actual: Deployment fails with "Git author 61635505+uinstinct@users.noreply.github.com must have access to the team Instinct's projects on Vercel to create deployments. Hobby teams do not support collaboration."
errors: "Git author 61635505+uinstinct@users.noreply.github.com must have access to the team Instinct's projects on Vercel to create deployments. Hobby teams do not support collaboration. Please upgrade to Pro to add team members."
reproduction: Push to main branch triggers the error
started: After initial deploy workflow was set up; prior fix attempt (vercel.json github.enabled: false) did not resolve it

## Eliminated

- hypothesis: vercel.json with {"github": {"enabled": false}} would fix the issue
  evidence: Error persists after that file was added. The vercel.json github.enabled flag only disables the Vercel GitHub App webhook-triggered deployments. It does NOT affect CLI-invoked deployments that pass VERCEL_ORG_ID pointing to a team scope.
  timestamp: 2026-03-31T00:00:00Z

## Evidence

- timestamp: 2026-03-31T00:00:00Z
  checked: .github/workflows/deploy.yml
  found: Workflow uses `vercel deploy --prebuilt --prod --token=...` with VERCEL_ORG_ID and VERCEL_PROJECT_ID set from GitHub secrets on every step (pull, build, deploy). No --scope flag is used.
  implication: The Vercel CLI reads VERCEL_ORG_ID to determine which account/team to deploy under. If this value is a team ID, the CLI enforces team membership on the commit author.

- timestamp: 2026-03-31T00:00:00Z
  checked: vercel.json
  found: Contains {"github": {"enabled": false}}. This was the prior fix attempt.
  implication: This setting only prevents Vercel's GitHub App from auto-triggering deployments on push. It is completely irrelevant to CLI-initiated deployments. The error is coming from the CLI deploy step, not the GitHub App.

- timestamp: 2026-03-31T00:00:00Z
  checked: Error message text
  found: "team Instinct's projects" — Vercel is resolving VERCEL_ORG_ID to a named team called "Instinct's projects"
  implication: VERCEL_ORG_ID in GitHub secrets contains a Vercel Team ID (format: "team_xxxxxxxx"), not the personal account ID. On Hobby plan, team membership is a Pro feature. The CLI is checking the git commit author email against team members and finding the Actions bot email is not a member.

- timestamp: 2026-03-31T00:00:00Z
  checked: How Vercel CLI determines git author
  found: Vercel CLI reads git metadata from the local checkout (git log -1) and sends the commit author email to the Vercel API as deployment metadata. When deploying to a team scope on Hobby plan, the API rejects any commit author that is not a team member.
  implication: The actual committer in GitHub Actions is the user who pushed (using GitHub's noreply email). This is not a member of the Vercel team. Fixing VERCEL_ORG_ID to point to the personal account eliminates the team membership check entirely.

## Resolution

root_cause: VERCEL_ORG_ID GitHub secret is set to a Vercel Team ID ("team Instinct's projects"), causing the Vercel CLI to deploy under team scope. On Hobby plan, the Vercel API enforces that the git commit author email must be a team member. The GitHub Actions commit author (61635505+uinstinct@users.noreply.github.com) is not a team member, so every CLI deploy is rejected. The vercel.json fix was a red herring — it only affects GitHub App webhook deployments, not CLI deployments.
fix: Replace the VERCEL_ORG_ID GitHub secret value with the personal Vercel account ID (not the team ID). The personal account ID can be found in Vercel dashboard → Settings → General → "Your ID" (format differs from team IDs). Alternatively, remove VERCEL_ORG_ID entirely and add --scope <username> to each vercel CLI command in deploy.yml, where <username> is the Vercel personal account username.
verification: empty
files_changed: []
