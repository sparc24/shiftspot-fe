```
Story / Task ID:      SLPTWM-116  →  FE scope: SLPTWM-126, SLPTWM-127
Title:                Worker Profile Detail View with Contact Information
Issue Type:           Story (parent) — planned scope is its [FE] + [UI] subtasks
Depth:                High
Author:               Planning Agent
Date:                 2026-09-08
Status:               Approved
Reviewer:             Tech Lead / Architect
Related PRD:          ShiftSpot PoC — Worker Directory
Sprint:               Current
```

---

## 1. Summary of Change

Implements the two FE/UI-scoped subtasks of SLPTWM-116: **SLPTWM-126 [FE] Worker Detail Screen: Profile Data Fetching and State Management** and **SLPTWM-127 [UI] Worker Profile Detail — Interactive States, Error State, and Accessibility**.

A new lazy-loaded `WorkerProfilePage` is added at `/seeker/worker/:workerId`. It reads the worker id from the route, fetches the full worker record through a new `workerService.getWorker(id, signal)` (backed by a new `mockWorkerApi.getWorkerById`), and renders one of three mutually exclusive states: loading, "Profile Not Found" (AC3), or the full profile — Profile Header (avatar/name/location/age), the complete skill-chip row, and a Contact Panel with clickable `tel:`/`mailto:` rows plus a Contact Worker action (AC1/AC2). SLPTWM-127 supplies the warning-panel treatment for the not-found state and the hover/focus/active/disabled treatments and WCAG 2.2 AA focus indicators for every interactive element on the screen, using existing `brand-*` design tokens only.

The end state: a job seeker can open a worker card from the search results, see full contact details, act on them, and return to their results; a stale or deleted id yields a clear "Profile Not Found" panel and renders no profile components at all.

**Explicitly out of FE scope** (BE/QA subtasks of SLPTWM-116): real `GET /workers/{id}` implementation, persistence, and manual test execution.

---

## 2. Scope of Change

### 2.1 Files to CREATE

| File Path | Type | Purpose |
|---|---|---|
| `src/features/job-seeker/WorkerProfilePage.tsx` | Page | Lazy-loaded detail page; reads `:workerId`, owns the loading/not-found/error/success switchboard, back link, page chrome |
| `src/features/job-seeker/hooks/useWorkerProfile.ts` | Hook | `useQuery<Worker, ApiError>` fetch-by-id with `signal` wiring, `enabled` guard, `retry: 0` |
| `src/features/job-seeker/components/WorkerProfileHeader.tsx` | Component (Presentational) | AC1 header: avatar initials, name, location, age; composes `SkillChipList` |
| `src/features/job-seeker/components/SkillChipList.tsx` | Component (Presentational) | Reusable `role="list"` skill-chip row, extracted from `WorkerCard`'s private `SkillBadge` |
| `src/features/job-seeker/components/WorkerContactPanel.tsx` | Component (Presentational) | AC2 panel: Phone + Email `ContactRow`s and the Contact Worker action |
| `src/features/job-seeker/components/ContactRow.tsx` | Component (Presentational) | One icon-badge + label + value contact link row (`tel:` / `mailto:`) |
| `src/features/job-seeker/components/ContactIcons.tsx` | Component (Presentational) | Inline `<svg aria-hidden>` `PhoneIcon` / `MailIcon` — no icon dependency added |
| `src/features/job-seeker/components/ProfileNotFound.tsx` | Component (Presentational) | AC3 warning panel, `role="alert"`, amber accent-bar pattern + back link |

**CREATE total: 8**

> Co-located `*.test.tsx` / `*.test.ts` files are authored by the Unit Test Agent in Block B and are deliberately **not** counted in this checksum, matching how `WorkerCard.test.tsx`, `workerService.search.test.ts`, etc. were produced for SLPTWM-115.

### 2.2 Files to MODIFY

| File Path | What Changes | Risk |
|---|---|---|
| `src/app/Router.tsx` | Add `const WorkerProfilePage = lazy(() => import('@/features/job-seeker').then(m => ({ default: m.WorkerProfilePage })))` and `<Route path="/seeker/worker/:workerId" element={<WorkerProfilePage />} />` above the catch-all | Low |
| `src/features/job-seeker/index.ts` | Export `WorkerProfilePage`, `useWorkerProfile`, and the new view types | Low |
| `src/features/job-seeker/components/index.ts` | Export `ContactRow`, `ProfileNotFound`, `SkillChipList`, `WorkerContactPanel`, `WorkerProfileHeader` (alphabetical, matching current order) | Low |
| `src/features/job-seeker/hooks/index.ts` | `export { useWorkerProfile } from './useWorkerProfile'` | Low |
| `src/features/job-seeker/types.ts` | Add `WorkerProfileView`, `ContactRowView`; leave `WorkerCardView` unchanged | Low |
| `src/features/job-seeker/mappers.ts` | Add `toWorkerProfileView(worker)`; reuse the existing private `toInitials` internally | Low |
| `src/features/job-seeker/constants.ts` | Add profile-screen copy constants (Section 10.1) | Low |
| `src/features/job-seeker/components/WorkerCard.tsx` | Wrap the card body in `<Link to={`/seeker/worker/${worker.id}`}>`; replace private `SkillBadge` with `SkillChipList`; move `role="listitem"` to the outer wrapper so the link is the card's single accessible name | **Medium** — existing `WorkerCard.test.tsx` asserts current DOM shape and will need updating |
| `src/shared/api/mockWorkerApi.ts` | Add `getWorkerById(id, signal?)`; make the private `delay()` abort-aware (optional `signal` param — existing callers unaffected); export `getWorkerById` from the `mockWorkerApi` object | **Medium** — shared file (EscalationFlag) |
| `src/shared/services/workerService.ts` | Add `getWorker(id: string, signal?: AbortSignal): Promise<Worker>` delegating to the mock, with the same "single swap point" comment convention as its siblings | **Medium** — shared file (EscalationFlag) |
| `src/shared/types/worker.ts` | Add `export const WORKER_NOT_FOUND = 'WORKER_NOT_FOUND'` so the mock and the UI agree on the 404 discriminator without a magic string | **Medium** — shared public type module |
| `src/shared/types/index.ts` | Re-export `WORKER_NOT_FOUND` alongside `SKILL_IDS` / `SKILL_OPTIONS` | Low |

**MODIFY total: 12**

### 2.3 Files to DELETE

| File Path | Reason for Deletion |
|---|---|
| — | None. |

**DELETE total: 0**

> **Plan Checksum: CREATE 8 · MODIFY 12 · DELETE 0**

### 2.4 Files to REUSE (no changes)

| File Path | How It Is Used |
|---|---|
| `src/shared/components/ErrorBoundary.tsx` | Wraps the profile `<main>`, mirroring `JobSeekerSearchPage` |
| `src/shared/components/ErrorAlert.tsx` | Non-404 fetch failures only (red `role="alert"` + Retry). Never used for AC3 |
| `src/shared/components/Button.tsx` | The **disabled** Contact Worker fallback, and any Retry affordance |
| `src/shared/components/index.ts` | Import surface for the three above |
| `src/shared/types/index.ts` (read side) | `Worker`, `ApiError`, `SKILL_OPTIONS` |
| `src/features/worker-registration/WorkerRegistrationPage.tsx` | **Visual reference only** — the duplicate-email amber banner markup copied into `ProfileNotFound`. No import (cross-feature internal import would violate Rule 4) |
| `src/index.css` | Global `:focus-visible { @apply outline-none ring-2 ring-offset-2 ring-brand-navy }` — already satisfies the baseline focus indicator for every element |
| `tailwind.config.js` | Existing `brand-*` tokens only; SLPTWM-127 confirms no new tokens |

---

## 3. Component Tree

```
WorkerProfilePage (Page — React.lazy via Router)
  ├── <header> ShiftSpot bar
  │     └── <Link to="/seeker/search">  ← Back to search results
  ├── ErrorBoundary (shared)
  │     └── <main>
  │           ├── <div role="status" aria-live="polite" aria-atomic>   (loading / state announcements)
  │           ├── ProfileNotFound                     ← AC3 only (WORKER_NOT_FOUND)
  │           ├── ErrorAlert (shared)                 ← non-404 failure only, with Retry
  │           └── <article aria-labelledby="worker-profile-name">   ← success only
  │                 ├── WorkerProfileHeader
  │                 │     ├── avatar <span aria-hidden> (initials)
  │                 │     ├── <h1 id="worker-profile-name">
  │                 │     ├── location / age meta line
  │                 │     └── SkillChipList  (role="list", all skills — not sliced)
  │                 └── WorkerContactPanel
  │                       ├── ContactRow  (Phone) → ContactIcons.PhoneIcon  → <a href="tel:…">
  │                       ├── ContactRow  (Email) → ContactIcons.MailIcon   → <a href="mailto:…">
  │                       └── Contact Worker action
  │                             ├── <a href={mailtoHref}>  (default)
  │                             └── Button disabled        (no contactable channel)
  └── <footer>
```

The three branches under `<main>` are **mutually exclusive** — AC3 requires that no profile component render on the not-found path, so the switchboard is a single `if/else if/else`, not independent conditional blocks (the mistake `WorkerSearchResults` deliberately avoids with its `hasSearched &&` guards).

---

## 4. Component Specifications

| Component | Type | Props Interface | State | Notes |
|---|---|---|---|---|
| `WorkerProfilePage` | Page | none | `useParams` + `useWorkerProfile` | Lazy-loaded; wraps content in `ErrorBoundary`; owns the state switchboard and `useMemo` mapping to the view model |
| `useWorkerProfile` | Hook | `(workerId: string \| undefined)` | TanStack Query | `enabled: Boolean(workerId)`; `retry: 0`; `staleTime: 30_000`; passes `signal` through |
| `WorkerProfileHeader` | Presentational | `WorkerProfileHeaderProps` | none | Renders the `<h1>` that names the `<article>`; composes `SkillChipList` |
| `SkillChipList` | Presentational | `SkillChipListProps` | none | `role="list"` + `aria-label`; also adopted by `WorkerCard` to remove the duplicated `SkillBadge` |
| `WorkerContactPanel` | Presentational | `WorkerContactPanelProps` | none | Renders two `ContactRow`s + the Contact Worker action |
| `ContactRow` | Presentational | `ContactRowProps` | none | Icon badge + visible label + value, wrapped in one anchor |
| `ContactIcons` | Presentational | `IconProps` (`className?`) | none | Two exported inline SVGs, `aria-hidden="true"`, `focusable="false"` |
| `ProfileNotFound` | Presentational | `ProfileNotFoundProps` | none | `role="alert"`; amber accent-bar warning panel + back-to-search link |

**Props interfaces to define:**

```ts
// components/WorkerProfileHeader.tsx
interface WorkerProfileHeaderProps {
  /** Pre-mapped view model — the component performs no derivation. */
  profile: WorkerProfileView
}

// components/SkillChipList.tsx
interface SkillChipListProps {
  labels: readonly string[]
  /** Accessible name for the list, e.g. "Skills". */
  ariaLabel?: string
  /** Chip size — 'sm' for the search card, 'md' for the profile header. */
  size?: 'sm' | 'md'
}

// components/WorkerContactPanel.tsx
interface WorkerContactPanelProps {
  phone: ContactRowView
  email: ContactRowView
  /** mailto href for the primary CTA; undefined renders the disabled Button. */
  contactHref?: string
  /** Used in the CTA's accessible name: "Contact Anita Kumar by email". */
  workerName: string
}

// components/ContactRow.tsx
interface ContactRowProps {
  /** Visible field label, e.g. "Phone". */
  label: string
  /** Human-readable value shown to the user, e.g. "+91-900-000-0001". */
  value: string
  /** Normalised href — `tel:+919000000001` / `mailto:a@b.test`. */
  href: string
  /** Rendered inside the circular badge; must be aria-hidden. */
  icon: ReactNode
}

// components/ProfileNotFound.tsx
interface ProfileNotFoundProps {
  title?: string        // defaults to PROFILE_NOT_FOUND_TITLE
  description?: string  // defaults to PROFILE_NOT_FOUND_DESCRIPTION
}

// components/ContactIcons.tsx
interface IconProps {
  className?: string
}
```

---

## 5. State and Data Flow

### 5.1 State Ownership

| State | Type | Owner | Rationale |
|---|---|---|---|
| `workerId` | Route state | `useParams<{ workerId: string }>()` in `WorkerProfilePage` | URL is the source of truth for which profile is shown — no mirror in `useState`, no Zustand |
| `worker` (server record) | Server state | TanStack Query — `useWorkerProfile(workerId)` | Remote data: Query owns caching, in-flight dedupe, cancellation, and the loading/error flags. Rule: no `useEffect` + `useState` fetching |
| `isLoading` / `isError` / `error` | Derived server state | TanStack Query result | Read straight off the query result; never copied into local state |
| `profileView` (mapped view model) | Derived UI value | `useMemo(() => data && toWorkerProfileView(data), [data])` in `WorkerProfilePage` | Same pattern as `WorkerSearchResults`' `cardViews` memo |
| Not-found vs. generic-error branch | Derived UI value | `error?.code === WORKER_NOT_FOUND` in `WorkerProfilePage` | Discriminated off the shared `ApiError.code`; no extra state |
| Hover / focus / active / disabled visuals | CSS state | Tailwind pseudo-class utilities | No JS state — SLPTWM-127 is entirely declarative |
| Back-navigation target | Constant | `/seeker/search` link, not `navigate(-1)` | Deterministic and deep-link-safe (see Q6) |

**No Zustand, no React Hook Form, no Context is introduced by this task.** There is no form and no cross-route shared state.

### 5.2 TanStack Query Keys

| Query Key | Hook | Invalidated By |
|---|---|---|
| `['workers', 'detail', workerId]` | `useWorkerProfile(workerId)` | Nothing today — the PoC has no worker-edit mutation. Namespaced under `'workers'` so a future `invalidateQueries({ queryKey: ['workers'] })` sweeps both search and detail |
| `['workers', 'search', filters]` | `useWorkerSearch` (existing, unchanged) | — |

`staleTime: 30_000` matches `useWorkerSearch`, so navigating search → detail → back → detail within 30s is instant and issues no second request.

### 5.3 Zustand Store Changes

| Store | Slice | Change |
|---|---|---|
| — | — | No Zustand changes. |

### 5.4 Request Cancellation Design (SLPTWM-126 explicit AC)

TanStack Query v5 passes an `AbortSignal` into `queryFn` and aborts it when the observer unmounts or the key changes. Nothing in this codebase uses it yet; this task introduces the pattern end-to-end:

1. `useWorkerProfile` destructures `({ signal })` from the `QueryFunctionContext` and forwards it to `workerService.getWorker(id, signal)`.
2. `workerService.getWorker` forwards it to `mockWorkerApi.getWorkerById(id, signal)` — and the "single swap point" comment documents the live equivalent: `apiClient.get<Worker>(\`/workers/${id}\`, { signal })` (Axios honours `signal` natively, so the swap is still a one-body change).
3. `mockWorkerApi`'s private `delay()` gains an optional `signal`: it clears its `setTimeout` and rejects with `signal.reason` on abort, and short-circuits if `signal.aborted` is already true when called. Existing `createWorker` / `searchWorkers` callers pass nothing and are behaviourally unchanged.

**Why bother, given the mock has no socket to close:** without this, unmounting mid-flight still resolves the 600 ms timer, keeping the closure and the seeded `workerList` reference alive and letting a stale resolution win a race if the user rapid-fires two different ids. More importantly, the abort contract is the part that has to exist *before* the real endpoint lands — retrofitting it after would touch all three layers again. The mock's abort rejection is a plain `DOMException`/`signal.reason`, **not** an `ApiError`; Query discards aborted-query results rather than routing them to `error`, so the UI never has to render it — but `useWorkerProfile`'s type contract stays `ApiError` and the mock must not translate an abort into a `WORKER_NOT_FOUND` (that would flash the AC3 panel on a fast navigate-away).

---

## 6. Services and API

### 6.1 New or Modified Endpoints

| Method | Path | Request | Response | Auth |
|---|---|---|---|---|
| `GET` | `/workers/{id}` | Path param `id: string` | `200 Worker` · `404 { code: 'WORKER_NOT_FOUND', message }` | None (PoC has no login — the directory is public by design) |

Base URL comes from `import.meta.env.VITE_API_BASE_URL` via the existing `apiClient`; nothing is hardcoded. Today the mock intercepts before any HTTP call is made.

### 6.2 Service Layer

| Service File | Method | What It Does |
|---|---|---|
| `src/shared/services/workerService.ts` | `getWorker(id, signal?)` | Delegates to `mockWorkerApi.getWorkerById`; documented swap point to `apiClient.get<Worker>(\`/workers/${id}\`, { signal })` |
| `src/shared/api/mockWorkerApi.ts` | `getWorkerById(id, signal?)` | Abort-aware `delay(MOCK_LATENCY_MS, signal)`, then `workerList.find(w => w.id === id)`; resolves the `Worker` or rejects with the `WORKER_NOT_FOUND` `ApiError` |
| `src/shared/api/mockWorkerApi.ts` | `delay(ms, signal?)` *(modified private helper)* | Clears its timer and rejects with `signal.reason` on abort; unchanged for callers that pass no signal |

Rejection shape (must match `ApiError` exactly so `useQuery<Worker, ApiError>` stays honest):

```ts
const notFound: ApiError = {
  code: WORKER_NOT_FOUND,
  message: 'Profile Not Found',
}
```

`workerList` is the authoritative lookup source (it holds both seeds and runtime registrations); `workersByEmail` / `workersByPhone` are uniqueness indexes and must not be used here. A linear `find` over ≤ a few dozen records is correct for the PoC — no id index is added (see Q12).

---

## 7. Types and Validation

### 7.1 TypeScript Types

```ts
// src/shared/types/worker.ts  (added)
/** Discriminator for the 404 branch — shared by the mock API and the detail UI. */
export const WORKER_NOT_FOUND = 'WORKER_NOT_FOUND'

// src/features/job-seeker/types.ts  (added)
export interface ContactRowView {
  /** Human-readable value as stored, e.g. "+91-900-000-0001". */
  value: string
  /** Protocol href — `tel:` (digits and a leading + only) or `mailto:`. */
  href: string
}

export interface WorkerProfileView {
  id: string
  /** 1–2 uppercase letters, same derivation as WorkerCardView. */
  initials: string
  name: string
  location: string
  age: number
  /** Pre-formatted, e.g. "Age 29" — keeps formatting out of JSX. */
  ageLabel: string
  /** ALL skill labels — unlike WorkerCardView, never sliced to MAX_CARD_SKILLS. */
  skillLabels: readonly string[]
  phone: ContactRowView
  email: ContactRowView
}
```

No change to `Worker` / `WorkerRegistrationPayload` — `phone`, `email`, and `age` already exist on the persisted record; the search view simply never projected them.

### 7.2 Zod Schemas

**Confirmed not applicable, because** this screen has no form and accepts no user-typed input. The only external value is the `:workerId` path segment, which is an opaque server-issued identifier (`seed-0001` or a `crypto.randomUUID()`) — client-side shape validation would either reject valid future id formats or duplicate the server's existence check. An id that does not resolve is handled by the same AC3 not-found path as a deleted profile, which is the correct user-visible outcome for both. React Router already URL-decodes the segment, and every use is either a lookup key or React text content (auto-escaped), so there is no injection surface.

---

## 8. Routing

| Route Path | Component | Lazy? | Guard |
|---|---|---|---|
| `/` | `LandingPage` | Yes | none *(existing)* |
| `/worker/register` | `WorkerRegistrationPage` | Yes | none *(existing)* |
| `/seeker/search` | `JobSeekerSearchPage` | Yes | none *(existing)* |
| **`/seeker/worker/:workerId`** | **`WorkerProfilePage`** | **Yes** | **none — public directory, consistent with every other route** |
| `*` | `<Navigate to="/" replace />` | — | *(existing — must stay last)* |

Router details:
- Registered **above** the `*` catch-all; otherwise the redirect swallows it.
- Nested under `/seeker/` so the seeker journey stays one URL family (`search` → `worker/:id`). `/seeker/worker/:workerId` cannot collide with `/seeker/search` — different second segments.
- Lazy-loaded through the feature barrel using the exact existing idiom: `lazy(() => import('@/features/job-seeker').then(m => ({ default: m.WorkerProfilePage })))`. Both seeker pages therefore share one `job-seeker` chunk, which is desirable — the detail page is only ever reached from search.
- The existing app-level `<Suspense fallback={<PageLoader />}>` in `Router.tsx` covers it; no new Suspense boundary.
- **Missing/empty param** (`/seeker/worker/`) is matched by the catch-all and redirects to `/`. Defensively, `useWorkerProfile` is `enabled`-guarded on `Boolean(workerId)` and the page renders `ProfileNotFound` when `workerId` is undefined — no request is fired.
- Forward navigation comes from `WorkerCard`'s new `<Link to={\`/seeker/worker/${worker.id}\`}>`. Ids are opaque strings that may one day contain URL-significant characters; the link builder wraps the id in `encodeURIComponent`.

---

## 9. Accessibility Plan *(mandatory at Depth: High — SLPTWM-127's primary deliverable)*

### 9.1 Per-component ARIA and keyboard contract

| Component | ARIA Requirements | Keyboard Behavior |
|---|---|---|
| `WorkerProfilePage` | Exactly one `<h1>` per render branch — the worker's name on success, the not-found title on AC3. `<main>` landmark, `<header>`/`<footer>` landmarks. `<div role="status" aria-live="polite" aria-atomic="true">` announces the loading message and the resolved outcome | Tab order follows DOM: skip-free — back link → contact rows → CTA |
| Back link | `<Link to="/seeker/search">`; `←` glyph wrapped in `aria-hidden="true"` so the accessible name is "Back to search results", not "left arrow Back…" | Native link: Tab focus, Enter activates |
| Profile `<article>` | `aria-labelledby` pointing at the `<h1 id="worker-profile-name">` | Not focusable — it is a container, not a control |
| Avatar initials | `aria-hidden="true"` (decorative duplicate of the adjacent name) — matches `WorkerCard`. It is a styled `<span>`, not an `<img>`, so no `alt` applies | n/a |
| Location / age | Visually a `·`-separated meta line; each value preceded by an `<span className="sr-only">` label ("Location: ", "Age: ") so the `·` is never read as content. The `·` itself is `aria-hidden="true"` | n/a |
| `SkillChipList` | `<ul role="list" aria-label="Skills">` with `<li>` chips — `role="list"` is explicit because Tailwind's `list-none` strips list semantics in Safari/VoiceOver (the reason `WorkerCard` already does this) | n/a — chips are static text, not filters, and must not be focusable |
| `WorkerContactPanel` | `<section aria-labelledby="contact-heading">` with a visible `<h2 id="contact-heading">Contact</h2>` | n/a |
| `ContactRow` (Phone) | One `<a href="tel:…">` wrapping badge + label + value so there is a single tab stop. Icon `aria-hidden="true" focusable="false"`. Accessible name reads "Phone +91-900-000-0001" from the visible label and value — no `aria-label` override, so the visible label remains the accessible-name prefix (WCAG 2.5.3 Label in Name) | Tab focus; Enter activates |
| `ContactRow` (Email) | Same, `<a href="mailto:…">` | Same |
| Contact Worker CTA | `<a href={mailtoHref}>` with `aria-label={\`Contact ${workerName} by email\`}` — the visible text "Contact Worker" is contained in the accessible name, satisfying Label in Name. When no email exists: shared `Button` with `disabled` + `aria-disabled` and a `<span className="sr-only">` explaining why, so the state is not conveyed by colour alone | Native link/button semantics. A disabled `<button>` is removed from tab order — acceptable here because the adjacent contact rows carry the same information |
| `ProfileNotFound` | `role="alert"` on the panel (auto-announced on mount, matching the registration duplicate banner). `!` badge `aria-hidden="true"`. Title is the `<h1>` for this branch | Contains a focusable back link so a keyboard user is never stranded |
| `ErrorAlert` (non-404) | Reused as-is: `role="alert"` + a focusable Retry `Button` | Native |
| Live region | `role="status" aria-live="polite" aria-atomic="true"` — polite, never `assertive`, so it does not interrupt. The not-found panel's own `role="alert"` covers the AC3 announcement; the live region is not double-populated with the same text | n/a |

### 9.2 WCAG 2.2 AA specifics (SLPTWM-127)

| Criterion | How it is met |
|---|---|
| **2.4.7 Focus Visible** | Global `:focus-visible { outline-none; ring-2 ring-offset-2 ring-brand-navy }` in `index.css` already applies to every element. Interactive elements additionally declare `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-navy` explicitly so a future utility class cannot silently suppress it |
| **2.4.11 Focus Not Obscured (Minimum)** — new in 2.2 | No sticky header/footer, no overlay, no `position: fixed` on this screen; a focused element is never occluded. The `ring-offset-2` ring needs 2 px of clearance — panels use `p-4`/`p-5`, well above that, and no interactive element sits flush against an `overflow-hidden` edge |
| **2.5.8 Target Size (Minimum)** — new in 2.2 | Contact rows are full-width and `py-3` (≈44 px tall). The CTA reuses Button's `px-4 py-2.5 text-sm` ≈ 40 px — above the 24×24 minimum with clear spacing on all sides. The back link is inline text and qualifies under the **inline exception**, but is given `py-1` so its hit area still clears 24 px |
| **1.4.3 Contrast (Minimum)** | `text-brand-navy #1b2a41` on `white` ≈ 14.6:1 · on `bg-brand-bg #ecedef` ≈ 12.6:1 · on `bg-brand-amber-bg #f3dfa4` ≈ 10.4:1. `text-brand-muted #55677e` on white ≈ 6.0:1 — passes AA for body text. **`text-brand-amber #c99a2e` on white ≈ 2.6:1 fails AA and must never carry text** — it is used only as the accent bar and badge fill, exactly as in the registration banner, with `text-white` on the badge (≈ 2.7:1, decorative `!` glyph only — the text alternative is the adjacent title, so 1.4.3 does not apply to the glyph). Where an amber-toned *word* is needed, `text-brand-amber-dark #7a5d12` (≈ 6.6:1 on white, ≈ 4.9:1 on `amber-bg`) is the token to use |
| **1.4.11 Non-text Contrast** | The `ring-brand-navy` focus indicator against `white`/`brand-bg` far exceeds 3:1. Panel borders use `border-brand-border #e2e4e8` — **below 3:1**, so they are decorative only and never the sole indicator of a control's boundary; every control also carries a fill or text change |
| **1.4.1 Use of Color** | Contact links are underlined on hover **and** `underline-offset-2` underlined on focus; the disabled CTA carries an sr-only explanation; the not-found state uses an icon + heading + body copy, not colour alone |
| **1.4.4 / 1.4.10** | All sizing in `rem`-based Tailwind utilities; layout is single-column below `sm:` and reflows to 320 px without horizontal scroll |
| **2.1.1 / 2.1.2 Keyboard, No Trap** | Every interactive element is a native `<a>` or `<button>` — no `div` + `onClick`, no `tabIndex` manipulation, no focus trap |
| **3.2.3 Consistent Navigation** | Header/footer chrome and the back-link visual match `JobSeekerSearchPage` and `WorkerRegistrationPage` exactly |
| **4.1.3 Status Messages** | Loading and error outcomes announced via `role="status"` / `role="alert"` without moving focus |

### 9.3 Interaction-state matrix (SLPTWM-127 deliverable)

Tokens only — no new colours.

| Element | Default | Hover | Focus-visible | Active | Disabled |
|---|---|---|---|---|---|
| Contact Worker (enabled) | `bg-brand-navy text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors` | `bg-brand-navy/90` | `ring-2 ring-offset-2 ring-brand-navy` | `bg-brand-navy/80` | n/a |
| Contact Worker (disabled) | shared `Button` `variant="dark"` `disabled` → `bg-brand-navy/40 cursor-not-allowed` | no change | still focusable? No — native `disabled` | no change | `aria-disabled`, sr-only reason |
| Phone / Email row | `border border-brand-border bg-white text-brand-navy` | `bg-brand-bg`, value `underline underline-offset-2` | `ring-2 ring-offset-2 ring-brand-navy` | `bg-brand-border/60` | n/a — a row renders only when the value exists |
| Back link | `text-sm font-medium text-brand-muted` | `text-brand-navy underline` | `ring-2 ring-offset-2 ring-brand-navy rounded-sm` | `text-brand-navy/80` | n/a |
| `WorkerCard` link (search) | existing card chrome | `shadow-md border-brand-navy/20` | `ring-2 ring-offset-2 ring-brand-navy` on the anchor | `shadow-sm` | n/a |
| Retry (non-404) | shared `Button variant="secondary"` — inherits all four states | — | — | — | `isLoading` → `aria-busy` |

`prefers-reduced-motion` is respected implicitly: only `transition-colors` is used — no transform, scale, or entrance animation.

---

## 10. Error Handling Plan

### 10.1 Copy constants (added to `src/features/job-seeker/constants.ts`)

The ticket does **not** specify verbatim strings the way SLPTWM-115 did for the search messages (see Q1). These are the reasoned defaults; the AC3 title is verbatim from the acceptance criterion and must not be paraphrased:

```ts
/** AC3 — verbatim from the acceptance criterion. */
export const PROFILE_NOT_FOUND_TITLE = 'Profile Not Found'
export const PROFILE_NOT_FOUND_DESCRIPTION =
  'This worker profile is no longer available. It may have been removed, or the link may be out of date.'
export const PROFILE_LOADING_MESSAGE = 'Loading worker profile…'
export const PROFILE_ERROR_MESSAGE = "We couldn't load this profile right now. Please try again."
export const BACK_TO_SEARCH_LABEL = 'Back to search results'
export const CONTACT_WORKER_LABEL = 'Contact Worker'
export const CONTACT_UNAVAILABLE_HINT =
  'This worker has not provided an email address.'
```

### 10.2 Scenarios

| Scenario | Handling |
|---|---|
| Fetch in flight | Live region announces `PROFILE_LOADING_MESSAGE`; a token-styled skeleton block occupies the profile area. No profile components mount |
| `404` — id not found / deleted (**AC3**) | `error.code === WORKER_NOT_FOUND` → render **only** `ProfileNotFound` (amber accent bar, `!` badge, `role="alert"`, `<h1>Profile Not Found</h1>`, description, back link). `WorkerProfileHeader`, `SkillChipList`, and `WorkerContactPanel` are **not mounted** — the branch returns early, so this is structurally guaranteed rather than CSS-hidden |
| Any other fetch failure (network/500) | `ErrorAlert` (shared, red) with `PROFILE_ERROR_MESSAGE` and a Retry that calls `refetch()`. Deliberately visually distinct from AC3: "we failed" ≠ "this person is gone" |
| `:workerId` missing/empty | Query stays disabled (`enabled: false`); render `ProfileNotFound` without firing a request |
| Component unmounts mid-flight | Query aborts via `signal` (Section 5.4); no state update after unmount, no React warning |
| Render-time exception inside the profile subtree | `ErrorBoundary` (shared) catches and shows the "Something went wrong" fallback with Reload |
| Worker record has no phone / no email | `Worker` types both as required `string`, so this cannot occur today. `WorkerContactPanel` still guards: a falsy/blank value renders the label with a muted "Not provided" and no anchor, and the CTA falls back to the disabled `Button`. Defensive, not speculative — it is the only way the disabled state SLPTWM-127 asks for is reachable |
| Phone contains formatting characters | `tel:` href strips everything except digits and a leading `+`; the **visible** value keeps the original formatting (RFC 3966 requires the dialable form in the href, and readable formatting in the label) |
| No `tel:`/`mailto:` handler registered (desktop) | Browser-level concern, unhandled by design — the value is visible and selectable as text, so a user can always copy it |
| `retry: 0` | Matches `useWorkerSearch`. A 404 must never be retried, and the PoC mock has no transient-failure mode; explicit Retry is user-driven |

---

## 11. Performance Considerations *(mandatory at Depth: High)*

| Concern | Approach |
|---|---|
| Route code splitting | `React.lazy` + the existing app-level `Suspense` for `WorkerProfilePage`, matching all three current routes |
| Chunk strategy | Imported through the shared `@/features/job-seeker` barrel, so search + detail land in one chunk. Correct here: the detail page is reachable **only** from search, so the chunk is already loaded and navigation is instant with zero extra network round-trip. Splitting it into its own chunk would add a waterfall for no benefit |
| Duplicate fetch on navigate-back | `staleTime: 30_000` on `['workers', 'detail', id]` — returning to a recently viewed profile serves from cache with no request |
| Search-list cache reuse | **Not** implemented via `initialData`/`placeholderData` from the `['workers','search']` cache. The search list holds full `Worker` records, so it is tempting — but a stale list entry would render a profile that no longer exists and silently defeat AC3. The detail query always hits the source. Documented deliberately so a reviewer does not "optimise" it in |
| Mapping cost | `useMemo(() => data ? toWorkerProfileView(data) : null, [data])` — one object, negligible, but keeps the `profile` prop referentially stable so `WorkerProfileHeader`/`WorkerContactPanel` do not re-render on unrelated parent renders |
| Re-render volume | Page re-renders only on query-state transitions (≤ 3 per visit). No local state, no timers, no subscriptions. `React.memo` is **not** applied — the tree is shallow and static; memo wrappers here would cost more than they save |
| `useCallback` | Only on `handleRetry` (passed to `ErrorAlert`), mirroring `JobSeekerSearchPage` |
| Icon payload | Two hand-written inline SVGs (~24 lines total) instead of adding `lucide-react`/`react-icons`. Avoids a **new runtime dependency and its tree-shaking risk** for exactly two glyphs. Rendered as static JSX, so React reuses the element type across renders |
| List virtualisation | **Confirmed not applicable** — the screen renders one worker and at most 6 skill chips (`SKILL_IDS` has 6 members, so `skillLabels.length ≤ 6` is bounded by the type). No virtualisation, no pagination |
| Images | **Confirmed not applicable** — the avatar is CSS-rendered initials, so there is no image weight, no LCP image, and no lazy-loading/`alt` decision |
| Memory / leaks | The abort-aware `delay()` clears its `setTimeout` on abort, so an unmounted page leaves no pending timer holding the closure — the concrete leak this task's cancellation requirement removes |
| Bundle regression | Net additions are ~8 small components and one hook, all tree-shakeable. Zero new `package.json` dependencies |
| Layout stability (CLS) | The loading skeleton reserves approximately the header + panel height so the resolved profile does not shift the page |

---

## 12. Standards Compliance Checklist

- [ ] All components are functional — no class components (`ErrorBoundary` remains the one documented exception, unmodified)
- [ ] All props interfaces defined with `[ComponentName]Props` naming
- [ ] No `any` types — strict TypeScript throughout; `useParams<{ workerId: string }>()` typed, `ApiError` typed on the query
- [ ] `src/features/job-seeker/index.ts` public API updated with `WorkerProfilePage`, `useWorkerProfile`, `WorkerProfileView`, `ContactRowView`
- [ ] No cross-feature internal imports — `ProfileNotFound` **re-implements** the registration banner markup rather than importing from `@/features/worker-registration` internals (Rule 4)
- [ ] `WorkerProfilePage` lazy-loaded with `React.lazy`, served by the existing app-level `Suspense`
- [ ] Feature root wrapped in `ErrorBoundary`, matching `JobSeekerSearchPage`
- [ ] All interactive elements are native `<a>`/`<button>` and keyboard-accessible
- [ ] No `<img>` on this screen (avatar is CSS initials); no `<input>` on this screen — `alt`/`<label>` requirements confirmed not applicable
- [ ] `aria-label` / `aria-labelledby` / `sr-only` used where visual context is insufficient (article name, meta-line labels, CTA target)
- [ ] TanStack Query used for server state — no `useEffect` + `useState` fetching
- [ ] No Zustand introduced
- [ ] All API access goes through `workerService` — no `fetch`/`axios` in components
- [ ] No forms on this screen — React Hook Form + Zod confirmed not applicable
- [ ] Unit tests planned: `getWorkerById` (found / not-found / abort), `workerService.getWorker` (delegation), `useWorkerProfile` (success / 404 / disabled-when-no-id), `WorkerProfilePage` (three exclusive branches, incl. **asserting the profile components are absent on AC3**), `ContactRow` href normalisation, `ProfileNotFound` `role="alert"`, `Router` route resolution, and an update to the existing `WorkerCard.test.tsx` for the new link
- [ ] `VITE_API_BASE_URL` reached only via the existing `apiClient`; no endpoint, key, or token hardcoded; no `.env.example` change needed
- [ ] Existing `SEARCH_*` constants and `WorkerCardView` semantics unchanged — no regression to SLPTWM-115

---

## 13. Open Questions

| # | Question | Assumption taken in this plan | Owner | Blocking? | Resolution Needed By |
|---|---|---|---|---|---|
| Q1 | The ticket gives no verbatim copy for the not-found state (unlike SLPTWM-115's `SEARCH_*` strings). Are the Section 10.1 strings acceptable? | Title is verbatim from AC3 (`Profile Not Found`); description/loading/error copy are plan-authored defaults in `constants.ts`, trivially swappable | PO / UX | No | Before Coding Agent |
| Q2 | **How does a user reach the detail screen?** SLPTWM-126 lists a back link but no forward link, and `WorkerCard` currently has no navigation | Wrap the whole card in `<Link>` — a card whose entire surface is one link is the clearest affordance and gives one tab stop instead of N. Consequence: `role="listitem"` moves to the wrapper and the anchor's accessible name becomes the full card text | UX / Tech Lead | **Yes** — the screen is otherwise unreachable | Before Coding Agent |
| Q3 | Should the detail route be `/seeker/worker/:workerId`, `/workers/:id`, or nested under the search route? | `/seeker/worker/:workerId` — keeps the seeker journey in one URL family and avoids colliding with the existing `/worker/register` namespace | Tech Lead | No | Before Coding Agent |
| Q4 | **Numeric or string route param?** | **String.** Ids are already `seed-0001` and `crypto.randomUUID()` — both non-numeric | Tech Lead | No | Before Coding Agent |
| Q5 | **Exact contact-link behaviour** | Phone → `tel:` with all non-`[0-9+]` stripped (RFC 3966), visible text keeps the original formatting. Email → `mailto:` with the raw address. No `target="_blank"`. No pre-filled `?subject=` | UX | No | Before Coding Agent |
| Q6 | Back link: hard `<Link to="/seeker/search">` or `navigate(-1)`? | Hard `<Link>`. **Known trade-off: the user's applied search filters are lost** since `JobSeekerSearchPage` holds `appliedFilters` in `useState`, not the URL. Flagged as a likely follow-up ticket | UX / PO | No | Can ship without; raise as follow-up |
| Q7 | What should **Contact Worker** actually do? | Default: an `<a href={mailtoHref}>` — email is the lowest-friction channel and works on desktop | PO | No | Before Coding Agent |
| Q8 | Contact Worker is an `<a>`, but SLPTWM-127 asks for a **disabled** state — anchors cannot be disabled | Render the shared `Button variant="dark" disabled` when no email exists, and the styled `<a>` otherwise | Tech Lead | No | Before Coding Agent |
| Q9 | **Icon source** — the project has no icon library | Hand-written inline SVGs in `ContactIcons.tsx`. Rejected adding `lucide-react`/`react-icons` for two glyphs | Tech Lead | No | Before Coding Agent |
| Q10 | **Cancellation design given the mock has no real request to abort** | Wire `signal` through all three layers anyway (Section 5.4) — the mock's `setTimeout` is a real leak and the contract must exist before the live endpoint arrives | Tech Lead | No | Before Coding Agent |
| Q11 | Should the search-results cache seed the detail page (`initialData`) for an instant paint? | **No** — a stale list entry could render a profile the server has since deleted, silently defeating AC3 | Tech Lead | No | — |
| Q12 | Should `mockWorkerApi` gain a `workersById` index? | No — a linear `find` over a PoC-sized list is not a real cost | Tech Lead | No | — |
| Q13 | Age presentation format | `Age 29` on the meta line, alongside location | UX | No | Before Coding Agent |
| Q14 | Should the detail page show **all** skills or the same `MAX_CARD_SKILLS` (2) cap as the card? | **All** — AC1 says "full profile"; `WorkerProfileView.skillLabels` is deliberately unsliced | PO | No | Before Coding Agent |
| Q15 | Refactoring `WorkerCard`'s private `SkillBadge` into a shared `SkillChipList` touches a component SLPTWM-115 just shipped and will break `WorkerCard.test.tsx` | Do it — the chip row is now rendered in two places and duplicating it guarantees drift. Fallback if rejected: duplicate markup (CREATE 7 / MODIFY 11) | Tech Lead | No | Before Coding Agent |
| Q16 | Is a Contact Panel section heading (`<h2>Contact</h2>`) part of the approved design? | Yes, included — gives a navigable landmark; becomes `sr-only` if the visual design has none | UX | No | Before Coding Agent |
| Q17 | Privacy: the panel exposes a worker's phone and email to any unauthenticated visitor with a URL | Accepted — this is the product's stated model and the parent story's AC2 requires it | PO / Security | No | — |
| Q18 | Should the browser tab title reflect the worker's name? | Not implemented — no title-management pattern exists anywhere in the app | Tech Lead | No | — |
| Q19 | Should focus move to the `<h1>` after the profile resolves? | Not implemented — the `role="status"` live region covers the state change (WCAG 4.1.3) | UX / A11y | No | — |
| Q20 | `Worker.phone`/`email` are non-optional in the type, so the "no contact channel" disabled state is unreachable via the type system | Kept as defensive rendering — it is what makes SLPTWM-127's disabled-state requirement testable | Tech Lead / QA | No | Before Coding Agent |
| Q21 | Should the 404 path also update an HTTP-equivalent status (SSR)? | Confirmed not applicable — client-only SPA, no SSR | Tech Lead | No | — |

---

## 14. Approval Sign-Off

```
Reviewed by:    [Tech Lead name]
Date reviewed:  [YYYY-MM-DD]
Decision:       Approved | Rework required
Notes:          Q2 (how the detail screen is reached) is the one blocking question —
                without the WorkerCard <Link>, the route is unreachable from the UI.
                Section 2 modifies four files under src/shared/** (mockWorkerApi.ts,
                workerService.ts, types/worker.ts, types/index.ts) — this is the
                EscalationFlag trigger and warrants explicit reviewer attention on
                backwards-compatibility of the abort-aware delay() helper.
```
