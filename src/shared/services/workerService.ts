import { mockWorkerApi } from '@/shared/api/mockWorkerApi'
import type { Worker, WorkerRegistrationPayload, WorkerSearchFilters } from '@/shared/types'

// Single swap point: today this delegates to the in-memory mock. Swapping to a
// live endpoint is a one-function-body change:
//   const { data } = await apiClient.post<Worker>('/api/workers', payload)
//   return data
async function createWorker(payload: WorkerRegistrationPayload): Promise<Worker> {
  return mockWorkerApi.createWorker(payload)
}

// Single swap point: today this delegates to the in-memory mock. Swapping to a
// live endpoint is a one-function-body change:
//   const { data } = await apiClient.get<Worker[]>('/api/workers/search', { params: filters })
//   return data
async function searchWorkers(filters: WorkerSearchFilters): Promise<Worker[]> {
  return mockWorkerApi.searchWorkers(filters)
}

export const workerService = {
  createWorker,
  searchWorkers,
}
