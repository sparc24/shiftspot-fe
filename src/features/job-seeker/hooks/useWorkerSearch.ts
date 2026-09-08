import { useQuery } from '@tanstack/react-query'

import { workerService } from '@/shared/services'
import type { ApiError, Worker, WorkerSearchFilters } from '@/shared/types'

export function useWorkerSearch(filters: WorkerSearchFilters | null) {
  return useQuery<Worker[], ApiError>({
    queryKey: ['workers', 'search', filters],
    queryFn: () => {
      // Narrowing, not a cast — `enabled` guarantees this branch is unreachable.
      if (!filters) throw new Error('useWorkerSearch: queryFn ran with no applied filters')
      return workerService.searchWorkers(filters)
    },
    enabled: filters !== null,
    retry: 0,
    staleTime: 30_000,
  })
}
