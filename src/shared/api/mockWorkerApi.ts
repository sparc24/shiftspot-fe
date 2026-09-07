import type { ApiError, DuplicateField, Worker, WorkerRegistrationPayload } from '@/shared/types'

const MOCK_LATENCY_MS = 600

const workersByEmail = new Map<string, Worker>()
const workersByPhone = new Map<string, Worker>()

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

  return worker
}

export const mockWorkerApi = {
  createWorker,
}
