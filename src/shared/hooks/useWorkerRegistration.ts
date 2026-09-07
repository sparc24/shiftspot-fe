import { useMutation } from '@tanstack/react-query'

import { workerService } from '@/shared/services'
import type { ApiError, Worker, WorkerRegistrationPayload } from '@/shared/types'

export function useWorkerRegistration() {
  return useMutation<Worker, ApiError, WorkerRegistrationPayload>({
    mutationKey: ['worker', 'register'],
    mutationFn: (payload) => workerService.createWorker(payload),
  })
}
