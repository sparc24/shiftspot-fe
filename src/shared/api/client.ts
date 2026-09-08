import axios from 'axios'

import type { ApiError } from '@/shared/types'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 10_000,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized: ApiError = axios.isAxiosError(error)
      ? {
          code: (error.response?.data as { code?: string } | undefined)?.code ?? 'NETWORK_ERROR',
          message:
            (error.response?.data as { message?: string } | undefined)?.message ??
            error.message ??
            'Something went wrong. Please try again.',
        }
      : {
          code: 'UNKNOWN_ERROR',
          message: 'Something went wrong. Please try again.',
        }

    return Promise.reject(normalized)
  },
)
