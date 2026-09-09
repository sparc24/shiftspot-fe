import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { WORKER_NOT_FOUND } from '@/shared/types'
import type { ApiError, Worker } from '@/shared/types'

import { useWorkerProfile } from './hooks'
import { WorkerProfilePage } from './WorkerProfilePage'

vi.mock('./hooks', () => ({
  useWorkerProfile: vi.fn(),
}))

const mockedUseWorkerProfile = vi.mocked(useWorkerProfile)

function createWorker(overrides: Partial<Worker> = {}): Worker {
  return {
    id: 'worker-123',
    name: 'Anita Kumar',
    email: 'anita.kumar@example.com',
    phone: '+91-900-000-0001',
    location: 'Cochin, Kerala',
    age: 29,
    skills: ['plumbing', 'electrical'],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

interface QueryResultOverrides {
  data?: Worker
  isLoading?: boolean
  isError?: boolean
  error?: ApiError | null
  refetch?: () => void
}

function mockQueryResult(overrides: QueryResultOverrides = {}) {
  mockedUseWorkerProfile.mockReturnValue({
    data: overrides.data,
    isLoading: overrides.isLoading ?? false,
    isError: overrides.isError ?? false,
    error: overrides.error ?? null,
    refetch: overrides.refetch ?? vi.fn(),
    // Only the fields WorkerProfilePage actually reads are meaningful here;
    // the rest of the UseQueryResult shape is irrelevant to this component.
  } as unknown as ReturnType<typeof useWorkerProfile>)
}

function renderPage(initialEntry = '/seeker/worker/worker-123') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/seeker/worker/:workerId" element={<WorkerProfilePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('WorkerProfilePage', () => {
  beforeEach(() => {
    mockedUseWorkerProfile.mockReset()
  })

  describe('loading branch', () => {
    it('WorkerProfilePage_whileLoading_rendersSkeletonAndAnnouncesLoadingMessageInLiveRegion', () => {
      mockQueryResult({ isLoading: true })

      renderPage()

      expect(screen.getByRole('status')).toHaveTextContent('Loading worker profile…')
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    // Penpot design-alignment regression guard (commit 128146e): the
    // skeleton is now wrapped in the notch-panel card treatment (previously
    // there was no card container around it at all).
    it('WorkerProfilePage_whileLoading_wrapsSkeletonInNotchPanelCard', () => {
      mockQueryResult({ isLoading: true })

      renderPage()

      const panel = document.querySelector('main .notch-panel')
      expect(panel).toBeInTheDocument()
      expect(panel?.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    })
  })

  describe('success branch', () => {
    it('WorkerProfilePage_withSuccessfulFetch_rendersProfileHeaderWithNameLocationAgeAndAllSkills', () => {
      const worker = createWorker({ skills: ['plumbing', 'electrical', 'carpentry'] })
      mockQueryResult({ data: worker })

      renderPage()

      const heading = screen.getByRole('heading', { name: 'Anita Kumar' })
      expect(heading).toBeInTheDocument()
      // Location/age share one <p> with sr-only label prefixes, so their text
      // nodes aren't isolated elements getByText can match directly.
      expect(heading.nextElementSibling).toHaveTextContent('Cochin, Kerala')
      expect(heading.nextElementSibling).toHaveTextContent('Age 29')
      expect(screen.getByText('Plumbing')).toBeInTheDocument()
      expect(screen.getByText('Electrical')).toBeInTheDocument()
      expect(screen.getByText('Carpentry')).toBeInTheDocument()
    })

    it('WorkerProfilePage_withSuccessfulFetch_rendersContactPanelWithPhoneAndEmailLinks', () => {
      const worker = createWorker({ phone: '+91-900-000-0001', email: 'anita.kumar@example.com' })
      mockQueryResult({ data: worker })

      renderPage()

      expect(screen.getByText('+91-900-000-0001').closest('a')).toHaveAttribute(
        'href',
        'tel:+919000000001',
      )
      expect(screen.getByText('anita.kumar@example.com').closest('a')).toHaveAttribute(
        'href',
        'mailto:anita.kumar@example.com',
      )
    })

    it('WorkerProfilePage_withSuccessfulFetch_announcesNameProfileLoadedInLiveRegion', () => {
      const worker = createWorker({ name: 'Anita Kumar' })
      mockQueryResult({ data: worker })

      renderPage()

      expect(screen.getByRole('status')).toHaveTextContent('Anita Kumar profile loaded')
    })

    it('WorkerProfilePage_withBlankEmail_rendersDisabledContactButtonInsteadOfMailtoLink', () => {
      const worker = createWorker({ email: '   ' })
      mockQueryResult({ data: worker })

      renderPage()

      expect(screen.getByRole('button', { name: 'Contact Worker' })).toBeDisabled()
      expect(
        screen.queryByRole('link', { name: /contact .* by email/i }),
      ).not.toBeInTheDocument()
    })

    // Penpot design-alignment regression guard (commit 128146e): the detail
    // content is now wrapped in a notch-panel card (previously no card
    // container existed around the profile article at all).
    it('WorkerProfilePage_withSuccessfulFetch_wrapsArticleInNotchPanelCard', () => {
      const worker = createWorker()
      mockQueryResult({ data: worker })

      renderPage()

      const article = screen.getByRole('article')
      expect(article).toHaveClass('notch-panel')
    })
  })

  describe('not-found branch', () => {
    it('WorkerProfilePage_withNotFoundError_rendersOnlyProfileNotFoundAndOmitsHeaderAndContactPanel', () => {
      const worker = createWorker()
      const apiError: ApiError = { code: WORKER_NOT_FOUND, message: 'Profile Not Found' }
      // data present alongside the error is the structural edge case: even
      // stale/cached data must not leak through once the error is 404.
      mockQueryResult({ data: worker, isError: true, error: apiError })

      renderPage()

      expect(screen.getByRole('alert')).toHaveTextContent('Profile Not Found')
      expect(screen.queryByText(worker.name)).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: worker.name })).not.toBeInTheDocument()
      expect(screen.queryByText('Contact', { selector: 'h2' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Contact Worker' })).not.toBeInTheDocument()
    })
  })

  describe('generic error branch', () => {
    it('WorkerProfilePage_withNonNotFoundError_rendersErrorAlertWithRetryButton', async () => {
      const user = userEvent.setup()
      const refetch = vi.fn()
      const apiError: ApiError = { code: 'SERVER_ERROR', message: 'boom' }
      mockQueryResult({ isError: true, error: apiError, refetch })

      renderPage()

      expect(screen.getByRole('alert')).toHaveTextContent(
        "We couldn't load this profile right now. Please try again.",
      )

      await user.click(screen.getByRole('button', { name: /retry/i }))

      expect(refetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('navigation and routing', () => {
    it('WorkerProfilePage_backLink_navigatesToSeekerSearch', () => {
      mockQueryResult({ isLoading: true })

      renderPage()

      expect(screen.getByRole('link', { name: /back to search results/i })).toHaveAttribute(
        'href',
        '/seeker/search',
      )
    })

    it('WorkerProfilePage_readsWorkerIdFromTheRouteParam_passesItToUseWorkerProfile', () => {
      mockQueryResult({ isLoading: true })

      renderPage('/seeker/worker/worker-123')

      expect(mockedUseWorkerProfile).toHaveBeenCalledWith('worker-123')
    })
  })
})
