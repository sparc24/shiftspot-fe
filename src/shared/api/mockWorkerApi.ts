import type { ApiError, Worker, WorkerRegistrationPayload } from '@/shared/types'

const MOCK_LATENCY_MS = 600

const workersByEmail = new Map<string, Worker>()

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function createWorker(payload: WorkerRegistrationPayload): Promise<Worker> {
  await delay(MOCK_LATENCY_MS)

  if (workersByEmail.has(payload.email)) {
    const duplicateError: ApiError = {
      code: 'DUPLICATE_EMAIL',
      message: 'A worker with this email is already registered.',
      field: 'email',
    }
    return Promise.reject(duplicateError)
  }

  const worker: Worker = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }

  workersByEmail.set(payload.email, worker)

  return worker
}

export const mockWorkerApi = {
  createWorker,
}
