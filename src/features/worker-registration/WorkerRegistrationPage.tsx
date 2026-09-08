import { Link } from 'react-router-dom'

import { SuccessMessage } from '@/shared/components'
import { useWorkerRegistration } from '@/shared/hooks'
import type { WorkerRegistrationFormValues } from '@/shared/validation'

import { WorkerRegistrationForm } from './WorkerRegistrationForm'

export function WorkerRegistrationPage() {
  const mutation = useWorkerRegistration()

  function handleSubmit(values: WorkerRegistrationFormValues) {
    mutation.mutate(values)
  }

  const bannerMessage = mutation.isError
    ? (mutation.error.fieldErrors && Object.keys(mutation.error.fieldErrors).length > 0
        ? mutation.error.message
        : 'Registration failed. Please try again.')
    : null

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="flex items-center justify-between border-b border-brand-border bg-white px-6 py-4">
        <span className="flex items-center gap-2 font-serif text-lg font-bold text-brand-navy">
          <span aria-hidden="true" className="inline-block h-4 w-3 bg-brand-navy" />
          ShiftSpot
        </span>
        <Link to="/" className="text-sm font-medium text-brand-muted hover:text-brand-navy hover:underline">
          ← Back to role selection
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
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

            {bannerMessage ? (
              <div role="alert" className="mx-auto mt-6 max-w-xl rounded-lg border border-brand-amber bg-brand-amber-bg p-4">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-amber text-sm font-bold text-white"
                  >
                    !
                  </span>
                  <div>
                    <p className="font-semibold text-brand-navy">Profile already exists</p>
                    <p className="mt-1 text-sm text-brand-navy/80">{bannerMessage}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mx-auto mt-8 max-w-xl">
              <div className="rounded-2xl border border-brand-border bg-white p-8 shadow-sm">
                <WorkerRegistrationForm
                  onSubmit={handleSubmit}
                  isSubmitting={mutation.isPending}
                  serverFieldErrors={mutation.isError ? mutation.error.fieldErrors : undefined}
                />
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
