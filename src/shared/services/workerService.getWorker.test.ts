import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockWorkerApi } from '@/shared/api/mockWorkerApi'
import type { Worker } from '@/shared/types'

import { workerService } from './workerService'

function createWorker(overrides: Partial<Worker> = {}): Worker {
  return {
    id: 'worker-123',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '9876543210',
    location: 'New York',
    age: 25,
    skills: ['plumbing'],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('workerService.getWorker', () => {
  beforeEach(() => {
    vi.spyOn(mockWorkerApi, 'getWorkerById')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('workerService_getWorker_delegatesToMockWorkerApiWithTheIdAndSignal', async () => {
    const worker = createWorker()
    vi.mocked(mockWorkerApi.getWorkerById).mockResolvedValue(worker)
    const controller = new AbortController()

    const result = await workerService.getWorker('worker-123', controller.signal)

    expect(mockWorkerApi.getWorkerById).toHaveBeenCalledWith('worker-123', controller.signal)
    expect(result).toEqual(worker)
  })

  it('workerService_getWorker_calledWithoutASignal_forwardsUndefinedAsTheSignal', async () => {
    const worker = createWorker()
    vi.mocked(mockWorkerApi.getWorkerById).mockResolvedValue(worker)

    await workerService.getWorker('worker-123')

    expect(mockWorkerApi.getWorkerById).toHaveBeenCalledWith('worker-123', undefined)
  })

  it('workerService_getWorker_whenMockApiRejects_propagatesTheErrorUnchanged', async () => {
    const apiError = { code: 'WORKER_NOT_FOUND', message: 'Profile Not Found' }
    vi.mocked(mockWorkerApi.getWorkerById).mockRejectedValue(apiError)

    await expect(workerService.getWorker('missing-id')).rejects.toEqual(apiError)
  })
})
