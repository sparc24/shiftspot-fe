# Standalone Connectivity Check

Runs the MCP Health Check Skill on demand, outside of any task — useful after switching machines, re-authenticating a connector, or before starting a work session, without needing to kick off a real ticket to find out something is disconnected.

**Usage:** `/mcp-check`

**Arguments:** none

---

## Behavior

Invoke `.claude/skills/mcp-health-check/SKILL.md` directly, in its **standalone** mode (no state file, no task context — see that skill's own Step 3: "If called standalone: report the results and exit").

Report Atlassian, Figma, and GitHub CLI connectivity exactly as the skill's Step 2 formats it. Do not proceed to any pipeline step afterward — this command only checks and reports.
