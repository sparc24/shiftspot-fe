import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { workerService } from '@/shared/services'
import { WORKER_NOT_FOUND } from '@/shared/types'
import type { ApiError, Worker } from '@/shared/types'

import { useWorkerProfile } from './useWorkerProfile'

vi.mock('@/shared/services', () => ({
  workerService: {
    getWorker: vi.fn(),
  },
}))

const mockedGetWorker = vi.mocked(workerService.getWorker)

function createWorker(overrides: Partial<Worker> = {}): Worker {
  return {
    id: 'worker-123',
    name: 'Anita Kumar',
    email: 'anita.kumar@example.com',
    phone: '+91-900-000-0001',
    location: 'Cochin, Kerala',
    age: 29,
    skills: ['plumbing', 'electrical'],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useWorkerProfile', () => {
  beforeEach(() => {
    mockedGetWorker.mockReset()
  })

  it('useWorkerProfile_withUndefinedWorkerId_doesNotFireARequest', () => {
    renderHook(() => useWorkerProfile(undefined), { wrapper: createWrapper() })

    expect(mockedGetWorker).not.toHaveBeenCalled()
  })

  it('useWorkerProfile_withEmptyStringWorkerId_doesNotFireARequest', () => {
    renderHook(() => useWorkerProfile(''), { wrapper: createWrapper() })

    expect(mockedGetWorker).not.toHaveBeenCalled()
  })

  it('useWorkerProfile_withValidWorkerId_resolvesAndExposesTheWorker', async () => {
    const worker = createWorker()
    mockedGetWorker.mockResolvedValue(worker)

    const { result } = renderHook(() => useWorkerProfile('worker-123'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(worker)
    expect(mockedGetWorker).toHaveBeenCalledWith('worker-123', expect.anything())
  })

  it('useWorkerProfile_whenApiRejectsWithNotFound_surfacesIsErrorWithWorkerNotFoundCode', async () => {
    const apiError: ApiError = { code: WORKER_NOT_FOUND, message: 'Profile Not Found' }
    mockedGetWorker.mockRejectedValue(apiError)

    const { result } = renderHook(() => useWorkerProfile('missing-id'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.code).toBe(WORKER_NOT_FOUND)
  })
})
