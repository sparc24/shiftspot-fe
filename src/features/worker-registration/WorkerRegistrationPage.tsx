import { Link } from 'react-router-dom'

import { SuccessMessage } from '@/shared/components'
import { useWorkerRegistration } from '@/shared/hooks'
import { isDuplicateWorkerError } from '@/shared/types'
import type { WorkerRegistrationFormValues } from '@/shared/validation'

import { WorkerRegistrationForm } from './WorkerRegistrationForm'

// The Penpot "Corner Clip" layer: the form card is a plain rounded rectangle
// decorated with a small page-background-colored dog-ear at its top-right
// corner (not a full clipped-corner silhouette like the landing page cards).
function CardCornerFold() {
  return (
    <div
      aria-hidden="true"
      className="absolute right-0 top-0 h-0 w-0 border-l-[28px] border-t-[28px] border-l-transparent border-t-brand-bg"
    />
  )
}

export function WorkerRegistrationPage() {
  const mutation = useWorkerRegistration()

  function handleSubmit(values: WorkerRegistrationFormValues) {
    mutation.mutate(values)
  }

  const banner = mutation.isError
    ? (isDuplicateWorkerError(mutation.error)
        ? { title: 'Profile already exists', body: mutation.error.message }
        : { title: 'Registration failed', body: 'Registration failed. Please try again.' })
    : null

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      <header className="flex items-center justify-between border-b border-brand-border bg-white px-6 py-4">
        <span className="flex items-center gap-2 font-serif text-lg font-bold text-brand-navy">
          <span aria-hidden="true" className="inline-block h-4 w-3 bg-brand-navy" />
          ShiftSpot
        </span>
        <Link to="/" className="text-sm font-medium text-brand-muted hover:text-brand-navy hover:underline">
          ← Back to role selection
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {mutation.isSuccess ? (
          <SuccessMessage
            title="Registration complete"
            description={`Thanks, ${mutation.data.name}! Your worker profile has been created.`}
          />
        ) : (
          <>
            <h1 className="text-center font-serif text-3xl font-bold text-brand-navy">
              Worker Registration
            </h1>

            {banner ? (
              <div role="alert" className="relative mx-auto mt-6 max-w-xl overflow-hidden rounded-[10px] bg-brand-amber-bg p-4 pl-5">
                <span aria-hidden="true" className="absolute inset-y-4 left-0 w-1 rounded-full bg-brand-amber" />
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-amber text-sm font-bold text-white"
                  >
                    !
                  </span>
                  <div>
                    <p className="font-semibold text-brand-navy">{banner.title}</p>
                    <p className="mt-1 text-sm text-brand-muted">{banner.body}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mx-auto mt-8 max-w-xl">
              <div className="relative">
                <div className="overflow-hidden rounded-[14px] border border-brand-border bg-white p-8 shadow-sm">
                  <WorkerRegistrationForm
                    onSubmit={handleSubmit}
                    isSubmitting={mutation.isPending}
                    serverFieldErrors={mutation.isError ? mutation.error.fieldErrors : undefined}
                  />
                </div>
                {/* Positioned in a border-less wrapper so it overlaps the card's border/rounded
                    corner rather than sitting inside its padding box (see CardCornerFold). */}
                <CardCornerFold />
              </div>

              <aside className="mt-6 rounded-lg border border-brand-border bg-white p-5 shadow-sm">
                <h2 className="font-serif font-bold text-brand-navy">Why we ask this</h2>
                <p className="mt-2 text-sm text-brand-muted">
                  ShiftSpot is a direct-contact directory — there&apos;s no login. Your email and phone
                  are shown only to job seekers who view your profile.
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-brand-muted">
                  <li>Email and phone must be unique</li>
                  <li>Pick every skill that applies</li>
                  <li>You can be listed within seconds</li>
                </ul>
              </aside>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-brand-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 text-xs text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Worker Registration</span>
          <span>ShiftSpot PoC</span>
        </div>
      </footer>
    </div>
  )
}
