# Low-Level Design (LLD)

| Field | Value |
|---|---|
| **Story / Task ID** | SLPTWM-17 |
| **Title** | Implement Worker Profile Registration Happy Path |
| **Issue Type** | Story |
| **Depth** | High |
| **Author** | Sparc Dev Pipeline |
| **Date** | 2026-09-07 |
| **Status** | Approved |
| **Reviewer** | Sparc Team |
| **Related PRD** | ShiftSpot Job Portal PoC — Worker Discovery |
| **Sprint** | TBD |

---

## 1. Summary of Change

Implement the happy-path Worker Profile Registration flow for the ShiftSpot Job Portal PoC: a Landing Page with an "Act as a Worker" call-to-action that routes to a Worker Registration screen, where a worker submits Name, Email, Phone, Location, Age and Skills and receives a success confirmation. Because the repository is currently the bare Vite + React + TypeScript starter, this ticket also scaffolds the entire project foundation — Tech Stack dependency installation, TypeScript strict mode, Tailwind CSS, Vitest + React Testing Library, and the canonical `src/app` / `src/features` / `src/shared` layout — establishing every convention that later tickets will follow.

The submission is served by a mocked service implementation behind a real service-layer boundary: `workerService.createWorker()` is the single call site, backed today by an in-module mock that resolves after a simulated latency, and swappable for a live Axios endpoint by changing one function body. No component, hook, or page has knowledge of the mock.

This ticket is explicitly scoped to the happy path. Field-level validation is client-side (Zod + React Hook Form); email/phone uniqueness is enforced as format validation plus a client-side check against the in-memory mock store only — see Section 13 note R-1.

---

## 2. Scope of Change

### 2.1 Files to CREATE (39 total)

| # | Path | Purpose |
|---|---|---|
| 1 | `tailwind.config.js` | Tailwind content globs + theme tokens |
| 2 | `postcss.config.js` | Tailwind/autoprefixer PostCSS pipeline |
| 3 | `src/test/setup.ts` | Vitest global setup — `@testing-library/jest-dom`, `cleanup` |
| 4 | `src/app/App.tsx` | Root composition: QueryClientProvider → BrowserRouter → ErrorBoundary → Suspense → Router |
| 5 | `src/app/Router.tsx` | Route table (`/`, `/worker/register`), lazy imports |
| 6 | `src/app/index.ts` | App-layer public API |
| 7 | `src/features/landing/LandingPage.tsx` | Landing screen with "Act as a Worker" CTA |
| 8 | `src/features/landing/LandingPage.test.tsx` | Landing render + navigation tests |
| 9 | `src/features/landing/index.ts` | Feature public API |
| 10 | `src/features/worker-registration/WorkerRegistrationPage.tsx` | Page shell, heading, success/error region |
| 11 | `src/features/worker-registration/WorkerRegistrationForm.tsx` | RHF + Zod form |
| 12 | `src/features/worker-registration/types.ts` | Feature-local form types |
| 13 | `src/features/worker-registration/constants.ts` | Skill options, location options, age bounds |
| 14 | `src/features/worker-registration/index.ts` | Feature public API |
| 15 | `src/features/worker-registration/WorkerRegistrationForm.test.tsx` | Form validation + submit tests |
| 16 | `src/shared/api/client.ts` | Axios instance, base URL, interceptors |
| 17 | `src/shared/api/mockWorkerApi.ts` | In-memory mock store + simulated latency |
| 18 | `src/shared/api/index.ts` | API layer public API |
| 19 | `src/shared/services/workerService.ts` | `createWorker()` — the single swap point |
| 20 | `src/shared/services/workerService.test.ts` | Service contract tests |
| 21 | `src/shared/services/index.ts` | Services public API |
| 22 | `src/shared/hooks/useWorkerRegistration.ts` | TanStack Query mutation hook |
| 23 | `src/shared/hooks/useWorkerRegistration.test.ts` | Hook tests via `renderHook` |
| 24 | `src/shared/hooks/index.ts` | Hooks public API |
| 25 | `src/shared/validation/schemas.ts` | `workerRegistrationSchema` (Zod) |
| 26 | `src/shared/validation/schemas.test.ts` | Schema unit tests |
| 27 | `src/shared/validation/index.ts` | Validation public API |
| 28 | `src/shared/types/worker.ts` | `Worker`, `WorkerRegistrationPayload`, `ApiError`, `SkillOption`, `SkillId` |
| 29 | `src/shared/types/index.ts` | Types public API |
| 30 | `src/shared/components/Button.tsx` | Accessible button primitive |
| 31 | `src/shared/components/TextInput.tsx` | Labelled text input |
| 32 | `src/shared/components/SelectInput.tsx` | Labelled single select |
| 33 | `src/shared/components/MultiSelect.tsx` | Accessible multi-select (checkbox group) |
| 34 | `src/shared/components/FormField.tsx` | Label + control + error wiring |
| 35 | `src/shared/components/SuccessMessage.tsx` | Success confirmation (`role="status"`) |
| 36 | `src/shared/components/ErrorAlert.tsx` | Error banner (`role="alert"`) |
| 37 | `src/shared/components/ErrorBoundary.tsx` | Class-based render-error boundary |
| 38 | `src/shared/components/index.ts` | Components public API |
| 39 | `src/shared/index.ts` | Shared layer public API (barrel of barrels) |

### 2.2 Files to MODIFY (5 total)

| # | Path | Change |
|---|---|---|
| 1 | `package.json` | Add deps `react-router-dom`, `react-hook-form`, `zod`, `@hookform/resolvers`, `axios`, `zustand`, `@tanstack/react-query`; devDeps `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@vitest/coverage-v8`, `tailwindcss`, `postcss`, `autoprefixer`; add `test`, `test:run`, `coverage` scripts |
| 2 | `tsconfig.app.json` | `"strict": true`, add `types` for vitest/jest-dom |
| 3 | `vite.config.ts` | Add `test` block (jsdom, setupFiles, coverage) + vitest triple-slash reference |
| 4 | `src/main.tsx` | Bootstrap from `src/app` instead of `./App` |
| 5 | `src/index.css` | Replace starter CSS with Tailwind directives + base tokens |

### 2.3 Files to DELETE (3 total)

| # | Path | Reason |
|---|---|---|
| 1 | `src/App.tsx` | Superseded by `src/app/App.tsx` |
| 2 | `src/App.css` | Superseded by Tailwind |
| 3 | `src/assets/react.svg` | Unused starter asset |

### 2.4 Files to REUSE

`index.html`, `tsconfig.json`, `tsconfig.node.json`, `public/vite.svg`, `.gitignore`

**Plan Checksum: CREATE 39, MODIFY 5, DELETE 3**

---

## 3. Component Tree

```
main.tsx
 └── App                                   (src/app/App.tsx)
      └── QueryClientProvider               (@tanstack/react-query)
           └── BrowserRouter                (react-router-dom)
                └── ErrorBoundary           (src/shared/components)
                     └── Suspense fallback={<PageLoader/>}
                          └── Router        (src/app/Router.tsx)
                               ├── "/"                    → LandingPage        (lazy)
                               │    └── Button "Act as a Worker"
                               └── "/worker/register"     → WorkerRegistrationPage (lazy)
                                    ├── SuccessMessage    (conditional, role="status")
                                    ├── ErrorAlert        (conditional, role="alert")
                                    └── WorkerRegistrationForm
                                         ├── FormField → TextInput   (Name)
                                         ├── FormField → TextInput   (Email)
                                         ├── FormField → TextInput   (Phone)
                                         ├── FormField → SelectInput (Location)
                                         ├── FormField → TextInput   (Age, type=number)
                                         ├── FormField → MultiSelect (Skills)
                                         └── Button (submit)
```

---

## 4. Component Specifications

| Component | File | Type | Props Interface | Responsibility |
|---|---|---|---|---|
| `App` | `src/app/App.tsx` | FC | `{}` | Compose providers; create `QueryClient` once via `useState` initializer |
| `Router` | `src/app/Router.tsx` | FC | `{}` | `<Routes>` with lazy-loaded route elements and a `*` fallback redirect to `/` |
| `LandingPage` | `src/features/landing/LandingPage.tsx` | FC | `{}` | Hero copy + `Button` calling `navigate('/worker/register')` |
| `WorkerRegistrationPage` | `src/features/worker-registration/WorkerRegistrationPage.tsx` | FC | `{}` | Owns submit orchestration via `useWorkerRegistration`; renders form or `SuccessMessage` |
| `WorkerRegistrationForm` | `.../WorkerRegistrationForm.tsx` | FC | `{ onSubmit: (v: WorkerRegistrationFormValues) => void; isSubmitting: boolean }` | RHF `useForm` with `zodResolver`; renders all six fields |
| `FormField` | `src/shared/components/FormField.tsx` | FC | `{ id: string; label: string; error?: string; required?: boolean; hint?: string; children: ReactNode }` | Wires `<label htmlFor>`, `aria-describedby`, error text |
| `TextInput` | `src/shared/components/TextInput.tsx` | `forwardRef<HTMLInputElement>` | `InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }` | Styled input, `aria-invalid` |
| `SelectInput` | `src/shared/components/SelectInput.tsx` | `forwardRef<HTMLSelectElement>` | `SelectHTMLAttributes<HTMLSelectElement> & { options: ReadonlyArray<{value: string; label: string}>; invalid?: boolean }` | Native `<select>` for a11y |
| `MultiSelect` | `src/shared/components/MultiSelect.tsx` | FC | `{ name: string; legend: string; options: readonly SkillOption[]; value: SkillId[]; onChange: (v: SkillId[]) => void; invalid?: boolean }` | `<fieldset>/<legend>` checkbox group — not a custom listbox |
| `Button` | `src/shared/components/Button.tsx` | FC | `ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' \| 'secondary'; isLoading?: boolean }` | `type` explicit, disabled+`aria-busy` while loading |
| `SuccessMessage` | `src/shared/components/SuccessMessage.tsx` | FC | `{ title: string; description?: string; children?: ReactNode }` | `role="status" aria-live="polite"` |
| `ErrorAlert` | `src/shared/components/ErrorAlert.tsx` | FC | `{ message: string; onRetry?: () => void }` | `role="alert"` |
| `ErrorBoundary` | `src/shared/components/ErrorBoundary.tsx` | Class | `{ children: ReactNode; fallback?: ReactNode }` | `getDerivedStateFromError` + `componentDidCatch` logging |

---

## 5. State Management

| State | Owner | Mechanism | Rationale |
|---|---|---|---|
| Form field values, touched/dirty, field errors | `WorkerRegistrationForm` | React Hook Form (`useForm` + `zodResolver`) | Uncontrolled inputs; no re-render per keystroke |
| Submission in-flight / error / success | `WorkerRegistrationPage` | TanStack Query `useMutation` via `useWorkerRegistration` | Server state belongs to the query layer, not component state |
| Created worker record (for confirmation copy) | `WorkerRegistrationPage` | `mutation.data` | No duplicate local copy |
| Global app state | — | **No Zustand store created** | Nothing is shared across features yet; adding a store now would be speculative. Zustand stays installed per Tech Stack for later tickets |
| Route state | React Router | `useNavigate` | — |

---

## 6. Data Layer — TanStack Query

| Key | Type | Used by |
|---|---|---|
| `['worker', 'register']` | mutation key | `useWorkerRegistration` |
| `['workers', 'list']` | query key (reserved, unused this ticket) | future worker listing ticket — declared in `queryKeys` so later tickets don't invent a divergent shape |

`QueryClient` defaults: `retry: 0` for mutations (a resubmitted registration must not silently double-create), `refetchOnWindowFocus: false`.

```ts
// src/shared/hooks/useWorkerRegistration.ts
export function useWorkerRegistration() {
  return useMutation<Worker, ApiError, WorkerRegistrationPayload>({
    mutationKey: ['worker', 'register'],
    mutationFn: (payload) => workerService.createWorker(payload),
  });
}
```

---

## 7. Services / API

| Concern | Detail |
|---|---|
| Logical endpoint | `POST /api/workers` |
| Real transport | `src/shared/api/client.ts` — Axios instance, `baseURL` from `import.meta.env.VITE_API_BASE_URL`, 10s timeout, response-error interceptor normalising to `ApiError` |
| Mock | `src/shared/api/mockWorkerApi.ts` — module-scoped `Map<string, Worker>`, `~600ms` simulated latency, generates `id` via `crypto.randomUUID()`, `createdAt` ISO timestamp; rejects with `ApiError{code:'DUPLICATE_EMAIL'}` if email already present |
| Single swap point | `workerService.createWorker(payload)` — body is `return mockWorkerApi.createWorker(payload)` today; becomes `const {data} = await apiClient.post<Worker>('/api/workers', payload); return data;` later. **Nothing else changes.** |
| Rule | No component or hook imports `mockWorkerApi` directly — enforced in code review |

---

## 8. Types & Validation

```ts
// src/shared/types/worker.ts
export type SkillId = 'cleaning' | 'delivery' | 'kitchen' | 'retail' | 'warehouse' | 'security';
export interface SkillOption { readonly value: SkillId; readonly label: string }

export interface WorkerRegistrationPayload {
  name: string; email: string; phone: string;
  location: string; age: number; skills: SkillId[];
}
export interface Worker extends WorkerRegistrationPayload {
  id: string; createdAt: string;
}
export interface ApiError { code: string; message: string; field?: keyof WorkerRegistrationPayload }
```

```ts
// src/shared/validation/schemas.ts
export const workerRegistrationSchema = z.object({
  name:     z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email:    z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone:    z.string().trim().regex(/^\+?[0-9\s-]{7,15}$/, 'Enter a valid phone number'),
  location: z.string().min(1, 'Select a location'),
  age:      z.coerce.number().int('Age must be a whole number')
              .min(18, 'You must be at least 18').max(70, 'Age must be 70 or below'),
  skills:   z.array(z.enum(['cleaning','delivery','kitchen','retail','warehouse','security']))
              .min(1, 'Select at least one skill'),
});
export type WorkerRegistrationFormValues = z.infer<typeof workerRegistrationSchema>;
```

No `any` anywhere; `WorkerRegistrationFormValues` is inferred, never hand-written twice.

---

## 9. Routing

| Path | Element | Loading | Notes |
|---|---|---|---|
| `/` | `LandingPage` | `React.lazy` + `Suspense` | Registered in `src/app/Router.tsx` (route registration only — not an escalation trigger) |
| `/worker/register` | `WorkerRegistrationPage` | `React.lazy` + `Suspense` | — |
| `*` | `<Navigate to="/" replace />` | — | Prevents blank screen on bad URL |

---

## 10. Accessibility Plan *(mandatory at High depth)*

| Component | Requirement | Implementation |
|---|---|---|
| `LandingPage` | Single `<h1>`; CTA reachable by keyboard | Semantic `<main>`, `<h1>`, real `<button>` |
| `WorkerRegistrationPage` | Page title announced; success announced without focus theft | `<h1>`, `SuccessMessage` with `role="status" aria-live="polite"` |
| `WorkerRegistrationForm` | Every control labelled; errors programmatically associated | `<label htmlFor>` per field; `aria-describedby={`${id}-error`}`; `aria-invalid` |
| Error summary | Submit with errors focuses first invalid field | RHF `shouldFocusError: true` |
| `MultiSelect` | Group has an accessible name | `<fieldset>` + `<legend>`; native checkboxes (deliberately not a custom listbox — avoids a keyboard trap) |
| `SelectInput` | Native `<select>` | No custom dropdown, no ARIA re-implementation |
| `Button` | Loading state announced, not just visual | `aria-busy`, `disabled`, visible text retained |
| `ErrorAlert` | Failure announced immediately | `role="alert"` (assertive) |
| Focus visibility | Never removed | Tailwind `focus-visible:ring-2`; no `outline-none` without a replacement |
| Colour contrast | ≥ 4.5:1 body / 3:1 large | Palette chosen from Tailwind 600+ on white |
| Images | All meaningful images have `alt` | Only decorative SVG used → `aria-hidden="true"` |
| Zoom/reflow | Usable at 200% | Fluid Tailwind container, no fixed pixel widths |

Per Orchestrator Rule 5, any of the above missing at review time is Critical.

---

## 11. Error Handling Plan *(mandatory at High depth)*

| Failure | Detection | User-visible behaviour | Recovery |
|---|---|---|---|
| Field validation failure | Zod resolver on submit + on blur revalidation | Inline error under the field, first invalid field focused | User corrects and resubmits |
| Duplicate email in mock store | `ApiError.code === 'DUPLICATE_EMAIL'` | `ErrorAlert` + field-level error on Email via `setError('email', ...)` | Change email and resubmit |
| Mock/network rejection (generic) | `mutation.isError` | `ErrorAlert` with "Registration failed. Please try again." + Retry button | `mutation.reset()` then resubmit; form values preserved (form is not unmounted on error) |
| Render-time exception | `ErrorBoundary` | Full-page fallback with reload action | Reload |
| Lazy chunk load failure | `Suspense` + `ErrorBoundary` | Same boundary fallback | Reload |
| Unknown route | Router `*` | Redirect to `/` | — |

No `console.log` in shipped paths; `ErrorBoundary.componentDidCatch` uses `console.error` only.

---

## 12. Performance Considerations *(mandatory at High depth)*

| Concern | Assessment | Action |
|---|---|---|
| Bundle size | React Router + RHF + Zod + TanStack Query + Axios ≈ 60–70 KB gzip | Accepted — all are Tech Stack mandated. No UI kit added; Tailwind purges unused CSS |
| Route splitting | Both routes lazy | `React.lazy` + `Suspense` in `Router.tsx` |
| Re-render churn on typing | RHF keeps inputs uncontrolled | No `watch()` of the whole form; only `formState.errors` consumed |
| `MultiSelect` controlled value | Small array, 6 options | Controlled via RHF `Controller`; `onChange` wrapped in `useCallback` |
| Inline object/array props | Would break memo | `SKILL_OPTIONS`/`LOCATION_OPTIONS` are module-level `as const` in `constants.ts` |
| `QueryClient` identity | Recreating per render resets cache | Created once in `useState(() => new QueryClient())` |
| Memoization | Not applied speculatively | No `React.memo`/`useMemo` without a measured need — avoids premature-optimization findings |
| Leaks | Mock timer must not resolve after unmount | Mutation state owned by TanStack Query, which handles unmount; mock uses a plain resolved-promise timeout with no subscription |
| Images/fonts | None added | System font stack via Tailwind default |

---

## 13. Standards Compliance Checklist

| # | Standard | Status |
|---|---|---|
| 1 | React 18 functional components + hooks only (except `ErrorBoundary`, which must be a class) | Planned |
| 2 | TypeScript strict; no `any` (Rule 6 — Critical) | Planned |
| 3 | Zustand for global state — none needed this ticket, dependency still installed | Planned |
| 4 | TanStack Query for all server state | Planned |
| 5 | React Hook Form for all forms | Planned |
| 6 | Zod for all validation, schema is the single source of truth | Planned |
| 7 | Tailwind for all styling; no CSS modules, no inline style objects | Planned |
| 8 | React Router v6 with lazy routes | Planned |
| 9 | Axios only via `src/shared/api/client.ts` | Planned |
| 10 | Cross-feature imports only via `index.ts` (Rule 4) | Planned |
| 11 | Accessibility criticals (Rule 5) covered in Section 10 | Planned |
| 12 | Vitest + RTL; tests colocated; user-centric queries (`getByRole`/`getByLabelText`) | Planned |
| 13 | Conventional commits, incremental (Rule 9) — `feat(worker-registration): ...` | Planned |
| 14 | No secrets committed; API base URL via `import.meta.env` | Planned |

### Open Questions (non-blocking unless noted)

| # | Question |
|---|---|
| Q-1 | Should Location be a free-text field rather than a fixed option list once real data exists? |
| Q-2 | Is the 18–70 age range product-approved, or placeholder? |
| Q-3 | Is the six-item skill taxonomy final? Should it come from an API? |
| Q-4 | Should phone validation be locale-aware (E.164) rather than a permissive regex? |
| Q-5 | Does the success screen need a "Register another worker" action? |
| Q-6 | Should the worker be persisted to `localStorage` so a refresh survives, in the PoC? |
| Q-7 | Is there a designed visual spec (Figma) that supersedes the Tailwind defaults chosen here? |
| Q-8 | Should the landing page also carry an "Act as an Employer" CTA stub? |
| Q-9 | Is analytics/event tracking in scope for the PoC? |
| Q-10 | **Coding Agent must resolve at implementation start:** dependency peer-conflicts across React 18 + the installed versions of RHF/TanStack Query/Zod resolvers |
| Q-11 | **Coding Agent must resolve at implementation start:** whether to introduce a `@/` path alias (tsconfig `paths` + Vite `resolve.alias`) or use relative imports throughout |

### Resolved Assumptions

| # | Assumption |
|---|---|
| R-1 | Uniqueness is client-side only against the in-memory mock store; no backend uniqueness guarantee exists in this PoC |
| R-2 | No authentication is required to register — the flow is public |
| R-3 | No Zustand store is created this ticket; the dependency is installed for future tickets |
| R-4 | The mock lives behind `workerService`, and a live API swap is a one-function change |
| R-5 | This ticket owns the project scaffolding (Tailwind, Vitest, strict TS, folder layout) as a prerequisite, not as scope creep |

---

## 14. Approval Sign-Off

**Reviewed by:** User (Sparc Team)
**Date reviewed:** 2026-09-07
**Decision:** Approved
**Notes:** Approved as drafted, including all Resolved Assumptions (R-1 through R-5). Open Questions Q-1 through Q-11 remain non-blocking and can be addressed in follow-up tickets, except Q-10 (dependency peer conflicts) and Q-11 (path alias `@/`) which the Coding Agent must resolve at the start of implementation.
