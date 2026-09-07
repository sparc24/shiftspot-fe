# Dev Pipeline — Explicit Entry Point

An explicit alternative to pasting a Jira/Figma link or task description into the chat. Functionally identical to that default behavior — this command exists for when you want to invoke the pipeline directly (scripting, muscle memory, or specifying the base branch inline instead of being asked).

**Usage:** `/dev <TICKET_ID> [base-branch]`

**Arguments:** $ARGUMENTS

---

## Behavior

1. Parse `$ARGUMENTS`: first token is `TICKET_ID` (required — if missing, ask for it and stop). Second token, if present, is an explicit base branch.
2. Treat this exactly as if the user had pasted the Jira ticket URL for `TICKET_ID` into the conversation — run the full Task Workflow in `CLAUDE.md`, starting at **Step 0**.
3. **If a base branch was given as the second argument**, skip Step 0's interactive question — use it directly as `ParentBranch`, run the same `git fetch`/`checkout`/`pull` sequence, and proceed. This is the only difference from the default paste-a-link flow: the base-branch prompt is pre-answered.
4. If a state file already exists for `TICKET_ID`, the Resume Check (part of Step 0) takes over as normal — this command does not bypass resume logic.

Everything downstream (Task Classification, Depth/CostTier assignment, the full pipeline through to the PR) is unchanged from `CLAUDE.md`. This command does not duplicate that logic — it only supplies the two inputs (`TicketId`, optionally `ParentBranch`) that Step 0/Step 1 would otherwise ask for.

**Do not use this for sprint planning** — that's `/sprint-plan <sprint-id>`, a completely separate pipeline.
