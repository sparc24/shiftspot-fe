import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { WorkerCardView } from '../types'
import { WorkerCard } from './WorkerCard'

function createWorkerView(overrides: Partial<WorkerCardView> = {}): WorkerCardView {
  return {
    id: 'worker-123',
    initials: 'JD',
    name: 'Jane Doe',
    location: 'Cochin, Kerala',
    skillLabels: ['Plumbing', 'Electrical'],
    ...overrides,
  }
}

describe('WorkerCard', () => {
  it('WorkerCard_withWorker_rendersNameLocationAndInitials', () => {
    const worker = createWorkerView()

    render(<WorkerCard worker={worker} />)

    expect(screen.getByRole('heading', { name: 'Jane Doe' })).toBeInTheDocument()
    expect(screen.getByText('Cochin, Kerala')).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('WorkerCard_withSkillLabels_rendersSkillsListWithAccessibleRoleAndLabel', () => {
    const worker = createWorkerView({ skillLabels: ['Plumbing', 'Electrical'] })

    render(<WorkerCard worker={worker} />)

    const list = screen.getByRole('list', { name: 'Skills' })
    expect(list).toBeInTheDocument()
    expect(screen.getByText('Plumbing')).toBeInTheDocument()
    expect(screen.getByText('Electrical')).toBeInTheDocument()
  })

  it('WorkerCard_withAtMostTwoSkillLabels_rendersExactlyThatManyBadges', () => {
    const worker = createWorkerView({ skillLabels: ['Plumbing', 'Electrical'] })

    render(<WorkerCard worker={worker} />)

    const list = screen.getByRole('list', { name: 'Skills' })
    expect(list.children).toHaveLength(2)
  })

  it('WorkerCard_withNoSkillLabels_omitsSkillsList', () => {
    const worker = createWorkerView({ skillLabels: [] })

    render(<WorkerCard worker={worker} />)

    expect(screen.queryByRole('list', { name: 'Skills' })).not.toBeInTheDocument()
  })
})
