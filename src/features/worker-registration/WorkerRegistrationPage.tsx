import { ErrorAlert, SuccessMessage } from '@/shared/components'
import { useWorkerRegistration } from '@/shared/hooks'
import type { WorkerRegistrationFormValues } from '@/shared/validation'

import { WorkerRegistrationForm } from './WorkerRegistrationForm'

export function WorkerRegistrationPage() {
  const mutation = useWorkerRegistration()

  function handleSubmit(values: WorkerRegistrationFormValues) {
    mutation.mutate(values)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Worker Registration</h1>

      {mutation.isSuccess ? (
        <SuccessMessage
          title="Registration complete"
          description={`Thanks, ${mutation.data.name}! Your worker profile has been created.`}
        />
      ) : (
        <>
          {mutation.isError ? (
            <ErrorAlert
              message={
                mutation.error.code === 'DUPLICATE_EMAIL'
                  ? mutation.error.message
                  : 'Registration failed. Please try again.'
              }
              onRetry={() => mutation.reset()}
            />
          ) : null}
          <WorkerRegistrationForm onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
        </>
      )}
    </main>
  )
}
