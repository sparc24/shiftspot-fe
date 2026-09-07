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
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <span className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <span aria-hidden="true" className="inline-block h-4 w-3 bg-slate-900" />
          ShiftSpot
        </span>
        <Link to="/" className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline">
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
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Worker profile</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">List your skills</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Fill in your details so job seekers nearby can find you and reach out directly. All fields
              are required.
            </p>

            {bannerMessage ? (
              <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-700 text-sm font-bold text-white"
                  >
                    !
                  </span>
                  <div>
                    <p className="font-semibold text-red-900">We couldn&apos;t submit your profile</p>
                    <p className="mt-1 text-sm text-red-800">{bannerMessage}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <WorkerRegistrationForm
                  onSubmit={handleSubmit}
                  isSubmitting={mutation.isPending}
                  serverFieldErrors={mutation.isError ? mutation.error.fieldErrors : undefined}
                />
              </div>

              <aside className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:col-span-1">
                <h2 className="font-bold text-gray-900">Why we ask this</h2>
                <p className="mt-2 text-sm text-gray-600">
                  ShiftSpot is a direct-contact directory — there&apos;s no login. Your email and phone
                  are shown only to job seekers who view your profile.
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
                  <li>Email and phone must be unique</li>
                  <li>Pick every skill that applies</li>
                  <li>You can be listed within seconds</li>
                </ul>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
