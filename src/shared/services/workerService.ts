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

// Single swap point: today this delegates to the in-memory mock. Swapping to a
// live endpoint is a one-function-body change:
//   const { data } = await apiClient.get<Worker>(`/workers/${id}`, { signal })
//   return data
async function getWorker(id: string, signal?: AbortSignal): Promise<Worker> {
  return mockWorkerApi.getWorkerById(id, signal)
}

export const workerService = {
  createWorker,
  searchWorkers,
  getWorker,
}
