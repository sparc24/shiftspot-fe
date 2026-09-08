import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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

function renderCard(worker: WorkerCardView) {
  return render(
    <MemoryRouter>
      <WorkerCard worker={worker} />
    </MemoryRouter>,
  )
}

describe('WorkerCard', () => {
  it('WorkerCard_withWorker_rendersNameLocationAndInitials', () => {
    const worker = createWorkerView()

    renderCard(worker)

    expect(screen.getByRole('heading', { name: 'Jane Doe' })).toBeInTheDocument()
    expect(screen.getByText('Cochin, Kerala')).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('WorkerCard_withSkillLabels_rendersSkillsListWithAccessibleRoleAndLabel', () => {
    const worker = createWorkerView({ skillLabels: ['Plumbing', 'Electrical'] })

    renderCard(worker)

    const list = screen.getByRole('list', { name: 'Skills' })
    expect(list).toBeInTheDocument()
    expect(screen.getByText('Plumbing')).toBeInTheDocument()
    expect(screen.getByText('Electrical')).toBeInTheDocument()
  })

  it('WorkerCard_withAtMostTwoSkillLabels_rendersExactlyThatManyBadges', () => {
    const worker = createWorkerView({ skillLabels: ['Plumbing', 'Electrical'] })

    renderCard(worker)

    const list = screen.getByRole('list', { name: 'Skills' })
    expect(list.children).toHaveLength(2)
  })

  it('WorkerCard_withNoSkillLabels_omitsSkillsList', () => {
    const worker = createWorkerView({ skillLabels: [] })

    renderCard(worker)

    expect(screen.queryByRole('list', { name: 'Skills' })).not.toBeInTheDocument()
  })

  it('WorkerCard_withWorker_wrapsCardInLinkToDetailRouteWithEncodedId', () => {
    const worker = createWorkerView({ id: 'seed 0001' })

    renderCard(worker)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/seeker/worker/seed%200001')
  })

  it('WorkerCard_withWorker_exposesListitemRoleOnOuterWrapper', () => {
    const worker = createWorkerView()

    renderCard(worker)

    // Scoped via the link's parent, not screen.getByRole('listitem') directly —
    // the nested skill <li> elements also carry an implicit listitem role, so
    // an unscoped query throws on "multiple elements found".
    const link = screen.getByRole('link')
    expect(link.parentElement).toHaveAttribute('role', 'listitem')
  })
})
