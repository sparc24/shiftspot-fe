---
name: git-branch
description: Create or check out a task branch off a specified parent branch, using conventional GitHub naming, before any code is written (Coding Agent Gate 3)
---

# Git Branch Skill

Creates or checks out the task branch off a specific parent branch, before any code is written. Called by the Coding Agent as Gate 3 of its PRE-CONDITIONS.

The parent branch is **not assumed to be `main`** — it is resolved once by the Orchestrator at Step 0 (Parent Branch Selection, in `CLAUDE.md`) and passed in here as `ParentBranch`. This skill does not ask the user anything itself; by the time it runs, `ParentBranch` has already been fetched, checked out, and pulled by Step 0.

---

## Trigger Point

The Coding Agent MUST invoke this skill during Gate 3, before any file operation, passing the data below from the approved plan context and the Step 0 pipeline context.

---

## Input

| Parameter | Type | Required | Description |
|---|---|---|---|
| `ParentBranch` | string | Yes | The branch resolved at orchestrator Step 0 (e.g. `main`, `develop`, `release/1.2`) — already fetched and pulled locally by the time this skill runs |
| `IssueType` | string | No | Jira issue type (e.g. `Story`, `Task`, `Bug`, `Tech Debt`) — selects the branch prefix. Omit if no ticket. |
| `TicketId` | string | No | Jira ticket ID (e.g. `US-123`). Omit if no ticket. |
| `Description` | string | Yes | Short feature description — lowercase, hyphen-separated, ≤ 5 words (e.g. `add-user-profile-page`) |

### Branch Prefix Rules

Selected from `IssueType`:

| Issue Type | Prefix |
|---|---|
| Story / Task / Feature | `feature/` |
| Bug | `bugfix/` |
| Tech Debt / Chore / Refinement | `chore/` |
| No ticket / IssueType omitted | `feature/` |

### Branch Name Rules

`<prefix><TicketId>-<Description>` when a ticket exists, otherwise `<prefix><Description>`:

- `feature/US-123-add-user-profile-page`
- `bugfix/US-456-fix-null-crash`
- `chore/US-789-rename-legacy-hook`
- `feature/add-loading-spinner` (no ticket)

Description must be lowercase, hyphen-separated, ≤ 5 words, no special characters. Total branch name should stay under ~60 characters.

---

## How to Invoke

Derive `BranchName` per the rules above, then resolve it in three explicit cases. **Do not use an `A && B || C` one-liner here** — that construct cannot distinguish "the branch doesn't exist" from "checkout failed for another reason" (dirty tree, index lock), and in the latter case it silently falls through and reports a misleading `already exists` error instead of the real cause.

All ancestry and anchoring use `origin/<ParentBranch>` (the remote-tracking ref), not the bare local ref — the local ref can be stale on a resumed task, where Step 0's `git pull` was skipped.

```bash
git fetch origin "<ParentBranch>:refs/remotes/origin/<ParentBranch>"

if git show-ref --verify --quiet "refs/heads/<BranchName>"; then
  # Case 1 — exists locally
  git checkout "<BranchName>"                       # Status: CheckedOut
elif git ls-remote --exit-code --heads origin "<BranchName>" >/dev/null 2>&1; then
  # Case 2 — exists on the remote but not locally (fresh clone, other machine,
  # pruned local branch). Must track it — creating a new branch here would
  # silently discard the remote work and fail later at push time.
  git fetch origin "<BranchName>" && \
    git checkout -b "<BranchName>" --track "origin/<BranchName>"   # Status: CheckedOutFromRemote
else
  # Case 3 — genuinely new
  git checkout -b "<BranchName>" "origin/<ParentBranch>"           # Status: Created
fi
```

### Divergence check (Cases 1 and 2 only — skip for a newly created branch)

A newly created branch is trivially a descendant, so this check is only meaningful for an existing branch:

```bash
git rev-list --left-right --count "origin/<ParentBranch>...<BranchName>"
# output: "<behind>	<ahead>"
```

- `behind > 0`, `ahead > 0` → **genuinely diverged**; set `Diverged: true`
- `behind > 0`, `ahead == 0` → merely **behind** the parent. This is normal and expected — Step 4 (Rebase Health) exists to fix exactly this. Do **not** set `Diverged`.
- If the command errors (unknown ref, corrupt repo) → set `Status: Failed` with the raw error. Do not treat a bad ref as divergence.

Note: do **not** use `git merge-base --is-ancestor <ParentBranch> <BranchName>` for this. It answers "is the branch fully up to date with the parent?", which is a different question — it reports non-zero for a merely-behind branch, so it would flag `DIVERGED` on nearly every resumed task and train the operator to ignore the signal. It also exits `>1` on a bad ref, which `||` cannot distinguish from a legitimate negative.

If `Diverged: true`, report it to the Coding Agent, which raises it as a gate (see `coding-agent.md` Gate 3).

---

## Output

| Field | Description |
|---|---|
| `BranchName` | The full branch name created or checked out (e.g. `feature/US-123-add-user-profile-page`) |
| `ParentBranch` | Echoed back from input — passed forward to the GitHub PR Skill as `BaseBranch` |
| `Status` | `Created` \| `CheckedOut` \| `CheckedOutFromRemote` \| `Failed` — determined by which of the three cases above ran |
| `Diverged` | `true` \| `false` — `true` only when the branch has commits the parent doesn't **and** the parent has commits the branch doesn't. Merely being behind the parent is not divergence. |
| `Error` | Populated only on `Failed` — the raw git error message |

Report output back to the Coding Agent in the conversation so it can confirm Gate 3 is cleared.

---

## Error Handling

- If git returns a non-zero exit code → set `Status: Failed`, report `Error`, and **do not proceed**. The Coding Agent must STOP and notify the Orchestrator.
- Do not retry silently. Surface the error immediately.
- Do not attempt to re-resolve `ParentBranch` here — if it's wrong, that's an orchestrator Step 0 problem, not something this skill re-asks about.

---

## Required Tools

| Tool | Purpose |
|---|---|
| Bash | Run `git checkout` / `git show-ref` / `git merge-base` commands |
