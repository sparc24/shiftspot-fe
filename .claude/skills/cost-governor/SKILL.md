---
name: cost-governor
description: Assigns a per-agent model based on the task's CostTier, derived from the same signals Step 2 already computes for Depth
---

# Cost Governor Skill (v2 — model assignment + measured spend, no enforcement)

Assigns a `CostTier` and resolves the per-agent model map for it. **This skill's own job stops at assignment** — it does not read token usage or write to `spend`. Recording measured spend after each sub-agent call is the Orchestrator's job (`CLAUDE.md` Rule 22), triggered by this skill's output but not performed by it, because the usage figure comes from the *result* of a subsequent Agent-tool call this skill has no visibility into.

Every one of the six roles — Coding Agent included — runs as a genuine Agent-tool subagent (Rule 23), so every role's spend is measurable; there is no permanently-unmeasurable role. A role invoked more than once for the same task (a Planning revision round, a Coding Agent re-invocation after a Diverged gate or a Code-Review No-Go) accumulates the **sum** of every invocation in `spend.<role>` — the model assignment this skill resolves stays the same across those re-invocations within one task, since `CostTier` is set once at Step 2 and only ever escalates.

What's still deliberately absent: no budget thresholds, no spend ledger rollup across tasks, no circuit breaker (`RAISE`/`CONTINUE-ONCE`/`STOP`). Those are deferred until real spend numbers — now actually being recorded — exist to calibrate budgets against; building enforcement before the numbers exist would mean guessing at thresholds.

---

## Trigger Point

Invoked by the Orchestrator in two places:

- **Full Workflow** — as part of **Step 2 — Assess Task Signals (Depth + Cost Tier)** in `CLAUDE.md`, immediately after Knowledge Agent completes and before Planning Agent starts. Derives `CostTier` from the signals (Step 2 below).
- **Bypass Workflow** — invoked at the end of Step 1 with a **pinned** `CostTier: trivial`. Skip signal derivation entirely; just load config and return the `trivial` model map. This exists because Orchestrator Rule 3 requires a resolved model for every agent call, and the Coding Agent and Unit Test Agent both run in Bypass.

This skill **only ever assigns models. It never decides whether an agent runs** — that is decided solely by `workflowType` at Step 1. Consequently no tier may contain a `skip` value: a Full Workflow task can legitimately resolve to `trivial`, and `planning: skip` there would violate Orchestrator Rule 1 ("Never skip Planning in Full Workflow").

---

## Step 1 — Load Configuration

Read `.claude/context/cost-policy.yaml`. If missing or unparseable, fall back to this table (log a note; never block the pipeline over a missing config):

| Tier | knowledge | planning | coding | code_review | unittest | performance_review |
|---|---|---|---|---|---|---|
| trivial | haiku | haiku | haiku | haiku | haiku | haiku |
| standard | haiku | sonnet | sonnet | sonnet | haiku | haiku |
| critical | sonnet | opus | sonnet | opus | sonnet | sonnet |

Plus `knowledge_default: haiku` — the Knowledge Agent runs *before* Step 2 resolves `CostTier`, so its model comes from this key, never from a tier row. (The `knowledge` column above applies only if a Knowledge Agent re-run is triggered after Step 2, e.g. by a Depth escalation.)

---

## Step 2 — Derive CostTier from Depth's Existing Signals

**Do not re-derive the size/escalation signal — Step 2 in `CLAUDE.md` already computed it for `Depth`.** Read that same signal:

- **Escalation flag set** (the task modifies `src/shared/**` or authentication code — the same check that forces `Depth: High`) → `CostTier: critical`. This cannot be downgraded by a low story-point estimate or small file count, for the same reason `Depth` can't be: a small-but-risky change is not a small change for review purposes.
- **No escalation, size signal available** — use the *same* Low/Medium/High size signal Step 2 already derived for `Depth` (do not re-read the raw story points or re-count files; the ladder lives in one place, in `CLAUDE.md` Step 2):
  - Low size signal → `CostTier: trivial`
  - Medium size signal → `CostTier: standard`
  - High size signal → `CostTier: critical`
- **No signal available at all** → default to `standard` — never assume `trivial`.

Because `CostTier` maps 1:1 off the size signal, any gap or overlap in Step 2's ladder becomes a gap here too — which is why the thresholds are defined once in `CLAUDE.md` Step 2 and merely referenced here.

`CostTier` and `Depth` are computed from the same underlying signal but are **not the same value** — a big-but-safe UI change can be `Depth: High` + `CostTier: standard` (needs a longer plan, doesn't need the best model); a tiny-but-risky auth tweak can be `Depth: Low` + `CostTier: critical` (short plan, but Planning/Review run on the best model). Both are correct outcomes, not an inconsistency.

**Escalation is one-directional.** Once `CostTier` is resolved for a task, nothing later in the pipeline may lower it. If the Coding Agent or Code Review Agent discovers the task is riskier than the original signal suggested, that's a reason to *raise* `CostTier` for the remainder of the task — never a reason to reconsider downward.

---

## Step 3 — Resolve and Return the Model Map

Look up `tiers.<CostTier>` from the loaded config (or the fallback table) and return it as-is. The Orchestrator injects this map into every subsequent sub-agent call for the task, the same way it already injects the Tech Stack (Orchestrator Rule 3) — sub-agents do not re-derive or question their assigned model.

---

## Output to Orchestrator

- `CostTier`: `trivial` | `standard` | `critical`
- Per-agent model map (`knowledge`, `planning`, `coding`, `code_review`, `unittest`, `performance_review`)

Both are written into the task's existing pipeline state file (`.claude/output/dev-pipeline/<ticket>-state.yml`) as `costTier` and `modelAssignment` — no separate ledger file.

---

## Required Tools

| Tool | Purpose |
|---|---|
| Read | Load `cost-policy.yaml` |
