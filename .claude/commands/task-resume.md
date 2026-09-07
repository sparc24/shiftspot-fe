# Resume an Interrupted Task

Resumes a task without needing to re-paste the original Jira/Figma link — just the ticket ID (or slug, if the task had no ticket).

**Usage:** `/task-resume <TICKET_ID_OR_SLUG>`

**Arguments:** $ARGUMENTS

---

## Behavior

1. Set `TicketIdOrSlug = $ARGUMENTS` (trim whitespace). If empty, ask for it and stop.
2. Check whether `.claude/output/dev-pipeline/<TicketIdOrSlug>-state.yml` exists.

   - **Missing** → report clearly:
     > "No in-progress task found for `<TicketIdOrSlug>`. Paste the Jira/Figma link (or use `/dev <TICKET_ID>`) to start a new task."
     Stop here — do not start a new task implicitly.

   - **Exists** → read it and present a short status summary before resuming, so the user isn't resuming blind:
     ```
     Resuming <ticketId>
       Workflow:     <workflowType>
       Current step: <currentStep>
       Completed:    <completedSteps, comma-separated>
       Branch:       <branchName>  (parent: <parentBranch>)
       Depth:        <depth>   CostTier: <costTier>
       Last updated: <lastUpdatedAt>
     ```
3. Then follow the **Resume Check** procedure in `CLAUDE.md` Step 0 exactly — git state recovery (rebase-abort-if-needed, fetch, checkout, dirty-tree check), skip only what's in `completedSteps`, jump to `currentStep`, and re-hydrate the plan from `planPath`/`planConfluenceUrl` if resuming at or after `coding-agent`. This command does not reimplement that logic — it is the same Resume Check, just entered by ticket ID instead of by re-pasting the link.

This command is a convenience wrapper, not a different resume mechanism — pasting the same Jira link again still works identically, per `CLAUDE.md`'s Resume Check.
