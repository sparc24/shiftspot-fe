import axios from 'axios'

import type { ApiError } from '@/shared/types'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 10_000,
})

// The backend's error bodies are RFC7807 ProblemDetails ({ type, title, status,
// detail, instance }), which has neither `code` nor `message`. This shape is
// deliberately loose (`unknown`-narrowed, not a strict interface) since
// additionalProperties are allowed and a non-object body (e.g. an HTML error
// page) must not throw while being normalised.
interface KnownErrorBody {
  code?: string
  message?: string
  title?: string
  detail?: string
}

function asErrorBody(data: unknown): KnownErrorBody | undefined {
  return typeof data === 'object' && data !== null ? (data as KnownErrorBody) : undefined
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized: ApiError = axios.isAxiosError(error)
      ? {
          // Precedence: existing custom { code, message } shape first (mock/legacy
          // tests), then RFC7807 ProblemDetails, then axios's own message, then a
          // generic fallback. `status` is undefined for a network/offline failure
          // (no `error.response`), which also keeps `code` at 'NETWORK_ERROR'.
          code:
            asErrorBody(error.response?.data)?.code ??
            (error.response?.status ? `HTTP_${error.response.status}` : 'NETWORK_ERROR'),
          message:
            asErrorBody(error.response?.data)?.message ??
            asErrorBody(error.response?.data)?.detail ??
            asErrorBody(error.response?.data)?.title ??
            error.message ??
            'Something went wrong. Please try again.',
          status: error.response?.status,
        }
      : {
          code: 'UNKNOWN_ERROR',
          message: 'Something went wrong. Please try again.',
        }

    return Promise.reject(normalized)
  },
)
