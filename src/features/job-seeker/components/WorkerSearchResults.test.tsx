import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import type { Worker } from '@/shared/types'

import { WorkerSearchResults } from './WorkerSearchResults'

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

interface RenderOverrides {
  hasSearched?: boolean
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  workers?: Worker[]
  onRetry?: () => void
}

function renderResults(overrides: RenderOverrides = {}) {
  const onRetry = overrides.onRetry ?? vi.fn()
  render(
    <MemoryRouter>
      <WorkerSearchResults
        hasSearched={overrides.hasSearched ?? false}
        isLoading={overrides.isLoading ?? false}
        isError={overrides.isError ?? false}
        errorMessage={overrides.errorMessage}
        workers={overrides.workers ?? []}
        onRetry={onRetry}
      />
    </MemoryRouter>,
  )
  return { onRetry }
}

describe('WorkerSearchResults', () => {
  it('WorkerSearchResults_beforeFirstSearch_showsIdleMessageOnly', () => {
    renderResults({ hasSearched: false })

    expect(
      screen.getByText('Start by selecting a skill or location to find workers near you.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('WorkerSearchResults_whileLoading_showsLoadingMessageOnly', () => {
    renderResults({ hasSearched: true, isLoading: true })

    expect(screen.getByText('Searching for workers…')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('WorkerSearchResults_withZeroResults_showsEmptyMessageOnly', () => {
    renderResults({ hasSearched: true, workers: [] })

    expect(
      screen.getByText('No workers found matching your criteria. Try adjusting your filters.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('WorkerSearchResults_withResults_showsResultCountAndCardGrid', () => {
    renderResults({
      hasSearched: true,
      workers: [createWorker({ id: 'w1' }), createWorker({ id: 'w2', name: 'Ben Mathew' })],
    })

    expect(screen.getByText('2 workers found')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2)
  })

  it('WorkerSearchResults_withSingleResult_usesSingularWorkerWording', () => {
    renderResults({ hasSearched: true, workers: [createWorker()] })

    expect(screen.getByText('1 worker found')).toBeInTheDocument()
  })

  it('WorkerSearchResults_onError_showsAlertWithMessageAndNoResultsGrid', () => {
    renderResults({ hasSearched: true, isError: true, errorMessage: 'boom' })

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('boom')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('WorkerSearchResults_onError_fallsBackToDefaultMessageWhenNoneProvided', () => {
    renderResults({ hasSearched: true, isError: true })

    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent("We couldn't load workers right now. Please try again.")
  })

  it('WorkerSearchResults_whenRetryClicked_callsOnRetry', async () => {
    const user = userEvent.setup()
    const { onRetry } = renderResults({ hasSearched: true, isError: true, errorMessage: 'boom' })

    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
