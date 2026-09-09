import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { workerApi } from '@/shared/api/workerApi'
import type { ApiError, Worker, WorkerRegistrationPayload } from '@/shared/types'

import { workerService } from './workerService'

function createPayload(overrides: Partial<WorkerRegistrationPayload> = {}): WorkerRegistrationPayload {
  return {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '9876543210',
    location: 'New York',
    age: 25,
    skills: ['plumbing'],
    ...overrides,
  }
}

function createWorker(overrides: Partial<Worker> = {}): Worker {
  return {
    id: 'worker-123',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '9876543210',
    location: 'New York',
    age: 25,
    skills: ['plumbing'],
    ...overrides,
  }
}

// SLPTWM-129: createWorker now delegates to the live workerApi, not the
// mock. The mock-specific duplicate-detection assertions that used to live
// here now belong in workerApi.test.ts — this file only asserts delegation.
describe('workerService.createWorker', () => {
  beforeEach(() => {
    vi.spyOn(workerApi, 'createWorker')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('workerService_createWorker_delegatesToWorkerApiWithTheGivenPayload', async () => {
    const payload = createPayload()
    const worker = createWorker()
    vi.mocked(workerApi.createWorker).mockResolvedValue(worker)

    const result = await workerService.createWorker(payload)

    expect(workerApi.createWorker).toHaveBeenCalledWith(payload)
    expect(result).toEqual(worker)
  })

  it('workerService_createWorker_whenWorkerApiRejects_propagatesTheErrorUnchanged', async () => {
    const payload = createPayload()
    const apiError: ApiError = {
      code: 'DUPLICATE_EMAIL',
      message: 'A profile with this Email already exists.',
      field: 'email',
      fieldErrors: { email: 'A profile with this Email already exists.' },
    }
    vi.mocked(workerApi.createWorker).mockRejectedValue(apiError)

    await expect(workerService.createWorker(payload)).rejects.toEqual(apiError)
  })
})
