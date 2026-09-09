```
Story / Task ID:      SLPTWM-129  (sub-task of SLPTWM-114 — Worker Profile Creation with Validation)
Title:                FE-API integration — replace mock worker registration with live POST /api/v1/workers
Issue Type:           Task
Depth:                High
Author:               Planning Agent (sparc.team24@experionglobal.com)
Date:                 2026-09-09
Status:               Approved
Reviewer:             [Tech Lead / Architect]
Related PRD:          SLPTWM-114 — Worker Profile Creation with Validation
Sprint:               [current]
```

---

## 1. Summary of Change

This is a **backend-integration swap, not a UI feature**. The Worker Registration screen shipped in SLPTWM-17 against `mockWorkerApi.createWorker`, an in-memory stand-in. This task replaces that one call with a real HTTP `POST` to the live ShiftSpot backend (`/api/v1/workers`) through the already-built-but-so-far-unused shared `apiClient`, so a submitted profile is persisted server-side and survives a page reload.

The end state: `workerService.createWorker` performs a real network request; the request body is translated from the app's internal shape to the backend's contract (`phone` → `phoneNumber`, lowercase skill ids → the backend's Title-Case skill strings); the 201 response is translated back into the app's `Worker` shape; and the backend's `409 Conflict` is translated into the *existing* duplicate-profile UX (amber banner + per-field errors on Email/Phone) so the polished error experience already shipped is preserved rather than degraded into a generic "Registration failed".

Two non-obvious environmental facts, verified against the live service during planning, drive part of this plan: the backend currently sends **no CORS headers at all** (so an unproxied browser call from `localhost` will fail preflight), and its error bodies are **RFC7807 `ProblemDetails`**, whose field names the current `apiClient` interceptor does not understand.

---

## 2. Scope of Change

### 2.1 Files to CREATE

| File Path | Type | Purpose |
|---|---|---|
| `src/shared/api/workerApi.ts` | API module | Real HTTP implementation for `createWorker`: backend DTO types, request/response mapping (`phone`↔`phoneNumber`, skill-id↔label), and 409→duplicate-error translation. Sibling of `mockWorkerApi.ts` |
| `.env.example` | Config (tracked) | Documents required env shape with **placeholder** values only — `VITE_API_BASE_URL`, `VITE_API_PROXY_TARGET` |
| `.env` | Config (**gitignored, never committed**) | Real local values. Already covered by `.gitignore` (`.env` + `.env.*` with `!.env.example`). Listed for completeness — it must exist for the app to run locally, but must not appear in the PR diff |

**CREATE total: 3**

### 2.2 Files to MODIFY

| File Path | What Changes | Risk |
|---|---|---|
| `src/shared/services/workerService.ts` | `createWorker` body swaps from `mockWorkerApi.createWorker` to `workerApi.createWorker`. Signature unchanged. `searchWorkers` / `getWorker` untouched (still mock — their BE tickets are separate) | **Medium** — the only production behaviour change |
| `src/shared/api/client.ts` | Response interceptor becomes `ProblemDetails`-aware (`title`/`detail`) in addition to `code`/`message`, and carries `status` onto the normalized `ApiError` | **Medium** — shared, but zero production consumers today |
| `src/shared/api/index.ts` | Add `export { workerApi } from './workerApi'` | Low |
| `src/shared/types/worker.ts` | `Worker.createdAt` becomes optional; `ApiError` gains optional `status?: number`; add exported duplicate-code constants + `isDuplicateWorkerError` predicate | **Medium** — widely imported type; all changes are additive/widening |
| `src/features/worker-registration/WorkerRegistrationPage.tsx` | Banner condition keyed off the error *code* (duplicate codes) instead of "`fieldErrors` is non-empty", so an indeterminate 409 still renders the correct banner | Low |
| `src/features/worker-registration/WorkerRegistrationForm.tsx` | After applying `serverFieldErrors`, move focus to the first server-errored field (`setFocus`) — closes an existing a11y gap that this integration makes reachable more often | Low |
| `vite.config.ts` | Add `server.proxy` for `/api` in dev (reads `VITE_API_PROXY_TARGET` via `loadEnv`) to work around the backend's missing CORS headers | **Medium** — build-tool config; dev-only, no effect on the production bundle |

**MODIFY total: 7**

### 2.3 Files to DELETE

| File Path | Reason for Deletion |
|---|---|
| — | **None.** See the explicit decision on `mockWorkerApi.ts` below |

**DELETE total: 0**

> **Decision — `mockWorkerApi.ts` is KEPT, not deleted.** It is still the live backing implementation for `workerService.searchWorkers` (SLPTWM-115) and `workerService.getWorker` (SLPTWM-116); deleting it would break two shipped features. Even `mockWorkerApi.createWorker` is kept: it is still exercised by `mockWorkerApi.test.ts`, it seeds the same in-memory store the search feature reads, and removing one of three symmetrical functions from a module that survives anyway is churn with no benefit. It becomes unreferenced by production code and that is acceptable and intentional — it is deleted wholesale when the search/detail BE integration tickets land.

**Plan Checksum: CREATE 3 · MODIFY 7 · DELETE 0**

Test files are owned by the Unit Test Agent (see §12) and are **excluded from the checksum**, per the convention used in the SLPTWM-115/116 plans.

### 2.4 Files to REUSE (no changes)

| File Path | How It Is Used |
|---|---|
| `src/shared/hooks/useWorkerRegistration.ts` | Unchanged. `useMutation<Worker, ApiError, WorkerRegistrationPayload>` already has the right generics; it calls `workerService.createWorker` and never learns the implementation changed |
| `src/shared/validation/schemas.ts` | Unchanged. `workerRegistrationSchema` keeps field name `phone` and `z.coerce.number().int()` for `age` — the number coercion already satisfies the backend's `int32` |
| `src/shared/api/mockWorkerApi.ts` | Unchanged — still backs `searchWorkers` / `getWorker` |
| `src/shared/components/FormField.tsx` | Unchanged — already renders `<p id="{id}-error" role="alert">`, which the server-side duplicate errors reuse |
| `src/shared/components/Button.tsx` | Unchanged — already `disabled={disabled || isLoading}` + `aria-busy`, which prevents double-submit during the real network round-trip |
| `.gitignore` | Unchanged — already ignores `.env` / `.env.*` while keeping `!.env.example` tracked |

---

## 3. Component Tree

No component is added, removed, or re-parented. The existing tree, annotated with the two touched nodes and the new data path:

```
WorkerRegistrationPage (Page — lazy loaded, existing)   ← MODIFIED (banner condition only)
  ├── header / footer (existing markup)
  ├── SuccessMessage (shared)            [mutation.isSuccess branch — reads mutation.data.name]
  ├── duplicate banner  role="alert"     [now driven by error CODE, not fieldErrors presence]
  └── WorkerRegistrationForm (Presentational + RHF)      ← MODIFIED (setFocus on server error)
        ├── FormField × 5 → TextInput (name, email, phone, location, age)
        └── FormField → MultiSelect (skills)

Data path (the actual subject of this ticket):
WorkerRegistrationPage
  └── useWorkerRegistration()            [TanStack Query useMutation — UNCHANGED]
        └── workerService.createWorker() [MODIFIED — delegation target swapped]
              └── workerApi.createWorker()          ← NEW
                    ├── toCreateWorkerRequest(payload)   phone→phoneNumber, skills→Title-Case
                    ├── apiClient.post<WorkerDto>('/api/v1/workers', body)
                    ├── toWorker(dto, payload)           phoneNumber→phone, skills→ids
                    └── toDuplicateError(apiError)       409 → DUPLICATE_* + fieldErrors
```

---

## 4. Component Specifications

No new components. Both modified components keep their existing props interfaces byte-for-byte — this is deliberate, so the change cannot ripple into their consumers or their existing tests' render setup.

| Component | Type | Props Interface | State | Notes on this change |
|---|---|---|---|---|
| `WorkerRegistrationPage` | Page | none | none (all server state via `useWorkerRegistration`) | Only `bannerMessage` derivation changes. Today: `mutation.error.fieldErrors && Object.keys(...).length > 0 ? mutation.error.message : 'Registration failed. Please try again.'`. New: `isDuplicateWorkerError(mutation.error) ? mutation.error.message : 'Registration failed. Please try again.'` — so a 409 whose field cannot be determined still renders the "Profile already exists" banner with the server's message |
| `WorkerRegistrationForm` | Presentational | `WorkerRegistrationFormProps` — **unchanged** (`onSubmit`, `isSubmitting`, `serverFieldErrors?`) | React Hook Form (`useForm`) | The existing `useEffect` that maps `serverFieldErrors` → `setError` gains a `setFocus(firstField)` after the loop, guarded so it only fires when at least one field error was applied |

**Props interfaces — unchanged, restated so the Coding Agent can assert no drift:**

```ts
interface WorkerRegistrationFormProps {
  onSubmit: (values: WorkerRegistrationFormValues) => void;
  isSubmitting: boolean;
  /** Duplicate-field messages returned by the API for the most recent submission, if any. */
  serverFieldErrors?: Partial<Record<DuplicateField, string>>;
}
```

---

## 5. State and Data Flow

### 5.1 State Ownership

| State | Type | Owner | Rationale |
|---|---|---|---|
| Form values (`name`, `email`, `phone`, `location`, `age`, `skills`) | Form state | **React Hook Form** in `WorkerRegistrationForm` | Existing; unchanged. `zodResolver(workerRegistrationSchema)` |
| Submission in-flight / success / error | **Server state** | **TanStack Query** `useMutation` in `useWorkerRegistration` | Existing; unchanged. This ticket only changes what `mutationFn` does under the hood |
| Created `Worker` (`mutation.data`) | Server state | TanStack Query mutation cache | Now sourced from the real 201 body instead of the mock's fabricated object |
| Duplicate per-field messages | Derived server state → form state | Passed as `serverFieldErrors` prop → applied via RHF `setError` | Existing bridge; unchanged mechanism, new producer |
| API base URL | Build-time config | `import.meta.env.VITE_API_BASE_URL` via `apiClient` | Not React state. Never hardcoded (§12) |

**Nothing moves between owners.** No `useState`, no Context, no Zustand is introduced. Any proposal to hold the API result in component state instead of the mutation cache is a blocker.

### 5.2 TanStack Query Keys

| Query Key | Hook | Invalidated By |
|---|---|---|
| `['worker', 'register']` (mutationKey) | `useWorkerRegistration` | n/a — mutations are not cached-by-key for reads |
| `['workers', filters]` (job-seeker search) | `useWorkerSearch` | **Deliberately NOT invalidated here.** Search is still mock-backed; invalidating it after a real registration would refetch the in-memory mock, which will never contain the just-created worker. Invalidation is added by the search-integration ticket, not this one — see Q9 |

`useMutation` retry defaults to `0` in TanStack Query v5 and is **left at the default**: a `POST` that creates a resource must not be auto-retried, since a timeout after the server already committed would create a duplicate profile.

### 5.3 Zustand Store Changes

| Store | Slice | Change |
|---|---|---|
| — | — | No Zustand changes. Confirmed not applicable — no global state is involved in a single-form submission |

---

## 6. Services and API

**This is the load-bearing section of this plan.**

### 6.1 New or Modified Endpoints

| Method | Path | Request | Response | Auth |
|---|---|---|---|---|
| `POST` | `/api/v1/workers` | `CreateWorkerRequest` (JSON) | `201` → `WorkerDto` · `400` → `ProblemDetails` · `409` → `ProblemDetails` | **None required today** (verified: unauthenticated `GET` returns `200`). The published OpenAPI declares a top-level `Bearer` (JWT) security requirement that is not currently enforced on these routes — see Q4 |

Base URL is **never hardcoded**. It resolves from `import.meta.env.VITE_API_BASE_URL` through the existing `apiClient`; the path constant `/api/v1/workers` lives in `workerApi.ts`.

**Verified backend contract** (from the service's own OpenAPI document at `/swagger/v1/swagger.json`, plus a live `GET` — this supersedes the ticket description, which documented only the request payload):

```jsonc
// CreateWorkerRequest — request body
{ "name": "string", "email": "string", "phoneNumber": "string",
  "location": "string", "age": 0 /* int32 */, "skills": ["string"] }

// WorkerDto — 201 Created response body  (NOTE: no createdAt field)
{ "id": "uuid-string", "name": "string", "email": "string", "phoneNumber": "string",
  "location": "string", "age": 0, "skills": ["string"] }

// ProblemDetails — 400 and 409 error body (RFC 7807; additionalProperties allowed)
{ "type": "string", "title": "string", "status": 409, "detail": "string", "instance": "string" }
```

**Live sample of a stored worker** (`GET /api/v1/workers/{id}`), which settles the skills-casing question empirically:

```json
{"id":"01a0846e-...","name":"Test1","email":"Test1@gmail.com","phoneNumber":"9809878867",
 "location":"LA","age":20,"skills":["Plumbing","Cleaning"]}
```

### 6.2 Field mapping contract

The app keeps `phone` internally **everywhere** — form, Zod schema, `WorkerRegistrationPayload`, `Worker`, `DuplicateField`, UI labels. The rename to `phoneNumber` happens **only** inside `workerApi.ts`, at the literal JSON body boundary, and is reversed on the way back. Renaming the internal field would touch the schema, the form, both features, and a dozen tests for zero functional gain.

| Internal (`WorkerRegistrationPayload`) | Wire (`CreateWorkerRequest`) | Transform out | Transform back in (`WorkerDto` → `Worker`) |
|---|---|---|---|
| `name: string` | `name` | identity | identity |
| `email: string` | `email` | identity (already trimmed + lowercased by Zod) | identity |
| **`phone: string`** | **`phoneNumber`** | **rename** | **rename back** |
| `location: string` | `location` | identity | identity |
| `age: number` | `age` | identity — Zod's `z.coerce.number().int()` already produced a real `number`; **no extra coercion, no `Number()` wrapper** | identity |
| `skills: SkillId[]` (`'plumbing'`…) | `skills: string[]` (`"Plumbing"`…) | **map id → Title-Case label** via `SKILL_OPTIONS` | map label → id by **case-insensitive** match against `SKILL_IDS`; unrecognised entries dropped |
| — | — | — | `id` ← `dto.id` |
| `createdAt` | *(absent from the contract)* | — | **omitted** — see §7.1 |

**Skills casing — decided on evidence, not convention.** The ticket documented only `"skills": ["string"]`. The live data shows the backend stores and returns `"Plumbing"`, `"Electrical"`, `"Gardening"`, `"Cleaning"` — Title-Case, exactly matching this app's `SKILL_OPTIONS` labels. The backend does not appear to normalise casing, and its `GET` search filter takes skills as query strings, so sending lowercase `"plumbing"` would create records that the existing data (and any Title-Case search) would not match. **Send the Title-Case labels.** The mapping is derived from `SKILL_OPTIONS` (already promoted to `shared/types`) rather than a second hardcoded list, so the two can never drift. This reverses the "send lowercase ids" default proposed in the ticket brief; see Q1.

### 6.3 Service Layer

| Service File | Method | What It Does |
|---|---|---|
| `src/shared/api/workerApi.ts` *(new)* | `createWorker(payload: WorkerRegistrationPayload): Promise<Worker>` | Builds `CreateWorkerRequest` via `toCreateWorkerRequest`; `apiClient.post<WorkerDto>(WORKERS_PATH, body)`; maps the 201 body via `toWorker(dto, payload)`; on rejection, passes the normalized `ApiError` through `toWorkerCreationError` before re-rejecting |
| `src/shared/api/workerApi.ts` | `toCreateWorkerRequest(payload)` *(module-private, exported only if the Unit Test Agent needs direct coverage)* | Pure mapper, out-bound |
| `src/shared/api/workerApi.ts` | `toWorker(dto, fallback)` *(module-private)* | Pure mapper, in-bound, tolerant (see §10) |
| `src/shared/api/workerApi.ts` | `toWorkerCreationError(error)` *(module-private)* | `409` → duplicate `ApiError` with `code`, `field`, `fieldErrors`; everything else passed through untouched |
| `src/shared/services/workerService.ts` | `createWorker(payload)` | **Body swap only:** `return workerApi.createWorker(payload)`. The stale "single swap point" comment is replaced with a comment naming the live endpoint and the mapping module |
| `src/shared/services/workerService.ts` | `searchWorkers`, `getWorker` | **Untouched** — still delegate to `mockWorkerApi`, with their swap-point comments intact |

`workerService` remains the only thing features import; no component gains an `axios`/`fetch` import.

### 6.4 Duplicate detection strategy

The mock signalled duplicates with `code: 'DUPLICATE_EMAIL' | 'DUPLICATE_PHONE' | 'DUPLICATE_EMAIL_AND_PHONE'` plus a `fieldErrors` map that `WorkerRegistrationForm` feeds into `setError`. That contract must be reproduced from an HTTP response so the shipped UX is not lost.

The OpenAPI document confirms `POST /api/v1/workers` declares a **`409 Conflict`** response returning `ProblemDetails` — a strong signal that 409 *is* the duplicate signal (the only plausible conflict for a create-worker with unique email/phone). The exact `title`/`detail` wording, and whether it names which field collided, is **not documented and was not probed** (probing requires an actual `POST`, which would mutate the shared dev backend — see Q2 for the one-line curl a reviewer can run).

**Strategy — a status-first ladder that degrades safely:**

1. **`status === 409` → it is a duplicate.** Unconditionally. This is the primary rule.
2. **Field attribution by substring**, case-insensitive, over `${title} ${detail}` from the `ProblemDetails` body (surfaced by the interceptor as `ApiError.message`):
   - matches `/e-?mail/i` → flag `email`
   - matches `/phone|mobile|contact\s*number/i` → flag `phone`
   - both match → flag both, `code: 'DUPLICATE_EMAIL_AND_PHONE'`
3. **Indeterminate 409** (message names neither field — the likely case if the backend returns a generic "Worker already exists"): flag **both** `email` and `phone`. Rationale: the user's next action is identical either way ("change one of these two"), both are genuinely candidate causes, and flagging both keeps the polished inline-error UX. Flagging neither would silently collapse the experience into a bare banner. `code` in this case is `'DUPLICATE_EMAIL_AND_PHONE'`, and the top-level `message` is the existing both-fields wording: *"A profile with this Email or Phone Number already exists. Update the highlighted fields and try again."*
4. **`status === 400`** → **not** a duplicate. It is a server-side validation failure that the client's Zod schema should have caught (an age out of range, a malformed email). Surfaced through the generic banner with the server's `detail` text; no field errors invented. This deliberately does not guess field attribution, because a mis-attributed 400 is worse than a generic one.
5. **Any other non-2xx / network error** → passed through untouched to the generic branch (§10).

The duplicate messages reuse the exact strings already asserted by the shipped tests and rendered today:

```ts
// src/shared/api/workerApi.ts
const DUPLICATE_MESSAGES: Record<DuplicateField, string> = {
  email: 'A profile with this Email already exists.',
  phone: 'A profile with this Phone Number already exists.',
};
```

They are duplicated from `mockWorkerApi.ts` rather than shared, because the mock is scheduled for deletion once search/detail are integrated; a shared constant would outlive its only other consumer. (If the reviewer prefers, promoting them to `shared/types/worker.ts` alongside the duplicate codes is a valid alternative — Q10.)

### 6.5 `apiClient` interceptor change — why it is required

The current interceptor reads `error.response.data.code` and `.message`. **`ProblemDetails` has neither.** Left as-is, a `409` normalises to `{ code: 'NETWORK_ERROR', message: 'Request failed with status code 409' }` — the duplicate is invisible, `status` is unavailable, and rule 1 above cannot be written. This is a genuine defect that only becomes observable once a real call is made, which is exactly this ticket.

New normalisation, additive and backward-compatible with the `{ code, message }` shape the mock and existing tests use:

```ts
// precedence: existing custom shape first, then RFC7807, then axios, then a generic fallback
code:    data?.code ?? (status ? `HTTP_${status}` : 'NETWORK_ERROR')
message: data?.message ?? data?.detail ?? data?.title ?? error.message ?? 'Something went wrong. Please try again.'
status:  error.response?.status            // NEW, optional
```

A true offline/DNS failure has no `error.response`, so `status` stays `undefined` and `code` stays `'NETWORK_ERROR'` — preserving today's behaviour exactly.

### 6.6 CORS and the dev proxy — verified blocker

Probing the live service from outside a browser:

- `OPTIONS /api/v1/workers` with `Origin` + `Access-Control-Request-Method: POST` → **`405 Method Not Allowed`, `Allow: GET, POST`**, no `Access-Control-*` headers.
- `GET /api/v1/workers` with `Origin: http://localhost:5173` → `200`, but **no `Access-Control-Allow-Origin` header**.

A JSON `POST` always triggers a CORS preflight. With no `OPTIONS` handler and no allow-origin header, **a direct browser call from `http://localhost:5173` will fail before it reaches the server**, and the user will see the generic network-error banner. This is not speculative; it is the current state of the deployment.

**Mitigation (in scope, dev-only):** add a Vite dev-server proxy so the browser makes a same-origin request that Vite forwards server-side, where CORS does not apply.

```ts
// vite.config.ts — inside defineConfig(({ mode }) => ({ ... }))
const env = loadEnv(mode, process.cwd(), '')
server: {
  proxy: {
    '/api': { target: env.VITE_API_PROXY_TARGET, changeOrigin: true },
  },
}
```

with `VITE_API_BASE_URL=` (empty) in local `.env`, so `apiClient`'s `baseURL` falls back to `''` and it issues a relative `/api/v1/workers` — proxied in dev, and in a deployed build resolved against whatever `VITE_API_BASE_URL` that build was given. **The application source is identical in both cases**; only env differs. Note this leaves a real deployment dependent on the backend enabling CORS — raised as **Q3 (blocking for deploy, not for this ticket)**.

### 6.7 `.env.example` (tracked — placeholders only)

```dotenv
# Base URL for the ShiftSpot API.
# Leave EMPTY in local development to route requests through the Vite dev proxy
# (see vite.config.ts / VITE_API_PROXY_TARGET) — the backend does not yet send CORS headers.
# In a deployed build, set this to the environment's API origin.
VITE_API_BASE_URL=

# Dev-server-only: where the Vite proxy forwards /api/* during `npm run dev`.
VITE_API_PROXY_TARGET=http://your-api-host.example.com
```

The real host goes only in the untracked `.env`, per the Secrets and Environment Configuration rules in `.claude/agents/coding-agent.md`.

---

## 7. Types and Validation

### 7.1 TypeScript Types

**New, in `src/shared/api/workerApi.ts`** (wire-shape DTOs — these names never leak past this module):

```ts
/** Request body for POST /api/v1/workers — mirrors the backend's CreateWorkerRequest. */
interface CreateWorkerRequest {
  name: string;
  email: string;
  phoneNumber: string;   // ← the app's `phone`
  location: string;
  age: number;           // int32
  skills: string[];      // Title-Case labels, e.g. 'Plumbing'
}

/** 201 response body — mirrors the backend's WorkerDto. Every field is nullable per its
 *  OpenAPI schema, so this type is deliberately pessimistic and the mapper is tolerant. */
interface WorkerDto {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  location?: string | null;
  age?: number | null;
  skills?: string[] | null;
}
```

**Modified, in `src/shared/types/worker.ts`:**

```ts
export interface Worker extends WorkerRegistrationPayload {
  id: string;
  /** Not returned by POST /api/v1/workers — the backend does not expose a creation
   *  timestamp. Present on mock-sourced workers only. Never rendered by any screen. */
  createdAt?: string;
}

export interface ApiError {
  code: string;
  message: string;
  /** HTTP status when the failure came from a response (absent for network/offline failures). */
  status?: number;                                   // NEW
  field?: keyof WorkerRegistrationPayload;
  fieldErrors?: Partial<Record<DuplicateField, string>>;
}

export const DUPLICATE_WORKER_CODES = [
  'DUPLICATE_EMAIL',
  'DUPLICATE_PHONE',
  'DUPLICATE_EMAIL_AND_PHONE',
] as const;

export type DuplicateWorkerCode = (typeof DUPLICATE_WORKER_CODES)[number];

export function isDuplicateWorkerError(error: ApiError | null | undefined): boolean {
  return !!error && (DUPLICATE_WORKER_CODES as readonly string[]).includes(error.code);
}
```

**`createdAt` decision.** The backend's `WorkerDto` has no creation timestamp. Three options were considered: (a) synthesise `new Date().toISOString()` client-side, (b) keep it required and let it be `undefined` at runtime — a lie to the type system, (c) make it optional. **(c) is chosen.** Fabricating a server timestamp client-side (a) is data invention that would eventually be rendered and be wrong. (b) is a `strict`-mode violation in spirit. (c) is honest, and the blast radius is nil: `createdAt` is **never read by any component** — verified by grep, its only appearances are the mock, the type, and test fixtures that supply it (all of which still type-check against an optional field). Existing tests need no edit for this.

`isDuplicateWorkerError` is a function on the shared types module rather than a `.includes` inline at the page, so the page, the mapper, and the tests all agree on one definition.

### 7.2 Zod Schemas

**`workerRegistrationSchema` is not modified.** It keeps `phone`, and its `age: z.coerce.number().int().min(18).max(70)` already yields the `int32` the backend wants.

**Response validation — deliberately NOT a Zod schema.** A `z.parse` on the 201 body would *throw* on any shape drift, converting a successful server-side creation into a client-side failure, and would prompt a confused user to re-submit and create a duplicate. That is strictly worse than tolerating an odd body. Instead, `toWorker` is a **tolerant mapper with per-field fallbacks to the payload the client just submitted** — the client already knows every value it sent, so it can always produce a complete, correct `Worker` even from an empty response body:

```ts
function toWorker(dto: WorkerDto | undefined, submitted: WorkerRegistrationPayload): Worker {
  return {
    id: dto?.id ?? '',
    name: dto?.name ?? submitted.name,
    email: dto?.email ?? submitted.email,
    phone: dto?.phoneNumber ?? submitted.phone,
    location: dto?.location ?? submitted.location,
    age: dto?.age ?? submitted.age,
    skills: toSkillIds(dto?.skills) ?? submitted.skills,
    // createdAt intentionally omitted — the backend does not provide one
  };
}
```

An empty `id` is the one value that cannot be reconstructed. It is tolerated (nothing navigates on success today) and is the single place a future "view your new profile" link must guard — called out in a code comment so it cannot be missed.

---

## 8. Routing

| Route Path | Component | Lazy? | Guard |
|---|---|---|---|
| `/worker-registration` *(existing)* | `WorkerRegistrationPage` | Yes — already `React.lazy` + `Suspense` in the Router | None (PoC is login-less) |

**Confirmed not applicable** as a change: no route is added, removed, renamed, or re-guarded. The lazy-loading and Error Boundary requirements of the React-Specific Planning Rules are already satisfied by the shipped route and are re-verified, not re-implemented (§12).

---

## 9. Accessibility Plan

No new interactive element is introduced, so **the accessibility surface of this ticket is entirely the error states** — which this change makes reachable in new ways (real network failure, real 409, real 400) and, in one case, more frequently. Depth High: every applicable control is listed, including confirmations that existing behaviour is sufficient.

| Element / State | ARIA Requirements | Keyboard / Focus Behaviour | Status under this change |
|---|---|---|---|
| Duplicate banner (`WorkerRegistrationPage`) | `role="alert"` on the container — **already present**; announced by screen readers when it appears after an async submit. Decorative `!` badge and the amber rule are `aria-hidden="true"` — already correct | Not focusable, not interactive — correct for a status message | **Preserved.** The only change is *when* it renders. Critical: the banner must not lose `role="alert"` while the condition is edited |
| Generic failure banner (same node, different text) | Same `role="alert"` node; the network/500 path reuses it with "Registration failed. Please try again." | — | **Preserved.** Verified that the new code-based condition still renders the alert node for non-duplicate errors — the fallback string is inside the same branch |
| Per-field duplicate error (`email`, `phone`) | `FormField` renders `<p id="{field}-error" role="alert">`; `TextInput` carries `aria-describedby="{field}-error"` and `invalid` → `aria-invalid`. Both already wired, and both fire for RHF `setError` exactly as they do for resolver errors (the form computes `aria-describedby` from `errors.x`, which `setError` populates) | — | **Preserved, verified by inspection.** No change needed |
| Focus after a failed submit | — | **GAP being closed.** `shouldFocusError: true` moves focus on *resolver* failures only. Server-side `setError` in a `useEffect` does **not** move focus, so a screen-reader or keyboard user who submits and gets a 409 is left with focus on the (now re-enabled) submit button while the error appears above them. Add `setFocus(firstServerErroredField)` after the `setError` loop | **MODIFIED** — `WorkerRegistrationForm.tsx`. This is the one substantive a11y improvement in the ticket |
| Focus for a *non-field* failure (network, 500, indeterminate-400) | Banner is `role="alert"`, so it is announced without a focus move | Focus remains on the submit button, which is re-enabled — the user can retry with `Enter` without moving | **Acceptable as-is.** Deliberately not adding a programmatic focus jump to a non-interactive banner: `role="alert"` already announces it, and moving focus to a non-focusable region is a WCAG anti-pattern |
| Submit button during the real network call | `aria-busy={isLoading}` and `disabled` — both already in `Button.tsx` | Disabled → removed from the tab order while in flight; prevents double-submit | **Preserved.** More important now: the in-flight window is a real network round-trip (hundreds of ms, possibly seconds on an Elastic Beanstalk cold start) rather than the mock's fixed 600 ms |
| Loading announcement | `aria-busy` on the button is the only in-flight signal | — | **Confirmed sufficient, not extended.** A `role="status"` live region for "Submitting…" is a reasonable enhancement but is out of scope for a service-layer swap and would be an unrequested UI change — noted in Q11 |
| Success state (`SuccessMessage`) | Existing component; renders `mutation.data.name` | — | **Preserved.** The tolerant mapper (§7.2) guarantees `name` is always a non-empty string even from a degenerate response body, so the success message can never render "Thanks, undefined!" |
| Colour contrast of error text/banner | Unchanged (`text-red-600` on white; amber banner) | — | **Confirmed not applicable** — no colour or token changes in this ticket |

---

## 10. Error Handling Plan

| Scenario | Detection | Handling | User sees |
|---|---|---|---|
| **Network failure / offline / DNS / CORS preflight rejection** | Axios error with **no** `error.response` → interceptor emits `{ code: 'NETWORK_ERROR', status: undefined }` | Passed through `toWorkerCreationError` untouched (no `status`, so no duplicate branch). Mutation rejects; `mutation.isError` true | Generic banner: "Registration failed. Please try again." Form retains all entered values (RHF state is untouched by the mutation), so retry costs nothing |
| **Request timeout** (`apiClient` `timeout: 10_000`) | Axios `ECONNABORTED`, no `error.response` | Same as network failure. **No auto-retry** — a `POST` that may have committed server-side must not be replayed automatically | Generic banner + a still-filled form. Risk of the user manually creating a duplicate exists and is bounded by the backend's own uniqueness constraint returning 409 on the retry — an acceptable outcome |
| **`409 Conflict` — duplicate, field identified** | `status === 409` **and** message matches `/e-?mail/i` and/or `/phone|mobile|contact\s*number/i` | Mapped to `DUPLICATE_EMAIL` / `DUPLICATE_PHONE` / `DUPLICATE_EMAIL_AND_PHONE` with `field` and `fieldErrors` populated | Existing amber "Profile already exists" banner **and** inline error(s) under the offending field(s), with focus moved to the first — i.e. **identical to the shipped mock UX** |
| **`409 Conflict` — duplicate, field NOT identifiable** | `status === 409`, message matches neither pattern | `DUPLICATE_EMAIL_AND_PHONE` with **both** `fieldErrors` set; top-level message is the server's `detail`/`title` if present, else the existing both-fields copy | Amber banner + inline errors under both Email and Phone. Slightly over-broad but actionable — see §6.4 rationale and Q2 |
| **`400 Bad Request` (server-side validation)** | `status === 400` | **Not** treated as a duplicate. `code: 'HTTP_400'`, `message` from `ProblemDetails.detail ?? .title`. No invented field errors | Generic banner. Should be near-unreachable — the Zod schema is stricter than the backend's (`nullable` everywhere) — so its appearance is itself a signal of contract drift |
| **`5xx` server error** | `status >= 500` | `code: 'HTTP_5xx'`, message from `ProblemDetails` if the body is JSON, else axios's message. Not retried | Generic banner |
| **Non-JSON error body** (nginx HTML 502/504 page) | `data` is a string, not an object | The interceptor's optional-chained property reads yield `undefined`, so it falls back to `error.message`. Must **not** throw while normalising — the interceptor's own failure would surface as an unhandled rejection | Generic banner |
| **`201` with a body that does not match `WorkerDto`** (missing/renamed/null fields) | No detection needed — no schema throw | Tolerant `toWorker` fills every field from the submitted payload; `id` falls back to `''`. **The registration is treated as successful, because it was.** | Normal success screen, correct name |
| **`2xx` with an empty body** | `dto` is `undefined`/`''` | Same tolerant path — `toWorker(undefined, payload)` returns a complete `Worker` minus a real `id` | Normal success screen |
| **Skills in the response the client doesn't recognise** | `toSkillIds` finds no case-insensitive `SKILL_IDS` match | Unknown entries dropped; if the result is empty, fall back to the submitted `skills` | No visible effect (skills aren't on the success screen) |
| **Render-time crash in the page** | — | Existing feature-root Error Boundary (already in place from SLPTWM-17) catches it | Error Boundary fallback |
| **Zod validation failure (client-side)** | Before submit | Unchanged — inline per-field errors via the resolver; no request is made | Existing behaviour |

**Cross-cutting rule for the Coding Agent:** every failure path must end at a rejected promise carrying an object that satisfies `ApiError` — never a raw `AxiosError`, never a thrown string. `useWorkerRegistration` is typed `useMutation<Worker, ApiError, …>`, and `WorkerRegistrationPage` dereferences `mutation.error.fieldErrors` and `mutation.error.message` without guards. Leaking a non-`ApiError` rejection is a TypeScript lie that becomes a runtime crash in the banner.

---

## 11. Performance Considerations

Depth High — stated in full, including the items confirmed to need no work.

| Concern | Assessment / Approach |
|---|---|
| **Bundle size** | **No net change.** `axios` is already a dependency and already imported by `src/shared/api/client.ts`; this ticket makes that module actually reachable from the page's chunk. `workerApi.ts` is a few hundred bytes of mappers. **No new npm dependency is added** — this is a hard constraint for this ticket |
| **Dead code shipped** | `mockWorkerApi.ts` stays in the bundle (still used by search/detail) including its ~120 lines of seed data. Unchanged from today; not this ticket's problem to solve. Once search + detail are integrated it drops out entirely via tree-shaking/deletion |
| **Route code splitting** | Already satisfied — `WorkerRegistrationPage` is `React.lazy` + `Suspense`. **Confirmed not applicable as new work** |
| **Perceived latency** | Real network latency (plus possible Elastic Beanstalk cold start) replaces the mock's fixed 600 ms and may be noticeably longer. Mitigated by the existing `isLoading`/`aria-busy` button state. The 10 s `apiClient` timeout is **kept as-is**; raising it globally would degrade every future endpoint to hide one deployment's cold start (Q6) |
| **Duplicate/concurrent submissions** | Prevented by `Button`'s `disabled={disabled || isLoading}`. Verified present — this matters far more against a real persisting backend than it did against the mock |
| **Retry storms** | `useMutation` retry stays at the v5 default of `0`. No exponential backoff, no retry-on-mount. Explicitly a correctness choice, not an oversight |
| **Re-render cost** | Unchanged. The mutation drives exactly the same three renders (idle → pending → settled). No `useMemo`/`useCallback` is warranted; adding memoisation here would be noise |
| **Mapper cost** | `toCreateWorkerRequest`/`toWorker` iterate at most 6 skills. Constant-time for practical purposes; **no memoisation** |
| **`serverFieldErrors` effect churn** | The `useEffect` in `WorkerRegistrationForm` depends on the `serverFieldErrors` object identity, which changes only when `mutation.error` changes — i.e. once per failed submission. Adding `setFocus` inside it does not add a render. **No change to the dependency array**; introducing an inline object literal for that prop at the call site would cause an effect loop and is a review blocker |
| **Dev proxy overhead** | `server.proxy` affects `vite dev` only; it is absent from the production bundle and from `vite build` output |
| **Query cache growth** | A mutation result is held only for the mutation's lifetime; no cache-size concern |
| **Payload size** | One small JSON object per submission. **Confirmed not applicable** — no pagination, batching, or compression concerns |

---

## 12. Standards Compliance Checklist

- [ ] All components are functional — no class components (no component added; the two modified stay functional)
- [ ] All props interfaces defined with `[ComponentName]Props` naming — `WorkerRegistrationFormProps` unchanged
- [ ] **No `any` types** — `WorkerDto` fields are `?: T | null`, and the interceptor's `data` is narrowed via `unknown` + optional-chained casts, matching the existing style in `client.ts`
- [ ] Every new feature folder has an `index.ts` public API — no new feature folder; `src/shared/api/index.ts` is updated to export `workerApi`
- [ ] No cross-feature internal imports — `workerApi` lives in `shared/`; `worker-registration` reaches the API only through `shared/hooks` → `shared/services`. **`shared/` must not import from any feature** (this is why `SKILL_OPTIONS` already lives in `shared/types` and the skill-label mapping can be built there)
- [ ] Every new page is lazy-loaded with `React.lazy` + `Suspense` — no new page; existing route already compliant
- [ ] Every feature root wrapped in an Error Boundary — already in place; re-verified, not re-implemented
- [ ] All interactive elements keyboard-accessible — no new interactive elements; **focus management on server errors is improved** (§9)
- [ ] All images have `alt`; all inputs have `<label>` — unchanged; all six fields already use `FormField`'s `<label htmlFor>`
- [ ] `aria-label` / `aria-describedby` used where visual context is insufficient — existing `aria-describedby="{field}-error"` wiring confirmed to also cover server-set errors
- [ ] TanStack Query used for server state — `useMutation` retained; **no `useEffect` + `useState` fetching introduced**
- [ ] Zustand used only for global state — none added
- [ ] **All API calls go through the service layer** — `axios` is imported only by `src/shared/api/client.ts`; `workerApi.ts` uses `apiClient`; components import neither
- [ ] Forms use React Hook Form + Zod — unchanged
- [ ] Unit tests planned — see the table below
- [ ] **Confidential data / environment-specific endpoints read from `import.meta.env.VITE_*` and documented in `.env.example`** — `VITE_API_BASE_URL` via `apiClient`; `VITE_API_PROXY_TARGET` via `loadEnv` in `vite.config.ts`. **The Elastic Beanstalk host appears in no source file.** Real values live only in the untracked `.env`; `.env.example` holds placeholders only. Per `coding-agent.md` §"Secrets and Environment Configuration Rules"
- [ ] `.env` is not staged, not committed, and does not appear in the PR diff (`.gitignore` already covers it — the GitHub PR Skill's Confidential Data Check must come back clean)

**Intended test set (owned by the Unit Test Agent, Parallel Block B — excluded from the Plan Checksum):**

| Test file | Must cover |
|---|---|
| `src/shared/api/workerApi.test.ts` *(new)* | Request body: `phone` → `phoneNumber`; skills `['plumbing','electrical']` → `['Plumbing','Electrical']`; `age` is a number, not a string; **asserts the body has no `phone` key**. Success: 201 `WorkerDto` → `Worker` with `phone` restored and skills lowercased. Tolerant mapping: empty body / missing `id` / null fields → falls back to the submitted payload. 409 with "email" in `detail` → `DUPLICATE_EMAIL` + `fieldErrors.email`; with "phone" → `DUPLICATE_PHONE`; with both → `DUPLICATE_EMAIL_AND_PHONE`; **indeterminate 409 → both fieldErrors**. 400 → **not** a duplicate. Network error (no `response`) → passthrough. `apiClient` mocked with `vi.mock('@/shared/api/client')` — **no real network in tests** |
| `src/shared/api/client.test.ts` *(new)* | Interceptor normalisation: `ProblemDetails` body → `message` from `detail`, then `title`; legacy `{code,message}` body still wins; `status` is populated from the response and `undefined` when there is none; non-JSON/string body does not throw |
| `src/shared/services/workerService.test.ts` *(rewrite)* | Currently asserts the **mock's** duplicate behaviour through the service and will fail after the swap. Rewritten to assert delegation to `workerApi.createWorker` (mocked) and pass-through of both resolution and rejection. Its mock-specific duplicate assertions move to `workerApi.test.ts` |
| `src/shared/api/mockWorkerApi.test.ts` *(unchanged)* | Still valid — the mock itself is unchanged |
| `src/features/worker-registration/WorkerRegistrationPage.test.tsx` *(extend)* | Duplicate banner renders for a duplicate **code** even when `fieldErrors` is empty; generic banner for a `NETWORK_ERROR`; success screen renders the name from the mapped response |
| `src/features/worker-registration/WorkerRegistrationForm.test.tsx` *(extend)* | Focus moves to the Email input when `serverFieldErrors.email` arrives; to Phone when only phone; no focus move when the prop is `undefined` |

---

## 13. Open Questions

Every one carries a best-reasoned default, so **implementation is not blocked on any of them**. "Blocking?" means blocking for merge/deploy, not for starting work.

| # | Question | Plan's default (implement this unless told otherwise) | Owner | Blocking? | Resolution needed by |
|---|---|---|---|---|---|
| **Q1** | **Skills casing** — does the backend expect `"plumbing"` or `"Plumbing"`? The ticket only says `["string"]`. | **Send Title-Case labels** (`"Plumbing"`). Not a convention guess: existing live records store `["Plumbing","Electrical","Gardening","Cleaning"]`, the backend does not appear to normalise casing, and the `GET` search filter matches on these strings — sending lowercase would create records invisible to skill search. Mapping derived from `SKILL_OPTIONS` so it can't drift. **This overrides the "send lowercase ids" suggestion in the ticket brief.** | BE dev | No | Code review |
| **Q2** | **409 body shape** — what exactly do `title`/`detail` say on a duplicate, and do they name the offending field? Not probed, because confirming requires a real `POST` that would mutate the shared dev database. | 409 ⇒ duplicate, unconditionally. Field attribution by case-insensitive substring on `title + detail`; **indeterminate ⇒ flag both Email and Phone**. Reviewer can settle this in one command: `curl -i -X POST <host>/api/v1/workers -H 'Content-Type: application/json' -d '{"name":"X","email":"Test1@gmail.com","phoneNumber":"9809878867","location":"LA","age":20,"skills":["Plumbing"]}'` — reusing an existing record's email/phone so it 409s rather than creating data. If the real wording is known, the regexes should be tightened to match it exactly. | BE dev / Tech Lead | **Yes — for merge.** A wrong assumption silently downgrades duplicates to a generic failure | Before merge |
| **Q3** | **CORS is not configured** — the deployment sends no `Access-Control-Allow-Origin` and returns `405` for `OPTIONS`. A direct browser call from any origin will fail preflight. | Local dev is unblocked by a **Vite dev proxy** (in scope, §6.6). A **deployed** frontend still cannot call this backend until CORS is enabled server-side. **Raise a BE ticket.** | BE dev / DevOps | **Yes — for deployment.** Not blocking for local dev or for this ticket's merge | Before any FE deploy |
| **Q4** | **Auth** — the OpenAPI document declares a top-level `Bearer` (JWT) security requirement, but the endpoints answer unauthenticated requests today. | **Send no auth header.** Verified: unauthenticated `GET` returns `200`, and `POST` declares no operation-level security. Keep the token attachment point centralised (a future `apiClient` *request* interceptor) so enabling auth is a one-file change and never touches `workerApi`/`workerService` | BE dev | No | Before the security requirement is actually enforced |
| **Q5** | **Response shape** — the ticket documented only the request. | **Resolved from the OpenAPI doc, not assumed:** `201` returns `WorkerDto` = `{id, name, email, phoneNumber, location, age, skills}`. **There is no `createdAt`** — hence `Worker.createdAt` becomes optional (§7.1). Mapper is tolerant so a shape change cannot turn a successful creation into a client-side error | — | No | — |
| **Q6** | **Timeout** — is `apiClient`'s 10 s enough for an Elastic Beanstalk instance that may cold-start? | **Keep 10 s.** Raising the global timeout to mask one environment's cold start penalises every future endpoint. If cold starts prove painful in demos, prefer keeping the instance warm over widening the client timeout | Tech Lead | No | Post-demo, if observed |
| **Q7** | **Search/detail still mocked** — after this ticket, a worker registered through the real API will **not** appear in the job-seeker search, because search still reads the in-memory mock. This is a visible demo inconsistency. | **Accept it for this ticket.** SLPTWM-129's scope is `POST` only. The search/detail integrations are separate tickets, and pulling them in would blow the scope and the checksum. **Flag to whoever demos.** No search-cache invalidation is added here (§5.2) precisely because it would refetch the mock and mislead | PO / Tech Lead | No | Before a stakeholder demo |
| **Q8** | **Should a `VITE_USE_MOCK_API` toggle be added**, so the mock can be re-enabled for offline demos? (`coding-agent.md` explicitly names this pattern.) | **No — not in this ticket.** The dev proxy already solves local development, and a runtime branch in the service layer doubles the paths every test must cover for a benefit no one has asked for. Revisit if offline demos become a real requirement | Tech Lead | No | Plan approval |
| **Q9** | **Should `mockWorkerApi.createWorker` be deleted now** that nothing in production calls it? | **No — keep it.** The module survives regardless (search/detail depend on it), it is still covered by its own tests, and removing one of three symmetrical functions is churn. It goes when the whole mock goes | Tech Lead | No | Plan approval |
| **Q10** | **Where should the duplicate message strings live** — duplicated into `workerApi.ts`, or promoted to `shared/types`? | **Duplicate them into `workerApi.ts`.** The mock is scheduled for deletion, so a shared constant would shortly have one consumer. A one-line comment cross-references the mock so the pair stays in sync while both exist. Trivially reversible if the reviewer disagrees | Tech Lead | No | Code review |
| **Q11** | **Should an `aria-live` "Submitting…" status region be added**, now that the in-flight window is a real (possibly multi-second) network call rather than a fixed 600 ms? | **No — out of scope.** `Button`'s `aria-busy` + disabled state is the existing signal and is WCAG-adequate. Adding a live region is an unrequested UI change in a service-layer ticket. Worth a follow-up if the backend proves slow | UX / Tech Lead | No | Follow-up ticket |
| **Q12** | **`ApiError.status` is added to a shared type** consumed by the job-seeker feature. Any objection? | It is **optional and additive** — no existing consumer (which matches on `code`, e.g. `WORKER_NOT_FOUND`) is affected, and no test fixture needs updating. Adding it is what makes status-first duplicate detection possible without parsing strings for the status | Tech Lead | No | Code review |
| **Q13** | **Email casing** — Zod applies `.toLowerCase()` before submit, so `jane@X.com` is stored lowercase; the existing live record shows `"Test1@gmail.com"` (mixed case), suggesting the backend preserves whatever it receives. Could a case-difference defeat backend duplicate detection? | **Keep the client-side lowercasing** (existing shipped behaviour; changing it would alter validated form semantics). If the backend's uniqueness check is case-*sensitive*, two profiles differing only in email case could both be created — a **backend** concern to raise, not something the client should paper over | BE dev | No | Backend hardening |
| **Q14** | **`EscalationFlag: true`** — this ticket modifies `src/shared/services/`, `src/shared/api/`, and `src/shared/types/`, all under `src/shared/**`. | Explicit **tech-lead sign-off required at §14** before coding starts. The two highest-blast-radius edits are `client.ts` (shared interceptor — mitigated by having zero production consumers today, plus new dedicated tests) and `worker.ts` (`Worker.createdAt` widened — mitigated by `createdAt` being read by no component) | Tech Lead | **Yes** | Plan approval |

---

## 14. Approval Sign-Off

```
Reviewed by:    [Tech Lead name]
Date reviewed:  [YYYY-MM-DD]
Decision:       Approved | Rework required
Notes:          EscalationFlag = true — this task modifies src/shared/api/, src/shared/services/,
                and src/shared/types/. Explicit sign-off required before coding begins (Q14).

                Please confirm or correct, at minimum:
                  Q1  Skills sent as Title-Case labels ("Plumbing"), not lowercase ids
                  Q2  409 => duplicate; indeterminate 409 flags BOTH email and phone
                  Q3  Backend CORS is a separate BE ticket; dev proxy is the interim fix
                  Q14 Approval to modify the shared apiClient interceptor and Worker type

Plan Checksum:  CREATE 3 · MODIFY 7 · DELETE 0   (test files excluded)
```
