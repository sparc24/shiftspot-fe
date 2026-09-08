import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import type { WorkerRegistrationPayload } from '@/shared/types'

import { useWorkerRegistration } from './useWorkerRegistration'

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
  it('transitions to success and exposes the created worker', async () => {
    const { result } = renderHook(() => useWorkerRegistration(), { wrapper: createWrapper() })

    result.current.mutate(payload)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.email).toBe(payload.email)
  })
})
