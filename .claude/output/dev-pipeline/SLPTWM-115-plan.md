```
Story / Task ID:      SLPTWM-115 (parent) — FE/UI subtasks SLPTWM-122, SLPTWM-123
Title:                Worker Search filter logic, API integration, interaction states and responsive design
Issue Type:           Story (parent) — plan scoped to its [FE] and [UI] subtasks
Depth:                High
Author:               Planning Agent (sparc.team24@experionglobal.com)
Date:                 2026-09-08
Status:               Approved
Reviewer:             [Tech Lead / Architect]
Related PRD:          PRD-ShiftSpot-WorkerSearch (parent story SLPTWM-115)
Sprint:               [Sprint number / name]
```

---

## 1. Summary of Change

This task turns `/seeker/search` from a "Coming soon" placeholder into the working Worker Search screen, implementing the two FE/UI-scoped subtasks of SLPTWM-115: **SLPTWM-122 [FE] Worker Search Filter Logic and API Integration** (filter state, the "Find Workers" search call, and the four-way conditional render of first-use / loading / zero-results / results) and **SLPTWM-123 [UI] Interaction states and responsive design** (skill-chip focus/hover/active/keyboard states, Location & Age input focus and error states, a WCAG 2.2 AA contrast fix for the gold-on-white chip treatment, and responsive layout below 1280px).

The BE and QA subtasks of SLPTWM-115 are out of scope; the search itself is served by a new `searchWorkers` function on the existing in-memory mock, behind the same single-swap-point service layer already used by worker registration, so pointing at a real endpoint later is a one-function-body change.

End state: a job seeker lands on the page and sees the first-use prompt, selects any combination of skills / location / age, clicks **Find Workers**, sees a loading indicator, and then either a responsive grid of worker cards with a result count, or the zero-results message — all keyboard operable and screen-reader announced.

⚠️ **Escalation acknowledged.** This plan modifies four files under `src/shared/**` (`api/mockWorkerApi.ts`, `services/workerService.ts`, `types/worker.ts` + its barrel, `components/MultiSelect.tsx`) plus `tailwind.config.js`. Three of the five are consumed by `worker-registration`, so every shared change below is specified as strictly additive or backwards-compatible by default value — with one deliberate exception (the amber contrast fix in `MultiSelect`, which is a Rule 5 Critical accessibility correction and does visually affect the already-signed-off registration screen). See §2.2 Risk column and Open Question Q5.

---

## 2. Scope of Change

**Plan Checksum: CREATE 12 · MODIFY 10 · DELETE 0**

### 2.1 Files to CREATE

| File Path | Type | Purpose |
|---|---|---|
| `src/features/job-seeker/types.ts` | Types | `WorkerCardView`, `WorkerSearchFormValues`, `SearchMessageVariant` |
| `src/features/job-seeker/constants.ts` | Constants | Verbatim AC message strings, `MAX_CARD_SKILLS = 2`, age bounds re-export |
| `src/features/job-seeker/validation.ts` | Validation | `workerSearchFilterSchema` (Zod) + inferred form values type |
| `src/features/job-seeker/mappers.ts` | Mapper | `toWorkerCardView(worker)` — initials, name, location, ≤2 skill labels; `toSearchFilters(formValues)` |
| `src/features/job-seeker/hooks/useWorkerSearch.ts` | Hook | TanStack Query `useQuery` for worker search, gated on applied filters |
| `src/features/job-seeker/hooks/index.ts` | Barrel | Re-exports `useWorkerSearch` |
| `src/features/job-seeker/components/WorkerSearchFilterBar.tsx` | Container (form) | RHF + Zod filter form: skill chips, Location, Age, "Find Workers" |
| `src/features/job-seeker/components/WorkerSearchResults.tsx` | Container | The AC1–AC4 conditional-render switchboard + the single live region |
| `src/features/job-seeker/components/WorkerResultsGrid.tsx` | Presentational | Responsive `role="list"` grid of `WorkerCard`s |
| `src/features/job-seeker/components/WorkerCard.tsx` | Presentational | Avatar initials, name, location, ≤2 skill badges (badge is a local sub-component) |
| `src/features/job-seeker/components/WorkerSearchMessage.tsx` | Presentational | One panel rendering the idle (AC4) / zero-results (AC3) / loading copy |
| `src/features/job-seeker/components/index.ts` | Barrel | Feature-internal component barrel |

*Test files are intentionally not listed here and are excluded from the Plan Checksum — the Unit Test Agent owns them in Parallel Block B. The intended set is recorded in §12.*

### 2.2 Files to MODIFY

| File Path | What Changes | Risk |
|---|---|---|
| `src/features/job-seeker/JobSeekerSearchPage.tsx` | Replace the placeholder body with header + `ErrorBoundary` + `WorkerSearchFilterBar` + `WorkerSearchResults`; owns `appliedFilters` state | Low |
| `src/features/job-seeker/index.ts` | Public API: keep `JobSeekerSearchPage`, add `useWorkerSearch` and the public types | Low |
| `src/features/job-seeker/JobSeekerSearchPage.test.tsx` | The existing "Coming soon" assertion **will fail** once the placeholder is gone — replace that spec with the real search specs; keep/adapt the back-link nav spec | Low |
| `src/shared/api/mockWorkerApi.ts` | Add a module-level `workerList: Worker[]` (seeded with demo workers), have `createWorker` push into it, add `searchWorkers(filters)` doing skill-OR / location-substring / age matching | **Medium** — shared file also used by registration; seeded emails/phones enter the uniqueness maps (see Q3) |
| `src/shared/services/workerService.ts` | Add `searchWorkers(filters)` delegating to the mock, with the same swap-point comment naming the future `GET` call | Low |
| `src/shared/types/worker.ts` | Add `SKILL_OPTIONS` (promoted from `worker-registration/constants.ts` so both features share one label source) and `WorkerSearchFilters` (needed by the shared service signature — shared must not import from a feature) | Low — additive only |
| `src/shared/types/index.ts` | Export `SKILL_OPTIONS` and `WorkerSearchFilters` | Low |
| `src/shared/components/MultiSelect.tsx` | (a) `aria-required` becomes driven by a new `required?: boolean` prop defaulting to `true`; (b) add an `:active` state on the chip label; (c) replace `border-brand-amber` / `hover:border-brand-amber` with the new `brand-amber-dark` token and add a check glyph so selection is not conveyed by a sub-3:1 colour alone | **Medium** — shared component; (c) changes the registration screen's chip appearance (deliberate a11y fix, Q5) |
| `src/features/worker-registration/constants.ts` | `SKILL_OPTIONS` becomes a re-export from `@/shared/types`; `MIN_WORKER_AGE`/`MAX_WORKER_AGE` stay | Low — `WorkerRegistrationForm`'s import path is unchanged |
| `tailwind.config.js` | Add `brand['amber-dark']: '#7a5d12'` (6.11:1 on white) | Low — additive token |

### 2.3 Files to DELETE

| File Path | Reason for Deletion |
|---|---|
| — | None. The placeholder page is rewritten in place, not deleted, because `Router.tsx` already lazy-loads it and its route must not change. |

### 2.4 Files to REUSE (no changes)

| File Path | How It Is Used |
|---|---|
| `src/app/Router.tsx` | Already lazy-loads `JobSeekerSearchPage` at `/seeker/search` — **no change needed** |
| `src/app/App.tsx` | Already provides `QueryClientProvider` (`refetchOnWindowFocus: false`) and the app-level `ErrorBoundary` |
| `src/shared/components/ErrorBoundary.tsx` | Wraps the feature root inside `JobSeekerSearchPage` (Rule 7) |
| `src/shared/components/FormField.tsx` | Label / hint / `role="alert"` error markup for the Skills, Location and Age fields |
| `src/shared/components/TextInput.tsx` | Location and Age inputs — its existing `invalid` prop already provides the SLPTWM-123 error state and `aria-invalid` |
| `src/shared/components/Button.tsx` | "Find Workers" — its `isLoading` / `aria-busy` variant supplies the pending state |
| `src/shared/components/ErrorAlert.tsx` | Search-failure state with a Retry action |
| `src/shared/api/client.ts` | Not called yet, but the normalised `ApiError` shape it produces is the error contract `useWorkerSearch` types against |

---

## 3. Component Tree

```
JobSeekerSearchPage (Page — lazy loaded via existing Router entry)
  ├── <header>  (ShiftSpot mark + "← Back to role selection" Link)
  ├── ErrorBoundary (shared)
  │     └── <main>
  │           ├── WorkerSearchFilterBar (Container — RHF + Zod; owns draft filter state)
  │           │     ├── FormField (shared) ── MultiSelect (shared, via RHF Controller)   ← skills chips
  │           │     ├── FormField (shared) ── TextInput (shared)                          ← Location
  │           │     ├── FormField (shared) ── TextInput (shared, inputMode="numeric")     ← Age
  │           │     └── Button (shared, isLoading)                                        ← "Find Workers"
  │           │
  │           └── WorkerSearchResults (Container — consumes useWorkerSearch result props)
  │                 ├── <div role="status" aria-live="polite" aria-atomic="true">   ← ONE live region
  │                 │     └── WorkerSearchMessage (idle | loading | empty)  or  result-count text
  │                 ├── ErrorAlert (shared, onRetry)                        ← error branch
  │                 └── WorkerResultsGrid (Presentational, role="list")     ← success branch
  │                       └── WorkerCard[] (Presentational, role="listitem")
  │                             ├── avatar initials <span aria-hidden="true">
  │                             └── SkillBadge[]  (local sub-component in WorkerCard.tsx, ≤2)
  └── <footer>
```

Note the grid sits **outside** the live region deliberately — announcing "2 workers found" is useful; re-announcing every card's full text on each search is not.

---

## 4. Component Specifications

| Component | Type | Props Interface | State | Notes |
|---|---|---|---|---|
| `JobSeekerSearchPage` | Page | none | `appliedFilters: WorkerSearchFilters \| null` (`useState`, init `null`) | Already lazy-loaded by `Router.tsx`; wraps feature body in `ErrorBoundary`; calls `useWorkerSearch(appliedFilters)` and passes the result down. `null` is the sentinel for "no search performed yet" → AC4 |
| `WorkerSearchFilterBar` | Container (form) | `WorkerSearchFilterBarProps` | React Hook Form (`useForm` + `zodResolver`) | Owns *draft* filter values only. `onSubmit` hands validated filters up; it never calls the API itself |
| `WorkerSearchResults` | Container | `WorkerSearchResultsProps` | `useMemo` over `workers` → `WorkerCardView[]` | Pure switchboard over `hasSearched / isLoading / isError / results.length`; owns the single live region and the result-count string |
| `WorkerResultsGrid` | Presentational | `WorkerResultsGridProps` | none | `role="list"`, responsive column count. One line of logic |
| `WorkerCard` | Presentational | `WorkerCardProps` | none | `role="listitem"`; non-interactive in this scope (no `onSelect` — see Q11) |
| `WorkerSearchMessage` | Presentational | `WorkerSearchMessageProps` | none | Renders one of the three canned copies from `constants.ts`. Trivial |

**Props interfaces to define:**

```ts
// src/features/job-seeker/components/WorkerSearchFilterBar.tsx
interface WorkerSearchFilterBarProps {
  /** Called with validated, normalised filters when "Find Workers" is submitted. */
  onSearch: (filters: WorkerSearchFilters) => void;
  /** Drives the Button's isLoading/aria-busy state. */
  isSearching: boolean;
}

// src/features/job-seeker/components/WorkerSearchResults.tsx
interface WorkerSearchResultsProps {
  /** False until the user has submitted at least one search — drives the AC4 first-use state. */
  hasSearched: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  workers: Worker[];
  onRetry: () => void;
}

// src/features/job-seeker/components/WorkerResultsGrid.tsx
interface WorkerResultsGridProps {
  workers: readonly WorkerCardView[];
}

// src/features/job-seeker/components/WorkerCard.tsx
interface WorkerCardProps {
  worker: WorkerCardView;
}
interface SkillBadgeProps {   // local to WorkerCard.tsx, not exported
  label: string;
}

// src/features/job-seeker/components/WorkerSearchMessage.tsx
interface WorkerSearchMessageProps {
  variant: SearchMessageVariant;   // 'idle' | 'loading' | 'empty'
}
```

**Shared-component prop change (`MultiSelect`):**

```ts
interface MultiSelectProps {
  id: string;
  name: string;
  options: readonly SkillOption[];
  value: SkillId[];
  onChange: (value: SkillId[]) => void;
  invalid?: boolean;
  describedById?: string;
  /** NEW — drives aria-required. Defaults to true so worker-registration is unaffected. */
  required?: boolean;
}
```

---

## 5. State and Data Flow

### 5.1 State Ownership

| State | Type | Owner | Rationale |
|---|---|---|---|
| `skills: SkillId[]` (draft) | Form state | React Hook Form in `WorkerSearchFilterBar`, bound to `MultiSelect` via `Controller` | Same pattern `WorkerRegistrationForm` already uses; satisfies the "no manual form state" standard. Initialised `[]` |
| `location: string` (draft) | Form state | React Hook Form in `WorkerSearchFilterBar` | Initialised `''` |
| `age: string` (draft) | Form state | React Hook Form in `WorkerSearchFilterBar` | Held as a **string** in the form and coerced by Zod (`z.coerce.number()`), so an empty box is a clean "no age filter" rather than `NaN`. Initialised `''` |
| Field-level validation errors | Form state | React Hook Form `formState.errors` | Feeds `FormField error` + `TextInput invalid` — this is the SLPTWM-123 input error state |
| `appliedFilters: WorkerSearchFilters \| null` | UI state | `useState` in `JobSeekerSearchPage` | The *committed* filters. Separating them from the draft is what makes AC4 (`null` = never searched) distinguishable from AC3 (searched, empty array). Also serves as the query-key input |
| `workers[]`, `isLoading`, `isError` | Server state | TanStack Query — `useWorkerSearch` | Remote read; Query owns caching, dedupe and status flags. **No `useEffect` + `useState` fetching** |
| `cardViews: WorkerCardView[]` | Derived | `useMemo` in `WorkerSearchResults` | Pure projection of `workers`; never stored |
| Global state | — | none | No Zustand slice is needed or added — filters are page-local and the results are server state |

**Data flow, one cycle:**

```
user edits chips/inputs → RHF draft state (WorkerSearchFilterBar)
   │ submit "Find Workers"
   ▼ zodResolver validates → toSearchFilters(values) normalises
onSearch(filters) → setAppliedFilters(filters)   [JobSeekerSearchPage]
   ▼
useWorkerSearch(appliedFilters)  ── enabled: appliedFilters !== null
   ▼ workerService.searchWorkers → mockWorkerApi.searchWorkers
{ data, isLoading, isError, error, refetch }
   ▼ passed as props
WorkerSearchResults → useMemo(toWorkerCardView) → WorkerResultsGrid → WorkerCard[]
```

### 5.2 TanStack Query Keys

| Query Key | Hook | Invalidated By |
|---|---|---|
| `['workers', 'search', appliedFilters]` | `useWorkerSearch(appliedFilters)` | Nothing in this scope. *(Should a future story make registration invalidate `['workers','search']` so a newly-registered worker appears without a reload? — Q9)* |

Hook contract:

```ts
export function useWorkerSearch(filters: WorkerSearchFilters | null) {
  return useQuery<Worker[], ApiError>({
    queryKey: ['workers', 'search', filters],
    queryFn: () => {
      // Narrowing, not a cast — `enabled` guarantees this branch is unreachable.
      if (!filters) throw new Error('useWorkerSearch: queryFn ran with no applied filters')
      return workerService.searchWorkers(filters)
    },
    enabled: filters !== null,
    retry: 0,
    staleTime: 30_000,
  })
}
```

**Implementation note the Coding Agent must not get wrong:** in TanStack Query v5 a *disabled* query reports `status: 'pending'`, so `isPending` is `true` before the first search and would render a spinner on mount. Use **`isLoading`** (`isPending && isFetching`) for the loading branch, and derive the AC4 idle branch from `appliedFilters === null`, never from `isPending`.

Because `appliedFilters` is a state object with stable identity between renders, the query key is referentially stable and will not cause refetch loops. Re-submitting identical filters within `staleTime` is served from cache — intentional.

### 5.3 Zustand Store Changes

| Store | Slice | Change |
|---|---|---|
| — | — | No Zustand changes. Filter state is page-scoped and results belong in TanStack Query; putting either in a global store would violate the "Zustand only for global state" standard. |

---

## 6. Services and API

### 6.1 New or Modified Endpoints

| Method | Path | Request | Response | Auth |
|---|---|---|---|---|
| `GET` | `/api/workers/search` *(not yet live — mocked)* | `WorkerSearchFilters` as query params: `skills` (repeated/CSV), `location`, `age` | `Worker[]` | None — ShiftSpot PoC is a login-less directory |

No real HTTP call is made in this task. `apiClient` and `VITE_API_BASE_URL` are already wired for the swap; the endpoint path above is recorded so the BE subtask has a stated FE expectation to agree or disagree with (Q9).

### 6.2 Service Layer

| Service File | Method | What It Does |
|---|---|---|
| `src/shared/services/workerService.ts` | `searchWorkers(filters: WorkerSearchFilters): Promise<Worker[]>` | Delegates to `mockWorkerApi.searchWorkers`. Carries the same single-swap-point comment as `createWorker`, naming `apiClient.get<Worker[]>('/api/workers/search', { params })` as the replacement body |
| `src/shared/api/mockWorkerApi.ts` | `searchWorkers(filters)` | `await delay(MOCK_LATENCY_MS)`, then filters `workerList`. Skill-OR, location substring, age match (below). Always resolves — never rejects — so the error branch is exercised only once a real endpoint exists |
| `src/shared/api/mockWorkerApi.ts` | `workerList: Worker[]` (module-level) | Seeded with demo workers at module init so the page has data to find; `createWorker` pushes each new worker onto it |

**Match semantics (single source of truth for the Coding Agent):**

```
matches(worker, f) =
     (f.skills.length === 0 || f.skills.some(s => worker.skills.includes(s)))   // AC2 — OR within skills
  && (!f.location        || worker.location.trim().toLowerCase()
                              .includes(f.location.trim().toLowerCase()))       // case-insensitive substring
  && (f.age === undefined || worker.age === f.age)                              // exact — see Q1
```

AND across the three dimensions, OR within skills. An entirely empty filter object matches every worker (browse-all — see Q4).

---

## 7. Types and Validation

### 7.1 TypeScript Types

Added to `src/shared/types/worker.ts` (must live in shared: the shared service signature references it, and shared may never import from a feature):

```ts
export const SKILL_OPTIONS: readonly SkillOption[] = [
  { value: 'plumbing',   label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'gardening',  label: 'Gardening' },
  { value: 'carpentry',  label: 'Carpentry' },
  { value: 'painting',   label: 'Painting' },
  { value: 'cleaning',   label: 'Cleaning' },
] as const

export interface WorkerSearchFilters {
  /** Empty array means "no skill constraint". OR-matched against the worker's skills. */
  skills: SkillId[]
  /** Trimmed; omitted entirely when the user left the box empty. */
  location?: string
  /** Omitted entirely when the user left the box empty. */
  age?: number
}
```

Added in `src/features/job-seeker/types.ts` (UI-only — deliberately *not* in shared):

```ts
export interface WorkerCardView {
  id: string
  /** 1–2 uppercase letters derived from the worker's name. */
  initials: string
  name: string
  location: string
  /** At most MAX_CARD_SKILLS (2) human-readable skill labels. */
  skillLabels: readonly string[]
}

export type SearchMessageVariant = 'idle' | 'loading' | 'empty'
```

Verbatim copy, in `src/features/job-seeker/constants.ts` — these strings are acceptance-criteria text and must not be paraphrased:

```ts
export const SEARCH_IDLE_MESSAGE =
  'Start by selecting a skill or location to find workers near you.'          // AC4
export const SEARCH_EMPTY_MESSAGE =
  'No workers found matching your criteria. Try adjusting your filters.'      // AC3
export const SEARCH_LOADING_MESSAGE = 'Searching for workers…'
export const SEARCH_ERROR_MESSAGE =
  "We couldn't load workers right now. Please try again."
export const MAX_CARD_SKILLS = 2

/** AC1: "2 workers found" — singular form for exactly one. */
export function formatResultCount(count: number): string {
  return `${count} ${count === 1 ? 'worker' : 'workers'} found`
}
```

### 7.2 Zod Schemas

`src/features/job-seeker/validation.ts` — feature-local, because this filter form is used by nothing outside `job-seeker` (unlike `workerRegistrationSchema`, which the shared layer already owns):

```ts
import { z } from 'zod'
import { SKILL_IDS } from '@/shared/types'

// Age bounds are inlined here rather than imported from worker-registration —
// see plan §7.2 note / Open Question Q13.
const MIN_SEARCH_AGE = 18
const MAX_SEARCH_AGE = 70

export const workerSearchFilterSchema = z.object({
  // No .min(1) — unlike registration, zero skills is a valid search.
  skills: z.array(z.enum(SKILL_IDS)),

  location: z.string().trim().max(80, 'Location must be 80 characters or fewer'),

  // Kept as a string so an empty box is "no filter", not NaN.
  age: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\d+$/.test(v), 'Enter age as a whole number')
    .refine(
      (v) => v === '' || (Number(v) >= MIN_SEARCH_AGE && Number(v) <= MAX_SEARCH_AGE),
      `Enter an age between ${MIN_SEARCH_AGE} and ${MAX_SEARCH_AGE}`,
    ),
})

export type WorkerSearchFormValues = z.infer<typeof workerSearchFilterSchema>
```

`toSearchFilters(values)` in `mappers.ts` then drops empties:

```ts
export function toSearchFilters(values: WorkerSearchFormValues): WorkerSearchFilters {
  return {
    skills: values.skills,
    ...(values.location.trim() ? { location: values.location.trim() } : {}),
    ...(values.age.trim() ? { age: Number(values.age) } : {}),
  }
}
```

> **Rule 4 note on age bounds.** `MIN_WORKER_AGE`/`MAX_WORKER_AGE` currently live in `worker-registration/constants.ts` and are **not** exported from that feature's `index.ts`. Importing them from a sibling feature's internals would be a Rule 4 blocker. This plan inlines the bounds locally in `job-seeker/validation.ts` instead — a *search* range and a *registration eligibility rule* are different concerns that happen to share numbers today; coupling them via a barrel is worse than duplicating two integers. Flagged as Q13.

---

## 8. Routing

| Route Path | Component | Lazy? | Guard |
|---|---|---|---|
| `/seeker/search` | `JobSeekerSearchPage` | **Yes — already** (`React.lazy` in `src/app/Router.tsx`, inside the app-level `<Suspense fallback={<PageLoader />}>`) | None — ShiftSpot is login-less; there is no `RequireAuth` in this codebase |

**No routing changes.** `Router.tsx` is listed in §2.4 REUSE, not §2.2. Rule 6 (lazy load routes) is already satisfied by the existing entry. Filters are **not** reflected in the URL in this scope (Q8).

---

## 9. Accessibility Plan

*(Mandatory in full at Depth: High. Target: WCAG 2.2 Level AA.)*

### 9.1 Per-component ARIA and keyboard

| Component | ARIA Requirements | Keyboard Behavior |
|---|---|---|
| `WorkerSearchFilterBar` | Native `<form onSubmit>` with `aria-labelledby` pointing at a visually-present "Find workers" `<h2>` (or `aria-label="Worker search filters"` if the heading is design-suppressed) | Enter in Location or Age submits the form (native form behaviour — do **not** suppress it) |
| Skill chips (`MultiSelect`) | Existing pattern retained: `<fieldset>` named by the `FormField` `<label id="{id}-label">` via `aria-labelledby`; `aria-describedby` → error id when invalid. **`aria-required` becomes `false` here** via the new `required={false}` prop — skills are optional in search, and the current hardcoded `aria-required="true"` would be a false statement | Each chip is a real `<input type="checkbox" class="peer sr-only">` — natively focusable (`sr-only` clips, it does not `display:none`). Tab moves chip→chip in DOM order (6 stops); **Space** toggles. Focus is visible on the `<label>` via the existing `peer-focus-visible:ring-2 ring-offset-2 ring-brand-navy`. No custom key handlers, no `tabindex`, no roving focus — nothing to get wrong |
| Location input | `<label htmlFor>` from `FormField`; `aria-invalid` + `aria-describedby="{id}-error"` on error (already wired by `TextInput` + `FormField`) | Standard text-input behaviour |
| Age input | Same as Location, plus `inputMode="numeric"` and `autoComplete="off"`. **`type="text"`, not `type="number"`** — `type="number"` brings spinner buttons with sub-24px hit areas (2.5.8), silently swallows non-numeric input so the user never sees the validation message, and reports `''` for invalid content. Numeric-only is enforced by Zod instead (Q12) | Standard text-input behaviour |
| "Find Workers" `Button` | `type="submit"`; `aria-busy` while searching (already in `Button`). Label text stays "Find Workers" even while loading, so the accessible name does not change under the user | Enter/Space activate (native `<button>`) |
| Result count / messages | **One** `<div role="status" aria-live="polite" aria-atomic="true">` in `WorkerSearchResults`. It renders exactly one of: idle copy, loading copy, zero-results copy, or `"{n} workers found"`. `aria-atomic` makes each transition announce as a whole sentence rather than a diff | Not focusable — status changes are announced, not navigated to |
| Search error | `ErrorAlert` already has `role="alert"` (assertive). Its Retry `Button` is keyboard reachable | Tab to Retry, Enter/Space to refetch |
| `WorkerResultsGrid` | `role="list"` on the grid container. Needed because Tailwind's `display: grid` removes the implicit list semantics from `<ul>`, so a bare `<ul>` would announce no item count | Tab passes through — cards are non-interactive in this scope |
| `WorkerCard` | `role="listitem"`. Avatar initials are decorative duplication of the adjacent name → `aria-hidden="true"` on the initials span. The name is the card's `<h3>`. Location prefixed with a visually-hidden "Location: " so "Cochin" is not announced bare. Skill badges wrapped in a `<ul role="list">` with a visually-hidden "Skills" label | No keyboard interaction (nothing focusable). If Q11 later adds click-through, the card becomes a `<a>`/`<button>` and needs Enter/Space + a focus ring — deliberately deferred rather than half-built |
| Back link | Existing `<Link>` — unchanged | Native |

### 9.2 Colour contrast audit (SLPTWM-123 deliverable)

Computed against WCAG 2.x relative-luminance for every token pair this screen actually renders. Tokens: `navy #1b2a41`, `muted #55677e`, `amber #c99a2e`, `amber-bg #f3dfa4`, `border #e2e4e8`, `bg #ecedef`.

| Pair | Usage | Ratio | Required | Verdict |
|---|---|---|---|---|
| `muted` on white | Placeholder text, card location, unselected chip label | **5.71:1** | 4.5:1 (1.4.3) | **Pass** |
| `navy` on white | Headings, card names, input text | **15.0:1** | 4.5:1 | Pass |
| `navy` on `amber-bg` | Selected chip label | **10.87:1** | 4.5:1 | Pass |
| `navy` on `bg #ecedef` | Body text on page background | **13.1:1** | 4.5:1 | Pass |
| **`amber #c99a2e` on white** | **Selected-chip border, `hover:border-brand-amber`** | **2.56:1** | **3:1 (1.4.11 Non-text Contrast)** | **FAIL — Critical** |
| `amber-bg #f3dfa4` on white | Selected-chip fill | **1.32:1** | 3:1 if it is the sole state indicator | **FAIL as a standalone indicator** |
| `border #e2e4e8` on white | Unselected chip / input boundary | **1.27:1** | 3:1 (1.4.11, component boundary) | **FAIL — Major** |

**Two Critical/Major findings and their required fixes (these are the substance of SLPTWM-123's contrast item, not an optional polish):**

1. **Chip selected/hover border fails 1.4.11 at 2.56:1, and the pale fill at 1.32:1 cannot carry the state on its own.** Fix in `MultiSelect.tsx`: add token `brand-amber-dark #7a5d12` (**6.11:1** on white — clears both 3:1 and 4.5:1), use it for the selected border and the `hover:` border, thicken the selected chip to a 2px border, **and** render a small `aria-hidden` check glyph inside the selected chip so selection is conveyed by shape as well as colour (1.4.1 Use of Colour). The `amber-bg` fill is retained unchanged, so the approved visual identity survives. This does change the registration screen's chips — see Q5.
2. **Input and unselected-chip boundaries fail 1.4.11 at 1.27:1.** Note it as a design-system defect. **This plan does not change `border-brand-border`** — it is used on virtually every surface in the app and re-toning it is a design-system change far outside two subtasks' blast radius. Instead: raise it to the UI designer as Q6, and in the meantime ensure every input on *this* screen has a persistent visible `<label>` (it does, via `FormField`) so the control is identifiable without relying on its border.

### 9.3 WCAG 2.2-specific criteria

| Criterion | Status |
|---|---|
| 2.4.11 Focus Not Obscured (Min) — AA | Pass. No sticky/overlay chrome on this page; the existing `ring-offset-2` focus ring is not clipped. Must be re-verified once the filter bar becomes a wrapping column below 1280px |
| 2.5.8 Target Size (Min) 24×24 — AA | Pass. Chips `px-4 py-2 text-sm` ≈ 36px tall; inputs `py-2.5` ≈ 40px; `Button` `py-2.5` ≈ 40px. Second reason Age uses `type="text"` — `type="number"` spinners are ~13px |
| 2.5.7 Dragging Movements — AA | Confirmed not applicable, because no interaction on this screen uses dragging |
| 3.2.6 Consistent Help — A | Confirmed not applicable, because this screen exposes no help mechanism |
| 3.3.7 Redundant Entry — A | Confirmed not applicable, because the search is a single-step form with no re-entry of previously supplied data |
| 3.3.8 Accessible Authentication — AA | Confirmed not applicable, because ShiftSpot has no authentication |
| 1.4.10 Reflow (320px, no 2-D scroll) | Addressed by §11.4's mobile-first stacking; must be verified at 320px |

### 9.4 Responsive design plan (SLPTWM-123 deliverable)

Tailwind breakpoints: `sm 640` · `md 768` · `lg 1024` · `xl 1280`. "Below 1280px" therefore means everything under `xl`.

| Region | ≥1280 (`xl`) | 1024–1279 (`lg`) | 640–1023 (`sm`/`md`) | <640 |
|---|---|---|---|---|
| Page container | `max-w-6xl px-6` | `max-w-6xl px-6` | `px-6` | `px-4` |
| Filter bar | `lg:flex-row lg:items-end` — chips take remaining width, Location/Age fixed, Button trailing | Same row layout, Location/Age narrower | Chips full-width on their own row; Location + Age side-by-side (`sm:grid-cols-2`); Button full-width below | Everything stacked, one column; Button `w-full` |
| Skill chips | Single wrapping row | `flex-wrap` wraps to 2 rows | 2–3 rows | Wraps freely; `gap-2.5` retained so 24×24 targets never collide |
| Results grid | `xl:grid-cols-3` | `lg:grid-cols-2` | `sm:grid-cols-2` | `grid-cols-1` |
| Result-count / messages | Left-aligned above the grid | Same | Same | Same |
| Empty & idle states | Centred panel, `max-w-md` | Same | Same | Full width, `px-4` |
| Header | Row, logo left / back-link right | Same | Same | `flex-col` stack (mirrors `WorkerRegistrationPage`'s footer pattern) |

Written mobile-first (base classes = narrowest), with `sm:`/`lg:`/`xl:` as progressive enhancement — the same direction the existing pages use.

---

## 10. Error Handling Plan

| Scenario | Handling |
|---|---|
| **No search performed yet (AC4)** | `appliedFilters === null` → `WorkerSearchMessage variant="idle"`, rendering **exactly**: `Start by selecting a skill or location to find workers near you.` No grid, no count text |
| **Search in flight (AC: loading indicator)** | `isLoading` → `WorkerSearchMessage variant="loading"` in the live region (`Searching for workers…`) **and** `Button isLoading` (`disabled` + `aria-busy`), preventing double-submit. The previous result grid is unmounted while loading, so a stale count is never shown next to a spinner |
| **Zero results (AC3)** | `!isLoading && !isError && data.length === 0` → `WorkerSearchMessage variant="empty"`, rendering **exactly**: `No workers found matching your criteria. Try adjusting your filters.` Distinguished from idle solely by `appliedFilters !== null` — never by `data === undefined` |
| **Results found (AC1)** | `data.length > 0` → live region shows `formatResultCount(n)` (`"2 workers found"`, `"1 worker found"`), followed by `WorkerResultsGrid` |
| **Search API fails** | `isError` → `ErrorAlert` (`role="alert"`) with `error.message` from the normalised `ApiError`, falling back to `SEARCH_ERROR_MESSAGE`; its Retry button calls `refetch()`. Filter values are **preserved** in the form so the user retypes nothing. `retry: 0` keeps the failure immediate and honest rather than hanging for three silent retries |
| **Age is non-numeric** (SLPTWM-122 item 6) | Blocked at submit by `workerSearchFilterSchema`; `FormField` renders `Enter age as a whole number` in a `role="alert"` paragraph; `TextInput invalid` paints the red border/bg and sets `aria-invalid`. **`appliedFilters` is not touched**, so a validation failure never clears an existing result set |
| **Age out of 18–70** | Same mechanism, message `Enter an age between 18 and 70` |
| **Location over 80 chars** | Same mechanism, message `Location must be 80 characters or fewer` |
| **All filters empty at submit** | Treated as browse-all: schema passes, `toSearchFilters` yields `{ skills: [] }`, the mock matches every worker, results render normally. No invented copy, and AC4 is untouched because it governs the pre-search state only (Q4) |
| **Render-time exception anywhere in the feature** | The feature-root `ErrorBoundary` inside `JobSeekerSearchPage` (Rule 7) catches it and shows the shared fallback, keeping the page header/footer chrome intact instead of blanking the whole app via the `App.tsx` boundary |
| **Query rejects with a non-`ApiError` shape** | `useWorkerSearch` is typed `useQuery<Worker[], ApiError>`; the mock always resolves, and once real, `apiClient`'s interceptor normalises every failure to `ApiError` before it reaches Query. The `errorMessage` prop is optional with a constant fallback, so an unexpected shape degrades to canned copy rather than rendering `undefined` |

---

## 11. Performance Considerations

*(Mandatory in full at Depth: High.)*

### 11.1 Bundle and code splitting

| Concern | Approach |
|---|---|
| Route code splitting | Confirmed already satisfied — `Router.tsx` lazy-loads `JobSeekerSearchPage` under the app `<Suspense>`. No new `React.lazy` call needed |
| New dependencies | **None.** Every need is met by packages already in `package.json` (`@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`). Net third-party bundle delta: 0 bytes |
| Feature-barrel over-export | `job-seeker/index.ts` exports only the page, the hook and the types — not the internal components |
| Shared-layer growth | `SKILL_OPTIONS` moves into `shared/types` rather than being duplicated; `worker-registration/constants.ts` re-exports it — net-neutral |

### 11.2 Re-render behaviour

| Concern | Approach |
|---|---|
| Filter typing re-rendering the results grid | Draft filters live in RHF *inside* `WorkerSearchFilterBar`, uncontrolled by design — keystrokes cannot re-render the page or the grid |
| Chip toggles re-rendering the grid | `MultiSelect` bound via an RHF `Controller`, re-renders only that field's subtree |
| `onSearch` / `onRetry` identity | Wrapped in `useCallback` in `JobSeekerSearchPage` |
| Card-view projection | `useMemo(() => workers.map(toWorkerCardView), [workers])` in `WorkerSearchResults` |
| Grid item churn | `WorkerCard` keyed by `worker.id` (UUID) — never by array index |
| `React.memo` on `WorkerCard` | Deliberately not applied — parent already re-renders only on a new result set; revisit only if Q9's pagination lands |

### 11.3 Data and network

| Concern | Approach |
|---|---|
| Duplicate searches | `staleTime: 30_000` — re-clicking with unchanged filters is served from cache |
| Accidental refetch storms | `refetchOnWindowFocus: false` already global; `enabled` keeps the query dormant until first submit |
| Query-key thrash | Key's third element is the committed `appliedFilters` state object, not a fresh per-render literal |
| Long lists (>100 cards) | **Confirmed not applicable at this scope, because** the seeded population is well under 100 and no pagination contract exists. Virtualisation not introduced — explicit trigger for revisiting noted if BE returns >100 unpaginated workers |

### 11.4 Rendering cost and layout

| Concern | Approach |
|---|---|
| Layout thrash from responsive grid | Pure CSS Grid, static breakpoint column counts — no JS measurement |
| CLS on state transitions | Idle/loading/empty panels share one `min-h-*` wrapper; fixed-size avatar circles prevent shift |
| Web font | Already loaded globally; no new family/weight introduced |
| Animation cost | Only colour/`transform` transitions on chips — compositor-friendly |
| Mock latency | `MOCK_LATENCY_MS = 600` for a visible dev loading state — not a real-network measurement |

---

## 12. Standards Compliance Checklist

- [x] All components are functional — no class components (shared `ErrorBoundary` is the pre-approved exception)
- [x] All props interfaces defined with `[ComponentName]Props` naming
- [x] No `any` types — strict TypeScript throughout
- [x] Every new feature folder has an `index.ts` public API
- [x] No cross-feature internal imports — age bounds inlined rather than reaching into `worker-registration` internals (Q13); `WorkerSearchFilters` lives in `shared/types` since shared may never import from a feature
- [x] Every new page is lazy-loaded with `React.lazy` + `Suspense` (already true)
- [x] Every feature root wrapped in an Error Boundary
- [x] All interactive elements are keyboard-accessible
- [x] All images have `alt` text; all inputs have `<label>` elements
- [x] `aria-label` / `aria-describedby` used where visual context is insufficient
- [x] TanStack Query used for server state
- [x] Zustand used only for global state (none added)
- [x] All API calls go through the service layer
- [x] Forms use React Hook Form + Zod
- [x] Unit tests planned — see below
- [x] Confidential data / env-specific endpoints read from `import.meta.env.VITE_*` (no new env var needed)

**Intended test set (owned by the Unit Test Agent, Parallel Block B — excluded from the Plan Checksum):**

| Test file | Must cover |
|---|---|
| `JobSeekerSearchPage.test.tsx` (rewrite) | Idle message (AC4, verbatim); search → count + grid (AC1); zero-results (AC3, verbatim); loading indicator; back-link nav |
| `WorkerSearchFilterBar.test.tsx` | Chip toggles; Space activates; non-numeric Age blocks submit; valid submit calls `onSearch`; Button `aria-busy` while searching |
| `WorkerSearchResults.test.tsx` | All four branches render correctly; error branch `role="alert"` + Retry |
| `WorkerCard.test.tsx` | Initials from one/multi-word names; at most 2 skill badges |
| `mappers.test.ts` | `toWorkerCardView` edge cases; `toSearchFilters` drops empty location/age |
| `useWorkerSearch.test.ts` | Disabled with `null` filters; happy path; failure surfaces `isError` |
| `mockWorkerApi.test.ts` | Skill OR-match; location substring; age match; AND across dimensions; empty filter returns all |
| `MultiSelect.test.tsx` (extend) | `required={false}` → `aria-required="false"`; default keeps `"true"` (registration regression guard) |

---

## 13. Open Questions

| # | Question | Assumption written into this plan | Owner | Blocking? | Resolution Needed By |
|---|---|---|---|---|---|
| Q1 | Age filter semantics — exact, max, or range? | Exact match (`worker.age === age`) | PO / BA | Potentially | Before Coding Agent starts |
| Q2 | Location matching — substring, exact, or dropdown? | Case-insensitive substring | PO / BE | No | Before merge |
| Q3 | Mock seed data needed — AC1 not demonstrable on empty store; do seeded workers occupy uniqueness maps? | Seed ~8 demo workers using `@seed.shiftspot.test` addresses to avoid collisions | Tech Lead | **Yes** | Before Coding Agent starts |
| Q4 | All filters empty at submit — browse-all or block? | Browse-all | PO / UX | No | Before merge |
| Q5 | Amber contrast fix changes already-signed-off registration chips — accept shared fix or fork styling? | Accept shared fix (Rule 5 Critical) | UI Designer + Tech Lead | Potentially | Before merge |
| Q6 | `border-brand-border` fails 1.4.11 app-wide — fix now or defer? | Defer as design-system debt; mitigate via persistent labels | UI Designer | No | Next design-system pass |
| Q7 | "1 worker found" singular vs literal AC template? | Pluralise properly | PO | No | Before merge |
| Q8 | Should filters live in the URL? | No | PO | No | Future story |
| Q9 | Real endpoint contract / pagination / cross-invalidation on registration? | Bare `Worker[]`, no pagination, no invalidation | BE | No | Before BE subtask starts |
| Q10 | Which 2 skills shown on card when worker has 4+? | First two as stored, no overflow indicator | UI Designer | No | Before merge |
| Q11 | Is card click-through in scope? | No — non-interactive | PO | No | Future story |
| Q12 | Age input `type="number"` vs `type="text"`? | `type="text" inputMode="numeric"` | UI Designer | No | Before merge |
| Q13 | Age bounds duplication vs importing from worker-registration barrel? | Inline locally | Tech Lead | No | Before merge |
| Q14 | Debounced live search instead of button click? | Explicit button per SLPTWM-122 wording | PO | No | Future story |
| Q15 | Live-region politeness for results vs errors? | `polite`+`atomic` for results; `assertive` (existing `role="alert"`) for errors | A11y reviewer | No | Before merge |
| Q16 | `useWorkerSearch` in shared/hooks (like registration) or feature-local? | Feature-local — smaller shared blast radius | Tech Lead | No | Before Coding Agent starts |
| Q17 | Does seeded mock data collide with existing registration tests? | `@seed.shiftspot.test` domain avoids collision; full suite must be run, not just changed-file scope | Unit Test Agent | No | Parallel Block B |
| Q18 | Does `staleTime: 30_000` risk stale results right after a registration? | Acceptable for PoC; tied to Q9 | Tech Lead | No | Before merge |

---

## 14. Approval Sign-Off

```
Reviewed by:    [Tech Lead name]
Date reviewed:  [YYYY-MM-DD]
Decision:       Approved | Rework required
Notes:          Escalation: 4 files under src/shared/** plus tailwind.config.js are modified.
                Please confirm Q3 (mock seed data — AC1 is not demonstrable without it),
                Q5 (the amber contrast fix visibly changes the signed-off Worker Registration
                chips), and Q1 (exact vs maximum age matching) before the Coding Agent starts.
```
