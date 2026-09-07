---
name: github-pr
description: Push the feature branch and open a GitHub pull request after the test suite is green
---

# GitHub PR Skill

Pushes the feature branch to the remote and opens a pull request on GitHub using the `gh` CLI. Called by the Orchestrator after Step 4 (Rebase Health) clears.

---

## Trigger Point

The Orchestrator MUST invoke this skill after all of the following are true:
- Test suite is fully green (Unit Test Agent, Parallel Block B)
- Step 4 (Rebase Health) has cleared — either a clean rebase, an auto-resolved additive conflict, or the user replied `resolved` at the conflict gate
- Jira ticket has been transitioned to Done

Not called by Unit Test Agent directly — Rebase Health runs after Unit Test Agent finishes, so opening the PR any earlier risks a stale PR.

---

## Input

| Parameter | Type | Required | Description |
|---|---|---|---|
| `BranchName` | string | Yes | The feature branch to push (e.g. `feature/US-123-add-user-profile-page`) |
| `BaseBranch` | string | Yes | Target branch for the PR — **this must be `ParentBranch` as resolved by the orchestrator's Step 0 (Parent Branch Selection)**, the same branch the task branch was created from by the Git Branch Skill. Never independently assume `main`/`develop` here — a mismatch between the branch's actual git ancestry and the PR's target branch produces a confusing diff. |
| `TicketId` | string | No | Jira ticket ID prepended to the PR title (e.g. `US-123`) |
| `Title` | string | Yes | Short PR title ≤ 70 characters (e.g. `US-123 Add user profile page`) |
| `Summary` | string | Yes | 1–3 bullet points describing what the PR does — plain text, no markdown headers |
| `TestPlan` | string | Yes | Bulleted checklist of what was tested |
| `ConfluenceUrl` | string | No | Confluence LLD page URL — included in PR body if present |

---

## How to Invoke

### Step 1 — Push the branch

```bash
git push --force-with-lease -u origin "<BranchName>"
```

`--force-with-lease` is required, not optional: Step 4 (Rebase Health) rebases the task branch onto `origin/<ParentBranch>` immediately before this skill runs, which **rewrites every commit SHA on the branch**. If the branch was already pushed on a prior attempt, a resumed session, or a Coding Agent rework loop, a plain `git push` is rejected as non-fast-forward. `--force-with-lease` (never bare `--force`) still refuses if someone else pushed to the branch in the meantime — safe here because the task branch is agent-owned and rebase-rewritten by design.

### Step 2 — Create the PR

```bash
gh pr create \
  --title "<Title>" \
  --base "<BaseBranch>" \
  --body "$(cat <<'EOF'
## Summary
<Summary>

## Test plan
<TestPlan>

## References
LLD: <ConfluenceUrl>

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
EOF
)"
```

**Placeholder substitution:** `<Title>`, `<BaseBranch>`, `<BranchName>`, `<Summary>`, `<TestPlan>`, and `<ConfluenceUrl>` are replaced textually **before** the command is handed to a shell — they are not shell variables. Keep the heredoc delimiter single-quoted (`<<'EOF'`), which prevents the shell from expanding `$`, backticks, or `\` inside substituted PR-body text. TypeScript/React test plans routinely contain `${}` template literals and `$`-prefixed identifiers, so an unquoted `<<EOF` here would corrupt the body and open a command-injection path.

**Conditional section:** if `ConfluenceUrl` is absent (always the case in Bypass Workflow, which produces no plan page), omit the entire `## References` section — heading and all. Do not emit an empty heading, and do not emit any literal conditional markup.

---

## Output

| Field | Description |
|---|---|
| `PrUrl` | The full GitHub PR URL returned by `gh pr create` |
| `Status` | `Created` \| `Failed` |
| `Error` | Populated only on `Failed` — the raw CLI error message |

Report `PrUrl` back to the Orchestrator in the conversation so it can surface it to the user.

---

## Error Handling

- If `git push` fails (e.g. no remote configured, auth error) → set `Status: Failed`, report `Error`. Do not attempt `gh pr create`. Notify the Orchestrator.
- If `git push` is rejected because the remote branch has commits not in the local branch (`--force-with-lease` refused) → set `Status: Failed` and report it as a **genuine conflict**: someone else pushed to this task branch. Do not escalate to bare `--force`; surface it to the user.
- If `gh pr create` fails → set `Status: Failed`, report `Error`. The push already succeeded, so on retry **re-run Step 1 as well** — Step 4 may have rebased again in between, which would make the remote branch stale. `--force-with-lease` makes re-pushing safe and idempotent.
- If a PR already exists for the branch, `gh pr create` will error. Report the existing PR URL from the error message instead.

---

## Required Tools

| Tool | Purpose |
|---|---|
| Bash | Run `git push` and `gh pr create` |
