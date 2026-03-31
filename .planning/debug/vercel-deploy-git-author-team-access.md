---
status: fixing
trigger: "vercel-deploy-git-author-team-access: Vercel deployment still failing with 'Git author must have access to team' error even after adding vercel.json to disable GitHub integration."
created: 2026-03-31T00:00:00Z
updated: 2026-03-31T04:00:00Z
---

## Current Focus

hypothesis: CONFIRMED. Root cause unchanged. Transfer is not available on Hobby plan. Alternative path: delete team project, re-link locally under personal account via `vercel link`, then update GitHub secrets with new project ID and org ID. Local .vercel/project.json already shows orgId: BHGAGt3qZQ2eaD6jz6z9iDTY (personal account) — user may have already run `vercel link` locally and created a new personal-scoped project.
test: N/A — root cause confirmed
expecting: N/A
next_action: User to follow the step-by-step fix: (1) delete team project in Vercel dashboard, (2) run `vercel link` locally if not already done, (3) read projectId from .vercel/project.json, (4) update VERCEL_PROJECT_ID and VERCEL_ORG_ID GitHub secrets, (5) push to main to trigger deploy.

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

- hypothesis: Updating the VERCEL_ORG_ID GitHub secret alone is sufficient to fix the team-scope issue
  evidence: User updated the secret but the error persists unchanged ("team Instinct's projects"). The Vercel CLI reads .vercel/project.json from the checked-out repo and it contains orgId: "team_C63mGscCguAsKFi53TWmt1kh" — this hardcoded team ID overrides or conflicts with the env var. The env var change had no effect because the project.json is the authoritative source the CLI uses.
  timestamp: 2026-03-31T01:00:00Z

- hypothesis: .vercel/project.json is checked into the repo and is the root cause
  evidence: git ls-files .vercel/project.json returns empty. .gitignore contains ".vercel". The file has zero git history. It is never in the CI checkout. The `vercel pull` step creates it at runtime. This hypothesis was incorrect.
  timestamp: 2026-03-31T02:00:00Z

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

- timestamp: 2026-03-31T01:00:00Z
  checked: .vercel/project.json (checked into the repo)
  found: {"projectId":"prj_hZyAoVNKzOxpfB4hX3JcWvwRv7cj","orgId":"team_C63mGscCguAsKFi53TWmt1kh","projectName":"project-oonw6"} — the orgId is hardcoded as a team_ ID in the local file.
  implication: Initially believed this file was committed to git, making it the root cause. This was wrong — see next evidence entry.

- timestamp: 2026-03-31T02:00:00Z
  checked: git ls-files .vercel/project.json and .gitignore
  found: File is gitignored (".vercel" in .gitignore), has zero git history, and is never present in CI checkout. The `vercel pull` step in deploy.yml creates .vercel/project.json at runtime by querying the Vercel API with VERCEL_ORG_ID + VERCEL_PROJECT_ID env vars.
  implication: The runtime-generated .vercel/project.json will contain the orgId that corresponds to whichever scope VERCEL_ORG_ID resolves to at the API level. If the Vercel project is still owned by or linked to the team on Vercel's side, `vercel pull` will write a team-scoped project.json regardless of what VERCEL_ORG_ID is set to. Need to verify: (1) current value of VERCEL_ORG_ID secret, (2) which account owns the Vercel project prj_hZyAoVNKzOxpfB4hX3JcWvwRv7cj.

- timestamp: 2026-03-31T03:00:00Z
  checked: Vercel dashboard — project ownership and GitHub secret values
  found: VERCEL_ORG_ID secret correctly set to BHGAGt3qZQ2eaD6jz6z9iDTY (personal account). The Vercel project "project-oonw6" is owned by "Instinct's projects" TEAM, not the personal account. `vercel pull` fetches project config by VERCEL_PROJECT_ID; because that project lives in the team, the returned config is team-scoped and all CLI operations run under team scope regardless of VERCEL_ORG_ID.
  implication: Root cause confirmed. The fix must happen in Vercel: transfer the project to the personal account. No code change required.

- timestamp: 2026-03-31T04:00:00Z
  checked: .vercel/project.json on local machine
  found: {"projectId":"prj_hZyAoVNKzOxpfB4hX3JcWvwRv7cj","orgId":"BHGAGt3qZQ2eaD6jz6z9iDTY","projectName":"project-oonw6"} — orgId is already the personal account ID, not the team ID.
  implication: User likely already ran `vercel link` locally and linked to or created a personal-scoped project. The projectId may be the same (if Vercel allowed re-linking the existing project to personal) or may be different (if a new project was created). The VERCEL_PROJECT_ID GitHub secret must be updated to match this projectId value. The deploy.yml workflow itself requires no changes — the issue is purely the GitHub secrets pointing at the wrong (team-scoped) Vercel project.

## Resolution

root_cause: The Vercel project "project-oonw6" (prj_hZyAoVNKzOxpfB4hX3JcWvwRv7cj) is owned by the "Instinct's projects" TEAM on Vercel, not the personal account. VERCEL_ORG_ID was correctly set to the personal account ID (BHGAGt3qZQ2eaD6jz6z9iDTY), but this is irrelevant — `vercel pull` resolves the project by VERCEL_PROJECT_ID, finds it is team-scoped, and the Vercel API then enforces team membership on the git commit author. The GitHub Actions noreply email is not a team member. Hobby plan does not allow team collaboration, so the deploy is rejected.
fix: Transfer is unavailable. Alternative: delete the team-scoped project from Vercel, re-link locally using `vercel link` under personal account, then update GitHub secrets VERCEL_PROJECT_ID and VERCEL_ORG_ID with values from .vercel/project.json. The local .vercel/project.json already shows orgId: BHGAGt3qZQ2eaD6jz6z9iDTY — user may have already done `vercel link`. The deploy.yml workflow itself needs no changes.
verification: empty
files_changed: []
