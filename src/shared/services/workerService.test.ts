import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { WorkerRegistrationPayload } from '@/shared/types'

const basePayload: WorkerRegistrationPayload = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '9876543210',
  location: 'downtown',
  age: 25,
  skills: ['cleaning'],
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

  it('rejects with DUPLICATE_EMAIL when the same email registers twice', async () => {
    const { workerService } = await import('./workerService')
    await workerService.createWorker(basePayload)

    await expect(workerService.createWorker(basePayload)).rejects.toMatchObject({
      code: 'DUPLICATE_EMAIL',
      field: 'email',
    })
  })

  it('resolves independently for two different emails', async () => {
    const { workerService } = await import('./workerService')
    const first = await workerService.createWorker(basePayload)
    const second = await workerService.createWorker({ ...basePayload, email: 'jordan@example.com' })

    expect(first.id).not.toBe(second.id)
    expect(second.email).toBe('jordan@example.com')
  })
})
