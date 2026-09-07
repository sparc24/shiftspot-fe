---
name: notify
description: Send a Windows toast notification at the start and end of every workflow phase, and on every gate
---

# Notify Skill

Sends a Windows toast notification summarising an agent's outcome. Called by the Dev Orchestrator **before** an agent/step begins (`Started`) and **after** it ends (`Completed`/`Blocked`/`Failed`) — not just on completion. This means a long-running step (Planning, Coding, a full test run) shows up immediately rather than only once it finishes, so you know something is actually in progress rather than the pipeline appearing to hang.

---

## Trigger Points

The orchestrator MUST invoke this skill at both the **start** and the **end** of each of the following:

This table is the **closed, authoritative list** — Orchestrator Rule 7 defers to it. Steps not listed here (Resume Check, Parent Branch Selection, Task Classification, Assess Task Signals) are fast and non-blocking, so notifying on them would be noise; they are intentionally excluded rather than accidentally missing.

| Step (canonical name) | Start status | End status |
|---|---|---|
| Knowledge Agent | `Started` | `Completed` or `Blocked` |
| Planning Agent | `Started` | `Completed` (LLD ready for approval) or `Blocked` |
| Plan Approval (human gate) | `Started` (awaiting your `Approved`) | `Completed` or `Blocked` |
| Coding Agent | `Started` | `Completed` or `Blocked` (any of Gates 1–3, or the Diverged gate) |
| Impact Check + Code Review | `Started` | `Completed` or `Blocked` |
| Coding Agent rework (No-Go) | `Started` | `Completed` or `Blocked` |
| Unit Test + Performance Review | `Started` | `Completed` or `Blocked` |
| Rebase Health | `Started` | `Completed` or `Blocked` (conflict gate) |
| Handoff (Jira Done → Comment → PR) | `Started` | `Completed` (with the PR URL) or `Failed` |
| Any step errors out or cannot proceed | — | `Failed` |

Every **human gate** in the pipeline appears above (Plan Approval, the Coding Agent's Diverged gate, Rebase Health's conflict gate) — those are the moments the pipeline is actually waiting on a person, which is the whole reason to send a toast.

For a step made of two concurrent calls (Impact Check + Code Review, or Unit Test + Performance Review), send **one** `Started` notification for the pair when both are issued, and **one** end-status notification once both have returned and been merged — not one per sub-call.

---

## Input

| Parameter | Type | Required | Description |
|---|---|---|---|
| `AgentName` | string | Yes | Display name of the agent/step (see canonical names below) |
| `Status` | enum | Yes | `Started` \| `Completed` \| `Blocked` \| `Failed` — any other value exits 1 |
| `Summary` | string | Yes | 1-2 sentence plain-English summary of what's beginning, what was done, or what is blocking it |

All three are `[Parameter(Mandatory)]` in the script — omitting any of them exits 1 rather than defaulting.

### Canonical Agent/Step Names

Use these exact strings as `AgentName` — they map one-to-one onto the Trigger Points table and onto the pipeline's canonical step slugs in `CLAUDE.md`:

- `Knowledge Agent`
- `Planning Agent`
- `Plan Approval`
- `Coding Agent`
- `Impact Check + Code Review`
- `Unit Test + Performance Review`
- `Rebase Health`
- `Handoff`

---

## How to Invoke

Run the PowerShell script via Bash from the **project root**. Always use `-ExecutionPolicy Bypass` to avoid policy errors.

```bash
powershell -ExecutionPolicy Bypass -File "$(git rev-parse --show-toplevel)/scripts/notify.ps1" \
  -AgentName "<AgentName>" \
  -Status "<Status>" \
  -Summary "<Summary>"
```

The path is anchored to the repo root rather than written relative (`./scripts/...`): the Bash working directory is not guaranteed to persist between agent tool calls, so a relative path can silently resolve to the wrong place.

`-SkipSend` is a test seam — it builds and prints the toast XML without dispatching it. `scripts/notify.Tests.ps1` uses it; it is not for normal pipeline use.

---

## Summary Authoring Rules

The orchestrator writes the `Summary` string. Follow these rules:

1. **One or two sentences maximum.** The toast is small.
2. **For `Started`:** state what's beginning, present tense (e.g. "Writing tests and checking performance patterns.").
3. **For `Completed`:** state what was done, past tense — state the key output (e.g. "LLD approved. 6 components planned.").
4. **For `Blocked`:** state the blocker and what is needed (e.g. "Confluence unreachable. Falling back to local doc_store.").
5. **For `Failed`:** state what failed and the error in plain terms (e.g. "Coding Agent failed: TypeScript strict error in useUpload.ts line 12.").
6. **No markdown, no bullet points** — plain text only (the toast renders raw text).

---

## Error Handling

- If the script exits with a non-zero code, log the error to the console but **do not block** the workflow. Notifications are informational only.
- Do not retry on failure.

---

## Required Tools

| Tool | Purpose |
|---|---|
| Bash | Execute `notify.ps1` via PowerShell |
