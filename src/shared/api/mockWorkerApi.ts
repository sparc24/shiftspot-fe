import type {
  ApiError,
  DuplicateField,
  Worker,
  WorkerRegistrationPayload,
  WorkerSearchFilters,
} from '@/shared/types'
import { WORKER_NOT_FOUND } from '@/shared/types'

const MOCK_LATENCY_MS = 600

const workersByEmail = new Map<string, Worker>()
const workersByPhone = new Map<string, Worker>()

// Seed data so AC1/AC2/AC3 are demonstrable without first registering
// workers. `@seed.shiftspot.test` addresses/phones are reserved for this
// purpose and never collide with a real registration attempt (Q3). Varied
// skills/locations/ages so some searches return multiple results and some
// return zero.
function seedWorker(payload: WorkerRegistrationPayload, id: string, createdAt: string): Worker {
  const worker: Worker = { ...payload, id, createdAt }
  workersByEmail.set(payload.email, worker)
  workersByPhone.set(payload.phone, worker)
  return worker
}

const workerList: Worker[] = [
  seedWorker(
    {
      name: 'Anita Kumar',
      email: 'anita.kumar@seed.shiftspot.test',
      phone: '+91-900-000-0001',
      location: 'Cochin, Kerala',
      age: 29,
      skills: ['plumbing', 'electrical'],
    },
    'seed-0001',
    '2026-01-01T00:00:00.000Z',
  ),
  seedWorker(
    {
      name: 'Ben Mathew',
      email: 'ben.mathew@seed.shiftspot.test',
      phone: '+91-900-000-0002',
      location: 'Cochin, Kerala',
      age: 34,
      skills: ['carpentry', 'painting'],
    },
    'seed-0002',
    '2026-01-01T00:00:01.000Z',
  ),
  seedWorker(
    {
      name: 'Divya Nair',
      email: 'divya.nair@seed.shiftspot.test',
      phone: '+91-900-000-0003',
      location: 'Ernakulam, Kerala',
      age: 22,
      skills: ['cleaning'],
    },
    'seed-0003',
    '2026-01-01T00:00:02.000Z',
  ),
  seedWorker(
    {
      name: 'Faisal Rahman',
      email: 'faisal.rahman@seed.shiftspot.test',
      phone: '+91-900-000-0004',
      location: 'Kochi, Kerala',
      age: 41,
      skills: ['electrical', 'gardening'],
    },
    'seed-0004',
    '2026-01-01T00:00:03.000Z',
  ),
  seedWorker(
    {
      name: 'Geetha Pillai',
      email: 'geetha.pillai@seed.shiftspot.test',
      phone: '+91-900-000-0005',
      location: 'Thrissur, Kerala',
      age: 55,
      skills: ['gardening', 'cleaning'],
    },
    'seed-0005',
    '2026-01-01T00:00:04.000Z',
  ),
  seedWorker(
    {
      name: 'Hari Menon',
      email: 'hari.menon@seed.shiftspot.test',
      phone: '+91-900-000-0006',
      location: 'Kottayam, Kerala',
      age: 29,
      skills: ['plumbing', 'carpentry', 'painting'],
    },
    'seed-0006',
    '2026-01-01T00:00:05.000Z',
  ),
  seedWorker(
    {
      name: 'Irene Thomas',
      email: 'irene.thomas@seed.shiftspot.test',
      phone: '+91-900-000-0007',
      location: 'Alappuzha, Kerala',
      age: 63,
      skills: ['painting'],
    },
    'seed-0007',
    '2026-01-01T00:00:06.000Z',
  ),
  seedWorker(
    {
      name: 'Jibin Varghese',
      email: 'jibin.varghese@seed.shiftspot.test',
      phone: '+91-900-000-0008',
      location: 'Kozhikode, Kerala',
      age: 18,
      skills: ['electrical'],
    },
    'seed-0008',
    '2026-01-01T00:00:07.000Z',
  ),
]

// Abort-aware: existing callers (createWorker, searchWorkers) pass no signal
// and are behaviourally unchanged. When a signal is supplied and already
// aborted, short-circuits without ever starting a timer; otherwise clears the
// pending timer and rejects with the signal's abort reason so no closure
// (and the workerList reference it holds) is kept alive after unmount.
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    return Promise.reject(signal.reason)
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)

    const onAbort = (): void => {
      clearTimeout(timer)
      reject(signal?.reason)
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

const DUPLICATE_MESSAGES: Record<DuplicateField, string> = {
  email: 'A profile with this Email already exists.',
  phone: 'A profile with this Phone Number already exists.',
}

async function createWorker(payload: WorkerRegistrationPayload): Promise<Worker> {
  await delay(MOCK_LATENCY_MS)

  const duplicateEmail = workersByEmail.has(payload.email)
  const duplicatePhone = workersByPhone.has(payload.phone)

  if (duplicateEmail || duplicatePhone) {
    const duplicateFields: DuplicateField[] = []
    if (duplicateEmail) duplicateFields.push('email')
    if (duplicatePhone) duplicateFields.push('phone')

    const fieldErrors = duplicateFields.reduce<Partial<Record<DuplicateField, string>>>(
      (acc, fieldName) => {
        acc[fieldName] = DUPLICATE_MESSAGES[fieldName]
        return acc
      },
      {},
    )

    const code =
      duplicateEmail && duplicatePhone
        ? 'DUPLICATE_EMAIL_AND_PHONE'
        : duplicateEmail
          ? 'DUPLICATE_EMAIL'
          : 'DUPLICATE_PHONE'

    const duplicateError: ApiError = {
      code,
      message:
        'A profile with this Email or Phone Number already exists. Update the highlighted fields and try again.',
      field: duplicateFields[0],
      fieldErrors,
    }
    return Promise.reject(duplicateError)
  }

  const worker: Worker = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }

  workersByEmail.set(payload.email, worker)
  workersByPhone.set(payload.phone, worker)
  workerList.push(worker)

  return worker
}

// Match semantics (see plan §6.2): AND across skills/location/age dimensions,
// OR within the selected skills. An entirely empty filter object matches
// every worker (browse-all).
function matchesFilters(worker: Worker, filters: WorkerSearchFilters): boolean {
  const skillMatch =
    filters.skills.length === 0 || filters.skills.some((skill) => worker.skills.includes(skill))

  const locationMatch =
    !filters.location ||
    worker.location.trim().toLowerCase().includes(filters.location.trim().toLowerCase())

  const ageMatch = filters.age === undefined || worker.age === filters.age

  return skillMatch && locationMatch && ageMatch
}

// Always resolves — never rejects — so the search error branch is exercised
// only once a real endpoint exists.
async function searchWorkers(filters: WorkerSearchFilters): Promise<Worker[]> {
  await delay(MOCK_LATENCY_MS)
  return workerList.filter((worker) => matchesFilters(worker, filters))
}

const NOT_FOUND_ERROR: ApiError = {
  code: WORKER_NOT_FOUND,
  message: 'Profile Not Found',
}

// `workerList` is the authoritative lookup source (seeds + runtime
// registrations); workersByEmail/workersByPhone are uniqueness indexes only
// and must not be used here. A linear find over a PoC-sized list is correct —
// no id index is introduced (plan §6.2 / Q12).
async function getWorkerById(id: string, signal?: AbortSignal): Promise<Worker> {
  await delay(MOCK_LATENCY_MS, signal)

  const worker = workerList.find((candidate) => candidate.id === id)
  if (!worker) {
    return Promise.reject(NOT_FOUND_ERROR)
  }

  return worker
}

export const mockWorkerApi = {
  createWorker,
  searchWorkers,
  getWorkerById,
}
