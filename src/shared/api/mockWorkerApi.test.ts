import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { WorkerSearchFilters } from '@/shared/types'

function createFilters(overrides: Partial<WorkerSearchFilters> = {}): WorkerSearchFilters {
  return { skills: [], ...overrides }
}

describe('mockWorkerApi.searchWorkers', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('searchWorkers_withOneSkillSelected_matchesWorkersHavingAnyOfTheSelectedSkills', async () => {
    const { mockWorkerApi } = await import('./mockWorkerApi')

    const results = await mockWorkerApi.searchWorkers(createFilters({ skills: ['gardening'] }))

    expect(results.length).toBeGreaterThan(0)
    expect(results.every((worker) => worker.skills.includes('gardening'))).toBe(true)
  })

  it('searchWorkers_withMultipleSkillsSelected_orMatchesAcrossSelectedSkills', async () => {
    const { mockWorkerApi } = await import('./mockWorkerApi')

    const results = await mockWorkerApi.searchWorkers(
      createFilters({ skills: ['gardening', 'carpentry'] }),
    )

    expect(
      results.every(
        (worker) => worker.skills.includes('gardening') || worker.skills.includes('carpentry'),
      ),
    ).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })

  it('searchWorkers_withLocationSubstring_matchesCaseInsensitively', async () => {
    const { mockWorkerApi } = await import('./mockWorkerApi')

    const results = await mockWorkerApi.searchWorkers(createFilters({ location: 'cochin' }))

    expect(results.length).toBeGreaterThan(0)
    expect(
      results.every((worker) => worker.location.toLowerCase().includes('cochin')),
    ).toBe(true)
  })

  it('searchWorkers_withAgeFilter_matchesOnlyWorkersOfExactlyThatAge', async () => {
    const { mockWorkerApi } = await import('./mockWorkerApi')

    const results = await mockWorkerApi.searchWorkers(createFilters({ age: 29 }))

    expect(results.length).toBeGreaterThan(0)
    expect(results.every((worker) => worker.age === 29)).toBe(true)
  })

  it('searchWorkers_withSkillLocationAndAgeCombined_appliesAndAcrossAllThreeDimensions', async () => {
    const { mockWorkerApi } = await import('./mockWorkerApi')

    const results = await mockWorkerApi.searchWorkers(
      createFilters({ skills: ['plumbing', 'electrical'], location: 'Cochin', age: 29 }),
    )

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({ name: 'Anita Kumar', age: 29, location: 'Cochin, Kerala' })
  })

  it('searchWorkers_withEntirelyEmptyFilters_matchesEveryWorker', async () => {
    const { mockWorkerApi } = await import('./mockWorkerApi')

    const results = await mockWorkerApi.searchWorkers(createFilters())

    expect(results.length).toBeGreaterThanOrEqual(8)
  })

  it('searchWorkers_withNoMatchingCriteria_returnsAnEmptyArray', async () => {
    const { mockWorkerApi } = await import('./mockWorkerApi')

    const results = await mockWorkerApi.searchWorkers(
      createFilters({ location: 'Nonexistent City' }),
    )

    expect(results).toEqual([])
  })
})
