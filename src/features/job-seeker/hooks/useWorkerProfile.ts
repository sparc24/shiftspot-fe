import { useQuery } from '@tanstack/react-query'

import { workerService } from '@/shared/services'
import type { ApiError, Worker } from '@/shared/types'

export function useWorkerProfile(workerId: string | undefined) {
  return useQuery<Worker, ApiError>({
    queryKey: ['workers', 'detail', workerId],
    queryFn: ({ signal }) => {
      // Narrowing, not a cast — `enabled` guarantees this branch is unreachable.
      if (!workerId) throw new Error('useWorkerProfile: queryFn ran with no workerId')
      return workerService.getWorker(workerId, signal)
    },
    enabled: Boolean(workerId),
    retry: 0,
    staleTime: 30_000,
  })
}
