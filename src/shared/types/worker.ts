export const SKILL_IDS = [
  'plumbing',
  'electrical',
  'gardening',
  'carpentry',
  'painting',
  'cleaning',
] as const

export type SkillId = (typeof SKILL_IDS)[number]

export interface SkillOption {
  readonly value: SkillId
  readonly label: string
}

export interface WorkerRegistrationPayload {
  name: string
  email: string
  phone: string
  location: string
  age: number
  skills: SkillId[]
}

export interface Worker extends WorkerRegistrationPayload {
  id: string
  /** Not returned by POST /api/v1/workers — the backend does not expose a creation
   *  timestamp. Present on mock-sourced workers only. Never rendered by any screen. */
  createdAt?: string
}

// Grid order matches the design: row 1 = Plumbing, Electrical, Gardening;
// row 2 = Carpentry, Painting, Cleaning. Promoted here (from
// worker-registration/constants.ts) so both worker-registration and
// job-seeker share one label source — shared must not import from a feature.
export const SKILL_OPTIONS: readonly SkillOption[] = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'painting', label: 'Painting' },
  { value: 'cleaning', label: 'Cleaning' },
] as const

export interface WorkerSearchFilters {
  /** Empty array means "no skill constraint". OR-matched against the worker's skills. */
  skills: SkillId[]
  /** Trimmed; omitted entirely when the user left the box empty. */
  location?: string
  /** Omitted entirely when the user left the box empty. */
  age?: number
}

// Fields that can be independently flagged as duplicates by the mock API —
// email and phone are checked against separate uniqueness indexes, and either
// or both may be duplicated on the same submission.
export type DuplicateField = 'email' | 'phone'

/** Discriminator for the 404 branch — shared by the mock API and the detail UI. */
export const WORKER_NOT_FOUND = 'WORKER_NOT_FOUND'

export interface ApiError {
  code: string
  message: string
  /** HTTP status when the failure came from a response (absent for network/offline failures). */
  status?: number
  field?: keyof WorkerRegistrationPayload
  /** Per-field messages for every duplicated field, so the caller can `setError` each one individually. */
  fieldErrors?: Partial<Record<DuplicateField, string>>
}

// Duplicate-detection codes emitted by both the mock API and the live
// workerApi (409 translation) — kept as one set so isDuplicateWorkerError
// recognises errors from either source identically.
export const DUPLICATE_WORKER_CODES = [
  'DUPLICATE_EMAIL',
  'DUPLICATE_PHONE',
  'DUPLICATE_EMAIL_AND_PHONE',
] as const

export type DuplicateWorkerCode = (typeof DUPLICATE_WORKER_CODES)[number]

export function isDuplicateWorkerError(error: ApiError | null | undefined): boolean {
  return !!error && (DUPLICATE_WORKER_CODES as readonly string[]).includes(error.code)
}
