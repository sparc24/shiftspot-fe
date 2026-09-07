# Project Configuration — Frontend Senior Lead Agent

This file is the **single source of truth for all project-specific values**. It ships with no organization tied to it — fill in the **Project Identity** and **Sprint Team** sections before running `/sprint-plan` for the first time. The dev pipeline (`CLAUDE.md`, per-ticket work) does not read this file at all — only `/sprint-plan` does.

---

## Project Identity

| Key | Value |
|-----|-------|
| **Jira ticket prefix** | *(**required** — e.g. `PROJ`)* |
| **Jira base URL** | *(**required** — e.g. `https://yourorg.atlassian.net`; interpolated into published Confluence ticket links, so a leftover placeholder ships into the plan)* |
| **Confluence space key** | *(**required** — e.g. `ENG`)* |
| **GitHub organization** | *(optional — not currently read by any agent; `gh` infers the repo from the git remote)* |
| **GitHub repo** | *(optional — not currently read by any agent)* |

---

## Workflow Track Detection

Optional. Only relevant if your team uses a release-branch strategy with fix-version-driven tracks (e.g. a "pilot" track targeting `main` and a "beta" track targeting a release branch). If your team just uses a single trunk branch, ignore this section entirely — the dev pipeline's Step 0 (Parent Branch Selection) already asks for the target branch on every task regardless.

The pipeline can auto-detect a track from Jira fix version names if you configure keyword lists below:

### Pilot track keywords *(case-insensitive match anywhere in fix version name)*
*(fill in, or leave blank if not applicable — e.g. `Pilot`, `F1`, `F2`, `F3`)*

No fix version set → also treated as pilot track (if this section is in use).
Any `labels` entry containing `pilot` (case-insensitive) → also pilot track.

### Beta track keyword
*(fill in, or leave blank if not applicable — e.g. `Beta`)*

### Hotfix signal
*(fill in your own rule, or leave blank — e.g. Beta fix version + `hotfix` label OR priority `Highest`/`Critical`)*

---

## File Paths

| Artifact | Path |
|----------|------|
| **Sprint plan working files** | `.claude/output/sprint-plan/` |
| **Source root** | `src/` |
| **Features folder** | `src/features/` |
| **Shared folder** | `src/shared/` |

### Shared file patterns

Read by the Slot Assigner (phase 3) to detect cross-story conflicts — two developers touching the same file in the same sprint. Directory paths alone are not enough; these are the glob patterns it matches against:

```
src/shared/**
src/app/Router.tsx
src/app/**
src/**/index.ts
tailwind.config.*
tsconfig*.json
package.json
```

Tune this list to your project. Anything matched here is treated as a shared-ownership file, which is what drives Foundation-story detection and slot sequencing.

---

## Tech Stack

Used by the Lead Analysis agent to determine which implementation components apply per story type. **This must match the Tech Stack table in the root `CLAUDE.md`** — the two are read by different agents (sprint planning vs. per-ticket dev pipeline) but describe the same project.

| Concern | Value |
|---------|-------|
| **Framework** | React 18.x+ — functional components and hooks only |
| **Language** | TypeScript strict mode (no `any` types) |
| **UI/Styling** | Tailwind CSS |
| **State (global)** | Zustand |
| **State (server)** | TanStack Query |
| **Forms** | React Hook Form |
| **Validation** | Zod |
| **HTTP** | Axios via shared API client |
| **Routing** | React Router v6+ |
| **Test framework** | Vitest + React Testing Library |
| **Coverage threshold** | See per-layer thresholds in `.claude/agents/unittest-agent.md` *(sprint-planning-only addition — intentionally not in `CLAUDE.md`'s table)* |

Every row above except **Coverage threshold** must match `CLAUDE.md`'s Tech Stack table exactly. The `HTTP` row matters specifically: the Lead Analysis agent derives per-story implementation components from this table, and the Estimation Baseline below prices an `API Service` component — omitting the HTTP layer here would under-scope every story with a network call.

If your project's actual stack differs (a different UI library, a real-time transport layer, a different state factory, etc.), update both this table and `CLAUDE.md`'s Tech Stack table together — they must never diverge.

---

## Sprint Team

All team members are treated as senior developers with equivalent productivity. Update this table each sprint if headcount changes.

| Developer | Jira Username | Sprint Capacity (hours) |
|-----------|--------------|------------------------|
| *(fill in)* | *(fill in)* | *(fill in — e.g. 60)* |

> **Per-sprint capacity**: a typical starting point is ~60 hours for a 2-week sprint (~6 productive hours/day after meetings, reviews, and overhead) — adjust to your team's actual cadence. Adjust per developer for PTO or part-time availability.

---

## Estimation Baseline

Used by the Lead Analysis agent to produce a technical estimation breakdown per story. **These numbers are a generic starting point — tune them from your own team's actual velocity once you have a few sprints of history.**

**Velocity reference**: 1 story point ≈ 2 hours for a senior developer, as a starting assumption.

### Hours per implementation component (by complexity tier)

| Component | Low (1–3 SP) | Medium (4–8 SP) | High (>8 SP) |
|-----------|-------------|----------------|-------------|
| Types/Interfaces | 0.5 | 1 | 2 |
| Zod Validation Schema | 0.5 | 1 | 1.5 |
| API Service | 0.5 | 1.5 | 3 |
| TanStack Query Keys | 0.25 | 0.5 | 0.5 |
| Query / Mutation Hooks | 0.5 | 1.5 | 3 |
| Zustand Store (if needed) | 0 | 1 | 2 |
| Screen Component | 2 | 4 | 8 |
| Sub-components | 0 | 2 | 5 |
| Unit Tests (per coverage thresholds) | 1 | 2.5 | 5 |
| PR description + review cycle | 0.5 | 1 | 1.5 |

If your project also involves i18n/locale-key sync, feature-flag guards, or other recurring per-story overhead, add rows for them here — they were deliberately left out of this generic baseline since they're not universal to every React project.

**Bug fix estimation:**
| Bug complexity | Estimated hours |
|---------------|----------------|
| Low (≤2 SP or no estimate) | 2–4 hours |
| Medium (3–5 SP) | 5–10 hours |
| High (>5 SP) | 12–20 hours |

**Story size thresholds:**
- Stories with `storyPoints > 8` should be flagged for splitting before sprint kickoff.
- Stories with `storyPoints` null are treated as Medium for estimation purposes — flag for product owner to estimate.
