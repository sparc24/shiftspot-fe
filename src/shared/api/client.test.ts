import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

import { apiClient } from './client'

// The interceptor is registered on the shared apiClient instance at import
// time; axios exposes the registered rejection handler on
// `interceptors.response.handlers`, which lets this suite invoke it directly
// without making a real network call.
function getHandler() {
  const handlers = (
    apiClient.interceptors.response as unknown as {
      handlers: Array<{
        fulfilled: (response: unknown) => unknown
        rejected: (error: unknown) => Promise<never>
      } | null>
    }
  ).handlers
  const handler = handlers[handlers.length - 1]
  if (!handler) throw new Error('No response interceptor registered on apiClient')
  return handler
}

function getRejectedHandler() {
  return getHandler().rejected
}

function createAxiosError(overrides: { status?: number; data?: unknown; message?: string } = {}): AxiosError {
  const error = new AxiosError(overrides.message ?? 'Request failed')
  if (overrides.status !== undefined) {
    error.response = {
      status: overrides.status,
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: overrides.data,
    }
  }
  return error
}

describe('apiClient response interceptor', () => {
  it('client_interceptor_onASuccessfulResponse_passesItThroughUnchanged', () => {
    const { fulfilled } = getHandler()
    const response = { data: { id: 'worker-1' }, status: 201 }

    expect(fulfilled(response)).toBe(response)
  })

  it('client_interceptor_withProblemDetailsBody_normalizesMessageFromDetail', async () => {
    const rejected = getRejectedHandler()
    const error = createAxiosError({
      status: 409,
      data: { type: 'about:blank', title: 'Conflict', status: 409, detail: 'Email already registered.' },
    })

    await expect(rejected(error)).rejects.toMatchObject({
      message: 'Email already registered.',
      status: 409,
    })
  })

  it('client_interceptor_withProblemDetailsBodyMissingDetail_fallsBackToTitle', async () => {
    const rejected = getRejectedHandler()
    const error = createAxiosError({
      status: 409,
      data: { type: 'about:blank', title: 'Conflict', status: 409 },
    })

    await expect(rejected(error)).rejects.toMatchObject({ message: 'Conflict' })
  })

  it('client_interceptor_withLegacyCodeMessageBody_stillNormalizesCorrectly', async () => {
    const rejected = getRejectedHandler()
    const error = createAxiosError({
      status: 404,
      data: { code: 'WORKER_NOT_FOUND', message: 'Profile Not Found' },
    })

    await expect(rejected(error)).rejects.toMatchObject({
      code: 'WORKER_NOT_FOUND',
      message: 'Profile Not Found',
      status: 404,
    })
  })

  it('client_interceptor_withAResponse_populatesStatusFromTheResponse', async () => {
    const rejected = getRejectedHandler()
    const error = createAxiosError({ status: 400, data: { detail: 'Bad request' } })

    await expect(rejected(error)).rejects.toMatchObject({ status: 400 })
  })

  it('client_interceptor_withNoResponse_leavesStatusUndefined', async () => {
    const rejected = getRejectedHandler()
    const error = createAxiosError()

    await expect(rejected(error)).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      status: undefined,
    })
  })

  it('client_interceptor_withNonJsonStringBody_doesNotThrowAndFallsBackToAxiosMessage', async () => {
    const rejected = getRejectedHandler()
    const error = createAxiosError({
      status: 502,
      data: '<html><body>Bad Gateway</body></html>',
      message: 'Request failed with status code 502',
    })

    await expect(rejected(error)).rejects.toMatchObject({
      code: 'HTTP_502',
      message: 'Request failed with status code 502',
      status: 502,
    })
  })

  it('client_interceptor_withNonAxiosError_normalizesToAGenericUnknownError', async () => {
    const rejected = getRejectedHandler()

    await expect(rejected(new Error('boom'))).rejects.toMatchObject({
      code: 'UNKNOWN_ERROR',
      message: 'Something went wrong. Please try again.',
    })
  })
})
