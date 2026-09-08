import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockWorkerApi } from '@/shared/api/mockWorkerApi'
import type { Worker, WorkerSearchFilters } from '@/shared/types'

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

function createFilters(overrides: Partial<WorkerSearchFilters> = {}): WorkerSearchFilters {
  return { skills: [], ...overrides }
}

describe('workerService.searchWorkers', () => {
  beforeEach(() => {
    vi.spyOn(mockWorkerApi, 'searchWorkers')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('workerService_searchWorkers_delegatesToMockWorkerApiWithTheGivenFilters', async () => {
    const filters = createFilters({ skills: ['plumbing'], location: 'Cochin' })
    const workers = [createWorker()]
    vi.mocked(mockWorkerApi.searchWorkers).mockResolvedValue(workers)

    const result = await workerService.searchWorkers(filters)

    expect(mockWorkerApi.searchWorkers).toHaveBeenCalledWith(filters)
    expect(result).toEqual(workers)
  })
})
