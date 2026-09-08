import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { WORKER_NOT_FOUND } from '@/shared/types'

describe('mockWorkerApi.getWorkerById', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('getWorkerById_withExistingId_resolvesTheFullWorker', async () => {
    const { mockWorkerApi } = await import('./mockWorkerApi')

    const promise = mockWorkerApi.getWorkerById('seed-0001')
    await vi.advanceTimersByTimeAsync(600)
    const worker = await promise

    expect(worker).toMatchObject({
      id: 'seed-0001',
      name: 'Anita Kumar',
      email: 'anita.kumar@seed.shiftspot.test',
      phone: '+91-900-000-0001',
      location: 'Cochin, Kerala',
      age: 29,
      skills: ['plumbing', 'electrical'],
    })
  })

  it('getWorkerById_withUnknownId_rejectsWithWorkerNotFoundError', async () => {
    const { mockWorkerApi } = await import('./mockWorkerApi')

    const assertion = expect(mockWorkerApi.getWorkerById('does-not-exist')).rejects.toEqual({
      code: WORKER_NOT_FOUND,
      message: 'Profile Not Found',
    })
    await vi.advanceTimersByTimeAsync(600)
    await assertion
  })

  it('getWorkerById_withAlreadyAbortedSignal_rejectsImmediatelyWithTheAbortReasonAndNeverResolves', async () => {
    const { mockWorkerApi } = await import('./mockWorkerApi')
    const controller = new AbortController()
    controller.abort('cancelled')

    await expect(mockWorkerApi.getWorkerById('seed-0001', controller.signal)).rejects.toBe(
      'cancelled',
    )
    // No timer was ever started for an already-aborted signal.
    expect(vi.getTimerCount()).toBe(0)
  })

  it('getWorkerById_whenAbortedMidDelay_clearsThePendingTimerAndRejectsWithTheAbortReason', async () => {
    const { mockWorkerApi } = await import('./mockWorkerApi')
    const controller = new AbortController()

    const promise = mockWorkerApi.getWorkerById('seed-0001', controller.signal)
    const assertion = expect(promise).rejects.toBe('cancelled')

    await vi.advanceTimersByTimeAsync(300)
    controller.abort('cancelled')

    await assertion
    expect(vi.getTimerCount()).toBe(0)
  })

  it('getWorkerById_calledWithoutASignal_resolvesJustLikeCreateWorkerAndSearchWorkersDo', async () => {
    const { mockWorkerApi } = await import('./mockWorkerApi')

    const promise = mockWorkerApi.getWorkerById('seed-0002')
    await vi.advanceTimersByTimeAsync(600)

    await expect(promise).resolves.toMatchObject({ id: 'seed-0002', name: 'Ben Mathew' })
  })
})
