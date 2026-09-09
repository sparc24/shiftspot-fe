import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiClient } from '@/shared/api/client'
import type { WorkerRegistrationPayload } from '@/shared/types'

import { useWorkerRegistration } from './useWorkerRegistration'

// SLPTWM-129: workerService.createWorker now performs a real HTTP call via
// workerApi -> apiClient. Mock apiClient itself so this hook test exercises
// the real hook -> service -> workerApi wiring without ever hitting the
// network.
vi.mock('@/shared/api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: 0 }, queries: { retry: 0 } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const payload: WorkerRegistrationPayload = {
  name: 'Jane Doe',
  email: `jane-${Date.now()}@example.com`,
  phone: '9876543210',
  location: 'downtown',
  age: 25,
  skills: ['cleaning'],
}

describe('useWorkerRegistration', () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset()
  })

  it('transitions to success and exposes the created worker', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        id: 'worker-1',
        name: payload.name,
        email: payload.email,
        phoneNumber: payload.phone,
        location: payload.location,
        age: payload.age,
        skills: ['Cleaning'],
      },
    })

    const { result } = renderHook(() => useWorkerRegistration(), { wrapper: createWrapper() })

    result.current.mutate(payload)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.email).toBe(payload.email)
  })
})
