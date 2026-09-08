import { useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ErrorAlert, ErrorBoundary } from '@/shared/components'
import { WORKER_NOT_FOUND } from '@/shared/types'

import { ProfileNotFound, WorkerContactPanel, WorkerProfileHeader } from './components'
import { BACK_TO_SEARCH_LABEL, PROFILE_ERROR_MESSAGE, PROFILE_LOADING_MESSAGE } from './constants'
import { useWorkerProfile } from './hooks'
import { toWorkerProfileView } from './mappers'

function ProfileSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-brand-border" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-48 animate-pulse rounded bg-brand-border" />
          <div className="h-4 w-32 animate-pulse rounded bg-brand-border" />
        </div>
      </div>
      <div className="h-24 animate-pulse rounded-lg bg-brand-border" />
    </div>
  )
}

export function WorkerProfilePage() {
  const { workerId } = useParams<{ workerId: string }>()
  const { data, isLoading, isError, error, refetch } = useWorkerProfile(workerId)

  const profile = useMemo(() => (data ? toWorkerProfileView(data) : null), [data])

  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  const isNotFound = !workerId || error?.code === WORKER_NOT_FOUND

  const statusMessage = isLoading ? PROFILE_LOADING_MESSAGE : profile ? `${profile.name} profile loaded` : ''

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      <header className="flex items-center justify-between border-b border-brand-border bg-white px-6 py-4">
        <span className="flex items-center gap-2 font-serif text-lg font-bold text-brand-navy">
          <span aria-hidden="true" className="inline-block h-4 w-3 bg-brand-navy" />
          ShiftSpot
        </span>
        <Link
          to="/seeker/search"
          className="rounded-sm py-1 text-sm font-medium text-brand-muted hover:text-brand-navy hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-navy"
        >
          <span aria-hidden="true">← </span>
          {BACK_TO_SEARCH_LABEL}
        </Link>
      </header>

      <ErrorBoundary>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
          <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {statusMessage}
          </div>

          {isLoading ? (
            <ProfileSkeleton />
          ) : isNotFound ? (
            <ProfileNotFound />
          ) : isError ? (
            <ErrorAlert message={PROFILE_ERROR_MESSAGE} onRetry={handleRetry} />
          ) : profile ? (
            <article aria-labelledby="worker-profile-name" className="flex flex-col gap-2">
              <WorkerProfileHeader profile={profile} />
              <WorkerContactPanel
                phone={profile.phone}
                email={profile.email}
                contactHref={profile.email.value.trim() ? profile.email.href : undefined}
                workerName={profile.name}
              />
            </article>
          ) : null}
        </main>
      </ErrorBoundary>

      <footer className="border-t border-brand-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 text-xs text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Worker Profile</span>
          <span>ShiftSpot PoC</span>
        </div>
      </footer>
    </div>
  )
}
