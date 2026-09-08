import { useMemo, type ReactNode } from 'react'

import { ErrorAlert } from '@/shared/components'
import type { Worker } from '@/shared/types'

import { SEARCH_ERROR_MESSAGE, formatResultCount } from '../constants'
import { toWorkerCardView } from '../mappers'
import { WorkerResultsGrid } from './WorkerResultsGrid'
import { WorkerSearchMessage } from './WorkerSearchMessage'

interface WorkerSearchResultsProps {
  /** False until the user has submitted at least one search — drives the AC4 first-use state. */
  hasSearched: boolean
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  workers: Worker[]
  onRetry: () => void
}

export function WorkerSearchResults({
  hasSearched,
  isLoading,
  isError,
  errorMessage,
  workers,
  onRetry,
}: WorkerSearchResultsProps) {
  const cardViews = useMemo(() => workers.map(toWorkerCardView), [workers])

  // Pure switchboard over hasSearched / isLoading / isError / results.length.
  // Distinguishes AC4 (never searched) from AC3 (searched, empty) solely via
  // hasSearched — never via `workers === undefined`.
  let liveRegionContent: ReactNode = null
  if (!hasSearched) {
    liveRegionContent = <WorkerSearchMessage variant="idle" />
  } else if (isLoading) {
    liveRegionContent = <WorkerSearchMessage variant="loading" />
  } else if (!isError && workers.length === 0) {
    liveRegionContent = <WorkerSearchMessage variant="empty" />
  } else if (!isError && workers.length > 0) {
    liveRegionContent = (
      <p className="text-sm font-semibold text-brand-navy">{formatResultCount(workers.length)}</p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="status" aria-live="polite" aria-atomic="true">
        {liveRegionContent}
      </div>

      {hasSearched && isError ? (
        <ErrorAlert message={errorMessage ?? SEARCH_ERROR_MESSAGE} onRetry={onRetry} />
      ) : null}

      {hasSearched && !isLoading && !isError && workers.length > 0 ? (
        <WorkerResultsGrid workers={cardViews} />
      ) : null}
    </div>
  )
}
