import { describe, expect, it } from 'vitest'

import type { Worker } from '@/shared/types'

import { toSearchFilters, toWorkerCardView } from './mappers'
import type { WorkerSearchFormValues } from './types'

function createWorker(overrides: Partial<Worker> = {}): Worker {
  return {
    id: 'worker-123',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+91-900-111-2222',
    location: 'Cochin, Kerala',
    age: 29,
    skills: ['plumbing'],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function createFormValues(overrides: Partial<WorkerSearchFormValues> = {}): WorkerSearchFormValues {
  return {
    skills: [],
    location: '',
    age: '',
    ...overrides,
  }
}

describe('toWorkerCardView', () => {
  it('toWorkerCardView_withOneWordName_derivesTwoLetterInitialsFromThatWord', () => {
    const worker = createWorker({ name: 'Madonna' })

    const view = toWorkerCardView(worker)

    expect(view.initials).toBe('MA')
  })

  it('toWorkerCardView_withMultiWordName_derivesInitialsFromFirstAndLastWord', () => {
    const worker = createWorker({ name: 'Hari Kumar Menon' })

    const view = toWorkerCardView(worker)

    expect(view.initials).toBe('HM')
  })

  it('toWorkerCardView_withFourOrMoreSkills_capsSkillLabelsAtMaxCardSkills', () => {
    const worker = createWorker({
      skills: ['plumbing', 'electrical', 'carpentry', 'painting'],
    })

    const view = toWorkerCardView(worker)

    expect(view.skillLabels).toEqual(['Plumbing', 'Electrical'])
  })

  it('toWorkerCardView_withFewerThanMaxSkills_returnsAllSkillLabels', () => {
    const worker = createWorker({ skills: ['gardening'] })

    const view = toWorkerCardView(worker)

    expect(view.skillLabels).toEqual(['Gardening'])
  })

  it('toWorkerCardView_withBlankName_returnsEmptyInitials', () => {
    const worker = createWorker({ name: '   ' })

    const view = toWorkerCardView(worker)

    expect(view.initials).toBe('')
  })

  it('toWorkerCardView_withSkillIdNotInLabelMap_fallsBackToTheRawSkillId', () => {
    const worker = createWorker({ skills: ['unlisted-skill' as Worker['skills'][number]] })

    const view = toWorkerCardView(worker)

    expect(view.skillLabels).toEqual(['unlisted-skill'])
  })

  it('toWorkerCardView_mapsIdAndLocationThrough', () => {
    const worker = createWorker({ id: 'seed-0009', location: 'Thrissur, Kerala' })

    const view = toWorkerCardView(worker)

    expect(view.id).toBe('seed-0009')
    expect(view.location).toBe('Thrissur, Kerala')
  })
})

describe('toSearchFilters', () => {
  it('toSearchFilters_withEmptyLocationAndAge_omitsBothFromResult', () => {
    const values = createFormValues({ skills: ['plumbing'], location: '   ', age: '' })

    const filters = toSearchFilters(values)

    expect(filters).toEqual({ skills: ['plumbing'] })
    expect(filters).not.toHaveProperty('location')
    expect(filters).not.toHaveProperty('age')
  })

  it('toSearchFilters_withLocationAndAgeProvided_trimsLocationAndConvertsAgeToNumber', () => {
    const values = createFormValues({ skills: [], location: '  Cochin, Kerala  ', age: '30' })

    const filters = toSearchFilters(values)

    expect(filters).toEqual({ skills: [], location: 'Cochin, Kerala', age: 30 })
  })

  it('toSearchFilters_withNoSkillsSelected_returnsEmptySkillsArray', () => {
    const values = createFormValues()

    const filters = toSearchFilters(values)

    expect(filters.skills).toEqual([])
  })
})
