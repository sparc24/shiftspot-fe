import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { WorkerRegistrationPayload } from '@/shared/types'

const basePayload: WorkerRegistrationPayload = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '9876543210',
  location: 'New York',
  age: 25,
  skills: ['plumbing'],
}

describe('workerService.createWorker', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('resolves with a created Worker including id and createdAt', async () => {
    const { workerService } = await import('./workerService')
    const worker = await workerService.createWorker(basePayload)

    expect(worker.id).toBeTruthy()
    expect(worker.createdAt).toBeTruthy()
    expect(worker.email).toBe(basePayload.email)
  })

  it('rejects with DUPLICATE_EMAIL and a fieldErrors.email message when the same email registers twice', async () => {
    const { workerService } = await import('./workerService')
    await workerService.createWorker(basePayload)

    await expect(
      workerService.createWorker({ ...basePayload, phone: '1112223333' }),
    ).rejects.toMatchObject({
      code: 'DUPLICATE_EMAIL',
      field: 'email',
      fieldErrors: { email: 'A profile with this Email already exists.' },
    })
  })

  it('rejects with DUPLICATE_PHONE and a fieldErrors.phone message when the same phone registers twice', async () => {
    const { workerService } = await import('./workerService')
    await workerService.createWorker(basePayload)

    await expect(
      workerService.createWorker({ ...basePayload, email: 'someone-else@example.com' }),
    ).rejects.toMatchObject({
      code: 'DUPLICATE_PHONE',
      field: 'phone',
      fieldErrors: { phone: 'A profile with this Phone Number already exists.' },
    })
  })

  it('rejects with both fieldErrors when email and phone are both already registered', async () => {
    const { workerService } = await import('./workerService')
    await workerService.createWorker(basePayload)

    await expect(workerService.createWorker(basePayload)).rejects.toMatchObject({
      code: 'DUPLICATE_EMAIL_AND_PHONE',
      fieldErrors: {
        email: 'A profile with this Email already exists.',
        phone: 'A profile with this Phone Number already exists.',
      },
    })
  })

  it('resolves independently for two different emails and phones', async () => {
    const { workerService } = await import('./workerService')
    const first = await workerService.createWorker(basePayload)
    const second = await workerService.createWorker({
      ...basePayload,
      email: 'jordan@example.com',
      phone: '1112223333',
    })

    expect(first.id).not.toBe(second.id)
    expect(second.email).toBe('jordan@example.com')
  })
})
