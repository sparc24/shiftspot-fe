import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError, WorkerRegistrationPayload } from '@/shared/types'

import { apiClient } from './client'

// No real network calls in tests, ever — apiClient is mocked entirely.
vi.mock('./client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

const mockedPost = vi.mocked(apiClient.post)

function createPayload(overrides: Partial<WorkerRegistrationPayload> = {}): WorkerRegistrationPayload {
  return {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '9876543210',
    location: 'Cochin, Kerala',
    age: 25,
    skills: ['plumbing', 'electrical'],
    ...overrides,
  }
}

describe('workerApi.createWorker', () => {
  beforeEach(() => {
    mockedPost.mockReset()
  })

  describe('request mapping', () => {
    it('workerApi_createWorker_rewritesPhoneToPhoneNumberAndOmitsPhone', async () => {
      const payload = createPayload()
      mockedPost.mockResolvedValue({ data: {} })

      const { workerApi } = await import('./workerApi')
      await workerApi.createWorker(payload)

      const [, body] = mockedPost.mock.calls[0]
      expect(body).toMatchObject({ phoneNumber: payload.phone })
      expect(body).not.toHaveProperty('phone')
    })

    it('workerApi_createWorker_mapsSkillIdsToTitleCaseLabels', async () => {
      const payload = createPayload({ skills: ['plumbing', 'electrical'] })
      mockedPost.mockResolvedValue({ data: {} })

      const { workerApi } = await import('./workerApi')
      await workerApi.createWorker(payload)

      const [, body] = mockedPost.mock.calls[0]
      expect(body).toMatchObject({ skills: ['Plumbing', 'Electrical'] })
    })

    it('workerApi_createWorker_sendsAgeAsANumber', async () => {
      const payload = createPayload({ age: 42 })
      mockedPost.mockResolvedValue({ data: {} })

      const { workerApi } = await import('./workerApi')
      await workerApi.createWorker(payload)

      const [, body] = mockedPost.mock.calls[0] as [string, { age: unknown }]
      expect(body.age).toBe(42)
      expect(typeof body.age).toBe('number')
    })

    it('workerApi_createWorker_postsToTheWorkersEndpoint', async () => {
      const payload = createPayload()
      mockedPost.mockResolvedValue({ data: {} })

      const { workerApi } = await import('./workerApi')
      await workerApi.createWorker(payload)

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/workers', expect.anything())
    })
  })

  describe('success mapping', () => {
    it('workerApi_createWorker_onSuccess_mapsPhoneNumberBackToPhoneAndSkillsToLowercaseIds', async () => {
      const payload = createPayload()
      mockedPost.mockResolvedValue({
        data: {
          id: 'worker-999',
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          phoneNumber: '9876543210',
          location: 'Cochin, Kerala',
          age: 25,
          skills: ['Plumbing', 'Electrical'],
        },
      })

      const { workerApi } = await import('./workerApi')
      const worker = await workerApi.createWorker(payload)

      expect(worker).toMatchObject({
        id: 'worker-999',
        phone: '9876543210',
        skills: ['plumbing', 'electrical'],
      })
      expect(worker).not.toHaveProperty('phoneNumber')
    })

    it('workerApi_createWorker_withEmptyDtoBody_fallsBackToSubmittedPayloadValues', async () => {
      const payload = createPayload()
      mockedPost.mockResolvedValue({ data: undefined })

      const { workerApi } = await import('./workerApi')
      const worker = await workerApi.createWorker(payload)

      expect(worker).toMatchObject({
        id: '',
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        location: payload.location,
        age: payload.age,
        skills: payload.skills,
      })
    })

    it('workerApi_createWorker_withEmptyStringNameInDto_fallsBackToSubmittedName', async () => {
      const payload = createPayload({ name: 'Jane Doe' })
      mockedPost.mockResolvedValue({
        data: {
          id: 'worker-1',
          name: '',
          email: payload.email,
          phoneNumber: payload.phone,
          location: payload.location,
          age: payload.age,
          skills: ['Plumbing'],
        },
      })

      const { workerApi } = await import('./workerApi')
      const worker = await workerApi.createWorker(payload)

      expect(worker.name).toBe('Jane Doe')
    })

    it('workerApi_createWorker_withMissingId_fallsBackToEmptyString', async () => {
      const payload = createPayload()
      mockedPost.mockResolvedValue({
        data: {
          name: payload.name,
          email: payload.email,
          phoneNumber: payload.phone,
          location: payload.location,
          age: payload.age,
          skills: ['Plumbing'],
        },
      })

      const { workerApi } = await import('./workerApi')
      const worker = await workerApi.createWorker(payload)

      expect(worker.id).toBe('')
    })
  })

  describe('duplicate detection (409)', () => {
    function createApiError(overrides: Partial<ApiError> = {}): ApiError {
      return { code: 'HTTP_409', message: '', status: 409, ...overrides }
    }

    it('workerApi_createWorker_409WithEmailInMessage_rejectsWithDuplicateEmail', async () => {
      const payload = createPayload()
      mockedPost.mockRejectedValue(
        createApiError({ message: 'A worker with this email already exists.' }),
      )

      const { workerApi } = await import('./workerApi')

      await expect(workerApi.createWorker(payload)).rejects.toMatchObject({
        code: 'DUPLICATE_EMAIL',
        field: 'email',
        fieldErrors: { email: 'A profile with this Email already exists.' },
      })
    })

    it('workerApi_createWorker_409WithPhoneInMessage_rejectsWithDuplicatePhone', async () => {
      const payload = createPayload()
      mockedPost.mockRejectedValue(
        createApiError({ message: 'A worker with this phone already exists.' }),
      )

      const { workerApi } = await import('./workerApi')

      await expect(workerApi.createWorker(payload)).rejects.toMatchObject({
        code: 'DUPLICATE_PHONE',
        field: 'phone',
        fieldErrors: { phone: 'A profile with this Phone Number already exists.' },
      })
    })

    it('workerApi_createWorker_409WithMobileInMessage_rejectsWithDuplicatePhone', async () => {
      const payload = createPayload()
      mockedPost.mockRejectedValue(createApiError({ message: 'Duplicate mobile number.' }))

      const { workerApi } = await import('./workerApi')

      await expect(workerApi.createWorker(payload)).rejects.toMatchObject({
        code: 'DUPLICATE_PHONE',
        fieldErrors: { phone: 'A profile with this Phone Number already exists.' },
      })
    })

    it('workerApi_createWorker_409WithContactNumberInMessage_rejectsWithDuplicatePhone', async () => {
      const payload = createPayload()
      mockedPost.mockRejectedValue(createApiError({ message: 'Duplicate contact number.' }))

      const { workerApi } = await import('./workerApi')

      await expect(workerApi.createWorker(payload)).rejects.toMatchObject({
        code: 'DUPLICATE_PHONE',
        fieldErrors: { phone: 'A profile with this Phone Number already exists.' },
      })
    })

    it('workerApi_createWorker_409NamingBothFields_rejectsWithDuplicateEmailAndPhone', async () => {
      const payload = createPayload()
      mockedPost.mockRejectedValue(
        createApiError({ message: 'This email and phone are already registered.' }),
      )

      const { workerApi } = await import('./workerApi')

      await expect(workerApi.createWorker(payload)).rejects.toMatchObject({
        code: 'DUPLICATE_EMAIL_AND_PHONE',
        fieldErrors: {
          email: 'A profile with this Email already exists.',
          phone: 'A profile with this Phone Number already exists.',
        },
      })
    })

    it('workerApi_createWorker_indeterminate409_rejectsWithBothFieldErrorsSet', async () => {
      const payload = createPayload()
      mockedPost.mockRejectedValue(createApiError({ message: 'Worker already exists.' }))

      const { workerApi } = await import('./workerApi')

      await expect(workerApi.createWorker(payload)).rejects.toMatchObject({
        code: 'DUPLICATE_EMAIL_AND_PHONE',
        fieldErrors: {
          email: 'A profile with this Email already exists.',
          phone: 'A profile with this Phone Number already exists.',
        },
      })
    })
  })

  describe('non-duplicate errors', () => {
    it('workerApi_createWorker_400_isNotTreatedAsADuplicateAndPassesThroughUnchanged', async () => {
      const payload = createPayload()
      const badRequest: ApiError = { code: 'HTTP_400', message: 'Age must be at least 18.', status: 400 }
      mockedPost.mockRejectedValue(badRequest)

      const { workerApi } = await import('./workerApi')

      await expect(workerApi.createWorker(payload)).rejects.toEqual(badRequest)
    })

    it('workerApi_createWorker_networkErrorWithNoStatus_passesThroughUnchanged', async () => {
      const payload = createPayload()
      const networkError: ApiError = { code: 'NETWORK_ERROR', message: 'Network Error' }
      mockedPost.mockRejectedValue(networkError)

      const { workerApi } = await import('./workerApi')

      await expect(workerApi.createWorker(payload)).rejects.toEqual(networkError)
    })
  })
})
