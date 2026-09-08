import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'

import { ErrorBoundary } from '@/shared/components'
import type { WorkerSearchFilters } from '@/shared/types'

import { WorkerSearchFilterBar, WorkerSearchResults } from './components'
import { useWorkerSearch } from './hooks'

export function JobSeekerSearchPage() {
  const [appliedFilters, setAppliedFilters] = useState<WorkerSearchFilters | null>(null)

  const { data, isFetching, isError, error, refetch } = useWorkerSearch(appliedFilters)

  const handleSearch = useCallback((filters: WorkerSearchFilters) => {
    setAppliedFilters(filters)
  }, [])

  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      <header className="flex items-center justify-between border-b border-brand-border bg-white px-6 py-4">
        <span className="flex items-center gap-2 font-serif text-lg font-bold text-brand-navy">
          <span aria-hidden="true" className="inline-block h-4 w-3 bg-brand-navy" />
          ShiftSpot
        </span>
        <Link
          to="/"
          className="text-sm font-medium text-brand-muted hover:text-brand-navy hover:underline"
        >
          ← Back to role selection
        </Link>
      </header>

      <ErrorBoundary>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <h1 className="text-center font-serif text-3xl font-bold text-brand-navy">
            Search for Workers
          </h1>

          <div className="mx-auto mt-8">
            <WorkerSearchFilterBar onSearch={handleSearch} isSearching={isFetching} />
          </div>

          <div className="mt-8">
            <WorkerSearchResults
              hasSearched={appliedFilters !== null}
              isLoading={isFetching}
              isError={isError}
              errorMessage={error?.message}
              workers={data ?? []}
              onRetry={handleRetry}
            />
          </div>
        </main>
      </ErrorBoundary>

      <footer className="border-t border-brand-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 text-xs text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Worker Search</span>
          <span>ShiftSpot PoC</span>
        </div>
      </footer>
    </div>
  )
}
