---
name: mcp-health-check
description: Probe Atlassian, Figma, and GitHub CLI connectivity in one block at startup, before any real work begins
---

# MCP Health Check Skill

Probes all configured MCP servers and CLIs with a lightweight call and reports connectivity status in one block, before any real work begins. Used by the dev pipeline's Startup Sequence (`CLAUDE.md`) and by `/sprint-plan`. Can also be invoked standalone.

---

## Instructions

### Step 1: Probe each server

Run a lightweight call against each dependency:

**Atlassian (Jira + Confluence):**
Using Atlassian MCP, fetch the current user's profile or any trivial endpoint that confirms the connection is alive.

**Figma** *(only if the task includes a Figma link — skip otherwise):*
Using Figma MCP, fetch the current user's profile or a trivial endpoint.

**GitHub CLI** *(dev pipeline only — not needed for `/sprint-plan`):*
Run `gh auth status`. Exit code `0` → connected; non-zero → unavailable.

For each dependency, record the result as either `connected` or `unavailable`.

---

### Step 2: Report status

Present the result to the developer:

```
🔌 Connectivity Check

  Atlassian (Jira + Confluence) : ✅ connected  |  ❌ unavailable
  Figma                         : ✅ connected  |  ❌ unavailable  |  ⏭ skipped (no Figma link)
  GitHub CLI (gh)               : ✅ connected  |  ❌ unavailable  |  ⏭ skipped (sprint planning only)
```

---

### Step 3: Handle failures

**All checked servers connected** → tell the developer "All connections verified." and return control to the caller.

**One or more are unavailable** — severity depends on which one:

| Dependency | If unavailable |
|---|---|
| Atlassian | **Hard block.** All tasks originate from a Jira ticket — there is no fallback. Report the error and stop; do not offer `continue`. |
| Figma | **Degrade gracefully.** Only relevant if the task actually references a Figma link — note it and continue; the Knowledge Agent will ask the user for a pasted design/screenshot instead. |
| GitHub CLI | **Degrade gracefully for now, hard block later.** The pipeline can still plan and code; it will hard-stop only when the GitHub PR Skill actually needs to push/open a PR. Note it and continue. |

If called from the dev pipeline (state file exists per the Resumable Pipeline State — see `CLAUDE.md`), write the result of each dependency into the state file's `mcpStatus` block (`"connected"` | `"unavailable"` | `"skipped"`) before returning control.

For any dependency that degrades gracefully rather than hard-blocking, present:

```
⚠️ [Dependency] is unavailable — [what this affects].
Continuing; you'll be asked for a manual fallback if and when it's actually needed.
```

Never pause and wait for a `continue`/`abort` reply on a gracefully-degrading dependency — this follows the Fallback Transparency Rule in `CLAUDE.md`: show what happened, show what it affects, and keep going. Only Atlassian's hard block actually stops the pipeline.

**If called standalone** (no state file context): report the results and exit. No further action required.
