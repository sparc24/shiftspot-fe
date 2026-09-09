import { mockWorkerApi } from '@/shared/api/mockWorkerApi'
import { workerApi } from '@/shared/api/workerApi'
import type { Worker, WorkerRegistrationPayload, WorkerSearchFilters } from '@/shared/types'

// Live endpoint (SLPTWM-129): delegates to workerApi, which POSTs to
// /api/v1/workers through the shared apiClient and maps the request/response
// shape at the boundary (see src/shared/api/workerApi.ts).
async function createWorker(payload: WorkerRegistrationPayload): Promise<Worker> {
  return workerApi.createWorker(payload)
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
