import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError, Worker } from '@/shared/types'

import { JobSeekerSearchPage } from './JobSeekerSearchPage'
import { useWorkerSearch } from './hooks'

vi.mock('./hooks', () => ({
  useWorkerSearch: vi.fn(),
}))

const mockedUseWorkerSearch = vi.mocked(useWorkerSearch)

interface QueryOverrides {
  data?: Worker[]
  isFetching?: boolean
  isError?: boolean
  error?: ApiError
  refetch?: () => void
}

function createQueryResult(overrides: QueryOverrides = {}) {
  return {
    data: overrides.data,
    isFetching: overrides.isFetching ?? false,
    isError: overrides.isError ?? false,
    error: overrides.error,
    refetch: overrides.refetch ?? vi.fn(),
  } as unknown as ReturnType<typeof useWorkerSearch>
}

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

function renderPage() {
  return render(
    <MemoryRouter>
      <JobSeekerSearchPage />
    </MemoryRouter>,
  )
}

async function submitEmptySearch() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /find workers/i }))
}

describe('JobSeekerSearchPage', () => {
  beforeEach(() => {
    mockedUseWorkerSearch.mockReset()
  })

  it('JobSeekerSearchPage_onMountBeforeAnySearch_showsIdleMessage', () => {
    mockedUseWorkerSearch.mockReturnValue(createQueryResult())

    renderPage()

    expect(
      screen.getByText('Start by selecting a skill or location to find workers near you.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('JobSeekerSearchPage_afterSearchWithResults_showsResultCountAndCardGrid', async () => {
    mockedUseWorkerSearch.mockReturnValue(
      createQueryResult({ data: [createWorker({ id: 'w1' }), createWorker({ id: 'w2' })] }),
    )

    renderPage()
    await submitEmptySearch()

    expect(screen.getByText('2 workers found')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2)
  })

  it('JobSeekerSearchPage_afterSearchWithNoMatches_showsZeroResultsMessage', async () => {
    mockedUseWorkerSearch.mockReturnValue(createQueryResult({ data: [] }))

    renderPage()
    await submitEmptySearch()

    expect(
      screen.getByText('No workers found matching your criteria. Try adjusting your filters.'),
    ).toBeInTheDocument()
  })

  it('JobSeekerSearchPage_duringInitialFetch_showsLoadingIndicatorDrivenByIsFetching', async () => {
    // isFetching only turns true once a search is applied (filters !== null) —
    // mirroring TanStack Query's real enabled/isFetching relationship keeps
    // the submit button enabled for the initial click.
    mockedUseWorkerSearch.mockImplementation((filters) =>
      createQueryResult({ isFetching: filters !== null }),
    )

    renderPage()
    await submitEmptySearch()

    expect(screen.getByText('Searching for workers…')).toBeInTheDocument()
  })

  it('JobSeekerSearchPage_duringRetryAfterError_showsLoadingIndicatorDrivenByIsFetching', async () => {
    const refetch = vi.fn()
    mockedUseWorkerSearch.mockReturnValue(
      createQueryResult({ isError: true, error: { code: 'SEARCH_FAILED', message: 'boom' }, refetch }),
    )

    const { rerender } = renderPage()
    await submitEmptySearch()

    expect(screen.getByRole('alert')).toHaveTextContent('boom')

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /retry/i }))
    expect(refetch).toHaveBeenCalledTimes(1)

    mockedUseWorkerSearch.mockReturnValue(createQueryResult({ isFetching: true }))
    rerender(
      <MemoryRouter>
        <JobSeekerSearchPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Searching for workers…')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('JobSeekerSearchPage_backLink_navigatesToTheLandingPage', async () => {
    mockedUseWorkerSearch.mockReturnValue(createQueryResult())
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/seeker/search']}>
        <Routes>
          <Route path="/seeker/search" element={<JobSeekerSearchPage />} />
          <Route path="/" element={<div>Landing Screen</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /back to role selection/i }))

    expect(await screen.findByText('Landing Screen')).toBeInTheDocument()
  })
})
