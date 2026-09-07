# Cost/Depth/Spend Status for a Task

Prints the Cost Governor assignment **and measured spend** for a task, read straight from its state file — no task execution, no MCP calls, no re-computation.

**Usage:** `/cost-status <TICKET_ID_OR_SLUG>`

**Arguments:** $ARGUMENTS

---

## Behavior

1. Set `TicketIdOrSlug = $ARGUMENTS`. If empty, list every `*-state.yml` file under `.claude/output/dev-pipeline/` with their `ticketId`, `currentStep`, `costTier`/`depth`, and `spend.totalUsd`, instead of erroring.
2. Otherwise read `.claude/output/dev-pipeline/<TicketIdOrSlug>-state.yml`. If missing, report:
   > "No task state found for `<TicketIdOrSlug>`."
3. Print, reading every value directly from the state file's `spend` block (see `CLAUDE.md` Resumable Pipeline State) — **never compute, estimate, or fill in a figure yourself**:
   ```
   <ticketId>  (<workflowType>)
     Depth: <depth>   CostTier: <costTier>
     Spend:
       knowledge            <modelAssignment.knowledge>    <spend.knowledge.tokens> tok   $<spend.knowledge.usd>
       planning             <modelAssignment.planning>     <spend.planning.tokens> tok    $<spend.planning.usd>   (sum across all revisions + finalize)
       coding               <modelAssignment.coding>       <spend.coding.tokens> tok      $<spend.coding.usd>     (sum across all invocations, incl. re-invocations)
       code_review          <modelAssignment.code_review>  <spend.code_review.tokens> tok $<spend.code_review.usd>
       unittest             <modelAssignment.unittest>     <spend.unittest.tokens> tok    $<spend.unittest.usd>
       performance_review   <modelAssignment.performance_review>  <spend.performance_review.tokens> tok  $<spend.performance_review.usd>
     Total measured: <spend.totalTokens> tokens (~$<spend.totalUsd>)
     Step: <currentStep>   (completed: <completedSteps, comma-separated>)
   ```

### Rendering rules — read carefully, these exist to prevent fabricated numbers

- A role whose `spend.<role>.tokens` is `null` (step hasn't run yet, or usage wasn't reported) → print `— (not yet run)` or `— (usage not reported)` as appropriate. **Never print `0`** — a null is a data gap, not a zero-cost step.
- Every role, **Coding Agent included**, runs as a genuine Agent-tool subagent (`CLAUDE.md` Rule 23) — there is no permanently-unmeasurable role. Render `coding` identically to every other role.
- A role invoked more than once for this task (a Planning revision round, a Coding Agent re-invocation after a Diverged gate or a Code-Review No-Go) shows the **sum** of every invocation, not just the latest — note this inline for `planning` and `coding` as shown above, since those are the two roles most likely to be re-invoked.

### What this is not

This is Cost Governor **v2**: real per-role token/USD figures, measured from actual sub-agent tool results (Orchestrator Rule 22) — not fabricated, not estimated. It is still **not** a budget tool: there is no threshold, no warning, no `RAISE`/`STOP` gate, and no cross-task rollup. If asked "is this over budget" or "how does this compare to other tasks," say plainly that budget enforcement and cross-task reporting aren't implemented yet — do not invent a comparison or a threshold to answer against.
