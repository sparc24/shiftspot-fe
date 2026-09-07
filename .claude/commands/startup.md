# Force Re-run Startup Sequence

Re-runs `CLAUDE.md`'s Startup Sequence on demand, without starting a task. Useful after editing `cost-policy.yaml`, `project-config.md`, `package.json`, or `tsconfig.json`, or after a dependency change — anything that would otherwise only get checked the next time a task happens to run.

**Usage:** `/startup`

**Arguments:** none

---

## Behavior

Run all three Startup Sequence steps from `CLAUDE.md`, in order, exactly as written there:

1. **Verify Tech Stack & Structure** — `package.json` packages, `tsconfig.json` strict mode, the `src/app/`/`src/features/`/`src/shared/` layout.
2. **Connectivity Check** — the MCP Health Check Skill (Atlassian, Figma, GitHub CLI).
3. **Sprint Planning Config** — note whether `.claude/context/project-config.md`'s required fields (Jira ticket prefix, Jira base URL, Confluence space key) are still placeholders, if `/sprint-plan` is expected to be used on this project.

Report the outcome of each step. This command does not start or resume any task — it only validates the environment. To act on a ticket afterward, paste its link, use `/dev <TICKET_ID>`, or `/task-resume <TICKET_ID>`.
