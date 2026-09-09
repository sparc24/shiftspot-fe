import { apiClient } from '@/shared/api/client'
import type { ApiError, DuplicateField, Worker, WorkerRegistrationPayload } from '@/shared/types'
import { SKILL_IDS, SKILL_OPTIONS } from '@/shared/types'

const WORKERS_PATH = '/api/v1/workers'

/** Request body for POST /api/v1/workers — mirrors the backend's CreateWorkerRequest. */
interface CreateWorkerRequest {
  name: string
  email: string
  phoneNumber: string
  location: string
  age: number
  skills: string[]
}

/**
 * 201 response body — mirrors the backend's WorkerDto. Every field is nullable
 * per its OpenAPI schema, so this type is deliberately pessimistic and the
 * mapper below (toWorker) is tolerant of any field being missing or null.
 */
interface WorkerDto {
  id?: string | null
  name?: string | null
  email?: string | null
  phoneNumber?: string | null
  location?: string | null
  age?: number | null
  skills?: string[] | null
}

// Duplicated from mockWorkerApi.ts rather than shared, because the mock is
// scheduled for deletion once search/detail are integrated — a shared
// constant would shortly have only one consumer (plan §6.4 / Q10).
const DUPLICATE_MESSAGES: Record<DuplicateField, string> = {
  email: 'A profile with this Email already exists.',
  phone: 'A profile with this Phone Number already exists.',
}

const BOTH_FIELDS_MESSAGE =
  'A profile with this Email or Phone Number already exists. Update the highlighted fields and try again.'

// id -> Title-Case label, derived from SKILL_OPTIONS so this can never drift
// from the single source of truth.
function skillIdToLabel(id: string): string | undefined {
  return SKILL_OPTIONS.find((option) => option.value === id)?.label
}

// Title-Case label -> id, case-insensitive. Unrecognised entries are dropped.
function skillLabelToId(label: string): (typeof SKILL_IDS)[number] | undefined {
  const normalized = label.trim().toLowerCase()
  return SKILL_IDS.find((id) => id.toLowerCase() === normalized)
}

function toCreateWorkerRequest(payload: WorkerRegistrationPayload): CreateWorkerRequest {
  return {
    name: payload.name,
    email: payload.email,
    phoneNumber: payload.phone,
    location: payload.location,
    // Zod's z.coerce.number().int() already produced a real number — no extra
    // coercion here.
    age: payload.age,
    skills: payload.skills
      .map((id) => skillIdToLabel(id))
      .filter((label): label is string => label !== undefined),
  }
}

function toSkillIds(skills: string[] | null | undefined): WorkerRegistrationPayload['skills'] | undefined {
  if (!skills) return undefined
  const ids = skills
    .map((label) => skillLabelToId(label))
    .filter((id): id is (typeof SKILL_IDS)[number] => id !== undefined)
  return ids.length > 0 ? ids : undefined
}

// Tolerant mapper: the client already knows every value it just submitted, so
// it can always produce a complete, correct Worker even from an empty/odd
// response body — never throws on a shape mismatch (plan §7.2). An empty `id`
// is the one value that cannot be reconstructed; nothing navigates on success
// today, but a future "view your new profile" link must guard against it.
function toWorker(dto: WorkerDto | undefined, submitted: WorkerRegistrationPayload): Worker {
  return {
    id: dto?.id ?? '',
    name: dto?.name ?? submitted.name,
    email: dto?.email ?? submitted.email,
    phone: dto?.phoneNumber ?? submitted.phone,
    location: dto?.location ?? submitted.location,
    age: dto?.age ?? submitted.age,
    skills: toSkillIds(dto?.skills) ?? submitted.skills,
    // createdAt intentionally omitted — the backend does not provide one.
  }
}

// 409 -> duplicate ApiError with code/field/fieldErrors reproducing the mock's
// shipped UX; every other status is passed through unchanged (plan §6.4).
function toWorkerCreationError(error: ApiError): ApiError {
  if (error.status !== 409) {
    return error
  }

  const haystack = error.message.toLowerCase()
  const isEmail = /e-?mail/i.test(haystack)
  const isPhone = /phone|mobile|contact\s*number/i.test(haystack)

  // Indeterminate 409 (matches neither pattern) defaults to flagging both
  // fields — both are genuine candidates and the next user action is
  // identical either way (plan §6.4 step 3).
  const flagEmail = isEmail || !isPhone
  const flagPhone = isPhone || !isEmail

  const fieldErrors: Partial<Record<DuplicateField, string>> = {}
  if (flagEmail) fieldErrors.email = DUPLICATE_MESSAGES.email
  if (flagPhone) fieldErrors.phone = DUPLICATE_MESSAGES.phone

  const code =
    flagEmail && flagPhone ? 'DUPLICATE_EMAIL_AND_PHONE' : flagEmail ? 'DUPLICATE_EMAIL' : 'DUPLICATE_PHONE'

  return {
    ...error,
    code,
    message: flagEmail && flagPhone ? BOTH_FIELDS_MESSAGE : error.message,
    field: flagEmail ? 'email' : 'phone',
    fieldErrors,
  }
}

async function createWorker(payload: WorkerRegistrationPayload): Promise<Worker> {
  try {
    const { data } = await apiClient.post<WorkerDto>(WORKERS_PATH, toCreateWorkerRequest(payload))
    return toWorker(data, payload)
  } catch (error) {
    return Promise.reject(toWorkerCreationError(error as ApiError))
  }
}

export const workerApi = {
  createWorker,
}
