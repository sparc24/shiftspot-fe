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

Every invocation of this skill runs the Confidential Data Check (Step 0) before touching the remote — there is no path to `git push` that skips it, including a retry after a failed `gh pr create`.

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

### Step 0 — Confidential data check (required before every push, no exceptions)

**No confidential data is ever pushed to a remote without the user explicitly approving it.** This runs before Step 1, every time this skill is invoked — including on a retry after `gh pr create` failed (Step 1 may re-push).

1. Enumerate what is about to be pushed:
   ```bash
   git diff --name-only "origin/<BaseBranch>...<BranchName>"
   ```
2. **Grep** those files for confidential-data patterns:
   - Private/secret key material: `-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----`
   - Cloud provider credentials: AWS access keys (`AKIA[0-9A-Z]{16}`), Google API keys (`AIza[0-9A-Za-z_-]{35}`), generic long bearer/service tokens (`gh[pousr]_[A-Za-z0-9]{36,}`, `sk-[A-Za-z0-9]{20,}`, `xox[baprs]-[A-Za-z0-9-]{10,}`)
   - Generic secret-shaped assignments: `(password|passwd|secret|api[_-]?key|access[_-]?token|client[_-]?secret)\s*[:=]\s*['"][^'"]{8,}['"]`
   - Sensitive file types being added/modified: `.env`, `.env.*` (not `.env.example`/`.env.sample`), `*.pem`, `*.key`, `*.pfx`, `*credentials*.json`, `*serviceaccount*.json`
   - A file that's tracked/staged despite matching a `.gitignore` pattern (check with `git check-ignore`) — a common way a secret ends up committed by accident
3. This is a **heuristic** scan, not a guarantee — say so plainly when reporting; it will miss some real secrets and can flag some false positives (e.g. a placeholder, a test fixture, a `.env.example`).
4. **No match found** → report "No confidential-data patterns found in the files being pushed." and proceed straight to Step 1 — this clean-scan case does not require a human gate.
5. **Any match found** → **STOP. This is a designed human gate, not an incidental failure** — do not push, do not silently redact, do not decide on the user's behalf. Show the user, per match: file path, line number, and which rule matched (redact the actual matched secret value itself from the display — no reason to echo a live credential back into the transcript). Then ask explicitly:
   ```
   ⚠️ Possible confidential data found before push to <remote>/<BranchName>

     [file:line] — <pattern class, e.g. "AWS access key pattern">
     [file:line] — <pattern class>

   This may be a false positive, or it may be a real secret about to be pushed to GitHub —
   once pushed, treat it as compromised even if later removed (history, forks, and caches
   can retain it).

   push anyway   → I'm confident this is safe (false positive / intentionally public), push as-is
   fix it first  → stop here; I'll remove/rotate/redact it myself before you push again
   ```
   - `push anyway` → proceed to Step 1, and note in the Output that the user explicitly overrode a confidential-data finding (so it's visible later, e.g. in a PR comment or the state file, not silently dropped).
   - Anything else (`fix it first`, a question, silence) → **do not push.** Ask what the user wants done next (e.g. amend a commit, drop a file from tracking, rotate a credential, edit `.gitignore`) rather than guessing at a remediation yourself — this is exactly the kind of hard-to-reverse, externally-visible action (Instructions' "Executing actions with care") that warrants a real conversation, not an autonomous fix.

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
| `ConfidentialDataOverridden` | `true` only if Step 0 found a match and the user explicitly chose `push anyway`; omitted/`false` otherwise. Carried into the state file so an override is visible after the fact, not silently dropped. |

Report `PrUrl` back to the Orchestrator in the conversation so it can surface it to the user.

---

## Error Handling

- If Step 0 finds a possible match → this is **not** an error to route around; it is a designed human gate (see Step 0). Do not proceed to Step 1 until the user has either said `push anyway` or the flagged content is gone from what's about to be pushed.
- If `git push` fails (e.g. no remote configured, auth error) → set `Status: Failed`, report `Error`. Do not attempt `gh pr create`. Notify the Orchestrator.
- If `git push` is rejected because the remote branch has commits not in the local branch (`--force-with-lease` refused) → set `Status: Failed` and report it as a **genuine conflict**: someone else pushed to this task branch. Do not escalate to bare `--force`; surface it to the user.
- If `gh pr create` fails → set `Status: Failed`, report `Error`. The push already succeeded, so on retry **re-run Step 1 as well** — Step 4 may have rebased again in between, which would make the remote branch stale. `--force-with-lease` makes re-pushing safe and idempotent.
- If a PR already exists for the branch, `gh pr create` will error. Report the existing PR URL from the error message instead.

---

## Required Tools

| Tool | Purpose |
|---|---|
| Bash | Run `git diff --name-only`, `git check-ignore`, `git push`, and `gh pr create` |
| Grep | Scan the files about to be pushed for confidential-data patterns (Step 0) |
