import { mockWorkerApi } from '@/shared/api/mockWorkerApi'
import type { Worker, WorkerRegistrationPayload } from '@/shared/types'

// Single swap point: today this delegates to the in-memory mock. Swapping to a
// live endpoint is a one-function-body change:
//   const { data } = await apiClient.post<Worker>('/api/workers', payload)
//   return data
async function createWorker(payload: WorkerRegistrationPayload): Promise<Worker> {
  return mockWorkerApi.createWorker(payload)
}

export const workerService = {
  createWorker,
}
