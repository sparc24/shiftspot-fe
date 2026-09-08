import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { workerService } from '@/shared/services'
import type { ApiError, Worker, WorkerSearchFilters } from '@/shared/types'

import { useWorkerSearch } from './useWorkerSearch'

vi.mock('@/shared/services', () => ({
  workerService: {
    searchWorkers: vi.fn(),
  },
}))

const mockedSearchWorkers = vi.mocked(workerService.searchWorkers)

function createWorker(overrides: Partial<Worker> = {}): Worker {
  return {
    id: 'worker-123',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+91-900-111-2222',
    location: 'Cochin, Kerala',
    age: 29,
    skills: ['plumbing'],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function createFilters(overrides: Partial<WorkerSearchFilters> = {}): WorkerSearchFilters {
  return { skills: [], ...overrides }
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useWorkerSearch', () => {
  beforeEach(() => {
    mockedSearchWorkers.mockReset()
  })

  it('useWorkerSearch_withNullFilters_doesNotFireARequest', () => {
    renderHook(() => useWorkerSearch(null), { wrapper: createWrapper() })

    expect(mockedSearchWorkers).not.toHaveBeenCalled()
  })

  it('useWorkerSearch_withValidFilters_resolvesWithWorkersFromTheApi', async () => {
    const workers = [createWorker()]
    mockedSearchWorkers.mockResolvedValue(workers)
    const filters = createFilters({ skills: ['plumbing'] })

    const { result } = renderHook(() => useWorkerSearch(filters), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(workers)
    expect(mockedSearchWorkers).toHaveBeenCalledWith(filters)
  })

  it('useWorkerSearch_whenApiRejects_surfacesIsErrorWithTheError', async () => {
    const apiError: ApiError = { code: 'SEARCH_FAILED', message: 'boom' }
    mockedSearchWorkers.mockRejectedValue(apiError)
    const filters = createFilters()

    const { result } = renderHook(() => useWorkerSearch(filters), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toEqual(apiError)
  })
})
