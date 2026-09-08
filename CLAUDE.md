# React Dev Orchestrator

Root agent. Coordinates all sub-agents for every React development task — this is the default behavior for any Jira link, Figma link, or plain-text task description pasted into the conversation.

**This project also has a separate entry point for sprint planning.** If the user runs `/sprint-plan <sprint-id>`, that is handled entirely by `.claude/commands/sprint-plan.md` — a distinct Frontend Senior Lead role that runs once per sprint, before individual tickets are picked up. It fetches every story in the sprint, flags readiness issues, detects cross-story dependencies and shared-file conflicts, sequences work into parallel slots per developer, and publishes a Development Plan + Estimation Document to Confluence. It does not write code and is not part of the Task Workflow below — do not conflate the two. See `.claude/context/project-config.md` for its Jira/Confluence/team configuration.

## Commands

All slash commands are thin wrappers around logic that lives in this file or in a skill — none of them duplicate or reimplement it. See `.claude/commands/*.md` for each.

| Command | Purpose |
|---|---|
| *(none — paste a link)* | Default: paste a Jira link, Figma link, or plain-text task description → runs the Task Workflow below, starting at Step 0 |
| `/dev <TICKET_ID> [base-branch]` | Explicit entry point, identical to pasting a link — optionally pre-answers Step 0's base-branch question |
| `/task-resume <TICKET_ID>` | Resume an interrupted task by ID, without re-pasting the original link — shows a status summary, then follows the same Resume Check as Step 0 |
| `/sprint-plan <sprint-id>` | Once per sprint, before individual tickets are picked up (see above) |
| `/mcp-check` | Standalone Atlassian/Figma/GitHub CLI connectivity check, outside of any task |
| `/startup` | Re-run the Startup Sequence (Tech Stack + Connectivity + Sprint Planning Config checks) on demand |
| `/cost-status [TICKET_ID]` | Print a task's `Depth`/`CostTier`/model assignment from its state file (or list all in-progress tasks if no ID given) — v1 has no spend data to show |

```
Once per sprint:   /sprint-plan <sprint-id>            → produces the dev allocation plan
Per ticket:        paste a link, or /dev <TICKET_ID>    → runs the Task Workflow below
Resuming:          /task-resume <TICKET_ID>             → same Resume Check, entered by ID
Utility, anytime:  /mcp-check · /startup · /cost-status
```

---

## Sub-Agents

| Agent | File | Role |
|---|---|---|
| Knowledge Agent | `.claude/agents/knowledge-agent.md` | Gather requirements and codebase context before planning — skipped in Bypass Workflow |
| Planning Agent | `.claude/agents/planning-agent.md` | Produce an approved LLD before any coding begins, using Knowledge Agent's findings as ground truth (no re-exploration), scaled to the Step 2 Depth assignment, run on the Step 2 CostTier's assigned model — skipped in Bypass Workflow |
| Coding Agent | `.claude/agents/coding-agent.md` | Implement the approved plan (or the Bypass task) following React conventions, run on the Step 2 CostTier's assigned model |
| Code Review Agent | `.claude/agents/code-review-agent.md` | Review quality, accessibility, security, and plan compliance at the Step 2 Depth assignment, run on the Step 2 CostTier's assigned model — runs concurrently with the `tsc --noEmit` Impact Check; skipped in Bypass Workflow |
| Unit Test Agent | `.claude/agents/unittest-agent.md` | Write and verify tests with Vitest + React Testing Library, scoped to changed files — always runs, Full or Bypass; runs concurrently with Performance Review Agent |
| Performance Review Agent | `.claude/agents/performance-review-agent.md` | Check for bundle bloat, re-render, and leak patterns — gated by Depth; skipped in Bypass Workflow |
| Cost Governor Skill | `.claude/skills/cost-governor/SKILL.md` | Assign a per-agent model from the task's `CostTier` at Step 2; measured spend is then recorded per Rule 22 — model assignment + spend measurement, still no budget enforcement (v2) |
| Notify Skill | `.claude/skills/notify/SKILL.md` | Send a Windows toast notification at the **start and end** of every step, and on every gate |
| MCP Health Check Skill | `.claude/skills/mcp-health-check/SKILL.md` | Probe Atlassian/Figma/GitHub CLI connectivity in one block at startup, before any real work begins |
| Git Branch Skill | `.claude/skills/git-branch/SKILL.md` | Create or check out the task branch off `ParentBranch`, using conventional naming, before coding begins |
| Jira Status Skill | `.claude/skills/jira-status/SKILL.md` | Transition the Jira ticket status (In Progress → Done) at defined workflow gates |
| Jira Comment Skill | `.claude/skills/jira-comment/SKILL.md` | Add a comment to the Jira ticket (LLD link) after tests pass |
| GitHub PR Skill | `.claude/skills/github-pr/SKILL.md` | Push the branch and open a pull request on GitHub after tests pass |

Two steps are orchestrator-run directly (no dedicated agent file), documented inline below: **Resume Check** (part of Step 0) and **Rebase Health** (Step 4, before the PR).

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | React 18.x+ — functional components and hooks only |
| Language | TypeScript strict mode (no `any` types) |
| State | Zustand (global) · TanStack Query (server) · React Hook Form (forms) |
| Styling | Tailwind CSS |
| Routing | React Router v6+ |
| Validation | Zod |
| HTTP | Axios via shared API client |
| Testing | Vitest + React Testing Library |

---

## Startup Sequence

Run in order before accepting any task.

### 1. Verify Tech Stack & Structure

Read `package.json` and confirm all Tech Stack packages are present. Warn on missing optional (`zustand`, `@tanstack/react-query`, `axios`); block on critical (`react`, `typescript`, `vite`/`react-scripts`, `vitest`, `@testing-library/react`, `react-router-dom`, `react-hook-form`, `zod`). Confirm `"strict": true` in `tsconfig.json`.

Verify the expected layout exists:

| Path | Purpose |
|---|---|
| `src/app/` | App-level setup and routing |
| `src/features/` | Feature modules |
| `src/shared/` | Shared utilities and components |

If non-standard, ask the user to confirm the layout before proceeding.

### 2. Connectivity Check

Invoke the **MCP Health Check Skill** (`.claude/skills/mcp-health-check/SKILL.md`) before any real work begins. It probes Atlassian (hard block if unavailable — all tasks originate from Jira), Figma (only if the task references one, degrades gracefully otherwise), and the GitHub CLI (degrades gracefully until the PR step actually needs it). See that skill for the exact severity-per-dependency table.

### 3. Sprint Planning Config (only relevant if `/sprint-plan` is used)

`.claude/context/project-config.md` must be filled in before `/sprint-plan` is run for the first time — specifically the **required** Project Identity fields (Jira ticket prefix, **Jira base URL**, Confluence space key), the Sprint Team roster/capacity, and the Shared file patterns. The Jira base URL is easy to miss and gets interpolated into published Confluence links, so a leftover placeholder ships into the plan. Not required for the per-ticket Task Workflow below — only for sprint planning.

---

## Task Workflow

```
Jira Ticket
     │
     ▼
Step 0 — Resume Check, then Parent Branch Selection
  State file exists for this ticket? ──YES──► resume from last completed step
     │ NO
     ▼   Ask user for ParentBranch → git fetch/checkout/pull it → create state file
     │
     ▼
Step 1 — Fetch Jira ticket (issueType, storyPoints), then Classify
  Bypass signals? ──YES──► BYPASS WORKFLOW (see below)
     │ NO
     ▼
[Notify: Started] Agent: Knowledge Agent [Notify: Completed]
                   ↓
Step 2 — Assess Task Signals (Depth + CostTier)
                   ↓
[Notify: Started] Agent: Planning Agent (depth-scaled LLD, CostTier model)
                   → returns LLD, terminates → Orchestrator presents it, collects
                     Approved/feedback → re-invoke as a fresh call per revision
                     round [Notify: Completed]
                   ↓          (persists plan + planApproved to state file)
[Notify: Started] Agent: Coding Agent (Gate 3: Git Branch Skill — branches off
                   ParentBranch; Diverged? → reports + terminates, Orchestrator
                   resolves with user, re-invokes; owns [Jira Status: In Progress];
                   commits incrementally as work progresses) [Notify: Completed]
                   ↓
     ┌────────────────────────────────────────────────┐
     │ Step 3a — PARALLEL BLOCK A (one message)        │
     │ [Notify: Started] Bash: npx tsc --noEmit        │
     │ Agent: Code Review Agent (depth-scaled)         │
     └─────────────────────┬────────────────────────────┘
                            ↓ Orchestrator merges: any tsc error → Critical
                              [Notify: Completed/Blocked]
            ↓ (No-Go: re-run only the failing half,     ↓ (Go)
               max 2 cycles → escalate)                  │
        Coding Agent                                     │
                                                          ▼
     ┌────────────────────────────────────────────────┐
     │ Step 3b — PARALLEL BLOCK B (one message)        │
     │ [Notify: Started]                               │
     │ Agent: Unit Test Agent (scoped run, commits,    │
     │         writes testPlan/prSummary to state)     │
     │ Agent: Performance Review Agent (depth-gated)   │
     └─────────────────────┬────────────────────────────┘
                            ↓ [Notify: Completed/Blocked]
                   Step 4 — Rebase Health
                   [Notify: Started] sync with ParentBranch,
                   auto-resolve safe conflicts,
                   human gate only on logic conflicts [Notify: Completed/Blocked]
                              ↓
                   [Jira Status: Done]
                              ↓
                   [Jira Comment: LLD link]
                              ↓
                       GitHub PR Skill (BaseBranch = ParentBranch)
                              ↓
                            Done
```

---

## Step 0 — Resume Check, then Parent Branch Selection

### Resume Check (runs first, before anything else)

Every task is identified by its Jira ticket ID (or, if there's no ticket, a slugified version of the task description). Before asking anything, check whether `.claude/output/dev-pipeline/<TicketIdOrSlug>-state.yml` already exists:

- **Exists** → read it, then:
  1. Restore every field **except** `mcpStatus` and `startedAt` (those belong to the current session — the Startup Sequence's health check overwrites `mcpStatus` on every run, including resumes). Also note (but do not adopt as "this session's identity") the file's `lastWriter` — record it for later comparison. This session generates its own fresh `lastWriter.sessionId` at Resume Check time, exactly as a brand-new task would.
  2. **Recover the git state** — restoring `branchName` as data is not enough; HEAD is wherever the crashed session left it, which may be `ParentBranch` or mid-rebase:
     ```bash
     # if a rebase was left in progress (e.g. a crash at Step 4), clear it first
     [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ] && git rebase --abort
     git fetch origin "<parentBranch>:refs/remotes/origin/<parentBranch>"
     git checkout "<branchName>"          # skip if branchName is empty (crash before Gate 3)
     git status --porcelain               # if non-empty, report it and gate before continuing
     ```
     Skipping the fetch here is what makes the local `ParentBranch` ref go stale on resumed tasks — always re-fetch even though the *re-ask* is skipped.
  3. Tell the user: `"Resuming <TicketId> from {currentStep} ({workflowType})."`
  4. **Skip exactly the steps listed in `completedSteps`** — nothing more. Do not assume any step ran because of where `currentStep` points; a session can die between two steps, so only `completedSteps` is authoritative. In particular, do not skip Task Classification unless `task-classification` is actually listed.
  5. Jump to `currentStep`. If it names an agent, treat it as an interrupted step per the mid-step resume rule below — re-invoke it with `changedFiles` / `completedScopeItems` as already-done, rather than from scratch.
  6. **Full Workflow, resuming at or after `coding-agent`:** the plan is no longer in conversation context. Re-hydrate it from `planPath` (or `planConfluenceUrl` if the local file is gone) before invoking any agent that consumes it. `planApproved: true` in the state file satisfies Coding Agent Gate 1 across a resume — the user does not re-approve.
- **Missing** → this is a new task. Continue to Parent Branch Selection below and create the state file there with `currentStep: task-classification`, `completedSteps: [parent-branch-selection]`, and `workflowType: null` (unknowable until Step 1b).

This is what makes an interrupted session (closed terminal, network drop, crashed session) resumable — just paste the same ticket again.

### Parent Branch Selection (new tasks only)

Runs once per task, **before Knowledge Agent starts exploring the codebase**, so every downstream agent sees the actual target codebase state rather than a stale local checkout.

1. Ask the user:
   > "Which branch should this work be based on? (e.g. `main`, `develop`, `release/1.2`). Reply with a branch name, or `main` to use the default."

   Wait for an explicit reply — never assume `main` silently.
2. Run, in order:
   ```bash
   git fetch origin <ParentBranch>
   git checkout <ParentBranch>
   git pull origin <ParentBranch>
   ```
3. If any command fails (branch doesn't exist remotely, fetch/pull error) — stop, show the raw git error, and ask the user to confirm the correct branch name. Do not proceed to Task Classification until this resolves.
4. Store `ParentBranch` as pipeline context for the rest of the task. It is passed to:
   - **Coding Agent Gate 3** → the Git Branch Skill (branches the task branch off `ParentBranch`)
   - **Unit Test Agent** → the `--changed` ref for scoping `test_command`/`coverage_command`
   - **Code Review + Performance Review Agents** → the `git diff` base for enumerating changed files
   - **Rebase Health (Step 4)** → the rebase target, and the Orchestrator's GitHub PR Skill invocation → `BaseBranch`
5. Create the state file (see Resumable Pipeline State below) with `currentStep: task-classification`, `completedSteps: [parent-branch-selection]`, `workflowType: null`. Note it is `task-classification`, not `knowledge-agent` — Step 1 runs next, and recording it as already-done would let a resume skip classification entirely.

`ParentBranch` is resolved exactly once per task and never re-derived or re-asked mid-pipeline.

### Resumable Pipeline State

Written to `.claude/output/dev-pipeline/<TicketIdOrSlug>-state.yml`, updated after **every** step and gate — this is the durable record that makes resume possible:

```yaml
ticketId: "US-123"                    # or a slug if no ticket
workflowType: "full"                  # full | bypass — set at Step 1b
currentStep: "coding-agent"
completedSteps:                       # use only the canonical slugs listed below
  - parent-branch-selection
  - task-classification
  - knowledge-agent
  - task-signals
parentBranch: "main"
branchName: "feature/US-123-add-user-profile-page"   # written the moment Gate 3 clears
diverged: false                       # from Git Branch Skill — re-checked at Step 4

# From Step 1a (Jira fetch) — nothing downstream re-fetches the ticket
issueType: "Story"                    # null if no ticket
storyPoints: 5                        # null if unset on the ticket

# From Step 2
depth: "Medium"                       # Low | Medium | High — null in bypass
costTier: "standard"                  # trivial | standard | critical — always "trivial" in bypass
modelAssignment:                      # from Cost Governor Skill — injected into every agent call
  knowledge: haiku
  planning: sonnet
  coding: sonnet
  code_review: sonnet
  unittest: haiku
  performance_review: haiku

# Measured spend — every role runs as a genuine Agent-tool subagent (Rule 23), so
# every role's usage is measurable, Coding Agent included. Populated after each
# sub-agent call returns (Rule 22). null means "hasn't run yet or usage wasn't
# reported" — never silently treated as zero. A role invoked more than once in a
# task (Planning revisions, a Coding Agent re-invocation after a Diverged gate or
# a Code-Review No-Go) holds the SUM of every one of its invocations, not just
# the latest.
spend:
  knowledge:           { tokens: null, usd: null }
  planning:            { tokens: null, usd: null }
  coding:              { tokens: null, usd: null }
  code_review:         { tokens: null, usd: null }
  unittest:            { tokens: null, usd: null }
  performance_review:  { tokens: null, usd: null }
  totalTokens: 0                      # sum of every non-null spend.<role>.tokens
  totalUsd: 0.00                      # sum of every non-null spend.<role>.usd

# From Planning Agent (Full Workflow only — all null in bypass)
planApproved: true                    # the user typed "Approved"; satisfies Gate 1 across a resume
planPath: ".claude/output/dev-pipeline/US-123-plan.md"
planTitle: "Add user profile page"
planChecksum: { create: 5, modify: 2, delete: 1 }
planConfluenceUrl: ""
planConfluenceTitle: ""

# From the Coding Agent, appended after each incremental commit
changedFiles: []
completedScopeItems: []

# From Parallel Block B — needed by the PR skill after a Step 4 abort/resume
testPlan: ""
prSummary: ""
prUrl: ""                             # set once the PR is actually open

mcpStatus:                            # always overwritten by the current session's probe, never restored
  atlassian: "connected"
  figma: "skipped"
  github: "connected"
startedAt: "2026-01-01T00:00:00Z"
lastWriter:                           # replaces bare lastUpdatedAt — see Rule 24
  client: "cli"                       # "vscode-extension" | "cli" | "unknown" — best-effort,
                                       # never omitted; "unknown" if undetectable
  sessionId: "a1b2c3"                 # short opaque id for *this* running session, stable
                                       # for its lifetime, no PII
  at: "2026-01-01T00:05:00Z"          # updated on every write, same semantics lastUpdatedAt had
```

### Canonical step slugs (the only valid `currentStep` / `completedSteps` values)

`parent-branch-selection` → `task-classification` → `knowledge-agent` → `task-signals` → `planning-agent` → `plan-approval` → `coding-agent` → `block-a` → `block-b` → `rebase-health` → `jira-done` → `jira-comment` → `pr-opened`

Bypass Workflow skips `knowledge-agent`, `task-signals`, `planning-agent`, `plan-approval`, and `block-a`. The Notify Skill's canonical step names map onto these one-to-one.

### Retention, mid-step resume, and concurrent sessions

- **Never delete the state file — not even after `pr-opened` is in `completedSteps`.** It is the only durable record of the ticket's measured spend (`spend.*`, Rule 22), plan history, and file/commit state. A ticket routinely needs more work after the PR opens and before it merges — review feedback, a design-alignment fix like the one that follows a "the design is incorrect" report, another rebase — and that follow-up work must accumulate into the *same* `spend.<role>` sums rather than being invisible to `/cost-status` or starting from an untracked zero.
- If the PR skill fails, or Jira Status/Comment fail, this was already "keep the file" territory — the point above just extends the same treatment to the success path too, so there is no longer a divergent "delete on success, keep on failure" branch to maintain.
- Once `pr-opened` is recorded, the file simply stops advancing through the canonical step slugs — it stays parked at `pr-opened` as a live record, not a stale one. Any further sub-agent invocation for this ticket (a post-PR Coding Agent rework, a re-review) reads this same file, adds its `changedFiles`/`completedScopeItems`, and **adds** its measured spend into the existing `spend.<role>` figures (Rule 22's "add, not set" already covers this — it is not special-cased to before-PR invocations).
- The handoff sub-steps each write state (`jira-done`, `jira-comment`, `pr-opened`) as they complete. Without this, a crash between Jira-Done and PR-open re-posts the Jira comment on resume — that skill is **not** idempotent, unlike Jira Status which returns `AlreadyInStatus`.
- **Mid-step resume:** state advances only *after* a step completes, so on resume `currentStep` names the step that was interrupted. Re-invoke that step's agent, passing `changedFiles` and `completedScopeItems` as "already done — do not redo", and reconcile against reality with `git log origin/<parentBranch>..<branchName>`. Without this the Coding Agent re-implements files it already committed.
- On any `abort`/`STOP` at a human gate, leave the file in place — that is the point.
- The file is only ever removed by a human, deliberately, once the ticket is fully closed out (e.g. merged and no further spend to track) — no pipeline step deletes it automatically.
- **Same-user, multiple clients.** The same person may run this pipeline against the same ticket from more than one Claude Code surface at once (e.g. the VS Code extension and the CLI). This is a supported workflow, not an error condition — never lock the state file or refuse to proceed because another session touched it. If the harness reports that this file changed on disk since this session last read it, treat that as a signal from a legitimate concurrent writer, not corruption: re-read the file fresh, reconcile per Rule 24, and tell the user in one line what changed and when (e.g. `"Note: <ticket> state was also updated by another session (<client>) at <time> — merged."`). Never overwrite or revert the other session's edit.

---

## Step 1 — Fetch the Ticket, then Classify

Runs once per task, immediately after Step 0 and before Knowledge Agent.

### 1a — Fetch the Jira ticket (required before classifying)

Call `mcp__claude_ai_Atlassian__getJiraIssue` with the ticket key and record these into the state file:

| Field | Used by |
|---|---|
| `issueType` | Step 1b bypass signals · Coding Agent Gate 3 (branch prefix) · Commit Standards (`feat`/`fix`/`chore`) |
| `storyPoints` | Step 2 signal 1 (Depth + CostTier). May be absent — Step 2 falls through to `TouchedFileCount`. |
| `summary`, `description`, `labels` | Step 1b classification, and passed to Knowledge Agent as the task description |

If there is no Jira ticket (plain-text task), set `issueType: null` and `storyPoints: null` and classify from the description text alone. If the fetch itself fails, that is Atlassian's hard block per the MCP Health Check Skill — stop; do not proceed with guessed values.

**Nothing downstream re-fetches the ticket.** `issueType` and `storyPoints` live in the state file from here on, which is also what makes them available after a resume.

### 1b — Classify the task

Determines whether the full pipeline runs or the lighter Bypass Workflow applies.

```
Is the task implementing NEW functionality, a NEW component,
a NEW hook, or a NEW screen/feature described in Figma or Jira?
       │
       ├── YES ──► FULL WORKFLOW (Knowledge → Planning → ... as above)
       │
       └── NO — does it match any bypass signal below?
                   │
                   ├── Keywords: "rename", "tweak", "typo", "copy change",
                   │            "small fix", "update text", "update copy"
                   │
                   ├── Jira issue type: Refinement, Tech Debt, Spike
                   │   (unless it explicitly adds new logic)
                   │
                   └── YES to any bypass signal ──► BYPASS WORKFLOW
```

If ambiguous, ask one clarifying question before proceeding:

> "Is this adding new functionality or modifying existing behaviour? If new, I'll run the full workflow. If it's a small refinement, I'll handle it directly."

### Bypass Workflow

For genuinely small changes. Skips Knowledge Agent, Planning Agent, and Code Review Agent entirely — **never skips testing or the PR**:

```
Task classified as Bypass
     │
     ▼
Coding Agent (Gate 1 satisfied by `workflowType: bypass` instead of an approved LLD;
              Gate 3 still applies — branches off ParentBranch, commits incrementally;
              CostTier is always trivial in Bypass — cheapest available model)
     │
     ▼
Unit Test Agent (scoped test run, safety net — still required, never skipped)
     │
     ▼
Step 4 — Rebase Health (still runs — never skipped, even in Bypass)
     │
     ▼
[Jira Status: Done] → [Jira Comment] → GitHub PR Skill (BaseBranch = ParentBranch) → Done
```

The reasoning overhead (Knowledge/Planning/Review) is what's skipped, not verification — tests, Rebase Health, and the PR step always still run before any PR opens, in both workflows.

---

## Step 2 — Assess Task Signals (Depth + Cost Tier)

Runs once per task, **only for Full Workflow tasks**, immediately after Knowledge Agent completes and before Planning Agent starts. Bypass Workflow tasks never reach this step — `Depth` stays unset and `CostTier` is always `trivial`. This is a separate axis from Step 1's classification — Step 1 decides *whether* the full pipeline runs at all; Step 2 decides *how much* plan/review detail a Full Workflow task needs (`Depth`) and *which model* each agent runs on (`CostTier`) — computed together from one shared signal pass, not two separate classification steps.

### Signal priority (first available wins; later signals may only escalate, never downgrade, an earlier one)

1. **Jira story points**, if present on the ticket (`storyPoints` in the state file, captured at Step 1): `≤ 2` → Low · `3–7` → Medium · `≥ 8` → High. These three ranges are exhaustive — every integer maps to exactly one level, with no gap.
2. **If no story points:** `TouchedFileCount` from the Knowledge Agent's output: `1–2` → Low · `3–6` → Medium · `7+` → High
3. **Escalation override (always checked, regardless of 1–2):** if the Knowledge Agent set `EscalationFlag: true`, force **High** — this cannot be downgraded by a low story-point estimate or a small file count. A 1-point ticket that modifies shared code is not a small ticket for review purposes.

   The flag fires only when the task **modifies** one of these — not when it merely imports from or registers into them:
   - a file under `src/shared/**`
   - authentication / authorization code
   - a published `index.ts` public API that other features consume

   Explicitly **not** escalation triggers: registering a route in `src/app/Router.tsx`, importing from another feature through its `index.ts` (Rule 4 already mandates this as the *safe* path), or adding a new file inside a single feature folder. Without this exclusion nearly every Full Workflow task would escalate — collapsing the tiering to "always High/critical" and defeating its purpose.

If genuinely no signal is available (no story points and no `TouchedFileCount`), default to **Medium** — never assume Low.

### What Depth changes

| Depth | Planning Agent | Code Review Agent |
|---|---|---|
| **Low** | Sections 3, 5–8 included only where directly applicable to the change (omit, don't pad with "N/A"); Sections 9–11 (Accessibility/Error Handling/Performance) condensed to one short paragraph each instead of full tables — but any Critical-severity concern (missing ARIA, unhandled error path) must still be called out explicitly, never silently dropped | Report Critical + Major findings only; skip Minor/Suggestion sections in the output |
| **Medium** (default) | Full template as it exists today — all sections used at full detail where applicable | Critical + Major + Minor; Suggestions optional (current default behavior) |
| **High** | Full template, and Sections 9 (Accessibility) and 11 (Performance) are mandatory even if seemingly not applicable — write "confirmed not applicable, because \<reason\>" rather than omitting; Open Questions (13) must be exhaustively considered, not left blank by default | Critical + Major + Minor + Suggestions; use WebSearch to verify security concerns/known CVEs for any Critical or Major finding |

Depth is written to the state file's `depth` field, which is the **single authoritative source** for every consumer (Planning Agent, Code Review Agent, Performance Review Agent's Complexity Gate). The plan header also records it, but for human readability only — if Rule 14's mid-pipeline escalation fires, the state file is updated and the plan header may be stale. No agent re-derives Depth.

### CostTier and per-agent model assignment

Invoke the **Cost Governor Skill** (`.claude/skills/cost-governor/SKILL.md`) — it reads the **same size signal and escalation flag computed above**, not a second copy of them:

- Escalation flag set → `CostTier: critical` (same trigger as Depth's forced-`High`)
- No escalation → reuse the *same* size signal derived above: `Low` → `trivial` · `Medium` → `standard` · `High` → `critical`. Do not restate the story-point thresholds here — they are defined once, in signal 1 above, precisely so the two cannot drift apart.
- No signal at all → `standard` (never assume `trivial`)

The Skill returns the resolved per-agent model map for this `CostTier` (from `.claude/context/cost-policy.yaml`). Inject it into every subsequent agent call for this task, the same way Tech Stack is already injected (Orchestrator Rule 3).

`Depth` and `CostTier` are **not the same value** — a big-but-safe UI change can be `Depth: High` + `CostTier: standard`; a tiny-but-risky auth tweak can be `Depth: Low` + `CostTier: critical`. Both are correct, not a contradiction. **v1 scope note:** this is model assignment only — no budget tracking, no spend ledger, no circuit breaker. Those are deferred until this pipeline has run against real tickets.

---

## Step 3a — Parallel Block A: Impact Check + Code Review

Runs once the Coding Agent reports complete. The Orchestrator issues both in the **same message** so they run concurrently:

- **Bash:** `npx tsc --noEmit` (the "Impact Check" — mechanical, no LLM reasoning)
- **Agent:** Code Review Agent, at the assigned Depth and model

The Impact Check is deliberately the **full, non-incremental** project check, including test files. The Coding Agent's per-step checks use `--incremental` for speed and may not cover everything; this is the authoritative one, and it's free wall-clock because it runs concurrently with the Code Review Agent rather than before it.

Wait for both, then **the Orchestrator merges them** — the Code Review Agent cannot do this itself, because the two ran concurrently and it never saw the `tsc` result:

- Any `tsc` error → record as Critical (`[Impact Check] <file>:<line> — <error>`) and force **No-Go**, regardless of the Code Review Agent's own verdict.
- Otherwise the Code Review Agent's Go/No-Go stands.

**On No-Go:** the Coding Agent fixes the listed findings, then re-run **only the half that was actually failing** — `tsc` errors alone → re-run the Impact Check only; review findings alone → re-run the Code Review Agent only (scoped to the changed files); both → re-issue the full block. After **2 unsuccessful cycles**, stop and escalate to the user rather than looping further.

`completedSteps` gains `block-a` once the merged verdict is Go.

**Skipped entirely in Bypass Workflow.**

---

## Step 3b — Parallel Block B: Unit Test + Performance Review

Runs once Step 3a has gone **Go**. The Orchestrator issues both in the same message so they run concurrently — neither depends on the other's output:

- **Unit Test Agent** (`.claude/agents/unittest-agent.md`) — scoped test run, commits test files
- **Performance Review Agent** (`.claude/agents/performance-review-agent.md`) — depth-gated mechanical check; may report "skipped" per its own Complexity Gate

Wait for both before proceeding. If Performance Review reports a Blocking finding, send it back to the Coding Agent and re-run this block once fixed — Unit Test Agent's result from the first pass still stands unless the fix touched files it already tested (re-run Unit Test Agent too in that case). If Unit Test Agent fails, fix and re-run Unit Test Agent alone; Performance Review's clean result still stands unless the fix changes performance-relevant code.

On completion, write `testPlan` and `prSummary` into the state file — the GitHub PR Skill requires both, and a Step 4 `stop`/resume would otherwise lose them (they live only in conversation context until persisted). `completedSteps` gains `block-b`.

**In Bypass Workflow** only the Unit Test Agent runs (Performance Review is skipped), but it still writes `testPlan`/`prSummary` and still gains `block-b`.

---

## Step 4 — Rebase Health

Runs immediately before the PR is opened, in **both** Full and Bypass Workflow — this is a safety net, never skipped. The branch was created from `ParentBranch` back at Step 0, but implementation may have taken a while; this catches anything that merged into `ParentBranch` in the meantime.

**4.1 — Preconditions (both required, neither optional).** `git rebase` refuses to start with a dirty tree, and Block B's `coverage_command` routinely leaves artifacts (`coverage/`, `*.tsbuildinfo`):
```bash
git rev-parse --abbrev-ref HEAD          # must equal <branchName>; if not, git checkout <branchName>
git status --porcelain                   # must be empty
```
If the tree is dirty: `git stash push -u -m "pre-rebase <ticketId>"`, rebase, then `git stash pop`. A rebase that fails to *start* is **not** a conflict and **not** a gracefully-degrading failure — do not fall through to the PR step (that is precisely the stale PR Rule 17 exists to prevent). Treat it as a hard stop.

**4.2 — Fetch and rebase:**
```bash
git fetch origin "<ParentBranch>:refs/remotes/origin/<ParentBranch>"
git rebase "origin/<ParentBranch>"
```
The explicit refspec matters: a bare `git fetch origin <branch>` updates the remote-tracking ref only opportunistically, and under a non-default `remote.origin.fetch` it updates `FETCH_HEAD` only — rebasing onto a stale `origin/<ParentBranch>` would silently produce exactly the stale branch this step exists to prevent.

**4.3 — Resolve, in a loop.** A rebase replays *every* incremental commit (Rule 9 mandates many), so it can stop repeatedly. This is a loop, not a single pass — continue until `git rebase` reports the rebase is complete:

```
while a rebase is in progress:
    classify the conflicting hunks
    → additive-only:  resolve, git add <each resolved file>, git rebase --continue
    → anything else:  human gate (below)
```

- **Additive-only conflicts** — both sides only *added* lines to the same list (two entries in an `index.ts` export list, two routes in the same router array, two keys in the same config object) and neither modified or deleted the other's line: keep both additions, `git add` each resolved file, then `git rebase --continue`.
- **Any other conflict** (either side modified or deleted a line the other touched, or the conflict is inside component/hook/service logic) → **human gate**:
  ```
  ✋ Rebase conflict — manual resolution needed

  Conflicting files:
    [list each]

  Resolve in your editor, then:  git add <each file>  &&  git rebase --continue

  Reply with:
    resolved   → re-verify and continue
    stop       → abort the rebase, preserve the branch and state file for later resume
  ```
  - `resolved` → verify no rebase is still in progress, then run the re-verification below.
  - `stop` → run **`git rebase --abort`** first, confirm `git status` is clean and HEAD is back on `<branchName>`, leave `rebase-health` **out** of `completedSteps`, then end the session. Without the explicit `--abort` the repo is left mid-rebase with a conflicted index and detached HEAD — the next resume then cannot even check out its own branch (`error: you need to resolve your current index first`) and re-running the rebase fails with `already a rebase-merge directory`. The option is named `stop`, not `abort`, precisely so it isn't confused with `git rebase --abort`.

**4.4 — Re-verify after *any* resolution, automatic or human.** "Keeping both additions" is not automatically build-safe: two sides adding the same export name to an `index.ts`, or the same path to a router array, yields a duplicate-identifier `tsc` error or a silently shadowed route. Run both:
```bash
npx tsc --noEmit
```
plus the scoped test command from `unittest-agent.md` — scoped to **`origin/<ParentBranch>`**, not the local ref, which is now behind the rebase target. If either fails, this is a regression introduced by the rebase: gate to the user rather than opening a PR.

**4.5 — Record it:** `completedSteps` gains `rebase-health`; `currentStep` advances to `jira-done`.

### After Rebase Health clears — the Orchestrator (not Unit Test Agent) hands off to Jira and GitHub

This ownership moved from Unit Test Agent to the Orchestrator specifically because a rebase can happen *after* Unit Test Agent finishes — opening the PR before that rebase would risk a stale PR.

Every sub-step writes to the state file as it completes — the Jira Comment Skill is **not** idempotent, so without this a crash mid-handoff re-posts the comment on resume.

1. **Invoke the Jira Status Skill** with `TicketId` and `TargetStatus: Done`. A `Failed` result is logged but does not block the next step. On success → `completedSteps` gains `jira-done`.
2. **Invoke the Jira Comment Skill** with `TicketId`, and `ConfluenceUrl`/`ConfluenceTitle` read from the state file's `planConfluenceUrl`/`planConfluenceTitle` (Full Workflow) — omit both in Bypass Workflow, which produces no plan page. Skip this sub-step entirely if `jira-comment` is already in `completedSteps`. On success → `completedSteps` gains `jira-comment`.
3. **Invoke the GitHub PR Skill** with every value read from the **state file**, not from conversation context — a resumed session has no conversation:

   | Parameter | Source (state file field) |
   |---|---|
   | `BranchName` | `branchName` (written when Gate 3 cleared) |
   | `BaseBranch` | `parentBranch` — the value resolved at Step 0 |
   | `TicketId` | `ticketId` |
   | `Title` | `<ticketId> <planTitle>` (Full) or `<ticketId> <task description>` (Bypass) — **truncate to 70 characters** per the skill's limit |
   | `Summary` | `prSummary` |
   | `TestPlan` | `testPlan` (written by Block B) |
   | `ConfluenceUrl` | `planConfluenceUrl`, if set (Full Workflow only) |

4. **On `Status: Created`** → record `prUrl`, add `pr-opened` to `completedSteps`, and report the URL in the conversation. **Keep the state file** — per Step 0's Retention rule, it is never deleted automatically, success or failure alike, since the ticket can still need further work (review feedback, a design-alignment fix) before it merges, and that work must keep accumulating into this same file's `spend.*`.

   **On `Status: Failed`** → **keep the state file** (same treatment as success, just without `pr-opened` recorded yet), set `currentStep: rebase-health`, and report the failure plus the manual fallback command (`gh pr create --base <parentBranch> --head <branchName> ...`). `gh` auth failure is a documented degradation path (the MCP Health Check lets the GitHub CLI degrade gracefully "until the PR step actually needs it"), so this is a realistic outcome, not a corner case.

---

## Fallback Transparency Rule

**Applies to every step and every agent in this pipeline, no exceptions.**

Whenever an automatic action cannot complete — a tool call fails, a CLI command returns an error, an MCP server is unreachable, authentication is required, a permission is denied — the agent or Orchestrator **MUST**:

1. Display the failure reason clearly.
2. Show the manual step the user needs to take (if any).
3. **Proceed immediately** for anything that degrades gracefully (see the MCP Health Check Skill's per-dependency severity table) — do NOT stop and wait for a reply that wasn't asked for.

Format:
```
⚠️ [Action] could not complete automatically
Reason: [exact error]
Action needed: [what the user must do, or "none — continuing with reduced functionality"]
Continuing...
```

**Exception — the pipeline's designed hard stops.** These are not "tool failures" with a fallback; they are deliberate stopping points, and this rule does **not** authorize proceeding past any of them:

- Plan approval (the user must type `Approved`)
- Rebase Health's logic-conflict gate, and any rebase that fails to *start* (dirty tree, wrong HEAD)
- Post-rebase re-verification failure (`tsc` or tests broken by the rebase)
- MCP Health Check's Atlassian hard block
- Step 0's parent-branch resolution failure (branch doesn't exist / fetch or pull error)
- Coding Agent Gate 1 (neither an approved plan nor `workflowType: bypass`), Gate 2, and Gate 3 `Status: Failed`
- Git Branch Skill `Diverged: true` gate
- Missing `test_command` configuration

This rule is about *incidental* tool/service failures that have a reasonable fallback (Figma unreachable, a Notify toast failing, a Jira comment erroring), not the pipeline's designed decision points.

---

## Orchestrator Rules

1. **Never skip Planning in Full Workflow.** No code without an approved LLD, unless the task was explicitly classified as Bypass at Step 1.
2. **Never skip Code Review in Full Workflow.** No tests against unreviewed code, unless the task was explicitly classified as Bypass at Step 1.
3. **Inject Tech Stack and the CostTier's assigned model** into every agent call so agents don't re-detect conventions or guess which model tier they're running on.
4. **Feature isolation.** Cross-feature imports must go through `index.ts` — flag at planning time.
5. **Accessibility blocks.** Missing ARIA, keyboard traps, missing `alt` → Critical.
6. **`any` type = Critical.** Same severity as a security issue.
7. **Notify at the start and end of every step listed in the Notify Skill's Trigger Points table, and at every human gate.** That table is the authoritative list — fast non-blocking steps (Resume Check, Parent Branch Selection, Task Classification, Task Signals) are deliberately excluded as noise. Notify failures must never block the workflow.
8. **Parent branch is resolved once, at Step 0, and never guessed.** Every subsequent git operation (branch creation, PR target) uses that same `ParentBranch` — no agent independently assumes `main`.
9. **Commit incrementally, never in one giant dump.** The Coding Agent and Unit Test Agent commit after each logical step, using conventional commit messages scoped to the ticket. See `.claude/agents/coding-agent.md` Commit Standards.
10. **Task Classification is resolved once, at Step 1, and never skipped.** Every task is either Full Workflow or Bypass Workflow — there is no third, unclassified path.
11. **Bypass never means unverified.** The Bypass Workflow skips Knowledge/Planning/Code Review, but Unit Test Agent and the PR step always still run.
12. **Impact Check and Code Review run concurrently, not sequentially.** Issue the `npx tsc --noEmit` Bash call and the Code Review Agent call in the same message so they execute in parallel; wait for both before deciding Go/No-Go.
13. **Prompt-caching ordering is a maintained convention, not a one-time cleanup.** Every agent file keeps all static standards, checklists, and templates **before** its `Behavior` section, so repeated invocations within a session reuse the cached static prefix instead of reprocessing it. Per-task interpolated values belong only in the four trailing sections — `Behavior`, `Required Tools`, `Input from Orchestrator`, `Output to Orchestrator` — never embedded mid-standards. The largest such block is `planning-agent.md`'s Plan Template (~265 lines), which is deliberately placed above `Behavior` for exactly this reason. Any future edit must preserve this ordering.
14. **Review/Plan Depth is resolved once, at Step 2, and may only be escalated, never downgraded, mid-pipeline.** If Coding Agent or Code Review Agent discovers the task is bigger or riskier than Depth assumed, raise it and re-run the affected step — never silently continue at a lower depth than what the risk warrants.
15. **Depth scaling changes report/plan verbosity, never the Critical-severity bar.** A Low-depth review still blocks on every Critical finding (security, `any` types, missing auth, accessibility Criticals per Rule 5) — Depth only affects how much Minor/Suggestion-level detail is produced, not what counts as blocking.
16. **The state file is written before this pipeline does anything irreversible, and after every step completes.** A crashed session must be resumable from the last completed step, not from scratch — see Resumable Pipeline State under Step 0, and Rule 24 for how concurrent writers are reconciled.
17. **Rebase Health (Step 4) is never skipped, in Full or Bypass Workflow.** A stale PR opened without a final sync is exactly the kind of silent risk this pipeline exists to prevent.
18. **The Fallback Transparency Rule applies everywhere except the pipeline's own designed gates.** An incidental tool/service failure with a reasonable fallback shows the error and continues; a designed human gate (plan approval, Rebase Health's logic-conflict gate, Atlassian unavailability) still stops and waits.
19. **Performance Review's Complexity Gate follows the same escalation-only discipline as Depth.** It may only skip work for genuinely pattern-free Low-depth tasks — it never skips at Medium/High Depth, and a risky pattern found during the grep pass always forces the review to run regardless of Depth. **Performance Review's Blocking set is authoritative for performance patterns** — Code Review does not assign competing severities to the same defects (see the ownership note in its Performance Checklist); a defect cannot be Major in one report and Blocking in the other.
20. **On a block's *initial* invocation, Parallel Block A and Parallel Block B are each issued as a single message with multiple tool calls.** Never invoke the two halves sequentially on the first pass — that defeats the purpose of running them concurrently. On a **rework** pass, re-run only the half the fix actually invalidated (see Step 3a and Step 3b) — re-running a clean half wastes an expensive model call, and at `CostTier: critical` the Code Review half runs on `opus`.
21. **CostTier is resolved once, at Step 2, from the same signal Depth uses, and may only be escalated, never downgraded, mid-pipeline** — identical discipline to Rule 14 for Depth. `CostTier` and `Depth` are independent outputs of one signal pass; they are not required to match, and a mismatch (e.g. `Depth: High` + `CostTier: standard`) is not an inconsistency to correct.
22. **Record measured spend immediately after every sub-agent call, never estimated.** The instant an Agent-tool invocation of **any** of the six roles (Knowledge, Planning, Coding, Code Review, Unit Test, Performance Review) returns, read `subagent_tokens` from that result, convert to USD via the assigned model's `blended_per_million` rate in `cost-policy.yaml`, and **add** it into the state file's `spend.<role>` — then recompute `totalTokens`/`totalUsd`. "Add," not "set": a role invoked more than once in a task (a Planning revision round, a Coding Agent re-invocation after a Diverged gate or a Code-Review No-Go) accumulates the **sum** of every one of its invocations, not just the most recent. For Parallel Blocks A and B, record each half under its own role key even though both were issued in one message; usage is reported per subagent, not per message. Never backfill a missing figure with a guess: a `null` is a data gap to report as such, not a zero. This addition is always performed against a **freshly re-read** on-disk value per Rule 24 — never against an in-context figure that may predate another session's write.
23. **Every sub-agent role runs as a genuine Agent-tool subagent invocation — never inline in the Orchestrator's own thread.** A role that hits a human-decision point mid-task (Planning's approval loop, Coding Agent's Diverged gate) **terminates and reports the blocker** rather than pausing to wait inline — a spawned subagent runs to completion and returns once; it cannot hold a live back-and-forth with the user. The Orchestrator has that exchange, then re-invokes the same role as a **fresh call** to continue. This is what makes Rule 22's spend measurement apply to all six roles uniformly, with no exceptions.
24. **State-file writes are read-fresh-then-merge, never read-once-then-overwrite.** Immediately before writing `.claude/output/dev-pipeline/<ticket>-state.yml` — at every Rule 16 write and especially every Rule 22 spend update — re-read the file from disk first; never compute the new value from an in-context copy that may be stale. Merge using these per-field rules, not a blind overwrite:
    - `completedSteps`, `completedScopeItems`, `changedFiles` → **union** this session's new entries with whatever is already on disk; never replace the list.
    - `spend.<role>.tokens` / `spend.<role>.usd` and the derived totals → treat the on-disk figure as the current base and **add** this call's delta to it (Rule 22's "add, not set" applies against the freshly re-read value, never a value cached earlier in the conversation).
    - Single-owner scalars for the current step (`currentStep`, `branchName`, gate approvals like `planApproved`) → last-write-wins is fine; these only make sense as one session's linear progress at a time.
    - After merging, set `lastWriter: { client, sessionId, at }` to this session's own values — this is what lets the *other* session detect the same condition on its own next write.

    If the freshly-read `lastWriter.sessionId` differs from what this session itself last wrote, surface the one-line notice described in "Retention, mid-step resume, and concurrent sessions" before continuing — never proceed silently.
